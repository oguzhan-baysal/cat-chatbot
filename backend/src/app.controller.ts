import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  getHello(): string {
    return 'Hello from Cat ChatBot Backend!';
  }

  @Get('test-db')
  async testDatabase() {
    try {
      // Veritabanı bağlantısını kontrol et
      if (this.connection.readyState === 1) {
        return { status: 'success', message: 'Veritabanına başarıyla bağlandı!' };
      } else {
        return { status: 'error', message: 'Veritabanına bağlanılamadı.' };
      }
    } catch (error) {
      return { status: 'error', message: 'Bir hata oluştu: ' + error.message };
    }
  }

  @Get('test')
  testEndpoint() {
    return {
      message: 'Cat ChatBot API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
