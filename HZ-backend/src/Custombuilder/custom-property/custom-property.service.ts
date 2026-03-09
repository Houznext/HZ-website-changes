import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CBProperty } from './entities/cb-property.entity';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import {
  CreateCBPropertyDto,
  UpdateCBPropertyDto,
  UpdateFloorsDto,
} from './dto/cb-property.dto';
import { CBFloor } from '../floor/entities/floor.entity';
import { HouseConstruction } from './entities/house-construction.entity';
import { InteriorInfo } from './entities/interior-info.entity';
import { CommercialConstruction } from './entities/commercial-construction.entity';

@Injectable()
export class CBPropertyService {
  constructor(
    @InjectRepository(CBProperty)
    private readonly cbPropertyRepository: Repository<CBProperty>,

    @InjectRepository(CustomBuilder)
    private readonly customBuilderRepository: Repository<CustomBuilder>,

    @InjectRepository(CBFloor)
    private readonly cbFloorRepository: Repository<CBFloor>,

    @InjectRepository(HouseConstruction)
    private readonly houseConstructionRepository: Repository<HouseConstruction>,

    @InjectRepository(InteriorInfo)
    private readonly interiorInfoRepository: Repository<InteriorInfo>,

    @InjectRepository(CommercialConstruction)
    private readonly commercialConstructionRepository: Repository<CommercialConstruction>,
  ) {}

