import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-300 p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to Cat ChatBot!</h1>
      <p className="text-xl mb-8">Are you ready to answer 10 questions about cats?</p>
      <Link to="/chat" className="bg-green-500 text-black px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300">
        Start Chat
      </Link>
    </div>
  );
};

export default Home;