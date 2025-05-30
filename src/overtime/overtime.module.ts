import { Module } from '@nestjs/common';
import { OvertimeController } from './overtime.controller';
import { OdooService } from '../odoo/odoo.service';

@Module({
  controllers: [OvertimeController],
  providers: [OdooService], // 🆕 Tambahkan ResumeService ke providers
})
export class OvertimeModule {}
