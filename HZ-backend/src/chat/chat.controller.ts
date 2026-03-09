import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiProperty,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateDmDto } from './dto/create-dm.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { GetChatHistoryDto } from './dto/get-chat-history.dto';
import { DeleteChatHistoryDto } from './dto/delete-chat-history.dto';
import { IsOptional } from 'class-validator';
import { ControllerAuthGuard } from '../guard';
import { ChatRealtimeAdapter } from './chat.realtime.adapter';
import { RealtimeGateway } from '../realtime/realtime.gateway';

class UpdateChannelTitleDto {
  title: string;
}

class UpdateChannelMembersDto {
  @ApiProperty()
  @IsOptional()
  memberIds: string[];
}

type UpdateDescriptionBody = { description: string }; 
class UpdateThreadThemeDto {
  @ApiProperty()
  theme: string;
}

function normalizeUserId(userId?: string) {
  return (userId || "").trim().replace(/\?+$/, "");
}

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(ControllerAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chat: ChatService,
  ) { }

  @Post('channels')
  @ApiOperation({ summary: 'Create a new channel' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'Creator user UUID (temporary until JWT)',
  })
  @ApiBody({ type: CreateChannelDto })
  async createChannel(
    @Query('userId') userId: string,
    @Body() dto: CreateChannelDto,
  ) {
    const safeUserId = normalizeUserId(userId);
    const thread = await this.chat.createChannelThread({
      creatorId: safeUserId,
      title: dto.title,
      memberIds: dto.memberIds,
      description: dto.description
    });

    return {
      id: thread.id,
      title: thread.title,
      kind: thread.kind,
      members: thread.members.map(m => ({
        userId: m.user.id,
        role: m.role,
      })),
    };
  }


  @Get('threads/:threadId')
  @ApiOperation({ summary: 'Get thread details (members, roles, etc.)' })
  @ApiParam({ name: 'threadId', description: 'Chat thread UUID' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User UUID (temporary until JWT auth is added)',
  })
  async getThreadDetails(
    @Param('threadId') threadId: string,
    @Query('userId') userId: string,
  ) {
    return this.chat.getThreadDetails(threadId, normalizeUserId(userId));
  }

  @Post('channels/:threadId/members')
  @ApiOperation({ summary: 'Add members to a channel (ADMIN/OWNER only)' })
  @ApiParam({ name: 'threadId', description: 'Channel thread UUID' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'Admin user UUID (temporary until JWT auth is added)',
  })
  @ApiBody({ type: UpdateChannelMembersDto })
  async addChannelMembers(
    @Param('threadId') threadId: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateChannelMembersDto,
  ) {
    const selectedIds = dto.memberIds;
    const result = await this.chat.addChannelMembers(
      threadId,
      normalizeUserId(userId),
      selectedIds,
    );
    return result;
  }

  @Delete('channels/:threadId/members/:removeUserId')
  @ApiOperation({ summary: 'Remove a member from a channel (ADMIN/OWNER only)' })
  @ApiParam({ name: 'threadId', description: 'Channel thread UUID' })
  @ApiParam({ name: 'removeUserId', description: 'User UUID to remove' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'Admin user UUID (temporary until JWT auth is added)',
  })
  async removeChannelMember(
    @Param('threadId') threadId: string,
    @Param('removeUserId') removeUserId: string,
    @Query('userId') userId: string,
  ) {
    const result = await this.chat.removeChannelMember(
      threadId,
      normalizeUserId(userId),
      removeUserId,
    );
    return result;
  }

  @Patch('channels/:threadId/title')
  @ApiOperation({ summary: 'Update channel title (ADMIN/OWNER only)' })
  @ApiParam({ name: 'threadId', description: 'Channel thread UUID' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'Admin user UUID (temporary until JWT auth is added)',
  })
  @ApiBody({ type: UpdateChannelTitleDto })
  async updateChannelTitle(
    @Param('threadId') threadId: string,
    @Query('userId') userId: string,
    @Body("title") title: string,
  ) {
    const result = await this.chat.updateChannelTitle(
      threadId,
      normalizeUserId(userId),
      title,
    );
    return result;
  }

  @Patch("threads/:threadId/theme")
  @ApiOperation({ summary: "Update thread theme (any member)" })
  @ApiParam({ name: "threadId", description: "Chat thread UUID" })
  @ApiQuery({
    name: "userId",
    required: true,
    description: "User UUID (temporary until JWT auth is added)",
  })
  @ApiBody({ type: UpdateThreadThemeDto })
  async updateThreadTheme(
    @Param("threadId") threadId: string,
    @Query("userId") userId: string,
    @Body("theme") theme: string,
  ) {
    return this.chat.updateThreadTheme(
      threadId,
      normalizeUserId(userId),
      theme,
    );
  }

  
  @Delete('channels/:threadId')
  @ApiOperation({ summary: 'Delete channel (ADMIN/OWNER only)' })
  @ApiParam({ name: 'threadId', description: 'Channel thread UUID' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'Admin user UUID (temporary until JWT auth is added)',
  })
  async deleteChannel(
    @Param('threadId') threadId: string,
    @Query('userId') userId: string,
  ) {
    const result = await this.chat.deleteThread(
      threadId,
      normalizeUserId(userId),
    );

    // Optional: broadcast deletion
    // this.gateway.broadcastChannelDeleted(threadId);

    return result;
  }

  
  @Post('dm')
  @ApiOperation({ summary: 'Create/Get a DM thread with another user' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User UUID (temporary until JWT auth is added)',
  })
  async createOrGetDm(
    @Query('userId') userId: string,
    @Body() dto: CreateDmDto,
  ) {
    const thread = await this.chat.getOrCreateDmThread(
      normalizeUserId(userId),
      dto.otherUserId,
    );
    return { threadId: thread.id, kind: thread.kind };
  }

  
  @Delete('dm/:threadId')
  @ApiOperation({ summary: 'Delete a DM thread and all messages' })
  @ApiParam({ name: 'threadId', description: 'Chat thread UUID' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User UUID (temporary until JWT auth is added)',
  })
  async deleteDm(
    @Param('threadId') threadId: string,
    @Query('userId') userId: string,
  ) {
    return this.chat.deleteDmThread(threadId, normalizeUserId(userId));
  }

  
  @Get('admin/chat-history')
  @ApiOperation({ summary: 'Get chat history with filters (ADMIN only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getChatHistory(@Query() query: GetChatHistoryDto) {
    return this.chat.getChatHistory({
      ...query,
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }

  
  @Post('admin/chat-history/delete')
  @ApiOperation({ summary: 'Delete chat messages (ADMIN only)' })
  @ApiBody({ type: DeleteChatHistoryDto })
  async deleteChatHistory(@Body() dto: DeleteChatHistoryDto) {
    return this.chat.deleteMessages(dto.ids);
  }

  @Get('threads')
  @ApiOperation({ summary: 'Get chat threads for logged-in user' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User UUID (temporary until JWT auth is added)',
  })
  listThreads(@Query('userId') userId: string) {
    return this.chat.listThreads(normalizeUserId(userId));
  }

  @Get('threads/:threadId/messages')
  @ApiOperation({ summary: 'Get messages for a chat thread' })
  @ApiParam({ name: 'threadId', description: 'Chat thread UUID' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User UUID (temporary until JWT auth is added)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of messages to fetch (default 50)',
  })
  getMessages(
    @Param('threadId') threadId: string,
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsed = limit ? Number(limit) : 50;
    const safeLimit =
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 200) : 50;
    return this.chat.fetchMessages(
      threadId,
      normalizeUserId(userId),
      safeLimit,
    );
  }

  @Patch("channels/:threadId/description")
  async editChannelDescription(
    @Param("threadId") threadId: string,
    @Query("userId") userId: string,
    @Body() body: UpdateDescriptionBody
  ) {
    return this.chat.updateChannelDescription(
      threadId,
      normalizeUserId(userId),
      body.description,
    );
  }

  @Delete('messages/:messageId')
  deleteMessage(
    @Param('messageId') messageId: string,
    @Query('userId') userId: string,
  ) {
    return this.chat.deleteMessage(messageId, normalizeUserId(userId));
  }

  @Delete('threads/:threadId/messages')
  async clearChat(
    @Param('threadId') threadId: string,
    @Query('userId') userId: string,
  ) {
    return this.chat.clearChat(normalizeUserId(userId), threadId);
  }

}
