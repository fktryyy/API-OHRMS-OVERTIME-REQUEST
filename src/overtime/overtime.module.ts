import { Module } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';
import { OvertimeController } from './overtime.controller';

@Module({
  controllers: [OvertimeController],
  providers: [OdooService]
})
export class OvertimeModule {}