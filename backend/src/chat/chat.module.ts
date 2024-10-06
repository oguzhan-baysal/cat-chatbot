import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat, ChatSchema } from './chat.schema';
import { CompletedChat, CompletedChatSchema } from './completed-chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: CompletedChat.name, schema: CompletedChatSchema }
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}