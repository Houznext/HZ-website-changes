import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CBDocument } from '../entities/cbDocument.entity';
import { CustomBuilder } from '../entities/custom-builder.entity';
import {
  CreateCBDocumentDto,
  UpdateCBDocumentDto,
} from '../dto/cb-document.dto';
import { NotificationService } from 'src/notifications/notification.service';
import { generateDocumentUploadTemplate } from 'src/emailTemplates';
import { S3Service } from 'src/common/s3/s3.service';

@Injectable()
export class CbDocumentService {
  constructor(
    @InjectRepository(CBDocument)
    private readonly cbDocumentRepo: Repository<CBDocument>,

    @InjectRepository(CustomBuilder)
    private readonly customBuilderRepository: Repository<CustomBuilder>,

    private readonly notificationService: NotificationService,
    private readonly s3Service: S3Service,
    // private readonly ultraMsgService: WhatsAppMsgService, // enable if you use it
  ) {}

  async uploadDocument(cbId: string, dto: CreateCBDocumentDto) {
    const customBuilder = await this.customBuilderRepository.findOne({
      where: { id: cbId },
      relations: ['customer'],
    });
    if (!customBuilder) {
      throw new NotFoundException('Custom Builder not found');
    }

    const document = this.cbDocumentRepo.create({
      customBuilder,
      type: dto.type as unknown as string,
      fileUrl: dto.fileUrl,
      title: dto.title,
      notes: dto.notes,
      documentDate: dto.documentDate as any,
      meta: dto.meta,
      uploadedBy: dto.uploadedById
        ? ({ id: dto.uploadedById } as any)
        : undefined,
      phase: dto.phaseId ? ({ id: dto.phaseId } as any) : undefined,
      dayLog: dto.dayLogId ? ({ id: dto.dayLogId } as any) : undefined,
    });

    const saved = await this.cbDocumentRepo.save(document);
    const formattedDate = saved?.createdAt.toLocaleString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const owner = customBuilder.customer;
    if (owner?.id) {
      const label = this.typeLabel(saved.type);
      const message = `Your ${label} document was uploaded successfully on ${formattedDate}.`;

      await this.notificationService.createNotification({
        userId: owner.id,
        message,
      });

      if (owner.email) {
        try {
          const template = generateDocumentUploadTemplate(
            label,
            owner.fullName || 'User',
          );
          await this.notificationService.sendEmailNotification({
            email: owner.email,

            template,
          });
        } catch {
          await this.notificationService.sendEmailNotification({
            email: owner.email,

            message,
          });
        }
      }

      // if (owner.phone) {
      //   const whatsappMsg = `Hello ${owner.fullName || ''}, your ${label} document has been uploaded successfully.`;
      //   await this.ultraMsgService.sendMessage(owner.phone, whatsappMsg);
      // }
    }

    return saved;
  }

  async getDocuments(cbId: string): Promise<CBDocument[]> {
    return this.cbDocumentRepo.find({
      where: { customBuilder: { id: cbId } },
      order: { updatedAt: 'DESC' },
      relations: ['uploadedBy', 'phase', 'dayLog'],
    });
  }

  private typeLabel(t: string) {
    const map: Record<string, string> = {
      costEstimation: 'Cost Estimation',
      agreement: 'Agreement',
      paymentReports: 'Payment Report',
      weeklyReports: 'Weekly Report',
      monthlyReports: 'Monthly Report',
      warranty: 'Warranty',
      bills: 'Bill',
      floorPlan: 'Floor Plan',
    };
    return map[t] ?? 'Document';
  }
  async updateDocument(cbId: string, docId: string, dto: UpdateCBDocumentDto) {
    const cb = await this.customBuilderRepository.findOne({
      where: { id: cbId },
      relations: ['customer'],
    });
    if (!cb) throw new NotFoundException('Custom Builder not found');

    const doc = await this.cbDocumentRepo.findOne({
      where: { id: docId, customBuilder: { id: cbId } },
      relations: ['uploadedBy', 'phase', 'dayLog'],
    });
    if (!doc) throw new NotFoundException('Document not found');

    if (dto.phaseId !== undefined)
      doc.phase = dto.phaseId ? ({ id: dto.phaseId } as any) : null;
    if (dto.dayLogId !== undefined)
      doc.dayLog = dto.dayLogId ? ({ id: dto.dayLogId } as any) : null;
    if (dto.uploadedById !== undefined)
      doc.uploadedBy = dto.uploadedById
        ? ({ id: dto.uploadedById } as any)
        : null;

    // When document file is replaced, delete the old file from S3 so DB and S3 stay in sync
    const newFileUrl = dto.fileUrl ?? doc.fileUrl;
    if (dto.fileUrl && doc.fileUrl && dto.fileUrl !== doc.fileUrl) {
      try {
        await this.s3Service.deleteFileByUrl(doc.fileUrl);
      } catch (err) {
        console.warn('Failed to delete old document from S3:', err);
      }
    }

    Object.assign(doc, {
      type: dto.type ?? doc.type,
      fileUrl: newFileUrl,
      title: dto.title ?? doc.title,
      notes: dto.notes ?? doc.notes,
      documentDate: dto.documentDate ?? doc.documentDate,
      meta: dto.meta ?? doc.meta,
    });

    const saved = await this.cbDocumentRepo.save(doc);
    const formattedDate = saved?.updatedAt?.toLocaleString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (cb.customer?.id) {
      const label = this.typeLabel(saved.type);
      await this.notificationService.createNotification({
        userId: cb.customer.id,
        message: `Your ${label} document was updated successfully on ${formattedDate}.`,
      });
    }

    return saved;
  }

  async deleteDocument(cbId: string, docId: string) {
    const cb = await this.customBuilderRepository.findOne({
      where: { id: cbId },
      relations: ['customer'],
    });
    if (!cb) throw new NotFoundException('Custom Builder not found');

    const doc = await this.cbDocumentRepo.findOne({
      where: { id: docId, customBuilder: { id: cbId } },
    });
    if (!doc) throw new NotFoundException('Document not found');

    // Delete file from S3 first so DB and S3 stay in sync
    if (doc.fileUrl) {
      try {
        await this.s3Service.deleteFileByUrl(doc.fileUrl);
      } catch (err) {
        console.warn('Failed to delete document from S3:', err);
      }
    }

    await this.cbDocumentRepo.remove(doc);

    return { success: true, id: docId, message: 'Deleted' };
  }
}
