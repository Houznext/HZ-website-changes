export class CreateInteriorPackageDto {
  name: string;
  price: string;
  suffix?: string;
  color?: string;
  features?: string[];
  highlighted?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  bhkType?: string | null;
}

export class UpdateInteriorPackageDto {
  name?: string;
  price?: string;
  suffix?: string;
  color?: string;
  features?: string[];
  highlighted?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  bhkType?: string | null;
}
