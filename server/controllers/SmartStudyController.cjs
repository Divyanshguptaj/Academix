const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse-fork');
const mammoth = require('mammoth');

const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

exports.generateSummary = async (req, res) => {
  try {
    const file = req.files?.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    let text = '';

    // Extract text based on file type
    const fileType = file.mimetype;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // PDF
      console.log('File size:', file.data.length);
      console.log('File type:', fileType);
      console.log('File name:', fileName);
      const data = await pdfParse(file.data);
      text = data.text;
      console.log('Extracted text length:', text.length);
    } else if (
      fileType === 'text/plain' ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md')
    ) {
      // Text file
      text = file.data.toString('utf-8');
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      // DOCX
      const result = await mammoth.extractRawText({ buffer: file.data });
      text = result.value;
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Please upload PDF, text, or DOCX files.",
      });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "No text found in the uploaded file",
      });
    }

    // Use Gemini to generate summary
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    const result = await model.generateContent(`Please provide a concise and well-structured summary of the following text. Organize it with key points, main ideas, and any important conclusions. Use bullet points where appropriate. Here's the text:\n\n${text}`);
    const summary = result.response.text();

    return res.status(200).json({
      success: true,
      summary,
      message: "Summary generated successfully",
    });

  } catch (error) {
    console.error("Error generating summary:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing the file or generating summary",
      error: error.message,
    });
  }
};
