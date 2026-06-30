import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'EduCore API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
