export class CreateOvertimeTypeDto {
    name: string;
    type: 'leave' | 'cash';
    duration_type: 'hours' | 'days';
    leave_type_id: number;
  }
  