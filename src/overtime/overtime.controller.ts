import { Body, Controller, Get, Post,Query, HttpException, HttpStatus } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';
import { CreateOvertimeTypeDto } from './dto/create-overtime-type.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';
import { ResumeService } from '../resume/resume.service'; // Import ResumeService

@Controller('overtime')
export class OvertimeController {
  constructor(
    private readonly odooService: OdooService,
    private readonly resumeService: ResumeService, // Inject ResumeService
  ) {}

  @Post('type')
  async createOvertimeType(@Body() body: CreateOvertimeTypeDto) {
    try {
      const result = await this.odooService.call('overtime.type', 'create', [[{
        name: body.name,
        type: body.type,
        duration_type: body.duration_type,
        leave_type: body.leave_type_id,
      }]]);
      return { id: result };
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Terjadi kesalahan saat membuat jenis lembur.',
        detail: error.message || JSON.stringify(error),
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('request')
  async createOvertimeRequest(@Body() body: CreateOvertimeRequestDto) {
    // Cek apakah sudah ada request dengan employee_id dan waktu yang sama
    const overlappingRequests = await this.odooService.call('hr.overtime', 'search', [[
      ['employee_id', '=', body.employee_id],
      ['date_from', '<', body.date_to],  // date_from dari request baru harus lebih kecil dari date_to request yang sudah ada
      ['date_to', '>', body.date_from],   // date_to dari request baru harus lebih besar dari date_from request yang sudah ada
    ]]);

    if (overlappingRequests.length > 0) {
      throw new HttpException({
        status: 'error',
        message: 'Anda tidak dapat memiliki 2 permintaan Lembur yang tumpang tindih pada hari yang sama!',
      }, HttpStatus.BAD_REQUEST);
    }

    try {
      // Jika tidak ada request yang bentrok, lanjutkan membuat request baru ke Odoo
      const result = await this.odooService.call('hr.overtime', 'create', [[{
        employee_id: body.employee_id,
        department_id: body.department_id,
        job_id: body.job_id || false,
        manager_id: body.manager_id || false,
        duration_type: body.duration_type,
        date_from: body.date_from,
        date_to: body.date_to,
        contract_id: body.contract_id,
        attchd_copy: body.attchd_copy || false,
        type: body.type,
      }]]);

      // Setelah berhasil buat Overtime, buat resume otomatis
      const resumeData = {
        id_user: body.id_user,  // Gunakan id_user hanya untuk resume
        employee_id: body.employee_id,
        department_id: body.department_id,
        totalOvertimeHours: this.calculateHours(body.date_from, body.date_to),
        totalOvertimeDays: this.calculateDays(body.date_from, body.date_to),
        notes: 'Generated from Overtime Request',
      };

      // Cek apakah data sudah benar sebelum memanggil ResumeService
      console.log('Data resume yang akan dibuat:', resumeData);

      const resume = await this.resumeService.create(resumeData);
      console.log('Resume yang baru dibuat:', resume);

      return { id: result };
    } catch (error) {
      // Log detail error Odoo
      console.log('🛑 Odoo Error Full Object:');
      console.dir(error, { depth: null }); // tampilkan semua properti error

      // Coba ekstrak pesan error dari berbagai kemungkinan
      const errorMessage = error?.message || error?.data?.message || error?.data?.debug || JSON.stringify(error);

      if (errorMessage.includes('Overtime requests that overlaps')) {
        throw new HttpException({
          status: 'error',
          message: 'Anda tidak dapat memiliki 2 permintaan Lembur yang tumpang tindih pada hari yang sama!',
        }, HttpStatus.BAD_REQUEST);
      }

      // Error umum fallback
      throw new HttpException({
        status: 'error',
        message: 'Terjadi kesalahan saat menyimpan request lembur.',
        detail: errorMessage,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get()
async getAllOvertimeRequests(
  @Query('tanggal') tanggal?: string,
  @Query('bulan') bulan?: number,
  @Query('tahun') tahun?: number,
  @Query('tanggal_awal') tanggal_awal?: string,
  @Query('tanggal_akhir') tanggal_akhir?: string,
) {
  try {
    let domain: [string, string, any][] = [];

    if (tanggal_awal && tanggal_akhir) {
      // Kalau user kirim tanggal range
      domain = [
        ['date_from', '>=', `${tanggal_awal} 00:00:00`],
        ['date_from', '<=', `${tanggal_akhir} 23:59:59`],
      ];
    } else if (tanggal) {
      // Kalau hanya kirim satu tanggal
      domain = [
        ['date_from', '>=', `${tanggal} 00:00:00`],
        ['date_from', '<=', `${tanggal} 23:59:59`],
      ];
    } else if (bulan && tahun) {
      // Kalau berdasarkan bulan
      const bulanString = bulan.toString().padStart(2, '0');
      const startDate = `${tahun}-${bulanString}-01 00:00:00`;
      const daysInMonth = new Date(tahun, bulan, 0).getDate();
      const endDate = `${tahun}-${bulanString}-${daysInMonth} 23:59:59`;

      domain = [
        ['date_from', '>=', startDate],
        ['date_from', '<=', endDate],
      ];
    }
    const result = await this.odooService.call('hr.overtime', 'search_read', [
      domain,
      [
        'id',
        'name',
        'employee_id',
        'department_id',
        'duration_type',
        'date_from',
        'date_to',
        'days_no_tmp',
        'actual_ovt',
        'state',
      ],
    ]);
    
    // Tambahkan state_label ke setiap item
    const stateLabels: { [key: string]: string } = {
      draft: 'Draft',
      f_approve: 'Waiting',
      approved: 'Approved',
      refused: 'Refused',
    };
    
    const finalResult = result.map((item: any) => ({
      ...item,
      state_label: stateLabels[item.state] || item.state, // fallback ke nilai asli kalau tidak dikenal
    }));
    
    return finalResult;
    
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Terjadi kesalahan saat mengambil data lembur.',
        detail: error.message || JSON.stringify(error),
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Helper untuk hitung durasi lembur
  private calculateHours(dateFrom: string, dateTo: string): number {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffMs = to.getTime() - from.getTime();
    return diffMs / (1000 * 60 * 60); // dari milliseconds ke jam
  }

  private calculateDays(dateFrom: string, dateTo: string): number {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffMs = to.getTime() - from.getTime();
    return diffMs / (1000 * 60 * 60 * 24); // dari milliseconds ke hari
  }
}
