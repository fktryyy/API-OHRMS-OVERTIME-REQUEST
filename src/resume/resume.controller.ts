import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { Resume } from './resume.service'; // Pastikan Resume diimport jika diperlukan

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  // Endpoint untuk membuat resume baru
  @Post()
  async create(@Body() createResumeDto: CreateResumeDto): Promise<Resume> {
    try {
      // Panggil service untuk membuat resume baru
      const resume = await this.resumeService.create(createResumeDto);
      return resume;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message || 'Terjadi kesalahan saat membuat resume',
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // Endpoint untuk mengambil semua resume
  @Get()
  async findAll(): Promise<any> {
    try {
      const resumes = await this.resumeService.findAll(); // Menggunakan ResumeService untuk mengambil data
  
      // Jika tidak ada data, kembalikan objek dengan pesan yang jelas
      if (!resumes || resumes.length === 0) {
        return { message: 'Tidak ada resume ditemukan' };
      }
  
      // Kembalikan data resume yang ditemukan
      return resumes;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: error.message || 'Terjadi kesalahan saat mengambil data resume',
      }, HttpStatus.NOT_FOUND);
    }
  }
}