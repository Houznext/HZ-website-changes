import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { DocumentDrafting } from './entities/documentDrafting.entity';
import {
  CreateDocumentDraftingDto,
  UpdateDocumentDraftingDto,
} from './dto/documentDrafting.dto';

@Injectable()
export class DocumentDraftingService {
  constructor(
    @InjectRepository(DocumentDrafting)
    private readonly documentDraftingRepository: Repository<DocumentDrafting>,
    @InjectRepository(CBService)
    private readonly cbServiceRepository: Repository<CBService>,
  ) {}

  // Create a Document Drafting
  async create(
    customBuilderId: string,
    createDocumentDraftingDto: CreateDocumentDraftingDto,
  ): Promise<DocumentDrafting> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['documentDrafting'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.documentDrafting) {
        throw new BadRequestException(
          'This service already has a document drafting.',
        );
      }

      const documentDrafting = this.documentDraftingRepository.create(
        createDocumentDraftingDto,
      );
      service.documentDrafting = documentDrafting;

      await this.cbServiceRepository.save(service);

      return service.documentDrafting;
    } catch (error) {
      console.error(`Error creating document drafting: ${error.message}`);
      throw error;
    }
  }

  // Find All Document Draftings
  async findAll(): Promise<DocumentDrafting[]> {
    try {
      const documentDraftings = await this.documentDraftingRepository.find({
        relations: ['service'],
      });

      console.log(`Successfully retrieved all document draftings.`);

      return documentDraftings;
    } catch (error) {
      console.error(
        `Error retrieving all document draftings: ${error.message}`,
      );
      throw error;
    }
  }

  // Find Document Drafting by ID
  async findById(id: string): Promise<DocumentDrafting> {
    try {
      const documentDrafting = await this.documentDraftingRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!documentDrafting) {
        throw new NotFoundException(
          `Document Drafting with ID ${id} not found.`,
        );
      }

      console.log(`Successfully retrieved document drafting with ID ${id}.`);

      return documentDrafting;
    } catch (error) {
      console.error(
        `Error retrieving document drafting with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  // Update Document Drafting
  async update(
    customBuilderId: string,
    updateDocumentDraftingDto: UpdateDocumentDraftingDto,
  ): Promise<DocumentDrafting> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['documentDrafting'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.documentDrafting) {
        throw new NotFoundException(`Document Drafting not found.`);
      }

      const updatedDocumentDrafting = Object.assign(
        service.documentDrafting,
        updateDocumentDraftingDto,
      );

      service.documentDrafting = updatedDocumentDrafting;

      await this.cbServiceRepository.save(service);

      return updatedDocumentDrafting;
    } catch (error) {
      console.error(`Error updating document drafting: ${error.message}`);
      throw error;
    }
  }

  // Delete Document Drafting
  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['documentDrafting'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const documentDrafting = service.documentDrafting;

      if (!documentDrafting) {
        throw new NotFoundException(`Document Drafting not found.`);
      }

      service.documentDrafting = null;

      await this.cbServiceRepository.save(service);
      await this.documentDraftingRepository.delete(documentDrafting.id);
    } catch (error) {
      console.error(`Error deleting document drafting: ${error.message}`);
      throw error;
    }
  }
}
