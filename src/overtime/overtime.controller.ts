import { Body, Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';
import { CreateOvertimeTypeDto } from './dto/create-overtime-type.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';

@Controller('overtime')
export class OvertimeController {
  constructor(private readonly odooService: OdooService) {}

  @Post('type')
  async createOvertimeType(@Body() body: CreateOvertimeTypeDto) {
    const result = await this.odooService.call('overtime.type', 'create', [[{
      name: body.name,
      type: body.type,
      duration_type: body.duration_type,
      leave_type: body.leave_type_id
    }]]);
    return { id: result };
  }

  @Post('request')
async createOvertimeRequest(@Body() body: CreateOvertimeRequestDto) {
  // Cek apakah sudah ada request dengan employee_id dan waktu yang sama
  const overlappingRequests = await this.odooService.call('hr.overtime', 'search', [[
    ['employee_id', '=', body.employee_id],
    ['date_from', '<', body.date_to],  // date_from dari request baru harus lebih kecil dari date_to request yang sudah ada
    ['date_to', '>', body.date_from]   // date_to dari request baru harus lebih besar dari date_from request yang sudah ada
  ]]);

  if (overlappingRequests.length > 0) {
    throw new HttpException({
      status: 'error',
      message: 'Anda tidak dapat memiliki 2 permintaan Lembur yang tumpang tindih pada hari yang sama!'
    }, HttpStatus.BAD_REQUEST);
  }

  try {
    // Jika tidak ada request yang bentrok, lanjutkan membuat request baru
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
        message: 'Anda tidak dapat memiliki 2 permintaan Lembur yang tumpang tindih pada hari yang sama!'
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
  async getAllOvertimeRequests() {
    const result = await this.odooService.call('hr.overtime', 'search_read', [
      [],
      [
        'id',
        'employee_id',
        'department_id',
        'job_id',
        'manager_id',
        'duration_type',
        'date_from',
        'date_to',
        'contract_id',
        'attchd_copy',
        'type',
      ],
    ]);
    return result;
  }
}
