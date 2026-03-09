import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotConversation } from './entities/bot-conversation.entity';
import { BotMessage } from './entities/bot-message.entity';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectRepository(BotConversation)
    private readonly conversationRepo: Repository<BotConversation>,
    @InjectRepository(BotMessage)
    private readonly messageRepo: Repository<BotMessage>,
  ) {}

  async createConversation(
    userId: string | null,
    sessionId: string | null,
  ): Promise<{ id: string }> {
    const conv = this.conversationRepo.create({
      userId: userId || null,
      sessionId: sessionId || null,
    });
    const saved = await this.conversationRepo.save(conv);
    return { id: saved.id };
  }

  async listConversations(
    userId: string | null,
    sessionId: string | null,
  ): Promise<{ id: string; createdAt: string }[]> {
    const qb = this.conversationRepo
      .createQueryBuilder('c')
      .orderBy('c.updatedAt', 'DESC')
      .take(50);

    if (userId) {
      qb.andWhere('c.userId = :userId', { userId });
    } else if (sessionId) {
      qb.andWhere('c.sessionId = :sessionId', { sessionId });
    } else {
      return [];
    }

    const list = await qb.getMany();
    return list.map((c) => ({
      id: c.id,
      title: c.title ?? 'New chat',
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async getMessages(
    conversationId: string,
    userId: string | null,
    sessionId: string | null,
  ): Promise<{ id: string; role: string; content: string; createdAt: string }[]> {
    const conv = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    this.assertAccess(conv, userId, sessionId);

    const messages = await this.messageRepo.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
    });
    return messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async appendMessages(
    conversationId: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    userId: string | null,
    sessionId: string | null,
  ): Promise<{ saved: number }> {
    const conv = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    this.assertAccess(conv, userId, sessionId);

    // Set conversation title from first user message if not set
    const firstUser = messages.find((m) => m.role === 'user');
    if (firstUser && !conv.title) {
      const preview = firstUser.content.trim().slice(0, 100);
      conv.title = preview + (firstUser.content.length > 100 ? '…' : '');
      await this.conversationRepo.save(conv);
    }

    const entities = messages.map((m) =>
      this.messageRepo.create({
        conversation: conv,
        role: m.role,
        content: m.content,
      }),
    );
    await this.messageRepo.save(entities);
    return { saved: entities.length };
  }

  async deleteConversation(
    conversationId: string,
    userId: string | null,
    sessionId: string | null,
  ): Promise<{ deleted: true }> {
    const conv = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    this.assertAccess(conv, userId, sessionId);

    await this.messageRepo.delete({ conversation: { id: conversationId } });
    await this.conversationRepo.delete(conversationId);
    return { deleted: true };
  }

  private assertAccess(
    conv: BotConversation,
    userId: string | null,
    sessionId: string | null,
  ): void {
    if (userId && conv.userId === userId) return;
    if (sessionId && conv.sessionId === sessionId) return;
    throw new ForbiddenException('Access denied to this conversation');
  }
}
