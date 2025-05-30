import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';
import { CreateOvertimeTypeDto } from './dto/create-overtime-type.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';

@Controller('overtime')
export class OvertimeController {
  constructor(
    private readonly odooService: OdooService,
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
  // 🔍 Cek lembur tumpang tindih
  const overlappingRequests = await this.odooService.call('hr.overtime', 'search', [[
    ['employee_id', '=', body.employee_id],
    ['date_from', '<', body.date_to],
    ['date_to', '>', body.date_from],
  ]]);

  if (overlappingRequests.length > 0) {
    throw new HttpException({
      status: 'error',
      message: 'Anda tidak dapat memiliki 2 permintaan lembur yang tumpang tindih.',
    }, HttpStatus.BAD_REQUEST);
  }

  // ✅ Validasi overtime_author jika disertakan
  let authorId = null;
  if (body.overtime_author) {
    const authorSearch = await this.odooService.call('hr.employee', 'search_read', [
      [['id', '=', body.overtime_author]],
      ['id']
    ]);

    if (!authorSearch.length) {
      throw new HttpException({
        status: 'error',
        message: 'Author tidak ditemukan.',
      }, HttpStatus.BAD_REQUEST);
    }

    authorId = authorSearch[0].id;
  }

  try {
    // 🔁 Ambil master batch terbaru
    const lastBatch = await this.odooService.call('master.batch', 'search_read', [
      [],
      ['id', 'name']
    ], {
      order: 'id desc',
      limit: 1,
    });

    if (!lastBatch.length) {
      throw new HttpException({
        status: 'error',
        message: 'Tidak ada master batch yang tersedia.',
      }, HttpStatus.BAD_REQUEST);
    }

    const batchId = lastBatch[0].id;

    // 🚀 Simpan request lembur
    const result = await this.odooService.call('hr.overtime', 'create', [[{
      employee_id: body.employee_id,
      department_id: body.department_id,
      job_id: body.job_id || false,
      manager_id: body.manager_id || false,
      duration_type: body.duration_type,
      date_from: body.date_from,
      date_to: body.date_to,
      contract_id: body.contract_id || false,
      attchd_copy: body.attchd_copy || false,
      type: body.type,
      master_batch_id: batchId,
      overtime_author: authorId,
    }]]);

    return { status: 'success', result };

  } catch (error) {
    const errorMessage = error?.message || error?.data?.message || error?.data?.debug || JSON.stringify(error);
    throw new HttpException({
      status: 'error',
      message: 'Terjadi kesalahan saat menyimpan request lembur.',
      detail: errorMessage,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
@Get()
async getAllOvertimeRequests(
  @Query('employee_id') employee_id?: number, 
  @Query('tanggal') tanggal?: string,
  @Query('bulan') bulan?: number,
  @Query('tahun') tahun?: number,
  @Query('tanggal_awal') tanggal_awal?: string,
  @Query('tanggal_akhir') tanggal_akhir?: string,
  @Query('state') state?: string,
) {
  try {
    if (!employee_id) {
      throw new HttpException('Employee ID harus dikirim', HttpStatus.BAD_REQUEST);
    }

    let domain: [string, string, any][] = [];
    
    if (tanggal_awal && tanggal_akhir) {
      domain.push(['date_from', '>=', `${tanggal_awal} 00:00:00`]);
      domain.push(['date_from', '<=', `${tanggal_akhir} 23:59:59`]);
    } else if (tanggal) {
      domain.push(['date_from', '>=', `${tanggal} 00:00:00`]);
      domain.push(['date_from', '<=', `${tanggal} 23:59:59`]);
    } else if (bulan && tahun) {
      const bulanString = bulan.toString().padStart(2, '0');
      const startDate = `${tahun}-${bulanString}-01 00:00:00`;
      const daysInMonth = new Date(tahun, bulan, 0).getDate();
      const endDate = `${tahun}-${bulanString}-${daysInMonth} 23:59:59`;

      domain.push(['date_from', '>=', startDate]);
      domain.push(['date_from', '<=', endDate]);
    }

    if (state) {
      domain.push(['state', '=', state]);
    }
    

    // Filter berdasarkan author (employee id)
    const authorId = Number(employee_id);
    domain.push(['overtime_author', '=', authorId]);
    
    const result = await this.odooService.call('hr.overtime', 'search_read', [
      domain,
      [
        'name',
        'id',
        'employee_barcode',
        'employee_id',
        'department_id',
        'duration_type',
        'date_from',
        'date_to',
        'days_no_tmp',
        'actual_ovt',
        'state',
        'master_batch_id',
        'overtime_author',
      ],
    ]);

    const stateLabels: { [key: string]: string } = {
      draft: 'Draft',
      f_approve: 'Waiting',
      approved: 'Approved',
      refused: 'Refused',
    };

    const finalResult = result.map((item: any) => ({
      ...item,
      state_label: stateLabels[item.state] || item.state,
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

  @Get('admin-employees')
  async getAdminEmployees() {
    try {
      const adminEmployees = await this.odooService.call('hr.employee', 'search_read', [
        [['is_admin_type', '=', true]],
        ['id', 'name']
      ]);
  
      return {
        status: 'success',
        data: adminEmployees,
      };
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Gagal mengambil data employee admin.',
        detail: error.message || JSON.stringify(error),
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  @Get('by-nik')
  async getOvertimeByNik(@Query('nik') nik: string) {
    if (!nik) {
      throw new HttpException({
        status: 'error',
        message: 'Parameter nik wajib diisi.',
      }, HttpStatus.BAD_REQUEST);
    }

    try {
      const employeeResult = await this.odooService.call('hr.employee', 'search_read', [
        [['barcode', '=', nik]],
        ['id'],
      ]);

      if (!employeeResult || employeeResult.length === 0) {
        throw new HttpException({
          status: 'error',
          message: `Karyawan dengan NIK ${nik} tidak ditemukan.`,
        }, HttpStatus.NOT_FOUND);
      }

      const employeeId = employeeResult[0].id;

      const overtimeResult = await this.odooService.call('hr.overtime', 'search_read', [
        [['employee_id', '=', employeeId]],
        [
          'name',
          'id',
          'employee_barcode',
          'name',
          'employee_id',
          'department_id',
          'duration_type',
          'date_from',
          'date_to',
          'days_no_tmp',
          'actual_ovt',
          'state',
          'master_batch_id',
          'overtime_author',
        ],
      ]);

      const stateLabels: { [key: string]: string } = {
        draft: 'Draft',
        f_approve: 'Waiting',
        approved: 'Approved',
        refused: 'Refused',
      };

      const finalResult = overtimeResult.map((item: any) => ({
        ...item,
        state_label: stateLabels[item.state] || item.state,
      }));

      return finalResult;
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Terjadi kesalahan saat mengambil data lembur berdasarkan NIK.',
        detail: error.message || JSON.stringify(error),
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('master-batch')
  async getAllMasterBatch() {
    try {
      // 1. Trigger pembuatan batch baru
      const batchId = await this.odooService.call('master.batch', 'create', [{}]);
  
      // 2. Ambil record batch barusan
      const newBatch = await this.odooService.call('master.batch', 'read', [
        [batchId],
        ['id', 'name', 'date_created'],
      ]);
  
      // 3. (Opsional) Ambil data hr.overtime juga jika perlu
      const overtimeRecords = await this.odooService.call('hr.overtime', 'search_read', [
        [],
      ], {
        fields: ['id', 'master_batch'],
        order: 'id desc',
      });
  
      // 4. Return dua-duanya
      return {
        new_batch: newBatch[0],
        overtime_records: overtimeRecords,
      };
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Terjadi kesalahan saat generate dan ambil data master batch.',
        detail: error.message || JSON.stringify(error),
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  private calculateHours(dateFrom: string, dateTo: string): number {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffMs = to.getTime() - from.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  private calculateDays(dateFrom: string, dateTo: string): number {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffMs = to.getTime() - from.getTime();
    return diffMs / (1000 * 60 * 60 * 24);
  }
}
