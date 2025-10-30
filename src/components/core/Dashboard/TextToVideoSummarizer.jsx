import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { BiVideo, BiPlay, BiStop, BiVolume } from 'react-icons/bi';
import { apiConnector } from '../../../services/apiconnector';
import { smartStudyEndpoints } from '../../../services/apis';

const { GENERATE_JSON2_VIDEO_API, CHECK_JSON2_STATUS_API } = smartStudyEndpoints;

const TextToVideoSummarizer = () => {
  const [text, setText] = useState('');
  const [videoTaskId, setVideoTaskId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoGenerating, setVideoGenerating] = useState(false);
  const videoIntervalRef = useRef(null);

  const handleClear = () => {
    setText('');
    setVideoTaskId('');
    setVideoUrl('');
    setVideoGenerating(false);
    clearVideoInterval();
  };

  const clearVideoInterval = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
  };

  const generateVideo = async () => {
    if (!text.trim()) {
      toast.error('Please enter your educational question first');
      return;
    }

    setVideoGenerating(true);
    try {
      const response = await apiConnector('POST', GENERATE_JSON2_VIDEO_API, {
        textPrompt: text
      });

      if (response.data.success) {
        setVideoTaskId(response.data.operationId);
        toast.success('Video generation started! Let me explain this concept visually...');

        // Start polling for status
        videoIntervalRef.current = setInterval(async () => {
          await checkVideoStatus(response.data.operationId);
        }, 15000); // Check every 15 seconds for json2video
      } else {
        toast.error(response.data.message || 'Failed to start video generation');
        setVideoGenerating(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while starting video generation');
      setVideoGenerating(false);
    }
  };

  const checkVideoStatus = async (taskId) => {
    try {
      const response = await apiConnector('POST', CHECK_JSON2_STATUS_API, {
        operationId: taskId
      });

      if (response.data.success) {
        const { status, videoUrl: generatedVideoUrl, error } = response.data;

        if (status === 'completed' && generatedVideoUrl) {
          setVideoGenerating(false);
          setVideoUrl(generatedVideoUrl);
          clearVideoInterval();
          toast.success('Video generated successfully!');
        } else if (status === 'failed') {
          setVideoGenerating(false);
          clearVideoInterval();
          toast.error(error ? `Video generation failed: ${error}` : 'Video generation failed');
        } else if (status === 'in_progress') {
          // Continue polling, no message
          console.log('Video generation in progress...');
        }
      } else {
        console.error('Failed to check video status:', response.data.message);
      }
    } catch (error) {
      console.error('Error checking video status:', error);
      // Don't stop polling on temporary errors, just log
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center bg-richblack-900 text-white min-h-[400px] pt-24">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-6 mb-8">
          <BiVideo className="text-6xl text-blue-500" />
          <h2 className="text-3xl font-semibold text-richblack-100">
            Question to Video
          </h2>
          <p className="text-center text-richblack-300 text-sm">
            Ask any educational question and get a comprehensive video explanation instantly
          </p>
        </div>

        {/* Text Input */}
        <div className="w-full mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your educational question here (e.g., 'What is machine learning?', 'Explain quantum physics', 'How does photosynthesis work?')..."
            className="w-full bg-richblack-800 border border-richblack-700 rounded-lg px-4 py-3 text-white placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-50 h-32 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <button
            onClick={generateVideo}
            disabled={!text.trim() || videoGenerating}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {videoGenerating ? 'Creating Your Video...' : 'Generate Video'}
          </button>
          <button
            onClick={handleClear}
            className="bg-richblack-600 hover:bg-richblack-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Video Generation Status */}
        {videoGenerating && (
          <div className="w-full mb-6">
            <div className="bg-richblack-800 border border-richblack-700 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
              <p className="text-white text-center mb-4">
                Creating your personalized educational video... This will take 2-3 minutes.
              </p>
              <p className="text-richblack-400 text-sm text-center">
                Your question: "<span className="text-yellow-400">{text}</span>"
              </p>
              <p className="text-richblack-400 text-sm text-center mt-2">
                Operation ID: {videoTaskId}
              </p>
            </div>
          </div>
        )}

        {/* Video Player */}
        {videoUrl && (
          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold text-yellow-200 mb-4">Your Educational Video</h3>
            <div className="bg-richblack-800 border border-richblack-700 rounded-lg overflow-hidden">
              <video
                controls
                className="w-full max-h-96"
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-center text-richblack-400 text-sm mt-4">
              Your video explanation is ready! This comprehensive educational content
              visually breaks down your question step-by-step.
            </p>
          </div>
        )}

        {!(videoGenerating || videoUrl) && text.trim() && (
          <div className="w-full mb-6">
            <p className="text-center text-richblack-400 text-sm">
              Ready to create your video! Click "Generate Video" to get a detailed visual explanation
              of your educational question.
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-richblack-400 text-sm">
          <p>Powered by Google Gemini AI + json2video</p>
        </div>
      </div>
    </div>
  );
};

export default TextToVideoSummarizer;
