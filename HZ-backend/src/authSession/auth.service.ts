import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtPayload } from 'src/Interface/jwt-payload.interface';
import { LoginUserDto, ReturnUserDto } from 'src/user/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => JwtService))
    private readonly jwtService: JwtService,
  ) {}

  async generateJwt(
    user: User,
    activeBranchId?: string,
  ): Promise<{ access_token: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      kind: user.kind,
      activeBranchId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return { access_token: accessToken };
  }

  async validateUser(userId: string): Promise<ReturnUserDto | null> {
    const user = await this.userService.findOne(userId);
    if (user) return user;
    return null;
  }

  async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async loginUser(loginDto: LoginUserDto): Promise<{ access_token: string }> {
    const { email, phone, password } = loginDto;

    const user = email
      ? await this.userService.findByEmail(email)
      : phone
        ? await this.userService.findByPhone(phone)
        : null;

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '30d' });
    return { access_token };
  }
}
