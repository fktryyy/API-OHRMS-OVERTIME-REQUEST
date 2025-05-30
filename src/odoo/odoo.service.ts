import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OdooService {
  private readonly url = process.env.ODOO_URL!;
  private readonly db = process.env.ODOO_DB!;
  private readonly username = process.env.ODOO_USERNAME!;
  private readonly password = process.env.ODOO_PASSWORD!;

  // Method utama untuk memanggil Odoo RPC
  async call(model: string, method: string, args: any[] = [], kwargs: any = {}) {
    // Login ke Odoo untuk mendapatkan UID
    const uidRes = await axios.post(this.url, {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "common",
        method: "login",
        args: [this.db, this.username, this.password],
      },
      id: Math.floor(Math.random() * 1000),
    });

    const uid = uidRes.data.result;

    // Panggil method di model Odoo
    const response = await axios.post(this.url, {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          this.db,
          uid,
          this.password,
          model,
          method,
          args,
          kwargs,
        ],
      },
      id: Math.floor(Math.random() * 1000),
    });

    return response.data.result;
  }

   async findEmployeeByBarcode(barcode: string) {
    const domain = [['barcode', '=', barcode]];
    const fields = ['id', 'name', 'barcode', 'work_email'];

    const employees = await this.call('hr.employee', 'search_read', [domain], {
      fields,
      limit: 1,
    });

    return employees.length ? employees[0] : null;
  }
  async findEmployeeByUsername(username: string, uid: number, password: string) {
    const domain = [['user_id.login', '=', username]];
    const fields = ['id', 'name', 'barcode'];
  
    const employees = await this.call('hr.employee', 'search_read', [domain], {
      fields,
      limit: 1,
    });
  
    return employees.length ? employees[0] : null;
  }
  

async authenticate(username: string, password: string): Promise<number | null> {
  try {
    const response = await axios.post(this.url, {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "common",
        method: "authenticate",
        args: [this.db, username, password, {}],
      },
      id: Math.floor(Math.random() * 1000),
    });

    const uid = response.data.result;
    return uid || null;
  } catch (error) {
    console.error('Gagal autentikasi ke Odoo:', error);
    return null;
  }
}


}
