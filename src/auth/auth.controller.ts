import { Controller, Post, Body, UnauthorizedException, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService, // Injecting JwtService
  ) {}

  // Endpoint login
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user); // Menghasilkan JWT
  }

  // Endpoint register (untuk membuat user baru)
  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string; role: string },
  ) {
    try {
      const newUser = await this.authService.createUser(
        body.name,
        body.email,
        body.password,
        body.role,
      );
      return {
        message: 'User successfully registered',
        user: newUser,
      };
    } catch (error) {
      return {
        message: 'Error registering user',
        error: error.message,
      };
    }
  }

  // Endpoint untuk mendapatkan data semua user
  @Get('users')
  async getAllUsers() {
    try {
      const users = await this.authService.findAllUsers();
      return {
        message: 'Users data retrieved successfully',
        users: users,
      };
    } catch (error) {
      throw new UnauthorizedException('Error retrieving users');
    }
  }

  // Endpoint untuk mendapatkan data user berdasarkan token JWT
  @Get('profile')
  async getUser(@Req() request: Request) {
    try {
      // Ambil token JWT dari header Authorization
      const token = request.headers['authorization']?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token is missing');
      }

      // Verifikasi dan decode token
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub; // ID user dari token (payload)

      // Ambil data user berdasarkan ID
      const user = await this.authService.findUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        message: 'User data retrieved successfully',
        user: user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token or expired');
    }
  }
}
