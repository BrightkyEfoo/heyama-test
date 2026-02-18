import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ObjectsGateway {
  @WebSocketServer()
  server: Server;

  notifyCreated(obj: any) {
    console.log('object:created', obj);
    this.server.emit('object:created', obj);
  }

  notifyDeleted(id: string) {
    console.log('object:deleted', { id });
    this.server.emit('object:deleted', { id });
  }
}
