import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DeleteMessageDto } from '../chat/dto/delete-message.dto';
import { JoinThreadDto } from '../chat/dto/join-thread.dto';
import { ReadThreadDto } from '../chat/dto/read-thread.dto';
import { SendMessageDto } from '../chat/dto/send-message.dto';
import { ChatRealtimeAdapter } from '../chat/chat.realtime.adapter';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly onlineCounts = new Map<string, number>();
  private readonly onlineSet = new Set<string>();
  // map of threadRoom -> set of userIds
  private readonly threadMembers = new Map<string, Set<string>>();

  constructor(
    private readonly chatRealtime: ChatRealtimeAdapter,
    private readonly eventEmitter: EventEmitter2,
  ) {}

afterInit(server: Server) {
  server.use((socket, next) => {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization;

    const token =
      typeof rawToken === 'string'
        ? rawToken.replace(/^Bearer\s+/i, '').trim()
        : undefined;

    // 🔹 If token exists, just decode (NO VERIFY)
    if (token) {
      try {
        const payload = jwt.decode(token) as any;

        if (payload && typeof payload === 'object') {
          socket.data.user = {
            ...payload,
            id: payload.sub || payload.id,
          };
        } else {
          socket.data.user = { id: 'anonymous' };
        }

        return next();
      } catch {
        socket.data.user = { id: 'anonymous' };
        return next();
      }
    }

    // 🔹 Fallback for dev/testing
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      socket.data.user = { id: userId };
    } else {
      socket.data.user = { id: 'anonymous' };
    }

    return next();
  });
}

  @OnEvent('realtime.push')
  handleRealtimePush(payload: { userId: string; data: any }) {
    this.server.to(`user:${payload.userId}`).emit('notification:new', payload.data);
  }

  @OnEvent('realtime.sync')
  handleRealtimeSync(payload: { userId: string }) {
    this.server.to(`user:${payload.userId}`).emit('notification:sync');
  }

  handleConnection(socket: Socket) {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);
    this.markOnline(userId);

    const activeBranchId = socket.data.user?.activeBranchId;
    if (activeBranchId) {
      socket.join(`branch:${activeBranchId}`);
    }

    socket.emit('presence:state', {
      onlineUserIds: Array.from(this.onlineSet),
    });
  }

  @SubscribeMessage('branch:join')
  handleBranchJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { branchId: string },
  ) {
    if (data?.branchId) {
      socket.join(`branch:${data.branchId}`);
    }
  }

  @SubscribeMessage('branch:leave')
  handleBranchLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { branchId: string },
  ) {
    if (data?.branchId) {
      socket.leave(`branch:${data.branchId}`);
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.user.id;
    this.markOffline(userId);

    // Only clear tracking if the user is truly offline (all tabs closed)
    const currentCount = this.onlineCounts.get(userId) ?? 0;
    if (currentCount === 0) {
      // Remove user from all thread tracking
      for (const [room, members] of this.threadMembers.entries()) {
        if (members.has(userId)) {
          members.delete(userId);
          if (members.size === 0) {
            this.threadMembers.delete(room);
          }
        }
      }
    }
  }

  private markOnline(userId: string) {
    const prev = this.onlineCounts.get(userId) ?? 0;
    this.onlineCounts.set(userId, prev + 1);
    if (prev === 0) {
      this.onlineSet.add(userId);
      this.server.emit('user:online', { userId });
    }
  }

  private markOffline(userId: string) {
    const prev = this.onlineCounts.get(userId) ?? 0;
    if (prev <= 1) {
      this.onlineCounts.delete(userId);
      this.onlineSet.delete(userId);
      this.server.emit('user:offline', { userId });
    } else {
      this.onlineCounts.set(userId, prev - 1);
    }
  }

  @SubscribeMessage('presence:get')
  handlePresenceGet(@ConnectedSocket() socket: Socket) {
    socket.emit('presence:state', { onlineUserIds: Array.from(this.onlineSet) });
  }

  // ---------- Event handlers ----------

  broadcastNewChannel(threadId: string, title: string, memberIds: string[]) {
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('thread:update', {
        kind: 'channel',
        id: threadId,
        title,
        lastMessage: '',
        timestamp: null,
        unreadCount: 0,
        memberCount: memberIds.length,
      });
    }
  }

  @SubscribeMessage('thread:join')
  async joinThread(@ConnectedSocket() s: Socket, @MessageBody() dto: JoinThreadDto) {
    const res = await this.chatRealtime.joinThread(s, dto);
    const room = `${dto.kind}:${dto.id}`;
    if (!this.threadMembers.has(room)) {
      this.threadMembers.set(room, new Set());
    }
    this.threadMembers.get(room)!.add(s.data.user.id);
    return res;
  }

  @SubscribeMessage('thread:leave')
  leaveThread(@ConnectedSocket() s: Socket, @MessageBody() dto: JoinThreadDto) {
    const res = this.chatRealtime.leaveThread(s, dto);
    const room = `${dto.kind}:${dto.id}`;
    this.threadMembers.get(room)?.delete(s.data.user.id);
    return res;
  }

  isUserInThread(userId: string, threadKind: string, threadId: string): boolean {
    const room = `${threadKind}:${threadId}`;
    return this.threadMembers.get(room)?.has(userId) ?? false;
  }

  @SubscribeMessage('thread:read')
  async readThread(
    @ConnectedSocket() s: Socket,
    @MessageBody() dto: ReadThreadDto,
  ) {
    const room = `${dto.threadKind}:${dto.threadId}`;
    if (!s.rooms.has(room)) {
      return;
    }
    const { userId } = await this.chatRealtime.readThread(s, dto);

    this.server.to(`user:${userId}`).emit('thread:update', {
      kind: dto.threadKind,
      id: dto.threadId,
      unreadCount: 0,
    });

    // Notify other members that this user read the thread
    this.server.to(`${dto.threadKind}:${dto.threadId}`).emit('message:read', {
      threadKind: dto.threadKind,
      threadId: dto.threadId,
      userId,
      readAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() s: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const { message, thread, members, userId } =
      await this.chatRealtime.sendMessage(s, dto);

    s.emit('message:ack', {
      threadKind: dto.threadKind,
      threadId: dto.threadId,
      clientId: dto.clientId,
      serverId: message?.id,
      timestamp: message?.createdAt.toISOString(),
    });

    const senderName = `${message?.sender.firstName} ${message?.sender.lastName}`.trim();
    const isImportant = message?.isImportant ?? false;

    this.server.to(`${dto.threadKind}:${dto.threadId}`).emit('message:new', {
      threadKind: dto.threadKind,
      threadId: dto.threadId,
      message: {
        id: message?.id,
        content: message?.content,
        senderId: userId,
        senderName,
        timestamp: message?.createdAt.toISOString(),
        isImportant,
        attachments: message?.attachments ?? [],
      },
    });

    // Emit important message popup to all thread members except the sender
    if (isImportant) {
      const importantPayload = {
        threadKind: dto.threadKind,
        threadId: dto.threadId,
        threadTitle: thread.title,
        message: {
          id: message?.id,
          content: message?.content,
          senderId: userId,
          senderName,
          timestamp: message?.createdAt.toISOString(),
          isImportant: true,
          attachments: message?.attachments ?? [],
        },
      };

      // Send to all members except the sender
      for (const m of members) {
        if (m.user.id !== userId) {
          this.server.to(`user:${m.user.id}`).emit('message:important', importantPayload);
        }
      }
    }

    for (const m of members) {
      this.server.to(`user:${m.user.id}`).emit('thread:update', {
        kind: thread.kind,
        id: thread.id,
        lastMessage: thread.lastMessagePreview,
        timestamp: thread.lastMessageAt?.toISOString() ?? null,
        unreadCount: m.unreadCount,
      });
    }

    // Emit event for notification creation
    this.eventEmitter.emit('chat.message.created', {
      threadId: thread.id,
      threadKind: thread.kind,
      threadTitle: thread.title,
      senderId: userId,
      senderName: `${message?.sender.firstName} ${message?.sender.lastName}`.trim(),
      content: message?.content || '[attachment]',
      isImportant,
      recipientIds: members.map(m => m.user.id),
    });
  }

  @SubscribeMessage('message:delete')
  async deleteMessage(
    @ConnectedSocket() s: Socket,
    @MessageBody() dto: DeleteMessageDto,
  ) {
    const { thread, members } = await this.chatRealtime.deleteMessage(s, dto);

    this.server
      .to(`${dto.threadKind}:${dto.threadId}`)
      .emit('message:deleted', {
        threadId: dto.threadId,
        messageId: dto.messageId,
      });

    for (const m of members) {
      this.server.to(`user:${m.user.id}`).emit('thread:update', {
        kind: thread.kind,
        id: thread.id,
        lastMessage: thread.lastMessagePreview,
        timestamp: thread.lastMessageAt?.toISOString() ?? null,
        unreadCount: m.unreadCount,
      });
    }
  }

  @OnEvent('order.statusChanged')
  handleOrderStatusChanged(payload: {
    orderId: string;
    orderNo: string;
    orderType?: string;
    userId?: string;
    newStatus: string;
    oldStatus: string;
    branchId?: string;
    updatedBy: string;
    courierName?: string;
    trackingId?: string;
    timestamp: string;
  }) {
    const event = 'order:statusChanged';
    const data = {
      orderId: payload.orderId,
      orderNo: payload.orderNo,
      orderType: payload.orderType,
      newStatus: payload.newStatus,
      oldStatus: payload.oldStatus,
      courierName: payload.courierName,
      trackingId: payload.trackingId,
      updatedBy: payload.updatedBy,
      timestamp: payload.timestamp,
    };

    if (payload.userId) {
      this.server.to(`user:${payload.userId}`).emit(event, data);
    }

    if (payload.branchId) {
      this.server.to(`branch:${payload.branchId}`).emit(event, data);
    }
  }
}
