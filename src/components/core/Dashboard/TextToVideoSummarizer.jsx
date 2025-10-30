import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { BiVideo, BiPlay, BiStop, BiVolume } from 'react-icons/bi';
import { apiConnector } from '../../../services/apiconnector';
import { smartStudyEndpoints } from '../../../services/apis';

const { TEXT_TO_VIDEO_SUMMARIZER_API, GENERATE_JSON2_VIDEO_API, CHECK_JSON2_STATUS_API } = smartStudyEndpoints;

const TextToVideoSummarizer = () => {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTaskId, setVideoTaskId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoGenerating, setVideoGenerating] = useState(false);
  const speechSynthRef = useRef(null);
  const videoIntervalRef = useRef(null);

  const generateVideoSummary = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to summarize');
      return;
    }

    setLoading(true);
    try {
      const response = await apiConnector('POST', TEXT_TO_VIDEO_SUMMARIZER_API, {
        text
      });

      if (response.data.success) {
        setOutput(response.data.output);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Failed to generate video summary');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while processing the request');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setOutput('');
    setVideoTaskId('');
    setVideoUrl('');
    setVideoGenerating(false);
    stopAudio();
    clearVideoInterval();
  };

  const clearVideoInterval = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
  };

  const generateVideo = async () => {
    if (!output) {
      toast.error('Generate a summary first');
      return;
    }

    setVideoGenerating(true);
    try {
      const response = await apiConnector('POST', GENERATE_JSON2_VIDEO_API, {
        textPrompt: output
      });

      if (response.data.success) {
        setVideoTaskId(response.data.operationId);
        toast.success('Video generation started!');

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

  const speakText = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      // Set voice preferences (soft, explanatory voice)
      const voices = window.speechSynthesis.getVoices();
      const softVoice = voices.find(voice => voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('soft'));
      if (softVoice) {
        utterance.voice = softVoice;
      }
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setIsPlaying(true);
        setAudioLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        speechSynthRef.current = null;
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setAudioLoading(false);
        speechSynthRef.current = null;
        toast.error('Error playing audio');
      };

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech is not supported in this browser');
    }
  };

  const playAudio = () => {
    if (!output) {
      toast.error('Generate a summary first');
      return;
    }

    if (isPlaying) {
      stopAudio();
      return;
    }

    setAudioLoading(true);
    // Extract text content from markdown (simple extraction)
    const textContent = output.replace(/[#*`]/g, '').replace(/\n+/g, ' ').trim();
    speakText(textContent);
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setAudioLoading(false);
      speechSynthRef.current = null;
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center bg-richblack-900 text-white min-h-[400px] pt-24">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-6 mb-8">
          <BiVideo className="text-6xl text-blue-500" />
          <h2 className="text-3xl font-semibold text-richblack-100">
            Text to Video Summarizer
          </h2>
          <p className="text-center text-richblack-300 text-sm">
            Enter text content to generate an AI-powered video summary that explains the concepts clearly
          </p>
        </div>

        {/* Text Input */}
        <div className="w-full mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type the text content you want to summarize into a video..."
            className="w-full bg-richblack-800 border border-richblack-700 rounded-lg px-4 py-3 text-white placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-50 h-32 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <button
            onClick={generateVideoSummary}
            disabled={!text.trim() || loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Video Summary'}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-yellow-200">AI Generated Video Summary</h3>
              <div className="flex gap-2">
                <button
                  onClick={generateVideo}
                  disabled={videoGenerating || !!videoUrl}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {videoGenerating ? 'Generating Video...' : videoUrl ? 'Video Ready' : 'Generate Video'}
                </button>
                <button
                  onClick={playAudio}
                  disabled={audioLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPlaying
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:bg-gray-600 disabled:cursor-not-allowed`}
                >
                  {audioLoading ? (
                    <BiVolume className="text-lg animate-pulse" />
                  ) : isPlaying ? (
                    <BiStop className="text-lg" />
                  ) : (
                    <BiPlay className="text-lg" />
                  )}
                  {audioLoading ? 'Loading...' : isPlaying ? 'Stop Audio' : 'Play Audio'}
                </button>
              </div>
            </div>
            <div className="bg-richblack-800 border border-richblack-700 rounded-lg p-6 prose prose-invert max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>

            {/* Video Player */}
            {videoUrl && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-yellow-200 mb-4">Generated Video</h4>
                <div className="bg-richblack-800 border border-richblack-700 rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full max-h-96"
                    src={videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {videoGenerating && (
              <div className="mt-6 text-center">
                <div className="bg-richblack-800 border border-richblack-700 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                  <p className="text-white">Generating video... This may take a few minutes.</p>
                  <p className="text-richblack-400 text-sm mt-2">
                    Operation ID: {videoTaskId}
                  </p>
                </div>
              </div>
            )}

            <p className="text-center text-richblack-400 text-sm mt-4">
              Generate video for visual learning or use Play Audio for audio narration
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-richblack-400 text-sm">
          <p>Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

export default TextToVideoSummarizer;
