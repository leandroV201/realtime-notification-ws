import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto, RegisterDto } from './dto/auth.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.validateUser(req.user.sub)
  }
}