import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt'; // Untuk enkripsi password

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Fungsi validasi user berdasarkan email dan password
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) { // Cek password yang terenkripsi
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Fungsi login, mengembalikan JWT
  async login(user: any) {
    const payload = { name: user.name, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Fungsi untuk membuat user baru (register)
  async createUser(name: string, email: string, password: string, role: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Enkripsi password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(newUser);
  }

  // Fungsi untuk mendapatkan data user berdasarkan ID
  async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!user) {
      throw new Error('User not found'); // Atau lemparkan exception lainnya jika user tidak ditemukan
    }
  
    return user;
  }
  

  // Fungsi untuk mendapatkan semua user
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find(); // Mengambil semua data user
  }
}
