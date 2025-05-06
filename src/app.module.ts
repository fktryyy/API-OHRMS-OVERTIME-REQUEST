import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OvertimeModule } from './overtime/overtime.module';
import { EmployeeModule } from './employee/employee.module';
import { ResumeModule } from './resume/resume.module';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // host database
      port: 5432,        // port database
      username: 'odoo16',  // username untuk database
      password: 'odoo16', // password untuk database
      database: 'login', // nama database
      entities: [User], // Daftarkan entitas User
      synchronize: true, // untuk auto create schema
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule, 
    EmployeeModule, 
    OvertimeModule, 
    ResumeModule,
  ],
})
export class AppModule {}
