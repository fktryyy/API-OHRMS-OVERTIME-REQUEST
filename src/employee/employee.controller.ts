import { Body, Controller, Post, Get, Param,Request, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @UseGuards(JwtAuthGuard)
  @Post(':id/approver/from-login')
  async setApproverFromLoginUserName(
    @Param('id') employeeId: number,
    @Request() req,
  ) {
    const approverName = req.user.name;
    return await this.employeeService.setEmployeeApproverByName(employeeId, approverName);
  }
  // Ambil semua employee
  @Get()
  async getAllEmployees() {
    return await this.employeeService.getAllEmployees();
  }

  // Ambil data lembur berdasarkan ID employee
  @Get(':id/overtime')
  async getEmployeeOvertime(@Param('id') id: string) {
    const employeeId = parseInt(id);
    return await this.employeeService.getEmployeeOvertime(employeeId);
  }

  // Ambil semua department
  @Get('alldepartment')
  async getAllDepartments() {
    return await this.employeeService.getAllDepartments();
  }

  // Ambil department berdasarkan ID employee
  @Get(':id/department')
  async getDepartmentByEmployeeId(@Param('id') id: string) {
    const employeeId = parseInt(id);
    return await this.employeeService.getDepartmentByEmployeeId(employeeId);
  }

  // Ambil nama lengkap department dari body
  @Post('department')
  async getDepartmentFromBody(@Body('employeeId') employeeId: number) {
    return await this.employeeService.getDepartmentFullNameByEmployeeId(employeeId);
  }

  // Ambil data approver dari semua employee
  @Get('approver')
  async getApprovers() {
    const employees = await this.employeeService.getAllEmployees();
    return employees.map((emp: any) => ({
      employee_id: emp.id,
      employee_name: emp.name,
      approver: emp.approver ? emp.approver[1] : null,
    }));
  }

  // Set approver berdasarkan nama user
  @Post(':id/approver-by-name')
  async setApproverByName(
    @Param('id') id: string,
    @Body('approverName') approverName: string,
  ) {
    const employeeId = parseInt(id);
    return await this.employeeService.setEmployeeApproverByName(employeeId, approverName);
  }

    // Ambil semua employee berdasarkan department_id
  @Get('department/:departmentId/employees')
  async getEmployeesByDepartmentId(@Param('departmentId') departmentId: string) {
    const deptId = parseInt(departmentId);
    return await this.employeeService.getEmployeesByDepartmentId(deptId);
  }

}
