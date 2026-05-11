import { Matches } from 'class-validator';

export class CustomerPhoneSendDto {
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  phone: string;
}

export class CustomerPhoneVerifyDto {
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must start with 6, 7, 8, or 9, and be 10 digits long',
  })
  phone: string;

  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  otp: string;
}
