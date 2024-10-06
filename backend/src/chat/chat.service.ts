import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';
import { CompletedChat, CompletedChatDocument } from './completed-chat.schema';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatService {
	private genAI: GoogleGenerativeAI;
	private model: any;

	constructor(
		@InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
		@InjectModel(CompletedChat.name) private completedChatModel: Model<CompletedChatDocument>
	) {
		this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
		this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
	}

	async createSession(): Promise<string> {
		const sessionId = uuidv4();
		const chat = new this.chatModel({
			sessionId,
			startTime: new Date(),
			qa: [],
			lastActivityTime: new Date(),
		});
		await chat.save();
		return sessionId;
	}

	async getNextQuestion(sessionId: string): Promise<string | null> {
		console.log(`Getting next question for session: ${sessionId}`);
		const chat = await this.chatModel.findOne({ sessionId }).exec();
		console.log(`Chat found:`, chat);
		if (!chat) return null;
		
		chat.lastActivityTime = new Date();
		await chat.save();

		const answeredCount = chat.qa.length;
		console.log(`Answered questions count: ${answeredCount}`);
		if (answeredCount >= 10) {
			if (!chat.endTime) {
				chat.endTime = new Date();
				await chat.save();
			}
			console.log('All questions answered');
			return "Congratulations! You have answered all the questions. Thank you for chatting about cats!";
		}
		
		const prompt = `You are a friendly cat enthusiast talking to a casual cat owner or cat lover. Ask a simple, fun, and engaging question about cats that anyone could answer. The question should be easy to understand and not require expert knowledge. Make it conversational, as if you're chatting with a friend about cats. Only return the question, nothing else.`;

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			let generatedQuestion = response.text();
			
			if (!generatedQuestion.endsWith('?')) {
				generatedQuestion += '?';
			}

			console.log(`Generated question: ${generatedQuestion}`);
			return generatedQuestion;
		} catch (error) {
			console.error('Error generating question:', error);
			return "What's your favorite thing about cats?";
		}
	}

	async saveAnswer(sessionId: string, answer: string): Promise<{ aiResponse: string, nextQuestion: string | null }> {
		console.log(`Saving answer for session: ${sessionId}`);
		try {
			const chat = await this.chatModel.findOne({ sessionId }).exec();
			console.log('Chat found:', chat);
			if (!chat) throw new Error('Session not found');

			const questionIndex = chat.qa.length;
			console.log(`Question index: ${questionIndex}`);
			if (questionIndex < 10) {
				const lastQuestion = chat.qa[questionIndex - 1]?.question || "What do you think about cats?";
				chat.qa.push({ question: lastQuestion, answer });
				chat.lastActivityTime = new Date();

				if (chat.qa.length === 10) {
					chat.endTime = new Date();
					await this.moveToCompletedChats(chat);
					return { 
						aiResponse: "Thank you for answering all the questions!",
						nextQuestion: "Congratulations! You have answered all the questions. Thank you for chatting with me about cats!"
					};
				} else {
					await chat.save();
					const aiResponse = await this.generateAIResponse(lastQuestion, answer);
					const nextQuestion = await this.getNextQuestion(sessionId);
					return { aiResponse, nextQuestion };
				}
			} else {
				console.log('All questions have been answered');
				return { 
					aiResponse: "Thank you for answering all the questions!",
					nextQuestion: "Congratulations! You have answered all the questions. Thank you for chatting with me about cats!"
				};
			}
		} catch (error) {
			console.error('Error in saveAnswer:', error);
			throw error;
		}
	}

	private async generateAIResponse(question: string, answer: string): Promise<string> {
		const prompt = `As a friendly cat enthusiast, respond to the user's answer about cats in a casual, warm, and engaging way. Keep your response brief (1-2 sentences) and conversational, as if chatting with a friend. Be positive and encouraging. Don't ask new questions.

Question: ${question}
User's Answer: ${answer}

Your response:`;

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			let aiResponse = response.text();
			
			if (aiResponse.length < 20 || !aiResponse.match(/[.!?]$/)) {
				aiResponse = `That's so cool! I love hearing about people's experiences with cats. Thanks for sharing!`;
			}
			return aiResponse;
		} catch (error) {
			console.error('Error generating AI response:', error);
			return `Wow, that's interesting! Thanks for sharing your thoughts about cats.`;
		}
	}

	private async moveToCompletedChats(chat: ChatDocument): Promise<void> {
		const completedChat = new this.completedChatModel({
			sessionId: chat.sessionId,
			startTime: chat.startTime,
			endTime: chat.endTime,
			qa: chat.qa,
		});
		await completedChat.save();
		await this.chatModel.findByIdAndDelete(chat._id);
	}

	async getIncompleteSession(sessionId: string): Promise<ChatDocument | null> {
		return this.chatModel.findOne({ sessionId }).exec();
	}

	async handleResponse(sessionId: string, answer: string): Promise<{ message: string; continueChat: boolean }> {
		const lowercaseAnswer = answer.toLowerCase();
		if (lowercaseAnswer.includes('yes') || lowercaseAnswer.includes('sure') || lowercaseAnswer.includes('okay')) {
			return {
				message: `Great! I'm excited to chat with you about cats. Let's start with the first question.`,
				continueChat: true
			};
		} else {
			return {
				message: "I understand. No problem at all! I'm here whenever you're ready to chat about cats. Feel free to come back anytime. Have a great day!",
				continueChat: false
			};
		}
	}
}