import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DataSource } from 'typeorm';
@WebSocketGateway(3002, {
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  imagePaths: string[] = [];
  batchSize = 50;
  constructor(private ds: DataSource) {}
  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    const rows = await this.ds.query('SELECT * FROM path');
    console.log('DB Response:', rows);
   this.imagePaths = rows.map((p) => {
  const filename = p.url.split('/').pop(); // extract just "frame_1.jpg"
  return `http://localhost:3000/images/${filename}`;
});
    console.log('Loaded image URLs:', this.imagePaths.length);
    client.data.index = 0;
  }
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
  @SubscribeMessage('newMessage')
  handleInitialStream(client: Socket) {
    client.emit('metadata', { total: this.imagePaths.length });
    this.sendNextBatch(client);
  }
  @SubscribeMessage('next-batch')
  handleNextBatch(client: Socket) {
    this.sendNextBatch(client);
  }
  sendNextBatch(client: Socket) {
    const start = client.data.index || 0;
    const end = Math.min(start + this.batchSize, this.imagePaths.length);
    const batch = this.imagePaths.slice(start, end);
    client.emit('reply', batch);
    client.data.index = end;
    if (end >= this.imagePaths.length) {
      client.emit('end-of-stream');
    }
  }
}