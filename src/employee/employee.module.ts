import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { OdooService } from '../odoo/odoo.service';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, OdooService],
})
export class EmployeeModule {}
