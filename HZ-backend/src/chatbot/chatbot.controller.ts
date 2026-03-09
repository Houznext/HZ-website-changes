import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AppendMessagesDto } from './dto/append-messages.dto';

function getUserIdFromAuth(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    return payload.sub ?? payload.userId ?? null;
  } catch {
    return null;
  }
}

/**
 * Chatbot conversations and history. Supports:
 * - Logged-in users: identified by JWT (userId); conversations are tied to the user.
 * - Anonymous users: identified by sessionId (query or X-Session-Id header); no login required.
 */
@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new bot conversation' })
  async createConversation(
    @Body() dto: CreateConversationDto,
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const userId = getUserIdFromAuth(auth);
    const sessionId = dto.sessionId ?? sessionIdHeader ?? null;
    return this.chatbot.createConversation(userId, sessionId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List bot conversations for current user/session' })
  @ApiQuery({ name: 'sessionId', required: false })
  async listConversations(
    @Query('sessionId') sessionIdQuery?: string,
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const userId = getUserIdFromAuth(auth);
    const sessionId =
      sessionIdQuery ?? sessionIdHeader ?? null;
    return this.chatbot.listConversations(userId, sessionId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiQuery({ name: 'sessionId', required: false })
  async getMessages(
    @Param('id') id: string,
    @Query('sessionId') sessionIdQuery?: string,
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const userId = getUserIdFromAuth(auth);
    const sessionId = sessionIdQuery ?? sessionIdHeader ?? null;
    return this.chatbot.getMessages(id, userId, sessionId);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Append messages to a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiQuery({ name: 'sessionId', required: false })
  async appendMessages(
    @Param('id') id: string,
    @Body() dto: AppendMessagesDto,
    @Query('sessionId') sessionIdQuery?: string,
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const userId = getUserIdFromAuth(auth);
    const sessionId = sessionIdQuery ?? sessionIdHeader ?? null;
    return this.chatbot.appendMessages(
      id,
      dto.messages,
      userId,
      sessionId,
    );
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete a conversation and its messages' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiQuery({ name: 'sessionId', required: false })
  async deleteConversation(
    @Param('id') id: string,
    @Query('sessionId') sessionIdQuery?: string,
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const userId = getUserIdFromAuth(auth);
    const sessionId = sessionIdQuery ?? sessionIdHeader ?? null;
    return this.chatbot.deleteConversation(id, userId, sessionId);
  }
}
