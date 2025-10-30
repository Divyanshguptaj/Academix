// controllers/SmartStudyController.cjs
require("dotenv").config();
const pdfParse = require("pdf-parse-fork");
const mammoth = require("mammoth");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Correct constructor usage
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// json2video Video Generation Functions
const JSON2VIDEO_API_KEY = process.env.JSON2VIDEO_API_KEY;
if (!JSON2VIDEO_API_KEY) {
  throw new Error("JSON2VIDEO_API_KEY is not set. Add it to your .env");
}

exports.generateJson2Video = async (req, res) => {
  try {
    const rawPrompt = req.body?.textPrompt;
    if (typeof rawPrompt !== "string" || !rawPrompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "textPrompt must be a non-empty string",
      });
    }
    const textPrompt = rawPrompt.trim();

    const API_KEY = process.env.JSON2VIDEO_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing JSON2VIDEO_API_KEY in environment",
      });
    }

    // Step 1: Use Gemini to generate comprehensive 2-minute video script
    console.log(
      "Generating comprehensive 2-minute video script with Gemini..."
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const geminiPrompt = `Create a comprehensive 2-minute educational video script about: "${textPrompt}"

The video should have 8-10 scenes to fully utilize the 2-minute duration and thoroughly explain the topic.

Structure the video as follows:
1. **Hook/Introduction** (8-10 seconds) - Grab attention, introduce the topic
2. **What Is It?** (12-15 seconds) - Define and explain the core concept
3. **Why It Matters** (12-15 seconds) - Importance and relevance
4. **Key Point 1** (15-18 seconds) - First major aspect with example
5. **Key Point 2** (15-18 seconds) - Second major aspect with example
6. **Key Point 3** (15-18 seconds) - Third major aspect with example
7. **Real-World Application** (15-18 seconds) - Practical examples or use cases
8. **Common Misconceptions** (12-15 seconds) - Clear up confusion
9. **Summary** (10-12 seconds) - Recap key takeaways
10. **Call to Action** (8-10 seconds) - Encourage further learning

IMPORTANT: For each scene, also provide a specific image search query that would find the most relevant and visually appealing background image for that scene.

Return ONLY valid JSON in this exact format (no markdown, no explanations):
{
  "title": "Catchy video title",
  "description": "Brief description of what viewers will learn",
  "scenes": [
    {
      "sceneNumber": 1,
      "purpose": "Hook/Introduction",
      "text": "On-screen text (8-12 words max)",
      "voiceText": "Complete narration script for this scene",
      "duration": 10,
      "visualSuggestion": "Brief description of visual theme",
      "imageSearchQuery": "specific search query for finding relevant background image"
    },
    ... (8-10 scenes total)
  ],
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}

Important guidelines:
- Make each scene build upon the previous one
- Use simple, clear language
- Include specific examples or analogies
- Each voiceText should be conversational and engaging
- Total duration should be approximately 120 seconds (2 minutes)
- On-screen text should be short and impactful
- Make it educational but entertaining
- For imageSearchQuery, be specific and descriptive (e.g., "modern technology abstract", "green plants nature sunlight", "business teamwork office")`;

    const result = await model.generateContent(geminiPrompt);
    let scriptText = result.response.text().trim();

    // Clean up any markdown code blocks
    scriptText = scriptText.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    console.log("Gemini response received, parsing...");

    const videoScript = JSON.parse(scriptText);

    if (!videoScript.scenes || videoScript.scenes.length < 8) {
      throw new Error(
        "Invalid script format from Gemini - needs at least 8 scenes"
      );
    }

    // Step 2: Use verified Unsplash images as backgrounds
    console.log("Selecting background images...");

    // Use a curated list of verified working Unsplash images in portrait orientation
    const verifiedUnsplashImages = [
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=1080&h=1920&fit=crop",
    ];

    const backgroundImages = [];

    // Assign images to scenes cyclically from verified list
    for (let i = 0; i < videoScript.scenes.length; i++) {
      backgroundImages.push(
        verifiedUnsplashImages[i % verifiedUnsplashImages.length]
      );
    }

    // Step 3: Create JSON2Video movie structure (Landscape format)
    const movieId = `movie_${Date.now()}`;

    const movie = {
      id: movieId,
      comment: videoScript.title || "Educational Video",
      width: 1920, // Landscape width
      height: 1080, // Landscape height
      quality: "high",
      draft: false,
      resolution: "landscape", // Changed to landscape
      fps: 30,
      cache: true,
      scenes: [],
      elements: [],
      settings: {}
    };

    // Define color overlays (same colors, suitable for landscape)
    const colorOverlays = [
      "rgba(102, 126, 234, 0.6)", // Purple (slightly reduced opacity for landscape)
      "rgba(240, 147, 251, 0.6)", // Pink
      "rgba(79, 172, 254, 0.6)",  // Blue
      "rgba(67, 233, 123, 0.6)",  // Green
      "rgba(250, 112, 154, 0.6)", // Orange-Pink
      "rgba(48, 207, 208, 0.6)",  // Teal
      "rgba(168, 237, 234, 0.6)", // Light teal
      "rgba(255, 154, 158, 0.6)", // Rose
      "rgba(255, 236, 210, 0.6)", // Peach
      "rgba(255, 110, 127, 0.6)"  // Coral
    ];

    // Create scenes from Gemini output
    videoScript.scenes.forEach((scene, index) => {
      const sceneId = `scene_${index + 1}_${Date.now()}`;
      const backgroundImage = backgroundImages[index % backgroundImages.length];
      const colorOverlay = colorOverlays[index % colorOverlays.length];

      movie.scenes.push({
        id: sceneId,
        comment: scene.purpose || `Scene ${index + 1}`,
        duration: scene.duration || 12,
        elements: [
          // Background image (now landscape dimensions)
          {
            type: "image",
            id: `bg_img_${index}`,
            src: backgroundImage.replace('w=1080&h=1920', 'w=1920&h=1080'), // Swap dimensions
            scale: {
              width: 1920, // Landscape width
              height: 1080, // Landscape height
            },
            x: 0,
            y: 0,
            comment: "Background image",
          },
          // Color overlay box for better readability
          {
            id: `overlay_${index}`,
            type: "component",
            component: "basic/100",
            settings: {
              box: {
                background: colorOverlay,
                "box-shadow": "none",
                final_width: "100%",
              },
            },
            comment: "Color overlay",
            x: 0,
            y: 0,
            width: 1920, // Updated width
            height: 1080, // Updated height
          },
          // Scene purpose label (adjusted positioning for landscape)
          {
            id: `label_${index}`,
            type: "text",
            style: "001",
            settings: {
              "font-size": "48px", // Slightly larger for landscape
              "font-family": "Inter",
              "font-weight": "600",
              "text-align": "center",
              color: "#FFFFFF",
              "text-shadow": "2px 2px 4px rgba(0,0,0,0.5)",
            },
            x: 0,
            y: 80,
            width: 1920, // Full width
            text: scene.purpose || `Part ${index + 1}`,
            comment: "Scene label",
          },
          // Main text (larger, centered for landscape)
          {
            id: `text_${index}`,
            type: "text",
            style: "003",
            settings: {
              "font-size": "80px", // Larger for landscape screen
              "font-family": "Inter",
              "font-weight": "700",
              "text-align": "center",
              "vertical-align": "center",
              color: "#FFFFFF",
              "text-shadow": "4px 4px 8px rgba(0,0,0,0.6)",
              "line-height": "1.3",
            },
            x: 100,
            y: 400, // Adjusted for landscape
            width: 1720, // Wider for landscape
            height: 400,
            text: scene.text,
            comment: "Main on-screen text",
          },
          // Voice narration
          {
            id: `voice_${index}`,
            type: "voice",
            voice: "en-US-JennyNeural",
            text: scene.voiceText,
            comment: "Narration",
          },
          // Audiogram (repositioned for landscape bottom)
          {
            id: `audiogram_${index}`,
            type: "audiogram",
            x: 0,
            y: 940, // Moved to bottom
            width: 1920,
            height: 140, // Slightly shorter
            color: "#ffffff",
            amplitude: 8,
          },
          // Progress indicator (scene number) - repositioned for landscape
          {
            id: `progress_${index}`,
            type: "text",
            style: "001",
            settings: {
              "font-size": "36px", // Larger for landscape
              "font-family": "Inter",
              "font-weight": "500",
              "text-align": "center",
              color: "#FFFFFF",
              "text-shadow": "2px 2px 4px rgba(0,0,0,0.5)",
            },
            x: 0,
            y: 900, // Moved up for landscape
            width: 1920,
            text: `${index + 1}/${videoScript.scenes.length}`,
            comment: "Progress indicator",
          },
        ],
      });
    });

    // Add final summary scene with key takeaways (adjusted for landscape)
    const summarySceneId = `scene_summary_${Date.now()}`;
    movie.scenes.push({
      id: summarySceneId,
      comment: "Key Takeaways Summary",
      duration: 8,
      elements: [
        {
          type: "image",
          id: "bg_img_summary",
          src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop", // Changed to landscape
          scale: {
            width: 1920,
            height: 1080,
          },
          x: 0,
          y: 0,
          comment: "Summary background",
        },
        {
          id: "overlay_summary",
          type: "component",
          component: "basic/100",
          settings: {
            box: {
              background: "rgba(26, 26, 46, 0.85)",
              "box-shadow": "none",
              final_width: "100%",
            },
          },
          comment: "Dark overlay",
          x: 0,
          y: 0,
          width: 1920, // Landscape width
          height: 1080, // Landscape height
        },
        {
          id: "summary_title",
          type: "text",
          style: "001",
          settings: {
            "font-size": "72px", // Larger for landscape
            "font-family": "Inter",
            "font-weight": "700",
            "text-align": "center",
            color: "#FFFFFF",
            "text-shadow": "3px 3px 6px rgba(0,0,0,0.5)",
          },
          x: 0,
          y: 150,
          width: 1920, // Full width
          text: "Key Takeaways",
          comment: "Summary title",
        },
        {
          id: "takeaways_text",
          type: "text",
          style: "003",
          settings: {
            "font-size": "48px", // Larger for landscape readability
            "font-family": "Inter",
            "font-weight": "500",
            "text-align": "center",
            color: "#FFFFFF",
            "line-height": "1.6",
            "text-shadow": "2px 2px 4px rgba(0,0,0,0.4)",
          },
          x: 200,
          y: 300,
          width: 1520,
          height: 600,
          text: videoScript.keyTakeaways
            .map((t, i) => `${i + 1}. ${t}`)
            .join("\n\n"),
          comment: "Key takeaways list",
        },
        {
          id: "voice_summary",
          type: "voice",
          voice: "en-US-JennyNeural",
          text: `Here are your key takeaways: ${videoScript.keyTakeaways.join(
            ". "
          )}. Thank you for watching!`,
          comment: "Summary narration",
        },
      ],
    });

    // Add background music (soft and educational)
    movie.elements.push({
      id: "bg_music",
      type: "audio",
      src: "https://json2video-test.s3.amazonaws.com/assets/audios/advertime.mp3",
      "fade-out": 2,
      duration: -1,
      volume: 0.12,
    });

    // Step 4: Send to JSON2Video API
    console.log("Sending comprehensive video to JSON2Video API...");
    const { data } = await axios.post(
      "https://api.json2video.com/v2/movies",
      movie,
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("JSON2Video API response:", JSON.stringify(data, null, 2));
    // console.log("Extracted operationId:", data.project || data.id);

    return res.status(200).json({
      success: true,
      message:
        "Comprehensive 2-minute educational video generation started successfully",
      operationId: data.project || data.id || "unknown",
      videoScript: {
        title: videoScript.title,
        description: videoScript.description,
        totalScenes: videoScript.scenes.length,
        estimatedDuration: `${Math.round(
          videoScript.scenes.reduce((sum, s) => sum + (s.duration || 12), 0)
        )} seconds`,
        keyTakeaways: videoScript.keyTakeaways,
      },
      response: data,
    });
  } catch (error) {
    console.error("JSON2Video generation error:", error);

    const err = error.response?.data || { message: error.message };

    return res.status(500).json({
      success: false,
      message: "Error generating video with JSON2Video",
      error: err.message || error.message || "Unknown error",
      details: err,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

    const maxTextLength = 15000; // Increased for better context
    const truncatedText =
      text.length > maxTextLength
        ? text.substring(0, maxTextLength) +
          "... (text truncated for processing)"
        : text;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are an AI educational content creator specialized in creating comprehensive video scripts from text content. Analyze the following text and create a detailed 2-minute video script that fully explains the concepts to viewers.

Text Content:
${truncatedText}

Create a comprehensive 2-minute video script (approximately 120 seconds) that includes:

1. **VIDEO OVERVIEW**
   - Catchy title
   - Main theme and target audience
   - 3-5 key learning objectives
   - Video structure breakdown (8-10 scenes)

2. **DETAILED SCENE-BY-SCENE BREAKDOWN**
   For each scene (8-10 scenes total), provide:
   - Scene purpose (Hook, Definition, Why It Matters, Key Points, Examples, Summary, etc.)
   - On-screen text (short and impactful, 8-12 words)
   - Complete narration script (what the voice will say)
   - Suggested duration (10-15 seconds per scene)
   - Visual description and color theme suggestion

3. **EDUCATIONAL FLOW**
   - Start with a hook to grab attention
   - Build concepts progressively
   - Include real-world examples and analogies
   - Address common misconceptions
   - Provide practical applications
   - End with clear takeaways

4. **ENGAGEMENT ELEMENTS**
   - Key questions viewers should be able to answer
   - Visual metaphors or analogies to use
   - Moments to emphasize (power phrases)
   - Suggested pacing (when to slow down for complex ideas)

5. **SUMMARY & TAKEAWAYS**
   - 3-5 key takeaways that viewers should remember
   - Suggested next steps or further learning resources
   - Call to action

Format the output as a detailed video production script with clear sections, timing for each scene, specific narration text, and visual recommendations. Make it educational, comprehensive, and engaging enough to fully explain the topic in 2 minutes.

The script should be suitable for direct video production with clear instructions for both visual and audio elements.`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    return res.status(200).json({
      success: true,
      output,
      message: "Comprehensive 2-minute video script generated successfully",
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

exports.checkJson2Status = async (req, res) => {
  try {
    const { operationId } = req.body;

    if (!operationId) {
      return res.status(400).json({
        success: false,
        message: "Operation ID is required",
      });
    }

    const API_KEY = process.env.JSON2VIDEO_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing JSON2VIDEO_API_KEY in environment",
      });
    }

    console.log(`Checking status for project: ${operationId}`);

    const response = await axios.get(
      `https://api.json2video.com/v2/movies?project=${operationId}`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const data = response.data;

    if (!data.movie) {
      return res.status(404).json({
        success: false,
        status: "not_found",
        message: "Project not found",
      });
    }

    const status = data.movie.status;

    if (status === "done" || status === "finished") {
      return res.status(200).json({
        success: true,
        status: "completed",
        videoUrl: data.movie.url,
        thumbnail: data.movie.thumbnail,
        duration: data.movie.duration,
        message: "Your comprehensive educational video is ready!",
      });
    } else if (status === "error" || status === "failed") {
      return res.status(200).json({
        success: false,
        status: "failed",
        error: data.movie.error || "Video generation failed",
      });
    } else {
      // Status could be: "queued", "rendering", "processing", etc.
      return res.status(200).json({
        success: true,
        status: "in_progress",
        currentStatus: status,
        message: `Video generation is ${status}. This may take 2-3 minutes for a comprehensive 2-minute video.`,
        progress: data.movie.progress || null,
      });
    }
  } catch (error) {
    console.error("Error checking json2video status:", error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        status: "not_found",
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error checking video generation status",
      error: error.message,
      details: error.response?.data || undefined,
    });
  }
};

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
