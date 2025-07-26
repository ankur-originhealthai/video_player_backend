import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
@WebSocketGateway(3002, {
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  imagePaths: string[] = [];
  batchSize = 10;
  imageFolderPath: string = process.env.IMAGE_FOLDER || path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    'Downloads',
    'images'
  );
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    console.log('Looking for images in:', this.imageFolderPath);
    if (fs.existsSync(this.imageFolderPath)) {
      this.imagePaths = fs
        .readdirSync(this.imageFolderPath)
        .filter((f) => /\.(jpg|jpeg|png|gif)$/i.test(f))
        .map((f) => `/images/${f}`); // Assumes /public/images is served
      console.log('Loaded images:', this.imagePaths.length);
    } else {
      console.error('Image folder not found:', this.imageFolderPath);
    }
    client.data.index = 0;
  }
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
  @SubscribeMessage('newMessage')
  handleInitialStream(client: Socket) {
    client.emit('metadata', { totalFrames: this.imagePaths.length });
    this.sendNextBatch(client);
  }
  @SubscribeMessage('next-batch')
  handleNextBatch(client: Socket) {
    this.sendNextBatch(client);
  }
  sendNextBatch(client: Socket) {
    const start = client.data.index || 0;
    const end = Math.min(start + this.batchSize, this.imagePaths.length);
    const batch = this.imagePaths
      .slice(start, end)
      .map((url) => `http://localhost:3000${url}`);
    client.emit('reply', batch);
    client.data.index = end;
    if (end >= this.imagePaths.length) {
      client.emit('end-of-stream');
    }
  }
}