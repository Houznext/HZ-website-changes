import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';

type ChatMessageCreatedPayload = {
  threadId: string;
  threadKind: 'dm' | 'channel';
  threadTitle?: string | null;
  senderId: string;
  senderName?: string | null;
  content?: string | null;
  isImportant?: boolean;
  recipientIds: string[];
};

type ChannelCreatedPayload = {
  threadId: string;
  title?: string | null;
  memberIds: string[];
  creatorId?: string | null;
  creatorName?: string | null;
};

type ChannelMemberAddedPayload = {
  threadId: string;
  threadTitle?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  memberIds: string[];
};

type ChannelMemberRemovedPayload = {
  threadId: string;
  threadTitle?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  removedUserId: string;
};

@Injectable()
export class ChatNotificationListener {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async createAndPush(userId: string, message: string) {
    const notification = await this.notificationService.createNotification({
      userId,
      message,
    });

    this.eventEmitter.emit('realtime.push', {
      userId,
      data: notification,
    });
  }

  @OnEvent('chat.message.created')
  async handleChatMessageCreated(payload: ChatMessageCreatedPayload) {
    if (!payload?.recipientIds?.length) return;

    const recipients = payload.recipientIds.filter(
      (id) => id && id !== payload.senderId,
    );
    if (!recipients.length) return;

    const senderName = payload.senderName?.trim() || 'Someone';
    const content = payload.content?.trim() || '[attachment]';
    const importantPrefix = payload.isImportant ? 'Important: ' : '';

    const message =
      payload.threadKind === 'channel'
        ? `${importantPrefix}${senderName} in ${payload.threadTitle ? `#${payload.threadTitle}` : 'a channel'}: ${content}`
        : `${importantPrefix}${senderName}: ${content}`;

    await Promise.all(
      recipients.map((userId) => this.createAndPush(userId, message)),
    );
  }

  @OnEvent('chat.channel.created')
  async handleChannelCreated(payload: ChannelCreatedPayload) {
    if (!payload?.memberIds?.length) return;

    const creatorId = payload.creatorId ?? null;
    const recipients = payload.memberIds.filter(
      (id) => id && id !== creatorId,
    );
    if (!recipients.length) return;

    const title = payload.title?.trim() || 'a channel';
    const actorName = payload.creatorName?.trim() || 'Someone';
    const message = `You were added to channel "${title}" by ${actorName}`;

    await Promise.all(
      recipients.map((userId) => this.createAndPush(userId, message)),
    );
  }

  @OnEvent('chat.channel.member_added')
  async handleChannelMemberAdded(payload: ChannelMemberAddedPayload) {
    if (!payload?.memberIds?.length) return;

    const actorId = payload.actorId ?? null;
    const recipients = payload.memberIds.filter(
      (id) => id && id !== actorId,
    );
    if (!recipients.length) return;

    const title = payload.threadTitle?.trim() || 'a channel';
    const actorName = payload.actorName?.trim() || 'Someone';
    const message = `You were added to channel "${title}" by ${actorName}`;

    await Promise.all(
      recipients.map((userId) => this.createAndPush(userId, message)),
    );
  }

  @OnEvent('chat.channel.member_removed')
  async handleChannelMemberRemoved(payload: ChannelMemberRemovedPayload) {
    if (!payload?.removedUserId) return;

    const title = payload.threadTitle?.trim() || 'a channel';
    const actorName = payload.actorName?.trim() || 'Someone';
    const message = `You were removed from channel "${title}" by ${actorName}`;

    await this.createAndPush(payload.removedUserId, message);
  }
}
