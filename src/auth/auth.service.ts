import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { LoginDto, RegisterDto } from './dto/auth.dto'
import { ConfigService } from '@nestjs/config'
import { RedisService } from 'src/redis/redis.service'
import { TokenMetadata } from './dto/token.dto'
import { v4 } from 'uuid'

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private redisService: RedisService,
    ) { }

    async register(registerDto: RegisterDto, metadata: TokenMetadata) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        })

        if (existingUser) {
            throw new ConflictException('Email já cadastrado')
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10)

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                name: registerDto.name,
                password: hashedPassword,
            },
        })


        const tokens = await this.generateTokens(user.id, user.email, metadata);


        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt.toISOString(),
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        }
    }

    async login(loginDto: LoginDto, metadata: TokenMetadata) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        })

        if (user) {
            if (!await bcrypt.compare(loginDto.password, user.password)) {
                throw new UnauthorizedException('Credenciais inválidas')
            }
        } else {
            throw new NotFoundException('Usuário não encontrado');
        }

        const tokens = await this.generateTokens(user.id, user.email, metadata);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt.toISOString(),
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        }
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado')
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
        }
    }

    async generateTokens(userId: string, email: string, metadata: TokenMetadata) {
        const payload = { sub: userId, email: email };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
        });


        const refreshTokenValue = v4();
        const refreshTokenExpiry = 7 * 24 * 60 * 60;

        await this.redisService.setRefreshToken(refreshTokenValue, userId, refreshTokenExpiry);


        await this.prisma.refreshToken.create({
            data: {
                token: refreshTokenValue,
                userId,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                deviceInfo: metadata.deviceInfo,
                expiresAt: new Date(Date.now() + refreshTokenExpiry * 1000)
            }
        });

        return {
            accessToken,
            refreshToken: refreshTokenValue,
        };
    }

    async refreshAccessToken(refreshToken: string, metadata: TokenMetadata) {
        const userId = await this.redisService.getRefreshToken(refreshToken);


        if (!userId) {
            throw new UnauthorizedException('Refresh token inválido ou expirado');
        }

        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });


        if (!tokenRecord || tokenRecord.revokedAt) {
            await this.redisService.deleteRefreshToken(refreshToken);
            throw new UnauthorizedException('Refresh token revogado');
        }

        const accessToken = this.jwtService.sign(
            { sub: userId },
            {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            },
        );

        return { accessToken };
    }

    async logout(refreshToken: string) {
        await this.redisService.deleteRefreshToken(refreshToken);

        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revokedAt: new Date() },
        });
    }

    async getActiveSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        createdAt: true,
      },
    });
  }
}