import { Module } from '@nestjs/common';
import { OvertimeModule } from './overtime/overtime.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [EmployeeModule, OvertimeModule],
})
export class AppModule {}
