import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from 'src/login/dto/login.dto';

@Controller('loginnip')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Panggil service yang validasi username dan password dari Odoo
    const employee = await this.loginService.validateUsernamePassword(username, password);

    if (!employee) {
      throw new UnauthorizedException('Username atau password tidak valid.');
    }

    return {
      message: 'Login berhasil',
      employee,
    };
  }
}
