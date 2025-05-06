export class EmployeeDto {
    id: number;
    name: string;
    department_id: [number, string];
    job_id: [number, string];
    parent_id: [number, string];
    contract_id: [number, string];
    work_email?: string;
    work_phone?: string;
    approver?: [number, string];
  }