// controllers/SmartStudyController.cjs
require("dotenv").config();
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse-fork");
const mammoth = require("mammoth");
// const { VertexAI } = require("@google-cloud/aiplatform");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { VertexAI } = require("@google-cloud/vertexai");
const { Storage } = require("@google-cloud/storage");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to your .env");
}

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

// ✅ Correct constructor usage
const genAI = new GoogleGenerativeAI(API_KEY);

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
${parts.map((p, i) => `--- Part ${i + 1} ---\n${p}`).join("\n\n")}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

exports.generateSummary = async (req, res) => {
  try {
    const file = req.files?.file; // ensure express-fileupload middleware is used
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    let text = "";
    const fileType = file.mimetype || "";
    const fileName = (file.name || "").toLowerCase();

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      const data = await pdfParse(file.data);
      text = data.text || "";
    } else if (
      fileType === "text/plain" ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md")
    ) {
      text = file.data.toString("utf-8");
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer: file.data });
      text = result.value || "";
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Upload PDF, TXT/MD, or DOCX.",
      });
    }

    if (!text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "No text found in the file" });
    }

    // Choose model (flash = fast/cheap, pro = best reasoning)
    // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Chunk → summarize each → merge
    const chunks = chunkText(text, 12000);
    const partials = [];
    for (const c of chunks) {
      const s = await summarizeChunk(model, c);
      partials.push(s);
    }
    const summary =
      partials.length === 1
        ? partials[0]
        : await mergeSummaries(model, partials);

    return res.status(200).json({
      success: true,
      summary,
      documentText: text, // Include extracted text for chat functionality
      message: "Summary generated successfully",
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message:
        error.statusText || "Error processing the file or generating summary",
      error: error.message,
      details: error.errorDetails || undefined,
    });
  }
};

exports.chatWithDocument = async (req, res) => {
  try {
    const { question, documentText } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!documentText || !documentText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Document text is required",
      });
    }

    // Limit the document text to fit within token limits
    const maxTextLength = 20000; // Adjust based on model's limits
    const truncatedText =
      documentText.length > maxTextLength
        ? documentText.substring(0, maxTextLength) + "..."
        : documentText;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a helpful academic assistant. Based on the following document content, please answer the user's question accurately and comprehensively.

Document Content:
${truncatedText}

Question: ${question}

Please provide a clear, detailed, and helpful answer based on the document. If the document doesn't contain information to answer the question, say so politely.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return res.status(200).json({
      success: true,
      answer,
      message: "Question answered successfully",
    });
  } catch (error) {
    console.error("Error in chat:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.statusText || "Error processing the chat request",
      error: error.message,
      details: error.errorDetails || undefined,
    });
  }
};

exports.askDoubt = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a helpful AI Study Assistant for an e-learning platform. Answer the student's question about studying, courses, learning techniques, academic subjects, homework help, or general educational doubts.

Be encouraging, provide clear explanations, and suggest practical study tips when relevant.

IMPORTANT: Format math expressions in plain text. For example:
- Write equations like: Force (F) = mass (m) × acceleration (a)
- Use words instead of symbols where possible: e.g., "dimension of mass is [M]" instead of $[M]$
- For units: write "meters per second squared (m/s²)" instead of LaTeX units
- Keep explanations simple and readable

Question: ${question}

Please provide a helpful, accurate, plain-text response suitable for students.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return res.status(200).json({
      success: true,
      answer,
      message: "Doubt resolved successfully",
    });
  } catch (error) {
    console.error("Error in doubt resolution:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.statusText || "Error processing the doubt request",
      error: error.message,
      details: error.errorDetails || undefined,
    });
  }
};

