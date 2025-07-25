import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
@WebSocketGateway(3002, { cors: { origin: '*' } })
export class Chatgateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly url = "http://localhost:3000";

  private readonly allImages = [
    this.url + "/static/img1.png",
    this.url + "/static/img2.png",
    this.url + "/static/img3.png",
    this.url + "/static/img4.png",
    this.url + "/static/img5.png",
    this.url + "/static/img6.png",
    this.url + "/static/img1.png",
    this.url + "/static/img2.png",
    this.url + "/static/img3.png",
    this.url + "/static/img4.png",
    this.url + "/static/img5.png",
    this.url + "/static/img6.png",
    this.url + "/static/img1.png",
    this.url + "/static/img2.png",
    this.url + "/static/img3.png",
    this.url + "/static/img4.png",
    this.url + "/static/img5.png",
    this.url + "/static/img6.png",
    this.url + "/static/img1.png",
    this.url + "/static/img2.png",
    this.url + "/static/img3.png",
    this.url + "/static/img4.png",
    this.url + "/static/img5.png",
    this.url + "/static/img6.png",
     this.url + "/static/img6.png",

      this.url + "/static/img6.png",
  ];
  private readonly CHUNK_SIZE = 5;
  private clientIndex = new Map<string, number>();
  handleConnection(client: Socket) {
    console.log("Client connected:", client.id);
    this.clientIndex.set(client.id, 0);
  }
  handleDisconnect(client: Socket) {
    console.log("Client disconnected:", client.id);
    this.clientIndex.delete(client.id);
  }
  @SubscribeMessage("newMessage")
  handleNewMessage(client: Socket) {
    console.log("Received: newMessage from", client.id);
    this.clientIndex.set(client.id, 0);
    this.sendNextImages(client);
  }
  @SubscribeMessage("next-batch")
  handleNextBatch(client: Socket) {
    //console.log("next batch sent")
    this.sendNextImages(client);
  }
  private sendNextImages(client: Socket) {
    const index = this.clientIndex.get(client.id) ?? 0;
    console.log(index)
    const nextChunk = this.allImages.slice(index, index + this.CHUNK_SIZE);
    if (nextChunk.length > 0) {
      client.emit("reply", nextChunk);
      this.clientIndex.set(client.id, index + nextChunk.length);
    } else {
      client.emit("end-of-stream", { done: true });
      return 
    }
  }
}






