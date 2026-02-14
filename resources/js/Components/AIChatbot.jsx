import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm Pavona AI Assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message to backend
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        
        // Add user message
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setIsTyping(true);

        try {
            // Send to Laravel backend (CSRF handled by axios defaults)
            const response = await axios.post('/chat', { message: userMessage });
            
            // Add bot response
            setMessages(prev => [...prev, { 
                text: response.data.reply || 'Sorry, I could not process that.', 
                sender: 'bot' 
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                text: 'Sorry, something went wrong. Please try again.', 
                sender: 'bot' 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-white"
            >
                {isOpen ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Box */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-200 flex flex-col overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold">Pavona AI</h3>
                                <p className="text-xs opacity-90">Online</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-purple-50/50 to-pink-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl ${
                                    msg.sender === 'user' 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
                                        : 'bg-white shadow-md text-gray-800 rounded-bl-none'
                                }`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white shadow-md p-3 rounded-2xl rounded-bl-none">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="p-4 bg-white border-t border-purple-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
