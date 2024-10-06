import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompletedChatDocument = CompletedChat & Document;

@Schema()
export class CompletedChat {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ type: [{ question: String, answer: String }] })
  qa: { question: string; answer: string }[];
}

export const CompletedChatSchema = SchemaFactory.createForClass(CompletedChat);