exports.summarizeYouTubeVideo = async (req, res) => {
  try {
    const { url, type } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL is required",
      });
    }

    if (!type || !["summary", "notes"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'summary' or 'notes'",
      });
    }

    // console.log('Processing YouTube video:', url, 'Type:', type);

    // Let Gemini handle the YouTube URL directly
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt;

    if (type === "notes") {
      // Study notes for long-term retention
      prompt = `You are an AI study assistant with advanced web analysis capabilities. Access and analyze this YouTube video thoroughly and create detailed, comprehensive study notes that will help someone study and retain this information for months without revisiting the video:

YouTube Video URL: ${url}

Analyze the entire video content, including all explanations, examples, and demonstrations shown. Create detailed study notes including:

1. **VIDEO OVERVIEW**
   - Main topic and purpose of the video
   - Target audience and prerequisites
   - Key learning objectives covered

2. **STRUCTURED CONTENT OUTLINE**
   - All main topics covered in order
   - Important concepts and definitions explained
   - Step-by-step processes and methodologies

3. **KEY CONCEPTS & EXPLANATIONS**
   - Important terms with their definitions from the video
   - Core principles, formulas, or frameworks presented
   - Visual or practical examples demonstrated

4. **PRACTICE & APPLICATION**
   - Practice questions or problems shown
   - Real-world applications discussed
   - Key examples and case studies explained

5. **MEMORY AIDS & STUDY TIPS**
   - Mnemonics and memory techniques provided
   - Study strategy recommendations given
   - Tips for retaining this material long-term

6. **SUMMARY & KEY TAKEAWAYS**
   - Essential concepts to remember
   - Main conclusions from the video
   - Review points for studying

Provide actual content based on what you find in this specific YouTube video. Make the study notes comprehensive enough that someone can fully understand and remember the video content months later without watching it again.

Format everything professionally with clear headings, bullet points, and numbered lists. Use **bold** for important terms.`;
    } else {
      // Descriptive summary for quick understanding
      prompt = `${url} can you generate descriptive summary for this youtube video.`;
    }

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    return res.status(200).json({
      success: true,
      output,
      message:
        type === "notes"
          ? "Detailed study notes generated successfully"
          : "YouTube video summarized successfully",
    });
  } catch (error) {
    console.error("Error processing YouTube video:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.statusText || "Error generating YouTube content",
      error: error.message,
      details: error.errorDetails || undefined,
    });
  }
};

exports.textToVideoSummarizer = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    console.log("Processing text to video summarizer");

    const maxTextLength = 10000; // Limit text length to avoid token issues
    const truncatedText =
      text.length > maxTextLength
        ? text.substring(0, maxTextLength) +
          "... (text truncated for processing)"
        : text;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are an AI educational content creator specialized in creating video scripts from text content. Analyze the following text and create a detailed video summary script that can be used to produce an educational video explaining the concepts.

Text Content:
${truncatedText}

Create a comprehensive video script that includes:

1. **VIDEO SCRIPT OVERVIEW**
   - Main theme and target audience
   - Key learning objectives
   - Estimated video duration (based on content depth)

2. **STRUCTURED NARRATIVE**
   - Introduction with hook and overview
   - Main body explaining key concepts with examples
   - Conclusion with summary and key takeaways

3. **VISUAL DESCRIPTION**
   - Suggested visuals, animations, or graphics for each section
   - Recommended on-screen text and bullet points
   - Visual storytelling elements

4. **NARRATION SCRIPT**
   - Complete spoken script with timing suggestions
   - Key phrases to emphasize
   - Pause points for complex concepts

5. **EDUCATIONAL ENHANCEMENTS**
   - Suggested questions or prompts for viewer engagement
   - Additional resources or further reading suggestions
   - Quiz or recap questions at the end

Format the output professionally with clear sections, timing estimates, and specific visual/audio recommendations that would make it suitable for video production. The script should be educational, engaging, and comprehensive.

