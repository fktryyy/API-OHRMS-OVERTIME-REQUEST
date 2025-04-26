export class CreateOvertimeRequestDto {
  //employee_barcode: string;
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
}
