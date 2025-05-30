export class CreateOvertimeRequestDto {
  id_user: string;
  employee_id: number;
  department_id: number;
  job_id?: number | false;
  manager_id?: number | false;
  duration_type: string;
  date_from: string;
  date_to: string;
  contract_id: number;
  attchd_copy?: string | false;
  type: string;
  master_batch?: number;
  overtime_author?: String;
}
