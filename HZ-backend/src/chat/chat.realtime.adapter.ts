import { Injectable } from '@nestjs/common';

import { DeleteMessageDto } from './dto/delete-message.dto';
import { JoinThreadDto } from './dto/join-thread.dto';
import { ReadThreadDto } from './dto/read-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@Injectable()
export class ChatRealtimeAdapter {
  constructor(private readonly chat: ChatService) {}

  private getUserId(socket: Socket) {
    return socket.data.user.id;
  }

  async joinThread(socket: Socket, dto: JoinThreadDto) {
    const userId = this.getUserId(socket);
    await this.chat.assertMember(dto.id, userId);
    socket.join(`${dto.kind}:${dto.id}`);
    return { ok: true };
  }

  leaveThread(socket: Socket, dto: JoinThreadDto) {
    socket.leave(`${dto.kind}:${dto.id}`);
    return { ok: true };
  }

  async readThread(socket: Socket, dto: ReadThreadDto) {
    const userId = this.getUserId(socket);
    await this.chat.markRead(dto.threadId, userId);
    return { ok: true, userId };
  }

  async sendMessage(socket: Socket, dto: SendMessageDto) {
    const userId = this.getUserId(socket);

    const result = await this.chat.createMessage({
      threadId: dto.threadId,
      senderId: userId,
      content: dto.content,
      isImportant: dto.isImportant,
      attachments: dto.attachments,
    });

    return {
      ok: true,
      userId,
      ...result,
    };
  }

  async deleteMessage(socket: Socket, dto: DeleteMessageDto) {
    const userId = this.getUserId(socket);
    const result = await this.chat.deleteMessage(dto.messageId, userId);
    return {
      ok: true,
      userId,
      ...result,
    };
  }
}
