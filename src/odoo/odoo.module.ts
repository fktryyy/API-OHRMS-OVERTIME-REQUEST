    // src/odoo/odoo.module.ts
import { Module } from '@nestjs/common';
import { OdooService } from './odoo.service';

@Module({
  providers: [OdooService],
  exports: [OdooService], // agar bisa digunakan di module lain
})
export class OdooModule {}
