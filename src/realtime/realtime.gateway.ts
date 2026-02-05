import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server

  private readonly userSockets = new Map<string, Set<string>>()

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    const userId = data?.userId
    if (!userId) return
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId)!.add(client.id);

    client.emit('joined', { ok: true }, (data) => console.log(data));
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id)
        if (socketIds.size === 0) this.userSockets.delete(userId);
        break
      }
    }
  }

  sendToUser(userId: string, event: string, payload: any) {
    const socketIds = this.userSockets.get(userId)
    if (!socketIds || socketIds.size === 0) return

    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, payload)
    }
  }
}
