import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';

import { ChatThread } from './entities/chat-thread.entity';
import {
  ChatThreadMember,
  ThreadRole,
} from "./entities/chat-thread-member.entity";
import { ChatMessage } from "./entities/chat-message.entity";
import { User } from '../user/entities/user.entity';
import { timestamp } from "rxjs";
import { AttachmentKind, ChatAttachment } from "./entities/chat-attachment.entity";
import { CreateChannelDto } from './dto/create-channel.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatReadReceipt } from './entities/chat-read-receipt.entity';
import { NotificationService } from '../notifications/notification.service';
import { S3Service } from '../common/s3/s3.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatThread)
    private readonly threadRepo: Repository<ChatThread>,
    @InjectRepository(ChatThreadMember)
    private readonly memberRepo: Repository<ChatThreadMember>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    @InjectRepository(ChatAttachment)
    private readonly attachmentRepo: Repository<ChatAttachment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ChatReadReceipt)
    private readonly receiptRepo: Repository<ChatReadReceipt>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
    private readonly s3Service: S3Service,
  ) { }

  private async deleteAttachmentFiles(attachments: ChatAttachment[]) {
    for (const attachment of attachments) {
      if (!attachment?.url) continue;
      try {
        await this.s3Service.deleteFileByUrl(attachment.url);
      } catch (err) {
        console.warn('Failed to delete chat attachment from S3:', err);
      }
    }
  }

  private makeCacheKey(base: string, parts: Array<string | number | null | undefined> = []) {
    return `chat:${base}:${parts.map((part) => part ?? 'na').join(':')}`;
  }

  async assertMember(threadId: string, userId: string) {
    const membership = await this.memberRepo.findOne({
      where: { thread: { id: threadId }, user: { id: userId } },
      relations: { thread: true, user: true } as any,
    });
    if (!membership)
      throw new ForbiddenException('Not a member of this thread');
    return membership;
  }

  async assertOwner(threadId: string, userId: string) {
    const m = await this.memberRepo.findOne({
      where: { thread: { id: threadId }, user: { id: userId } },
    });
    if (!m) throw new ForbiddenException('Not a member');
    if (![ThreadRole.OWNER, ThreadRole.ADMIN].includes(m.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return m;
  }

  async getThreadDetails(threadId: string, userId: string) {

    await this.assertMember(threadId, userId);

    const thread = await this.threadRepo.findOne({
      where: { id: threadId },
      relations: { members: { user: true } } as any,
    });
    if (!thread) throw new NotFoundException('Thread not found');

    const me = thread.members?.find((m) => m.user?.id === userId);

    const result = {
      id: thread.id,
      kind: thread.kind,
      title: thread.title,
      theme: (thread as any).theme ?? "classic",
      description: (thread as any).description ?? null, // ✅ NEW
      myRole: me?.role ?? ThreadRole.MEMBER,
      isOwner: me?.role === ThreadRole.OWNER,
      members: (thread.members ?? []).map((m) => ({
        userId: m.user.id,
        name:
          `${m.user.firstName ?? ''} ${m.user.lastName ?? ''}`.trim() ||
          m.user.email,
        role: m.role,
      })),
    };
    return result;
  }

  async addChannelMembers(
    threadId: string,
    ownerId: string,
    memberIds: string[],
  ) {
    await this.assertOwner(threadId, ownerId);

    const unique = Array.from(new Set(memberIds)).filter(Boolean);
    if (!unique.length) return { added: 0 };

    return this.dataSource.transaction(async (manager) => {
      const memberRepo = manager.getRepository(ChatThreadMember);
      const userRepo = manager.getRepository(User);
      const threadRepo = manager.getRepository(ChatThread);

      const thread = await threadRepo.findOne({ where: { id: threadId } });
      if (!thread) throw new NotFoundException('Thread not found');

      const actor = await userRepo.findOne({
        where: { id: ownerId },
        select: ['id', 'firstName', 'lastName', 'email'],
      } as any);
      const users = await userRepo.findBy({ id: In(unique) });

      const validIds = new Set(users.map((u) => u.id));

      const existing = await memberRepo
        .createQueryBuilder('m')
        .select('m.userId', 'userId')
        .where('m.threadId = :threadId', { threadId })
        .getRawMany();

      const existingIds = new Set(existing.map((e) => e.userId));

      const toAdd = Array.from(validIds).filter((id) => !existingIds.has(id));
      if (!toAdd.length) return { added: 0 };

      const newMembers = toAdd.map((userId) =>
        memberRepo.create({
          thread: { id: threadId } as any,
          user: { id: userId } as any,
          role: ThreadRole.MEMBER,
          unreadCount: 0,
        }),
      );

      await memberRepo.save(newMembers);
      const actorName = actor
        ? `${actor.firstName ?? ''} ${actor.lastName ?? ''}`.trim() ||
          actor.email
        : 'Unknown';

      this.eventEmitter.emit('chat.channel.member_added', {
        threadId: thread.id,
        threadTitle: thread.title,
        actorId: ownerId,
        actorName,
        memberIds: toAdd,
      });
      return { added: newMembers.length };
    });
  }

  async removeChannelMember(
    threadId: string,
    ownerId: string,
    removeUserId: string,
  ) {
    await this.assertOwner(threadId, ownerId);

    const target = await this.memberRepo.findOne({
      where: { thread: { id: threadId }, user: { id: removeUserId } },
    });
    if (!target) throw new NotFoundException('Member not found');

    // Prevent removing owner
    if (target.role === ThreadRole.OWNER) {
      throw new BadRequestException('Cannot remove channel owner');
    }

    await this.memberRepo.delete({
      thread: { id: threadId } as any,
      user: { id: removeUserId } as any,
    });

    const thread = await this.threadRepo.findOne({
      where: { id: threadId },
      select: ['id', 'title'],
    });
    const actor = await this.userRepo.findOne({
      where: { id: ownerId },
      select: ['id', 'firstName', 'lastName', 'email'],
    } as any);

    const actorName = actor
      ? `${actor.firstName ?? ''} ${actor.lastName ?? ''}`.trim() || actor.email
      : 'Unknown';

    this.eventEmitter.emit('chat.channel.member_removed', {
      threadId,
      threadTitle: thread?.title ?? null,
      actorId: ownerId,
      actorName,
      removedUserId: removeUserId,
    });

    return { removed: true };
  }

  async updateChannelTitle(threadId: string, ownerId: string, title: string) {
    await this.assertOwner(threadId, ownerId);

    const newTitle = title?.trim();
    if (!newTitle) throw new BadRequestException('Title required');

    const res = await this.threadRepo.update(threadId, { title: newTitle });
    if (!res.affected) throw new NotFoundException('Thread not found');

    const updatedThread = await this.threadRepo.findOne({
      where: { id: threadId },
    });
    return { updated: true, thread: updatedThread };
  }

  async updateThreadTheme(threadId: string, userId: string, theme: string) {
    await this.assertMember(threadId, userId);

    const nextTheme = (theme || "").trim() || "classic";
    const res = await this.threadRepo.update(threadId, { theme: nextTheme });
    if (!res.affected) throw new NotFoundException("Thread not found");

    return { updated: true, theme: nextTheme };
  }

  async deleteThread(threadId: string, ownerId: string) {
    await this.assertOwner(threadId, ownerId);

    return this.dataSource.transaction(async (manager) => {
      const messageRepo = manager.getRepository(ChatMessage);
      const memberRepo = manager.getRepository(ChatThreadMember);
      const threadRepo = manager.getRepository(ChatThread);
      const attachmentRepo = manager.getRepository(ChatAttachment);

      const attachments = await attachmentRepo
        .createQueryBuilder('a')
        .innerJoin('a.message', 'm')
        .where('m.threadId = :threadId', { threadId })
        .getMany();

      await this.deleteAttachmentFiles(attachments);

      await messageRepo.delete({ thread: { id: threadId } as any });
      await memberRepo.delete({ thread: { id: threadId } as any });
      await threadRepo.delete(threadId);

      return { deleted: true };
    });
  }

  async deleteDmThread(threadId: string, userId: string) {
    await this.assertMember(threadId, userId);

    return this.dataSource.transaction(async (manager) => {
      const threadRepo = manager.getRepository(ChatThread);
      const messageRepo = manager.getRepository(ChatMessage);
      const memberRepo = manager.getRepository(ChatThreadMember);
      const attachmentRepo = manager.getRepository(ChatAttachment);

      const thread = await threadRepo.findOne({ where: { id: threadId } });
      if (!thread) throw new NotFoundException('Thread not found');
      if (thread.kind !== 'dm') {
        throw new BadRequestException('Only DM threads can be deleted here');
      }

      const attachments = await attachmentRepo
        .createQueryBuilder('a')
        .innerJoin('a.message', 'm')
        .where('m.threadId = :threadId', { threadId })
        .getMany();

      await this.deleteAttachmentFiles(attachments);

      await messageRepo.delete({ thread: { id: threadId } as any });
      await memberRepo.delete({ thread: { id: threadId } as any });
      await threadRepo.delete(threadId);

      return { deleted: true };
    });
  }

  async listThreads(userId: string) {

    const memberships = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: {
        user: true,
        thread: {
          members: {
            user: true,
          },
        },
      } as any,
      order: { thread: { lastMessageAt: 'DESC' } as any },
    });

    const result = memberships.map((m) => {
      let title = m.thread.title;
      let receiverId: string | null = null;

      if (m.thread.kind === 'dm') {
        const otherMember = m.thread.members.find(
          (member) => member.user.id !== userId,
        );

        if (otherMember?.user) {
          receiverId = otherMember.user.id;
          title =
            `${otherMember.user.firstName ?? ''} ${otherMember.user.lastName ?? ''}`.trim() ||
            otherMember.user.email;
        } else {
          title = 'Unknown User';
        }
      }

      return {
        kind: m.thread.kind,
        id: m.thread.id,
        title,
        theme: (m.thread as any).theme ?? "classic",
        description: (m.thread as any).description ?? null, // ✅ NEW
        receiverId,
        lastMessage: m.thread.lastMessagePreview,
        timestamp: m.thread.lastMessageAt
          ? m.thread.lastMessageAt.toISOString()
          : null,
        unreadCount: (m as any).unreadCount ?? 0,
        memberCount:
          m.thread.kind === 'channel' ? (m.thread.members?.length ?? 0) : 2,
      };
    });
    return result;
  }

  async listAllThreads() {

    const threads = await this.threadRepo.find({
      order: { lastMessageAt: 'DESC' } as any,
    });

    const result = threads.map((t) => ({
      kind: t.kind,
      id: t.id,
      title: t.title,
      theme: (t as any).theme ?? "classic",
      lastMessage: t.lastMessagePreview,
      timestamp: t.lastMessageAt ? t.lastMessageAt.toISOString() : null,
      unreadCount: 0,
    }));
    return result;
  }

  async fetchMessages(threadId: string, userId: string, limit = 50) {

    await this.assertMember(threadId, userId);

    const thread = await this.threadRepo.findOne({
      where: { id: threadId },
      select: ["id", "theme"] as any,
    });

    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 50;

    const msgs = await this.messageRepo.find({
      where: { thread: { id: threadId } },
      relations: { sender: true, attachments: true } as any,
      order: { createdAt: "DESC" },
      take: safeLimit,
    });

    const receipts = await this.receiptRepo.find({
      where: { thread: { id: threadId } },
      relations: { user: true } as any,
    });

    const result = {
      messages: msgs.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.sender.id,
        senderName: `${m.sender.firstName} ${m.sender.lastName}`.trim(),
        timestamp: m.createdAt.toISOString(),
        isImportant: m.isImportant,
        attachments: m.attachments?.map(a => ({
          id: a.id,
          kind: a.kind,
          url: a.url,
          mimeType: a.mimeType,
          fileName: a.fileName,
          sizeBytes: a.sizeBytes,
          width: a.width,
          height: a.height,
        })) ?? [],
      })),
      threadTheme: (thread as any)?.theme ?? "classic",
      readReceipts: receipts.map(r => ({
        userId: r.user.id,
        lastReadAt: r.lastReadMessageAt?.toISOString() || null,
      })),
    };
    return result;
  }

  async createMessage(params: {
    threadId: string;
    senderId: string;
    content?: string;
    isImportant?: boolean;
    attachments?: {
      kind: AttachmentKind;
      url: string;
      mimeType?: string;
      fileName?: string;
      sizeBytes?: number;
      width?: number;
      height?: number;
    }[];
  }) {
    return this.dataSource.transaction(async (manager) => {
      const threadRepo = manager.getRepository(ChatThread);
      const memberRepo = manager.getRepository(ChatThreadMember);
      const messageRepo = manager.getRepository(ChatMessage);
      const attachmentRepo = manager.getRepository(ChatAttachment);

      const thread = await threadRepo.findOne({
        where: { id: params.threadId },
      });
      if (!thread) throw new NotFoundException('Thread not found');

      const membership = await memberRepo.findOne({
        where: { thread: { id: thread.id }, user: { id: params.senderId } },
      });
      if (!membership) throw new ForbiddenException('Not a member');

      const msg = messageRepo.create({
        thread: { id: thread.id } as any,
        sender: { id: params.senderId } as any,
        content: params.content ?? undefined,
        isImportant: params.isImportant ?? false,
      });

      const saved = await messageRepo.save(msg);

      if (params.attachments?.length) {
        const entities = params.attachments.map(a =>
          attachmentRepo.create({
            ...a,
            message: saved,
          }),
        );
        await attachmentRepo.save(entities);
      }

      const preview = saved.content?.slice(0, 200) || (params.attachments?.length ? '[attachment]' : '');
      await threadRepo.update(thread.id, {
        lastMessageAt: saved.createdAt,
        lastMessagePreview: preview,
      });
      // Update in-memory object so gateway gets fresh data
      thread.lastMessageAt = saved.createdAt;
      thread.lastMessagePreview = preview;

      await memberRepo.increment(
        { thread: { id: thread.id }, user: { id: Not(params.senderId) } },
        'unreadCount',
        1,
      );

      const members = await memberRepo.find({
        where: { thread: { id: thread.id } },
        relations: { user: true } as any,
      });
      const sender = await manager.getRepository(User).findOne({
        where: { id: params.senderId },
        select: ['id', 'firstName', 'lastName', 'email'],
      } as any);

      const senderName = sender
        ? `${sender.firstName ?? ''} ${sender.lastName ?? ''}`.trim() ||
        sender.email
        : 'Unknown';

      const fullMessage = await messageRepo.findOne({
        where: { id: saved.id },
        relations: {
          sender: true,
          attachments: true,
        } as any,
      });

      return { message: fullMessage, thread, members };

    });
  }

  async markRead(threadId: string, userId: string) {
    const membership = await this.memberRepo.findOne({
      where: { thread: { id: threadId }, user: { id: userId } },
      relations: { thread: true, user: true } as any,
    });
    if (!membership) return;
    membership.unreadCount = 0;
    await this.memberRepo.save(membership);

    // Update or create read receipt
    try {
      let receipt = await this.receiptRepo.findOne({
        where: { thread: { id: threadId }, user: { id: userId } },
      });
      if (!receipt) {
        receipt = this.receiptRepo.create({
          thread: { id: threadId } as any,
          user: { id: userId } as any,
        });
      }
      receipt.lastReadMessageAt = new Date();
      await this.receiptRepo.save(receipt);
    } catch (err) {
      // If a duplicate key error occurs, it means another request created it.
      // We can just find and update it.
      if (err.code === '23505') {
        await this.receiptRepo.update(
          { thread: { id: threadId }, user: { id: userId } },
          { lastReadMessageAt: new Date() }
        );
      } else {
        throw err;
      }
    }

    this.eventEmitter.emit('realtime.sync', { userId });
  }

  async getOrCreateDmThread(meId: string, otherUserId: string) {
    if (meId === otherUserId) {
      throw new BadRequestException('Cannot create DM with yourself');
    }

    // Ensure both users exist to avoid FK violation on chat_thread_members
    const [meUser, otherUser] = await Promise.all([
      this.userRepo.findOne({ where: { id: meId }, select: ['id'] }),
      this.userRepo.findOne({ where: { id: otherUserId }, select: ['id'] }),
    ]);
    if (!meUser) {
      throw new BadRequestException('Your user account was not found. Please log in again.');
    }
    if (!otherUser) {
      throw new BadRequestException(
        'The other user (e.g. support) does not exist. Please check the user ID or create the support user in the database.',
      );
    }

    const existing = await this.threadRepo
      .createQueryBuilder('t')
      .innerJoin(
        'chat_thread_members',
        'm1',
        'm1."threadId" = t.id AND m1."userId" = :meId',
        { meId },
      )
      .innerJoin(
        'chat_thread_members',
        'm2',
        'm2."threadId" = t.id AND m2."userId" = :otherUserId',
        { otherUserId },
      )
      .where('t.kind = :kind', { kind: 'dm' })
      .getOne();

    if (existing) {
      return existing;
    }

    const thread = this.threadRepo.create({
      kind: 'dm',
      title: null,
      lastMessageAt: null,
      lastMessagePreview: null,
    });

    const savedThread = await this.threadRepo.save(thread);

    const meMember = this.memberRepo.create({
      thread: { id: savedThread.id } as any,
      user: { id: meId } as any,
      unreadCount: 0,
      role: ThreadRole.MEMBER,
    });

    const otherMember = this.memberRepo.create({
      thread: { id: savedThread.id } as any,
      user: { id: otherUserId } as any,
      unreadCount: 0,
      role: ThreadRole.MEMBER,
    });

    await this.memberRepo.save([meMember, otherMember]);

    return savedThread;
  }

  async createChannelThread(params: {
    creatorId: string;
    title: string;
    description?: string; // ✅ NEW
    memberIds: string[];
  }): Promise<ChatThread> {
    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const threadRepo = manager.getRepository(ChatThread);
      const memberRepo = manager.getRepository(ChatThreadMember);

      const creator = await userRepo.findOne({
        where: { id: params.creatorId },
      });
      if (!creator) throw new NotFoundException('Creator user not found');

      const uniqueMemberIds = Array.from(
        new Set([params.creatorId, ...params.memberIds]),
      );
      if (uniqueMemberIds.length < 2) {
        throw new BadRequestException('Channel must have at least 2 members');
      }

      const users = await userRepo.findBy({ id: In(uniqueMemberIds) });
      if (users.length !== uniqueMemberIds.length) {
        throw new BadRequestException('One or more member IDs are invalid');
      }

      const thread = threadRepo.create({
        kind: 'channel',
        title: params.title,
        description: params.description?.trim() || null,
        createdBy: creator,
        lastMessageAt: null,
        lastMessagePreview: null,
      });

      const savedThread = await threadRepo.save(thread);

      const members = uniqueMemberIds.map((userId) =>
        memberRepo.create({
          thread: savedThread,
          user: users.find((u) => u.id === userId)!,
          unreadCount: 0,
          role:
            userId === params.creatorId ? ThreadRole.OWNER : ThreadRole.MEMBER,
        }),
      );

      const savedMembers = await memberRepo.save(members);

      const threadEntity = await threadRepo.findOne({
        where: { id: savedThread.id },
        relations: { members: { user: true } },
      });

      if (!threadEntity) {
        throw new InternalServerErrorException('Thread creation failed');
      }

      this.eventEmitter.emit('chat.channel.created', {
        threadId: threadEntity.id,
        title: threadEntity.title,
        memberIds: threadEntity.members.map(m => m.user.id),
        creatorId: params.creatorId,
        creatorName:
          `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() ||
          creator.email,
      });

      return threadEntity;
    });
  }


  async getChatHistory(params: {
    page: number;
    limit: number;
    search?: string;
    from?: string;
    to?: string;
  }) {

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const query = this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.thread', 'thread')
      .leftJoin('thread.members', 'members')
      .leftJoin('members.user', 'memberUser')
      .orderBy('message.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (params.search) {
      const s = `%${params.search}%`;
      query.andWhere(
        '(message.content ILIKE :search OR sender.firstName ILIKE :search OR sender.lastName ILIKE :search OR thread.title ILIKE :search OR memberUser.firstName ILIKE :search OR memberUser.lastName ILIKE :search)',
        { search: s },
      );
    }

    if (params.from)
      query.andWhere('message.createdAt >= :from', { from: params.from });
    if (params.to)
      query.andWhere('message.createdAt <= :to', { to: params.to });

    const [items, total] = await query.getManyAndCount();

    const enrichedItems = await Promise.all(
      items.map(async (msg) => {
        let receiverName = '';
        let receiverType = 'USER';
        let receiverId = '';

        if (!msg.thread) return null;

        const senderId = msg.sender ? msg.sender.id : 'unknown';
        const senderName = msg.sender
          ? `${msg.sender.firstName} ${msg.sender.lastName}`
          : 'Unknown Sender';

        if (msg.thread.kind === 'channel') {
          receiverType = 'CHANNEL';
          receiverName = msg.thread.title || 'Channel';
          receiverId = msg.thread.id;
        } else {
          receiverType = 'USER';
          if (msg.sender) {
            const otherMember = await this.memberRepo.findOne({
              where: {
                thread: { id: msg.thread.id },
                user: { id: Not(msg.sender.id) },
              },
              relations: { user: true } as any,
            });
            if (otherMember && otherMember.user) {
              receiverName =
                `${otherMember.user.firstName} ${otherMember.user.lastName}`.trim();
              receiverId = otherMember.user.id;
            } else {
              receiverName = 'Unknown';
            }
          } else {
            receiverName = 'Unknown';
          }
        }

        return {
          id: msg.id,
          createdAt: msg.createdAt,
          message: msg.content,
          senderId,
          senderName,
          receiverType,
          receiverId: receiverId || '',
          receiverName,
        };
      }),
    );

    const result = {
      items: enrichedItems.filter((i) => i !== null),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return result;
  }

  async updateChannelDescription(
    threadId: string,
    ownerId: string,
    description: string,
  ) {
    await this.assertOwner(threadId, ownerId);

    const newDesc = description?.trim() ?? '';

    const res = await this.threadRepo.update(threadId, {
      description: newDesc.length ? newDesc : null,
    } as any);

    if (!res.affected) throw new NotFoundException('Thread not found');

    return { updated: true, description: newDesc.length ? newDesc : null };
  }

  async deleteMessages(ids: string[]) {
    if (!ids.length) return { deleted: 0 };
    const attachments = await this.messageRepo.find({
      where: { id: In(ids) },
      relations: { attachments: true } as any,
    });

    for (const msg of attachments) {
      await this.deleteAttachmentFiles(msg.attachments ?? []);
    }

    const result = await this.messageRepo.delete(ids);
    return { deleted: result.affected || 0 };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: {
        sender: true,
        thread: {
          members: { user: true },
        },
        attachments: true,
      } as any,
    });

    if (!message) throw new NotFoundException('Message not found');

    const thread = message.thread;
    const membership = thread.members.find((m) => m.user.id === userId);

    if (!membership) throw new ForbiddenException('Not a member of this thread');

    const isOwner = membership.role === ThreadRole.OWNER;
    const isSender = message.sender.id === userId;

    if (!isOwner && !isSender) {
        throw new ForbiddenException('You can only delete your own messages');
    }

    await this.deleteAttachmentFiles(message.attachments ?? []);

    // Delete message (attachments cascade)
    await this.messageRepo.delete({ id: messageId });

    // Check if we need to update thread preview
    if (thread.lastMessageAt?.getTime() === message.createdAt.getTime()) {
      const latest = await this.messageRepo.findOne({
        where: { thread: { id: thread.id } },
        order: { createdAt: 'DESC' },
      });

      await this.threadRepo.update(thread.id, {
        lastMessageAt: latest?.createdAt ?? null,
        lastMessagePreview: latest?.content?.slice(0, 200) ?? null,
      });
    }

    return { thread, members: thread.members };
  }

  async clearChat(userId: string, threadId: string) {
    await this.assertMember(threadId, userId);

    const thread = await this.threadRepo.findOne({
        where: { id: threadId },
        relations: { members: { user: true } } as any,
    });

    if (!thread) throw new NotFoundException('Thread not found');

    const membership = thread.members.find((m) => m.user.id === userId);
    
    // In Channels, only Owner can clear all chat
    if (thread.kind === 'channel' && membership?.role !== ThreadRole.OWNER) {
        throw new ForbiddenException('Only owner can clear channel history');
    }
    
    

    const attachments = await this.attachmentRepo
      .createQueryBuilder('a')
      .innerJoin('a.message', 'm')
      .where('m.threadId = :threadId', { threadId })
      .getMany();
    await this.deleteAttachmentFiles(attachments);

    await this.messageRepo.delete({ thread: { id: threadId } as any });

    // Reset thread preview
    await this.threadRepo.update(threadId, {
        lastMessageAt: null,
        lastMessagePreview: null
    });

    return { cleared: true, threadId };
  }
}
