import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'; // Pastikan entitas User diimpor

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'secretkey', // Ganti dengan env var di production
      signOptions: { expiresIn: '1d' }, // Token kedaluwarsa dalam 1 hari
    }),
    TypeOrmModule.forFeature([User]), // Pastikan untuk menambahkan repository User
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
