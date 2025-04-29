export class CreateResumeDto {
  id_user: string;
  employee_id: number;
  department_id: number;
  totalOvertimeHours: number;
  totalOvertimeDays: number;
  notes?: string; // optional
}
