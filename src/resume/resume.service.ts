import { Injectable } from '@nestjs/common';

export interface Resume {
  id_user: string;
  employee_id: number;
  department_id: number;
  totalOvertimeHours: number;
  totalOvertimeDays: number;
  notes?: string;
}

@Injectable()
export class ResumeService {
  private resumes: Resume[] = []; // Simulasi data dalam array, bisa diganti dengan database

  // Fungsi untuk membuat resume
  async create(data: Resume): Promise<Resume> {
    console.log('Membuat resume dengan data:', data);
    this.resumes.push(data);  // Menambahkan data ke array
    return data;  // Mengembalikan data resume yang baru dibuat
  }

  // Fungsi untuk mengambil semua resume
  async findAll(): Promise<Resume[]> {
    if (this.resumes.length === 0) {
      throw new Error('Tidak ada resume ditemukan');  // Menambahkan error handling jika tidak ada resume
    }
    return this.resumes;  // Mengembalikan semua resume
  }
}
