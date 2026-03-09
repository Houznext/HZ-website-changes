export class DeleteMessageDto {
  threadId: string;
  threadKind: 'dm' | 'channel';
  messageId: string;
}
