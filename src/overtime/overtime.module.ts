import { Module } from '@nestjs/common';
import { OvertimeController } from './overtime.controller';
import { OdooService } from '../odoo/odoo.service';
import { ResumeService } from '../resume/resume.service'; // 🆕 Import ResumeService

@Module({
  controllers: [OvertimeController],
  providers: [OdooService, ResumeService], // 🆕 Tambahkan ResumeService ke providers
})
export class OvertimeModule {}
