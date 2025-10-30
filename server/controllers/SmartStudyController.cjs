// controllers/SmartStudyController.cjs
require("dotenv").config();
const pdfParse = require("pdf-parse-fork");
const mammoth = require("mammoth");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Correct constructor usage
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    console.error("Error generating summary:");
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

// json2video Video Generation Functions
const JSON2VIDEO_API_KEY = process.env.JSON2VIDEO_API_KEY;
if (!JSON2VIDEO_API_KEY) {
  throw new Error("JSON2VIDEO_API_KEY is not set. Add it to your .env");
}

// NOTE: This assumes 'genAI' is correctly initialized globally at the top of your file.

// Helper function to generate structured JSON for video scenes
// async function generateVideoScenesJson(textPrompt, maxDuration = 15) {
//   const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//   // Ensure the total estimated duration is within the limit.
//   const maxDurationPerScene = Math.floor(maxDuration / 3);

//   // This prompt forces Gemini to act as a structured video editor
//   const prompt = `
//       You are an AI video editor for the JSON2Video API. Your task is to analyze the following educational text and create a structured JSON array of 3 to 4 unique video scenes. The total video duration must be ${maxDuration} seconds or less.

//       For each scene:
//       1. Choose a simple background color (e.g., "#000000", "#4392F1").
//       2. Extract a maximum 50-character summary text that explains one key concept.
//       3. Set the scene duration to a value between 3 and ${maxDurationPerScene} seconds.
//       4. Use element type "text" with style "008" and font "Bebas Neue".

//       Educational Content: "${textPrompt}"

//       Your output MUST be a valid JSON array, strictly following this structure. DO NOT include any text outside the JSON block.

//       [
//         {
//           "background-color": "...",
//           "elements": [
//             {
//               "type": "text",
//               "style": "008",
//               "text": "The key concept summary (max 50 chars)",
//               "duration": N, // 3 to ${maxDurationPerScene} seconds
//               "settings": {
//                 "color": "white",
//                 "font-size": "8vw",
//                 "font-family": "Bebas Neue"
//               }
//             }
//           ]
//         },
//         // ... Add 2 to 3 more scenes here ...
//       ]
//     `;

//   // Request the JSON output
//   console.log("Prompt for video scenes JSON:");
//   const result = await model.generateContent(prompt);
//   console.log("🎬 inside genereate video scene json function");
//   // The result.text should be a clean JSON string
//   const jsonString = result.response.text().trim();
//   return JSON.parse(jsonString);
// }

// exports.generateJson2Video = async (req, res) => {
//   try {
//     const { textPrompt } = req.body;
//     const maxVideoDuration = 15; // Set video limit

//     if (!textPrompt || !textPrompt.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Text prompt for video generation is required",
//       });
//     }

//     if (!process.env.JSON2VIDEO_API_KEY) {
//       return res.status(500).json({
//         success: false,
//         message:
//           "Video generation service is not configured. Please set JSON2VIDEO_API_KEY in .env",
//       });
//     }

//     console.log("🎬 Starting json2video generation via Gemini structured prompt...");

//     // Step 1: Use Gemini to generate the structured JSON for the scenes
//     const videoScenes = await generateVideoScenesJson(
//       textPrompt,
//       maxVideoDuration
//     );
//     console.log("🎬 Generated video scenes JSON:", videoScenes);
//     // Step 2: Assemble the final JSON body for the JSON2Video API
//     const videoBody = {
//       width: 1080, // Higher quality resolution
//       height: 1920, // Vertical video for better display
//       draft: false,
//       scenes: videoScenes,
//     };

//     // Step 3: Call json2video API
//     const response = await axios.post(
//       "https://api.json2video.com/v2/movies",
//       videoBody,
//       {
//         headers: {
//           "x-api-key": process.env.JSON2VIDEO_API_KEY, // Use process.env for security
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     console.log("🎬 json2video API response a gaya ");
//     // The API returns an operation ID (project ID)
//     return res.status(200).json({
//       success: true,
//       operationId: response.data.project,
//       message:
//         "Video generation started with json2video. Use this ID to check status.",
//       videoRequest: videoBody, // Show what was sent
//     });
//   } catch (error) {
//     console.error("💥 Error in json2video generation:");
//     // Check if the error is from the API or a JSON parse issue
//     const errorMessage = error.response ? error.response.data : error.message;

//     return res.status(500).json({
//       success: false,
//       message:
//         "Error generating video with json2video (Check API Key & Gemini Output)",
//       error: errorMessage,
//     });
//   }
// };

// NOTE: You will also need a separate function (e.g., checkJson2VideoStatus)
// to poll the API using the operationId to get the final video URL.

exports.generateJson2Video = async (req, res) => {
  try {
    const { textPrompt } = req.body;

    // Use dummy prompt if not provided
    const prompt = textPrompt || "A cat sitting on a chair, waving its tail";

    console.log("🎬 Starting json2video video generation...");

    const response = await axios.post("https://api.json2video.com/v2/movies", {
      width: 640,
      height: 360,
      draft: false,
      scenes: [
        {
          "background-color": "#4392F1",
          elements: [
            {
              type: "text",
              style: "008",
              text: prompt.substring(0, 100), // limit text length
              settings: {
                color: "white",
                "font-size": "10vw",
                "font-family": "Bebas Neue"
              },
              duration: 5,
              cache: false
            }
          ]
        }
      ]
    }, {
      headers: {
        'x-api-key': JSON2VIDEO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json({
      success: true,
      operationId: response.data.project,
      message: "Video generation started with json2video. Use this ID to check status.",
      prompt: prompt,
    });
  } catch (error) {
    console.error("💥 Error in json2video generation:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating video with json2video",
      error: error.message,
    });
  }
};

exports.checkJson2Status = async (req, res) => {
  try {
    const { operationId } = req.body;

    if (!operationId) {
      return res
        .status(400)
        .json({ success: false, message: "Operation ID is required" });
    }

    // console.log("object1")
    const response = await axios.get(
      `https://api.json2video.com/v2/movies?project=${operationId}`,
      {
        headers: {
          "x-api-key": JSON2VIDEO_API_KEY,
        },
      }
    );
    // console.log("object2")
    const data = response.data;

    if (data.movie.status === "done") {
      return res.status(200).json({
        success: true,
        status: "completed",
        videoUrl: data.movie.url,
      });
    } else if (data.movie.status === "") {
      return res.status(200).json({
        success: false,
        status: "failed",
        error: "Failed",
      });
    } else {
      return res.status(200).json({
        success: true,
        status: "in_progress",
        message: "Video generation is still in progress",
      });
    }
  } catch (error) {
    console.error("💥 Error checking json2video status:");
    return res.status(500).json({
      success: false,
      message: "Error checking video generation status",
      error: error.message,
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
    console.error("Error in chat:");
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
    console.error("Error in doubt resolution:");
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
    console.error("Error processing YouTube video:");
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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    console.error("Error in text to video summarizer:");
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.statusText || "Error generating video summary",
      error: error.message,
      details: error.errorDetails || undefined,
    });
  }
};
