https://cat-chatbot.vercel.app/

![image](https://github.com/user-attachments/assets/9c14601b-2184-45ef-85dd-9e28ba9785e6)

# Cat ChatBot

Cat ChatBot is an interactive web application that engages users in a fun conversation about cats. It uses AI to generate questions and responses, creating a unique and entertaining experience for cat lovers.

## Features

- AI-powered chat interface
- 10 unique questions about cats in each session
- Responsive design for both desktop and mobile
- Session management for incomplete chats
- MongoDB integration for data persistence

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: MongoDB
- AI: Google's Generative AI (Gemini Pro)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/cat-chatbot.git
   cd cat-chatbot
   ```

2. Install dependencies for both frontend and backend:
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with the following content:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GOOGLE_API_KEY=your_google_api_key
   ```

   ### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run start:dev
   ```

2. In a new terminal, start the frontend:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all cat lovers who inspired this project
- Special thanks to the NestJS and React communities for their excellent documentation
