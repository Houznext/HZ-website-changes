
import { Injectable } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) { }

  emitToUser(userId: string, event: string, payload: any) {
    this.gateway.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToRoom(room: string, event: string, payload: any) {
    this.gateway.server.to(room).emit(event, payload);
  }

  broadcast(event: string, payload: any) {
    this.gateway.server.emit(event, payload);
  }

  toThread(kind: 'dm' | 'channel', id: string) {
    return this.gateway.server.to(`${kind}:${id}`);
  }
}

