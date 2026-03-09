import { IsEnum, IsString, IsOptional } from "class-validator";
import { AttachmentKind } from "../entities/chat-attachment.entity";

export class CreateAttachmentDto {
  @IsEnum(AttachmentKind)
  kind: AttachmentKind;

  @IsString()
  url: string;

  @IsOptional()
  mimeType?: string;

  @IsOptional()
  fileName?: string;

  @IsOptional()
  sizeBytes?: number;

  @IsOptional()
  width?: number;

  @IsOptional()
  height?: number;
}
