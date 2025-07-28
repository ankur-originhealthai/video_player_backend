import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Path } from './path.entity';
@Module({
  imports: [ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..', 'public'),
      serveRoot: '/static',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'Player',
      // entities: [User, Patient, Recordings, Exam],
      synchronize: true,
    }),
  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
