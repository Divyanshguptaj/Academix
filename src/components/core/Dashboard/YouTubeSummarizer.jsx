import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { VscDeviceCameraVideo } from 'react-icons/vsc';
import { apiConnector } from '../../../services/apiconnector';
import { smartStudyEndpoints } from '../../../services/apis';

const { SUMMARIZE_YOUTUBE_VIDEO_API } = smartStudyEndpoints;

const YouTubeSummarizer = () => {
  const [url, setUrl] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generateContent = async (type) => {
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    try {
      const response = await apiConnector('POST', SUMMARIZE_YOUTUBE_VIDEO_API, {
        url,
        type
      });

      if (response.data.success) {
        setOutput(response.data.output);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || `Failed to generate ${type}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while processing the request');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setOutput('');
  };

  return (
    <div className="flex flex-col w-full items-center justify-center bg-richblack-900 text-white min-h-[400px] pt-24">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-6 mb-8">
          <VscDeviceCameraVideo className="text-6xl text-red-500" />
          <h2 className="text-3xl font-semibold text-richblack-100">
            YouTube Summarizer
          </h2>
          <p className="text-center text-richblack-300 text-sm">
            Enter a YouTube URL to fetch transcript and generate AI study notes!
          </p>
        </div>

        {/* URL Input */}
        <div className="w-full mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL here (e.g. https://www.youtube.com/watch?v=...)"
            className="w-full bg-richblack-800 border border-richblack-700 rounded-lg px-4 py-3 text-white placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-red-50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <button
            onClick={() => generateContent('summary')}
            disabled={!url.trim() || loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Quick Summary'}
          </button>
          <button
            onClick={() => generateContent('notes')}
            disabled={!url.trim() || loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Study Notes'}
          </button>
          <button
            onClick={handleClear}
            className="bg-richblack-600 hover:bg-richblack-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Output Display */}
        {output && (
          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold text-yellow-200 mb-4">AI Generated Content</h3>
            <div className="bg-richblack-800 border border-richblack-700 rounded-lg p-6 prose prose-invert max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-richblack-400 text-sm">
          <p>Note: Works with videos that have English captions available</p>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSummarizer;
