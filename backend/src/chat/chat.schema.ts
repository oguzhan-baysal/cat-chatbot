import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ required: true })
  lastActivityTime: Date;

  @Prop({ type: [{ question: String, answer: String }] })
  qa: { question: string; answer: string }[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);