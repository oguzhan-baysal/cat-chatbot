import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-green-300">
        <header className="bg-gray-900 shadow-md">
          <nav className="container mx-auto px-4 py-3 md:py-4">
            <ul className="flex justify-center md:justify-start space-x-4 md:space-x-8">
              <li>
                <Link to="/" className="text-green-500 hover:text-green-400 text-lg md:text-xl transition duration-300">Home</Link>
              </li>
              <li>
                <Link to="/chat" className="text-green-500 hover:text-green-400 text-lg md:text-xl transition duration-300">Chat</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatBot />} />
          </Routes>
        </main>

        <footer className="bg-gray-900 text-center py-4">
          <p className="text-green-500">&copy; 2024 Cat ChatBot. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
