import { Body,Controller,Post, Get, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Menggunakan async agar bisa menunggu promise yang dikembalikan
  @Get()
  async getAllEmployees() {
    return await this.employeeService.getAllEmployees();
  }

  // Endpoint untuk mengambil lembur berdasarkan ID karyawan
  @Get(':id/overtime')
  async getEmployeeOvertime(@Param('id') id: number) {
    return await this.employeeService.getEmployeeOvertime(id);
  }
  // Endpoint untuk mendapatkan semua department
  @Get('alldepartment')
  async getAllDepartments() {
    return await this.employeeService.getAllDepartments();
}
  @Get(':id/department')
  async getDepartmentByEmployeeId(@Param('id') id: string) {
    const employeeId = parseInt(id);
    return await this.employeeService.getDepartmentByEmployeeId(employeeId);
  }
  @Post('department')
async getDepartmentFromBody(@Body('employeeId') employeeId: number) {
  return await this.employeeService.getDepartmentFullNameByEmployeeId(employeeId);
}

}
