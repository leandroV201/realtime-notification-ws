import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { LoginDto, RegisterDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
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


        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt.toISOString(),
            },
            token,
        }
    }

    async login(loginDto: LoginDto) {
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

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt.toISOString(),
            },
            token,
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
}