import { Injectable } from '@nestjs/common';
import { OdooService } from 'src/odoo/odoo.service';

@Injectable()
export class LoginService {
  constructor(private readonly odooService: OdooService) {}

  async validateUsernamePassword(username: string, password: string) {
    // Cari employee yang punya username dan password cocok
    const domain = [['username', '=', username], ['password', '=', password]];
    const fields = ['id', 'name', 'username', 'barcode'];

    const result = await this.odooService.call('hr.employee', 'search_read', [domain], {
      fields,
      limit: 1,
    });

    return result.length ? result[0] : null;
  }
}
