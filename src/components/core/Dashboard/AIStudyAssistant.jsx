import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { VscRobot } from 'react-icons/vsc';
import { apiConnector } from '../../../services/apiconnector';
import { smartStudyEndpoints } from '../../../services/apis';

const { ASK_DOUBT_API } = smartStudyEndpoints;

const AIStudyAssistant = () => {
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Array of {question, answer}
  const [loading, setLoading] = useState(false);

  const handleAskDoubt = async () => {
    if (!doubtQuestion.trim()) return;

    setLoading(true);
    try {
      const response = await apiConnector('POST', ASK_DOUBT_API, {
        question: doubtQuestion,
      });

      if (response.data.success) {
        setChatHistory(prev => [...prev, {
          question: doubtQuestion,
          answer: response.data.answer,
        }]);
        setDoubtQuestion('');
      } else {
        toast.error('Failed to get an answer');
      }
    } catch (error) {
      console.error('Doubt error:', error);
      toast.error('An error occurred while asking the doubt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center bg-richblack-900 text-white min-h-[400px] p-24">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-6 mb-8">
          <VscRobot className="text-6xl text-blue-400" />
          <h2 className="text-3xl font-semibold text-richblack-100">
            AI Study Assistant
          </h2>
          <p className="text-center text-richblack-300 text-sm">
            Ask for help with studying, courses, assignments, or any educational doubts!
          </p>
        </div>

        {/* Chat History */}
        <div className="bg-richblack-800 border border-richblack-700 rounded-lg p-4 mb-4 w-full max-h-96 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <p className="text-richblack-400 italic text-center">
              Hi! I'm your AI study assistant. What doubt can I help you with today? 😊
            </p>
          ) : (
            chatHistory.map((chat, idx) => (
              <div key={idx} className="mb-4">
                <div className="bg-purple-900 bg-opacity-30 p-3 rounded-lg mb-2">
                  <strong className="text-purple-200">You:</strong> {chat.question}
                </div>
                <div className="bg-richblack-700 p-3 rounded-lg whitespace-pre-wrap">
                  <strong className="text-green-200">AI Assistant:</strong> {chat.answer}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ask Doubt Input */}
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={doubtQuestion}
            onChange={(e) => setDoubtQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskDoubt()}
            placeholder="Ask your doubt here..."
            className="flex-1 bg-richblack-800 border border-richblack-700 rounded-lg px-4 py-3 text-white placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-50"
            disabled={loading}
          />
          <button
            onClick={handleAskDoubt}
            disabled={!doubtQuestion.trim() || loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        <div className="mt-6 text-center text-richblack-400 text-sm">
          <p>Examples: "How to solve this math problem?", "Study tips for exams", "Help with physics concepts"</p>
        </div>
      </div>
    </div>
  );
};

export default AIStudyAssistant;
