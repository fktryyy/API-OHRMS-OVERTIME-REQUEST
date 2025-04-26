import { Injectable } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class EmployeeService {
  constructor(private readonly odoo: OdooService) {}

  async getAllEmployees() {
    const domain = [['active', '=', true]];
    const fields = [
      'id',
      'name',
      'department_id',
      'job_id',
      'parent_id',
      'contract_id',
      'work_email',
      'work_phone',
    ];

    return await this.odoo.call(
      'hr.employee',
      'search_read',
      [domain],                  // args
      { fields }                 // kwargs
    );
  }

  async getEmployeeOvertime(employeeId: number) {
    const domain = [['employee_id', '=', employeeId]];
    const fields = [
      'id',
      'date_from',
      'date_to',
      'duration_type',
      'type',
      'actual_ovt'
    ];

    return await this.odoo.call(
      'hr.overtime',
      'search_read',
      [domain],                  // args
      { fields }                 // kwargs
    );
  }
  async getAllDepartments() {
    const fields = ['id', 'name', 'manager_id', 'company_id', 'parent_id'];
  
    return await this.odoo.call(
      'hr.department',
      'search_read',
      [[]], // Ambil semua department tanpa filter
      { fields }
    );
  }
  async getDepartmentFullNameByEmployeeId(employeeId: number) {
    const employee = await this.odoo.call(
      'hr.employee',
      'search_read',
      [[['id', '=', employeeId]]],
      { fields: ['department_id'] }
    );
  
    if (!employee || employee.length === 0) {
      throw new Error('Employee not found');
    }
  
    const departmentId = employee[0].department_id?.[0];
  
    // Ambil data lengkap department termasuk parent_id
    const departments = await this.odoo.call(
      'hr.department',
      'search_read',
      [[['id', '=', departmentId]]],
      { fields: ['id', 'name', 'parent_id'] }
    );
  
    if (!departments || departments.length === 0) {
      throw new Error('Department not found');
    }
  
    let fullName = departments[0].name;
    let current = departments[0];
  
    // Loop ke parent department (maks 3 level agar aman dari infinite loop)
    for (let i = 0; i < 3 && current.parent_id; i++) {
      const parentId = current.parent_id[0];
      const parent = await this.odoo.call(
        'hr.department',
        'search_read',
        [[['id', '=', parentId]]],
        { fields: ['name', 'parent_id'] }
      );
  
      if (!parent || parent.length === 0) break;
  
      fullName = parent[0].name + ' / ' + fullName;
      current = parent[0];
    }
  
    return {
      id: departmentId,
      name: fullName
    };
  }
  
  async getDepartmentByEmployeeId(employeeId: number) {
    const employee = await this.odoo.call(
      'hr.employee',
      'search_read',
      [[['id', '=', employeeId]]],
      { fields: ['department_id'] }
    );
  
    if (!employee || employee.length === 0) {
      throw new Error('Employee not found');
    }
  
    const department = employee[0].department_id;
    return { id: department[0], name: department[1] };
  }
  
  
}
