import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Message {
  type: 'bot' | 'user';
  content: string;
}

const ChatMessage = ({ type, children }: { type: 'user' | 'bot', children: React.ReactNode }) => (
  <div className={`rounded-md p-2 mb-2 ${type === 'user' ? 'bg-green-800 self-start' : 'bg-green-900 self-end'} max-w-[80%]`}>
    <p className={`text-sm ${type === 'user' ? 'text-green-300' : 'text-green-400'}`}>
      {type === 'user' ? 'User Message' : 'Bot Message'}
    </p>
    <p className="text-green-100 break-words">{children}</p>
  </div>
)

const ChatBot: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasIncompleteSession, setHasIncompleteSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkIncompleteSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkIncompleteSession = async () => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      try {
        const response = await axios.get(`http://localhost:3000/chat/incomplete/${savedSessionId}`);
        if (response.data.session) {
          setHasIncompleteSession(true);
          setSessionId(savedSessionId);
        } else {
          startSession(false);
        }
      } catch (error) {
        console.error('Yarım kalmış oturum kontrolü hatası:', error);
        startSession(false);
      }
    } else {
      startSession(false);
    }
  };

  const startSession = async (resumeSession = false) => {
    console.log('Starting session, resume:', resumeSession);
    try {
      if (resumeSession && sessionId) {
        console.log('Resuming session:', sessionId);
        getNextQuestion(sessionId);
      } else {
        console.log('Starting new session');
        const response = await axios.post('http://localhost:3000/chat/start');
        console.log('New session response:', response.data);
        setSessionId(response.data.sessionId);
        localStorage.setItem('chatSessionId', response.data.sessionId);
        if (response.data.message) {
          setMessages(prev => [...prev, { type: 'bot', content: response.data.message }]);
        }
      }
      setHasIncompleteSession(false);
    } catch (error) {
      console.error('Session start error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
      }
    }
  };

  const getNextQuestion = async (sid: string) => {
    console.log('Getting next question for session:', sid);
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/chat/question/${sid}`);
      console.log('Response from server:', response.data);
      if (response.data.question) {
        console.log('New question received:', response.data.question);
        setMessages(prev => [...prev, { type: 'bot', content: response.data.question }]);
      } else {
        console.log('No more questions, session complete');
        setIsComplete(true);
        setMessages(prev => [...prev, { type: 'bot', content: 'Congratulations! You have answered all the questions.' }]);
      }
    } catch (error) {
      console.error('Error getting question:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
      }
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, an error occurred. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !inputMessage.trim() || isComplete) return;

    setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
    setInputMessage('');

    try {
      const response = await axios.post(`http://localhost:3000/chat/answer/${sessionId}`, { answer: inputMessage });
      console.log('Server response:', response.data);
      if (response.data.aiResponse) {
        setMessages(prev => [...prev, { type: 'bot', content: response.data.aiResponse }]);
      }
      if (response.data.nextQuestion) {
        if (response.data.nextQuestion.includes("Congratulations!")) {
          setIsComplete(true);
          const thankYouMessage = "Thank you so much for taking the time to answer these questions about cats! Your responses were delightful and insightful. I really appreciate your participation and hope you enjoyed our chat about our feline friends. Have a wonderful day!";
          setMessages(prev => [...prev, { type: 'bot', content: thankYouMessage }]);
          setTimeout(() => {
            navigate('/');
          }, 5000); // 5 saniye sonra anasayfaya yönlendir
        } else {
          setMessages(prev => [...prev, { type: 'bot', content: response.data.nextQuestion }]);
        }
      }
    } catch (error) {
      console.error('Answer submission error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
      }
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, an error occurred. Please try again.' }]);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black p-4">
      <div className="w-full max-w-4xl border-4 border-green-500 rounded-lg p-4 flex flex-col h-[80vh] bg-gray-900">
        {hasIncompleteSession ? (
          <div className="text-center mb-4">
            <p className="text-green-300 mb-2">You have an incomplete session. Would you like to continue?</p>
            <button
              onClick={() => startSession(true)}
              className="bg-green-500 text-black px-4 py-2 rounded mr-2 hover:bg-green-600"
            >
              Continue
            </button>
            <button
              onClick={() => startSession(false)}
              className="bg-red-500 text-black px-4 py-2 rounded hover:bg-red-600"
            >
              Start New Session
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}>
                <ChatMessage type={message.type}>
                  {message.content}
                </ChatMessage>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        {isLoading && (
          <div className="text-center my-4">
            <p className="text-green-500">Loading next question...</p>
          </div>
        )}
        <div className="mt-auto">
          <p className="text-green-500 text-center mb-2">Welcome to Cat ChatBot</p>
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isComplete ? "Chat completed" : "Type your message..."}
              className="flex-grow bg-transparent border border-green-500 rounded-l p-2 text-green-300 placeholder-green-700"
              disabled={isComplete}
            />
            <button
              type="submit"
              disabled={isComplete}
              className={`px-4 py-2 rounded-r ${isComplete ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-black`}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;