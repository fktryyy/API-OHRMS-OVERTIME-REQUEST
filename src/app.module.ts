import { Module } from '@nestjs/common';
import { OvertimeModule } from './overtime/overtime.module';
import { EmployeeModule } from './employee/employee.module';
import { ResumeModule } from './resume/resume.module';

@Module({
  imports: [EmployeeModule, OvertimeModule, ResumeModule],
})
export class AppModule {}
