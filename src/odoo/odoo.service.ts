import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OdooService {
  private readonly url = 'http://localhost:8069/jsonrpc';
  private readonly db = 'SSM';
  private readonly username = 'admin@ssmindonesia.com';
  private readonly password = 'a';

  async call(model: string, method: string, args: any[] = [], kwargs: any = {}) {
    // Login ke Odoo
    const uidRes = await axios.post(this.url, {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "common",
        method: "login",
        args: [this.db, this.username, this.password]
      },
      id: Math.floor(Math.random() * 1000)
    });

    const uid = uidRes.data.result;

    // Panggil method model Odoo
    const response = await axios.post(this.url, {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          this.db,          // Nama database
          uid,              // UID hasil login
          this.password,    // Password
          model,            // Model
          method,           // Method
          args,             // Argumen utama (list)
          kwargs            // Argumen keyword opsional (dict/object)
        ]
      },
      id: Math.floor(Math.random() * 1000)
    });

    return response.data.result;
  }
}