  async create(
    customBuilderId: string,
    createCBPropertyDto: CreateCBPropertyDto,
  ): Promise<CBProperty> {
    try {
      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id: customBuilderId },
        relations: ['propertyInformation'],
      });

      if (!customBuilder) {
        throw new NotFoundException('Custom Builder not found');
      }

      if (customBuilder.propertyInformation) {
        throw new BadRequestException('Custom Builder already has a property');
      }

      if (
        createCBPropertyDto.construction_scope === 'house' &&
        !createCBPropertyDto.houseConstructionInfo
      ) {
        throw new BadRequestException('House construction info is required');
      }

      if (
        createCBPropertyDto.construction_scope === 'interior' &&
        !createCBPropertyDto.interiorInfo
      ) {
        throw new BadRequestException('Interior info is required');
      }

      let houseConstructionInfo = null;
      let interiorInfo = null;
      let commercialConstructionInfo = null;

      if (createCBPropertyDto.construction_scope === 'house') {
        if (createCBPropertyDto.construction_type === 'Commercial' && createCBPropertyDto.commercialConstructionInfo) {
          const data = this.commercialConstructionRepository.create(
            createCBPropertyDto.commercialConstructionInfo,
          );
          commercialConstructionInfo = await this.commercialConstructionRepository.save(data);
        } else if (createCBPropertyDto.houseConstructionInfo) {
          const data = this.houseConstructionRepository.create(
            createCBPropertyDto.houseConstructionInfo,
          );
          houseConstructionInfo = await this.houseConstructionRepository.save(data);
        }
      } else if (createCBPropertyDto.construction_scope === 'interior') {
        const data = this.interiorInfoRepository.create(
          createCBPropertyDto.interiorInfo,
        );
        interiorInfo = await this.interiorInfoRepository.save(data);
      }

      const newCBProperty = this.cbPropertyRepository.create({
        construction_type: createCBPropertyDto.construction_type,
        property_type: createCBPropertyDto.property_type,
        commercial_property_type: createCBPropertyDto.commercial_property_type,
        construction_scope: createCBPropertyDto.construction_scope,
        house_construction_info: houseConstructionInfo,
        interior_info: interiorInfo,
        commercial_construction_info: commercialConstructionInfo,
      });

      customBuilder.propertyInformation = newCBProperty;

      await this.customBuilderRepository.save(customBuilder);

      console.log('CBProperty created successfully');

      return customBuilder.propertyInformation;
    } catch (error) {
      console.log('Error creating CBProperty:', error);
      throw error;
    }
  }

  async findAll(): Promise<CBProperty[]> {
    try {
      const cbProperties = await this.cbPropertyRepository.find();
      console.log('CBProperties found successfully');
      return cbProperties;
    } catch (error) {
      console.log('Error finding CBProperties:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CBProperty> {
    try {
      const cbProperty = await this.cbPropertyRepository.findOne({
        where: { id },
        relations: [
          'customBuilder',
          'house_construction_info',
          'interior_info',
          'commercial_construction_info',
        ],
      });
      if (!cbProperty) {
        throw new NotFoundException('CBProperty not found');
      }
      console.log('CBProperty found successfully');
      return cbProperty;
    } catch (error) {
      console.log('Error finding CBProperty:', error);
      throw error;
    }
  }

  async findOneByCustomBuilderId(customBuilderId: string): Promise<CBProperty> {
    try {
      const cbProperty = await this.cbPropertyRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: [
          'customBuilder',
          'house_construction_info',
          'interior_info',
          'commercial_construction_info',
        ],
      });
      if (!cbProperty) {
        throw new NotFoundException('CBProperty not found');
      }
      console.log('CBProperty found successfully');
      return cbProperty;
    } catch (error) {
      console.log('Error finding CBProperty:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateCBPropertyDto: UpdateCBPropertyDto,
  ): Promise<CBProperty> {
    try {
      const property = await this.cbPropertyRepository.findOne({
        where: { id },
        relations: [
          'customBuilder',
          'house_construction_info',
          'interior_info',
          'commercial_construction_info',
        ],
      });

      if (!property) {
        throw new NotFoundException('CBProperty not found');
      }

      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id: property.customBuilder.id },
        relations: ['propertyInformation'],
      });

      if (!customBuilder) {
        throw new NotFoundException('CustomBuilder not found');
      }

      let updatedHouseConstructionInfo = null;
      let updatedInteriorInfo = null;
      let updatedCommercialConstructionInfo = null;
      let changedScope =
        property.construction_scope !== updateCBPropertyDto.construction_scope;
      const isCommercial = updateCBPropertyDto.construction_type === 'Commercial';

      if (updateCBPropertyDto.construction_scope === 'house') {
        if (isCommercial && updateCBPropertyDto.commercialConstructionInfo) {
          if (!property.commercial_construction_info) {
            property.commercial_construction_info =
              this.commercialConstructionRepository.create();
          }
          const data = Object.assign(
            property.commercial_construction_info,
            updateCBPropertyDto.commercialConstructionInfo,
          );
          updatedCommercialConstructionInfo =
            await this.commercialConstructionRepository.save(data);
          updatedHouseConstructionInfo = null;
          updatedInteriorInfo = null;
        } else {
          if (!property.house_construction_info) {
            property.house_construction_info =
              this.houseConstructionRepository.create();
          }

          let data;
          if (changedScope) {
            data = Object.assign(
              property.house_construction_info,
              updateCBPropertyDto.houseConstructionInfo,
              { floors: [] },
            );
          } else {
            data = Object.assign(
              property.house_construction_info,
              updateCBPropertyDto.houseConstructionInfo,
            );
          }

          updatedHouseConstructionInfo =
            await this.houseConstructionRepository.save(data);
          updatedInteriorInfo = null;
          updatedCommercialConstructionInfo = null;
        }
      } else if (updateCBPropertyDto.construction_scope === 'interior') {
        if (!property.interior_info) {
          property.interior_info = this.interiorInfoRepository.create();
        }

        let data;
        if (changedScope) {
          data = Object.assign(
            property.interior_info,
            updateCBPropertyDto.interiorInfo,
            { floors: [] },
          );
        } else {
          data = Object.assign(
            property.interior_info,
            updateCBPropertyDto.interiorInfo,
          );
        }

        updatedInteriorInfo = await this.interiorInfoRepository.save(data);
        updatedHouseConstructionInfo = null;
        updatedCommercialConstructionInfo = null;
      }

      const updatedCBProperty = Object.assign(property, {
        construction_type: updateCBPropertyDto.construction_type,
        propertyName: updateCBPropertyDto.propertyName,
        property_type: updateCBPropertyDto.property_type,
        commercial_property_type: updateCBPropertyDto.commercial_property_type,
        construction_scope: updateCBPropertyDto.construction_scope,
        house_construction_info: updatedHouseConstructionInfo,
        interior_info: updatedInteriorInfo,
        commercial_construction_info: updatedCommercialConstructionInfo,
      });

      customBuilder.propertyInformation = updatedCBProperty;

      const savedCustomBuilder =
        await this.customBuilderRepository.save(customBuilder);
      console.log('CBProperty updated successfully');
      return savedCustomBuilder.propertyInformation;
    } catch (error) {
      console.log('Error updating CBProperty:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const property = await this.cbPropertyRepository.findOne({
        where: { id },
        relations: ['customBuilder'],
      });

      if (!property) {
        throw new NotFoundException('CBProperty not found');
      }

      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id: property.customBuilder.id },
        relations: ['propertyInformation'],
      });

      if (!customBuilder) {
        throw new NotFoundException('CustomBuilder not found');
      }

      customBuilder.propertyInformation = null;

      await this.customBuilderRepository.save(customBuilder);

      await this.cbPropertyRepository.delete(id);
      console.log('CBProperty deleted successfully');
    } catch (error) {
      console.log('Error deleting CBProperty:', error);
      throw error;
    }
  }

  // async updateFloors(
  //   customBuilderId: string,
  //   floorsData: UpdateFloorsDto,
  // ): Promise<CBProperty> {
  //   try {
  //     const property = await this.cbPropertyRepository.findOne({
  //       where: { customBuilder: { id: customBuilderId } },
  //       relations: ['house_construction_info', 'interior_info'],
  //     });

  //     if (!property) {
  //       throw new NotFoundException('Property not found');
  //     }

  //     if (!floorsData?.floors?.length) {
  //       throw new BadRequestException('At least one floor is required');
  //     }

  //     await this.cbPropertyRepository.manager.transaction(
  //       async (entityManager) => {
  //         // Decide which scope to use
  //         if (property.construction_scope === 'house') {
  //           // 1) Delete existing floors from house
  //           if (property.house_construction_info.floors?.length > 0) {
  //             await Promise.all(
  //               property.house_construction_info.floors.map(async (floor) => {
  //                 await entityManager.delete(CBFloor, floor.id);
  //               }),
  //             );
  //           }

  //           // 2) Create and save new floors
  //           const savedFloors = await Promise.all(
  //             floorsData.floors.map(async (floor) => {
  //               return entityManager.save(CBFloor, floor);
  //             }),
  //           );

  //           // 3) Attach new floors to house_construction_info
  //           property.house_construction_info.floors = savedFloors;
  //           await entityManager.save(CBProperty, property);
  //         } else if (property.construction_scope === 'interior') {
  //           // 1) Delete existing floors from interior
  //           if (property.interior_info.floors?.length > 0) {
  //             await Promise.all(
  //               property.interior_info.floors.map(async (floor) => {
  //                 await entityManager.delete(CBFloor, floor.id);
  //               }),
  //             );
  //           }

  //           // 2) Create and save new floors
  //           const savedFloors = await Promise.all(
  //             floorsData.floors.map(async (floor) => {
  //               return entityManager.save(CBFloor, floor);
  //             }),
  //           );

  //           // 3) Attach new floors to interior_info
  //           property.interior_info.floors = savedFloors;
  //           await entityManager.save(CBProperty, property);
  //         } else {
  //           throw new BadRequestException(
  //             `Floors are only valid for 'house' or 'interior' scopes`,
  //           );
  //         }
  //       },
  //     );

  //     return this.findOneByCustomBuilderId(customBuilderId);
  //   } catch (error) {
  //     console.error('Error updating floors:', error);
  //     throw error;
  //   }
  // }
   async updateFloors(
    customBuilderId: string,
    floorsData: UpdateFloorsDto,
  ): Promise<CBProperty> {
    const property = await this.cbPropertyRepository.findOne({
      where: { customBuilder: { id: customBuilderId } },
      relations: [
        'house_construction_info',
        'house_construction_info.floors',
      ],
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (!floorsData?.floors?.length) {
      throw new BadRequestException('At least one floor is required');
    }

    
    await this.cbPropertyRepository.manager.transaction(
      async (entityManager) => {
        
        let house = property.house_construction_info;

        if (!house) {
          house = entityManager.create(HouseConstruction, {
          
          });
          house = await entityManager.save(HouseConstruction, house);

          property.house_construction_info = house;
          await entityManager.save(CBProperty, property);
        }

      
        await entityManager.delete(CBFloor, { property: { id: house.id } });

       
        const savedFloors: CBFloor[] = [];

        for (const floorDto of floorsData.floors) {
          const floorEntity = entityManager.create(CBFloor, {
            ...floorDto,
            property: house, 
          });

          const saved = await entityManager.save(CBFloor, floorEntity);
          savedFloors.push(saved);
        }

       
        house.floors = savedFloors;
        await entityManager.save(HouseConstruction, house);
      },
    );

    
    return this.findOneByCustomBuilderId(customBuilderId);
  }

  
}
