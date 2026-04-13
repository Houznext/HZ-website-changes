import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';
import { User } from 'src/user/entities/user.entity';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { CurrentStep } from '../enum/custom-builder.enum';
import { LocationDetails } from 'src/property/entities/location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationDetails)
    private locationRepository: Repository<LocationDetails>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(CustomBuilder)
    private custombuilderRepository: Repository<CustomBuilder>,
  ) {}

  // Find one by id

  async findAll(): Promise<LocationDetails[]> {
    try {
      return await this.locationRepository.find({
        relations: ['user'],
      });
    } catch (error) {
      console.error('Error retrieving locations:', error.message);
      throw error;
    }
  }

  async findOne(id: string): Promise<LocationDetails> {
    try {
      const location = await this.locationRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!location) {
        throw new NotFoundException(`Location with ID ${id} not found.`);
      }

      console.log(`Location with ID ${id} retrieved successfully.`);
      return location;
    } catch (error) {
      console.log(`Error retrieving location with ID ${id}:`, error.message);
      console.log('Error stack:', error.stack);
      throw error;
    }
  }
  // find locations by userId

  async findByUserId(userId: string): Promise<LocationDetails[]> {
    try {
      const locations = await this.locationRepository.find({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!locations || locations.length === 0) {
        throw new NotFoundException(
          `No locations found for user with ID ${userId}.`,
        );
      }

      console.log(
        `Locations for user with ID ${userId} retrieved successfully.`,
      );
      return locations;
    } catch (error) {
      console.log(
        `Error retrieving locations for user with ID ${userId}:`,
        error.message,
      );
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  // find location by custom builderId

  async findByCustomBuilderId(customBuilderId: string) {
    try {
      const location = await this.locationRepository.findOne({
        where: { customBuilderId },
        relations: ['user'],
      });

      if (!location) {
        throw new NotFoundException(
          `No location found for custom builder with ID ${customBuilderId}.`,
        );
      }

      console.log(
        `Location for custom builder with ID ${customBuilderId} retrieved successfully.`,
      );
      return location;
    } catch (error) {
      console.log(
        `Error retrieving locations for custom builder with ID ${customBuilderId}:`,
        error.message,
      );
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  // Create location and add it to user's locations array

  async create(userId: string, locationData: CreateLocationDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['customBuilders'],
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!user.isVerified) {
        throw new BadRequestException('Associated user is not verified');
      }

      let customBuilder = user.customBuilders?.[0];
      if (!customBuilder) {
        customBuilder = await this.custombuilderRepository.save(
          this.custombuilderRepository.create({
            customer: user,
            currentStep: CurrentStep.customerOnboarding,
          }),
        );
      }

      // Create the location and set relations
      const location = this.locationRepository.create({
        ...locationData,
        customBuilder,
        user,
      });

      const savedLocation = await this.locationRepository.save(location);

      return {
        location: savedLocation,
        customBuilderId: customBuilder.id,
      };
    } catch (error) {
      console.log(`Error creating location:`, error.message);
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  // Update location

  async update(id: string, locationData: UpdateLocationDto) {
    try {
      const locationToUpdate = await this.locationRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!locationToUpdate) {
        throw new BadRequestException('Location not found');
      }

      // Merge new data into existing entity
      Object.assign(locationToUpdate, locationData);

      // Save updated location directly
      const updatedLocation =
        await this.locationRepository.save(locationToUpdate);

      console.log(`Location with ID ${id} updated successfully.`);
      return updatedLocation;
    } catch (error) {
      console.log(`Error updating location with ID ${id}:`, error.message);
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  // Remove location

  async remove(id: string): Promise<void> {
    try {
      const locationToDelete = await this.locationRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!locationToDelete) {
        throw new BadRequestException('Location not found');
      }
      await this.locationRepository.remove(locationToDelete);
    } catch (error) {
      console.log('Error stack:', error.stack);
      throw error;
    }
  }
}
