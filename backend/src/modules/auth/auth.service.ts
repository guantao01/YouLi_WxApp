import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  /**
   * WeChat Mini Program login
   * Exchange code for openid, then create/update user
   */
  async wechatLogin(code: string, userInfo?: any): Promise<{ token: string; user: any }> {
    // Get openid from WeChat API
    const openid = await this.getWechatOpenId(code);

    if (!openid) {
      throw new UnauthorizedException('WeChat login failed');
    }

    // Find or create user
    let user = await this.usersService.findByOpenid(openid);

    if (!user) {
      // Create new user
      user = await this.usersService.createUser({
        openid,
        nickname: userInfo?.nickname || 'User',
        avatar: userInfo?.avatar || '',
        province: userInfo?.province || null,
        city: userInfo?.city || null,
      });
    } else if (userInfo) {
      // Update user info
      user = await this.usersService.updateUser(user.id, {
        nickname: userInfo.nickname,
        avatar: userInfo.avatar,
      });
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      userId: user.id,
      openid: user.openid,
    });

    return { token, user };
  }

  /**
   * Get WeChat OpenID from code
   */
  private async getWechatOpenId(code: string): Promise<string | null> {
    try {
      const appid = this.configService.get('WECHAT_APPID');
      const secret = this.configService.get('WECHAT_SECRET');

      const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid,
          secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      if (response.data.openid) {
        return response.data.openid;
      }

      return null;
    } catch (error) {
      console.error('WeChat API error:', error);
      return null;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