Note: If text is truncated, the script should still be complete based on available content.`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    return res.status(200).json({
      success: true,
      output,
      message: "Video summary script generated successfully",
    });
  } catch (error) {
    console.error("Error in text to video summarizer:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.statusText || "Error generating video summary",
      error: error.message,
      details: error.errorDetails || undefined,
    });
  }
};

// Helper function to generate refined prompt for Veo
async function generateRefinedPrompt(textPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = `Create a concise, vivid, and cinematic video prompt (2-3 sentences) based on this content for a text-to-video AI.
Focus on visually representing the main concept.
Content: ${textPrompt}`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating refined prompt:", error);
    return textPrompt; // Fallback to original prompt
  }
}

// Configure Vertex AI client for Veo
function getVertexAIClient() {
  try {
    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      throw new Error("GOOGLE_CLOUD_PROJECT is not set in .env");
    }
    // The VertexAI client will use GOOGLE_APPLICATION_CREDENTIALS for auth
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    });
    return vertexAI;
  } catch (error) {
    console.error("Error initializing Vertex AI client:", error.message);
    throw error;
  }
}

exports.generateVideoWithVeo = async (req, res) => {
  try {
    const { textPrompt } = req.body;

    if (!textPrompt || !textPrompt.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Text prompt is required" });
    }

    const videoPrompt = await generateRefinedPrompt(textPrompt);
    // console.log("🧠 Refined Video Prompt:", videoPrompt);

    const vertexClient = getVertexAIClient();
    // const VEOS_MODEL_ID = "veo-3.1-generate-preview"; // Updated ID for compatibility
    const VEOS_MODEL_ID = "veo-3.1-fast-generate-preview"; // Updated ID for compatibility

    console.log("🎬 Starting Veo video generation on Vertex AI...");

    // NOTE: Veo requires an output GCS URI to store the video.
    // Ensure you have a GOOGLE_CLOUD_BUCKET_URI set in your .env
    if (!process.env.GOOGLE_CLOUD_BUCKET_URI) {
      return res.status(500).json({
        success: false,
        message: "GOOGLE_CLOUD_BUCKET_URI must be set for Veo output.",
      });
    }

    // Start the Asynchronous Veo Generation
    const [operation] = await vertexClient
      .getGenerativeModel({
        model: VEOS_MODEL_ID,
      })
      .generateContent({
        prompt: videoPrompt,
        duration: 8,
        aspectRatio: "16:9",
        config: {
          outputGcsUri: process.env.GOOGLE_CLOUD_BUCKET_URI,
        },
      });

    // console.log("✅ Video generation started, operation ID:", operation.name);

    return res.status(200).json({
      success: true,
      operationId: operation.name,
      message:
        "Video generation started with Veo. Use this ID to check status.",
      videoPrompt,
    });
  } catch (error) {
    console.error("💥 Error in Veo video generation:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating video with Veo on Vertex AI",
      error: error.message,
    });
  }
};

exports.checkVideoStatus = async (req, res) => {
  // try {
  //   const { operationId } = req.body;

  //   if (!operationId) {
  //     return res
  //       .status(400)
  //       .json({ success: false, message: "Operation ID is required" });
  //   }

  //   const vertexClient = getVertexAIClient();
  //   const [operation] = await vertexClient.getOperation({ name: operationId });

  //   if (operation.done) {
  //     if (operation.error) {
  //       // ... (Error handling is the same)
  //       return res.status(200).json({
  //         success: false,
  //         status: "failed",
  //         error: operation.error,
  //       });
  //     } else {
  //       const videoGcsUri = operation.response?.videos?.[0]?.gcsUri;

  //       if (!videoGcsUri) {
  //         return res.status(500).json({
  //           success: false,
  //           status: "failed",
  //           message:
  //             "Video generation completed, but GCS URI not found in response.",
  //         });
  //       }

  //       // ⭐ NEW: Generate the playable signed URL
  //       const playableUrl = await generateSignedUrl(videoGcsUri);

  //       console.log(
  //         "✅ Video generation completed, Playable URL:",
  //         playableUrl
  //       );
  //       return res.status(200).json({
  //         success: true,
  //         status: "completed",
  //         // Return the playable URL to the frontend
  //         videoUrl: playableUrl,
  //         videoGcsUri: videoGcsUri, // Optional: Keep GCS URI for reference
  //       });
  //     }
  //   } else {
  //     // ... (In progress is the same)
  //     return res.status(200).json({
  //       success: true,
  //       status: "in_progress",
  //       message: "Video generation is still in progress",
  //     });
  //   }
  // } catch (error) {
  //   console.error("💥 Error checking video status:", error);
  //   return res.status(500).json({
  //     success: false,
  //     message: "Error checking video generation status",
  //     error: error.message,
  //   });
  // }
  return res.status(200).json({
    success: true,
    status: "completed",
  });
};

// Helper function to extract bucket and file name from GCS URI
// function parseGcsUri(gcsUri) {
//   if (!gcsUri.startsWith("gs://")) {
//     throw new Error("Invalid GCS URI format.");
//   }
//   const path = gcsUri.substring(5); // Remove 'gs://'
//   const firstSlash = path.indexOf("/");
//   const bucketName = path.substring(0, firstSlash);
//   const fileName = path.substring(firstSlash + 1);
//   return { bucketName, fileName };
// }

// Helper function to generate a signed URL
// async function generateSignedUrl(gcsUri, durationMinutes = 15) {
//   const { bucketName, fileName } = parseGcsUri(gcsUri);

//   const options = {
//     version: "v4", // Use V4 signing for enhanced security
//     action: "read",
//     expires: Date.now() + durationMinutes * 60 * 1000, // Expires in 15 minutes
//   };

//   // Get a v4 signed URL for reading the file
//   const [url] = storage
//     .bucket(bucketName)
//     .file(fileName)
//     .getSignedUrl(options);

//   return url;
// }
