import { IsObject } from 'class-validator';

/**
 * JSON body for cms draft/publish. Required so global ValidationPipe
 * can validate non-primitive `data` (plain interfaces are rejected).
 */
export class CmsUpsertBodyDto {
  @IsObject()
  data: Record<string, unknown>;
}
