import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { OdooService } from 'src/odoo/odoo.service';

@Module({
  controllers: [LoginController],
  providers: [LoginService, OdooService],
})
export class LoginModule {}
