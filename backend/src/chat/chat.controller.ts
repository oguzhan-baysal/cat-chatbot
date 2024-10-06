import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  async startSession() {
    const sessionId = await this.chatService.createSession();
    const firstQuestion = await this.chatService.getNextQuestion(sessionId);
    return { sessionId, message: firstQuestion };
  }

  @Get('question/:sessionId')
  async getQuestion(@Param('sessionId') sessionId: string) {
    console.log('Getting question for session:', sessionId);
    const question = await this.chatService.getNextQuestion(sessionId);
    console.log('Question generated:', question);
    return { question };
  }

  @Post('answer/:sessionId')
  async submitAnswer(@Param('sessionId') sessionId: string, @Body('answer') answer: string) {
    console.log(`Submitting answer for session: ${sessionId}`);
    const response = await this.chatService.saveAnswer(sessionId, answer);
    return { 
      success: true, 
      aiResponse: response.aiResponse, 
      nextQuestion: response.nextQuestion 
    };
  }

  @Get('incomplete/:sessionId')
  async getIncompleteSession(@Param('sessionId') sessionId: string) {
    const session = await this.chatService.getIncompleteSession(sessionId);
    return session ? { session } : { message: 'No incomplete session found' };
  }

  // ... diğer metodlar aynı kalacak ...
}