import { Body, Controller, Get, Post, UseGuards, HttpCode, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() registerDto: RegisterDto
  ) {
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceInfo:
        typeof req.headers['user-agent'] === 'string'
          ? this.parseDeviceInfo(req.headers['user-agent'])
          : 'Não Identificado',
    };

    const result = await this.authService.register(registerDto, metadata);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceInfo:
        typeof req.headers['user-agent'] === 'string'
          ? this.parseDeviceInfo(req.headers['user-agent'])
          : 'Não Identificado',
    };

    const result = await this.authService.login(loginDto, metadata);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    const metadata = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceInfo:
        typeof req.headers['user-agent'] === 'string'
          ? this.parseDeviceInfo(req.headers['user-agent'])
          : 'Não Identificado',
    };

    const result = await this.authService.refreshAccessToken(
      refreshToken,
      metadata
    );

    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken');
    return { message: 'Logout realizado com sucesso' };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@Req() req: Request) {
    return this.authService.getActiveSessions(req['user'].sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    return this.authService.validateUser(req['user'].sub);
  }

  private parseDeviceInfo(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }
}