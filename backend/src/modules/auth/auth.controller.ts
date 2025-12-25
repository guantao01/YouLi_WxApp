import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * WeChat Mini Program login endpoint
   */
  @Post('wechat-login')
  async wechatLogin(@Body() body: { code: string; userInfo?: any }) {
    return await this.authService.wechatLogin(body.code, body.userInfo);
  }

  /**
   * Verify token
   */
  @Post('verify')
  async verifyToken(@Body() body: { token: string }) {
    return await this.authService.verifyToken(body.token);
  }
}
