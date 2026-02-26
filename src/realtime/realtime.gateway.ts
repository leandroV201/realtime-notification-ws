import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 60000,
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  private readonly userSockets = new Map<string, Set<string>>();

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token;

      if (!token) {
        console.log(`[WS] Cliente sem token: ${client.id}`);
        client.emit('error', { message: 'Token não fornecido' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get('JWT_ACCESS_SECRET') || 'access-secret',
      });

      const userId = payload.sub;
      client.userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      client.emit('authenticated', {
        userId,
        socketId: client.id,
      });
    } catch (error) {
      client.emit('error', { message: 'Token inválido ou expirado' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.userId;

    if (!userId) return;

    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.delete(client.id);

      if (socketIds.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.emit('joined', {
      ok: true,
      userId: client.userId,
      message: 'Autenticado via token JWT',
    });
  }

  sendToUser(userId: string, event: string, payload: any) {
    const socketIds = this.userSockets.get(userId);

    if (!socketIds || socketIds.size === 0) {
      return false;
    }

    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, payload);
    }

    return true;
  }

  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  isUserOnline(userId: string): boolean {
    const socketIds = this.userSockets.get(userId);
    return socketIds ? socketIds.size > 0 : false;
  }

  getUserConnectionCount(userId: string): number {
    const socketIds = this.userSockets.get(userId);
    return socketIds ? socketIds.size : 0;
  }

  getStats() {
    return {
      totalUsers: this.userSockets.size,
      totalConnections: Array.from(this.userSockets.values()).reduce(
        (sum, sockets) => sum + sockets.size,
        0,
      ),
      users: Array.from(this.userSockets.entries()).map(
        ([userId, socketIds]) => ({
          userId,
          connections: socketIds.size,
        }),
      ),
    };
  }
}