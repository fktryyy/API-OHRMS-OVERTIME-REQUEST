import { IsString } from 'class-validator';

export class LoginDto {
  username: string;
  password: string;
}