import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { BaseGuard } from '../auth/guard/base.guard';
import { JwtService } from '@nestjs/jwt';
import { User } from './schema/user.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule)
  ],
  providers: [UsersService, JwtService, BaseGuard],
  exports: [
    UsersService
  ]
})
export class UserModule { }
