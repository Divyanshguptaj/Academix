import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { VscCloudUpload } from 'react-icons/vsc';
import { apiConnector } from '../../../services/apiconnector';
import { smartStudyEndpoints } from '../../../services/apis';

const { GENERATE_SUMMARY_API } = smartStudyEndpoints;

const SmartStudyCompanion = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Processing your file...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiConnector('POST', GENERATE_SUMMARY_API, formData, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.data.success) {
        setSummary(response.data.summary);
        toast.success('Summary generated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred while processing the file');
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  const handleClear = () => {
    setFile(null);
    setSummary('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center bg-richblack-900 text-white min-h-[300px] pt-24">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-richblack-700 rounded-lg p-8 w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-4">
          <VscCloudUpload className="text-5xl text-richblack-400" />
          <h2 className="text-2xl font-semibold text-richblack-100">
            Smart Study Companion
          </h2>
          <p className="text-center text-richblack-300 text-sm">
            Upload lecture notes, PDFs, or text files to generate AI-powered summaries
          </p>

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.txt,.md,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-md font-semibold hover:bg-yellow-100 transition-colors"
          >
            Choose File
          </button>

          {file && (
            <p className="text-richblack-200 text-sm">
              Selected: {file.name}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Generate Summary'}
            </button>
            <button
              onClick={handleClear}
              className="bg-richblack-600 hover:bg-richblack-500 text-white px-4 py-2 rounded-md font-semibold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Summary Display */}
      {summary && (
        <div className="mt-8 w-full max-w-2xl">
          <h3 className="text-xl font-semibold text-yellow-50 mb-4">Generated Summary</h3>
          <div className="bg-richblack-800 border border-richblack-700 rounded-lg p-6 whitespace-pre-wrap text-richblack-100">
            {summary}
          </div>
        </div>
      )}

      {/* Supported Formats Info */}
      <div className="mt-8 text-center text-richblack-400 text-sm">
        <p>Supported formats: PDF, TXT, MD, DOCX</p>
        <p className="mt-1">Note: Recordings support coming soon!</p>
      </div>
    </div>
  );
};

export default SmartStudyCompanion;
