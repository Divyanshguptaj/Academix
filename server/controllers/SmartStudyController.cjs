// controllers/SmartStudyController.cjs
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse-fork');
const mammoth = require('mammoth');


const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to your .env");
}

// ✅ Correct constructor usage
const genAI = new GoogleGenerativeAI(API_KEY);

// (async () => {
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   const { models } = await genAI.listModels();    // requires latest SDK
//   for (const m of models) {
//     if (m.supportedGenerationMethods?.includes('generateContent')) {
//       console.log(m.name); // e.g., models/gemini-1.5-flash-latest
//     }
//   }
// })();

// Simple chunker to avoid token overflows
function chunkText(text, maxChars = 12000) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + maxChars));
    i += maxChars;
  }
  return chunks;
}

// Summarize a single chunk
async function summarizeChunk(model, chunk) {
  const prompt = `You are an academic note-maker. Summarize the following content into:
- A short abstract (2–3 sentences)
- 5–10 bullet key points
- Important conclusions if any

Content:
${chunk}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

// Merge multiple chunk summaries into one final summary
async function mergeSummaries(model, parts) {
  const prompt = `Combine the following partial summaries into a single, concise study note with:
1) Abstract
2) Key Points (bulleted)
3) Key Takeaways

Partial summaries:
${parts.map((p, i) => `--- Part ${i + 1} ---\n${p}`).join('\n\n')}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

exports.generateSummary = async (req, res) => {
  try {
    const file = req.files?.file; // ensure express-fileupload middleware is used
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    let text = '';
    const fileType = file.mimetype || '';
    const fileName = (file.name || '').toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const data = await pdfParse(file.data);
      text = data.text || '';
    } else if (
      fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')
    ) {
      text = file.data.toString('utf-8');
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer: file.data });
      text = result.value || '';
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Upload PDF, TXT/MD, or DOCX."
      });
    }

    if (!text.trim()) {
      return res.status(400).json({ success: false, message: "No text found in the file" });
    }

    // Choose model (flash = fast/cheap, pro = best reasoning)
    // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Chunk → summarize each → merge
    const chunks = chunkText(text, 12000);
    const partials = [];
    for (const c of chunks) {
      const s = await summarizeChunk(model, c);
      partials.push(s);
    }
    const summary = partials.length === 1 ? partials[0] : await mergeSummaries(model, partials);

    return res.status(200).json({
      success: true,
      summary,
      message: "Summary generated successfully"
    });

  } catch (error) {
    console.error("Error generating summary:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.statusText || "Error processing the file or generating summary",
      error: error.message,
      details: error.errorDetails || undefined
    });
  }
};
