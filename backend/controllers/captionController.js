const { createClient } = require('@deepgram/sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Generate captions for uploaded video
const generateCaptions = async (req, res) => {
  try {
    // Points check: require 1 point to generate captions
    if (!req.user || (req.user.points || 0) <= 0) {
      return res.status(402).json({ message: 'Insufficient points. Please purchase more credits.' });
    }
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No video file uploaded' 
      });
    }

    if (!process.env.DEEPGRAM_API_KEY) {
      return res.status(500).json({ 
        message: 'Deepgram API key not configured' 
      });
    }

    const videoBuffer = req.file.buffer;
    
    // Get caption options from request
    const options = {
      language: req.body.language || 'hi',
      fontSize: parseInt(req.body.fontSize) || 24,
      fontFamily: req.body.fontFamily || 'Arial',
      fontColor: req.body.fontColor || '#FFFFFF',
      backgroundColor: req.body.backgroundColor || 'rgba(0,0,0,0.7)',
      position: req.body.position || 'bottom',
      maxWordsPerLine: parseInt(req.body.maxWordsPerLine) || 8
    };
    
    // Use Deepgram to transcribe the video
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      videoBuffer,
      {
        model: 'nova-2',
        language: options.language,
        smart_format: true,
        punctuate: true,
        paragraphs: true,
        utterances: true,
        diarize: true,
        detect_language: true
      }
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      return res.status(500).json({ 
        message: 'Error transcribing video',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Extract transcript and format as captions
    const transcript = result.results.channels[0].alternatives[0].transcript;
    const paragraphs = result.results.channels[0].alternatives[0].paragraphs?.paragraphs || [];
    const utterances = result.results.channels[0].alternatives[0].words || [];

    // Format captions with timestamps
    const captions = paragraphs.map(paragraph => ({
      start: paragraph.start,
      end: paragraph.end,
      text: paragraph.sentences.map(sentence => sentence.text).join(' ')
    }));

    // If no paragraphs, create simple caption from full transcript
    if (captions.length === 0 && transcript) {
      captions.push({
        start: 0,
        end: utterances.length > 0 ? utterances[utterances.length - 1].end : 0,
        text: transcript
      });
    }

    // Deduct one point after successful generation
    try {
      req.user.points = Math.max(0, (req.user.points || 0) - 1);
      await req.user.save();
    } catch (saveErr) {
      console.error('Failed to deduct point:', saveErr);
    }

    res.status(200).json({
      message: 'Captions generated successfully',
      data: {
        transcript: transcript,
        captions: captions,
        options: options,
        metadata: {
          duration: result.results.channels[0].alternatives[0].summaries?.[0]?.summary || null,
          confidence: result.results.channels[0].alternatives[0].confidence || null,
          language: options.language,
          detectedLanguage: result.results.channels[0].detected_language || options.language
        }
      }
    });

  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({ 
      message: 'Error generating captions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate video with burned-in captions
const generateVideoWithCaptions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No video file uploaded' 
      });
    }

    const videoBuffer = req.file.buffer;
    const tempDir = path.join(__dirname, '../temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const inputVideoPath = path.join(tempDir, `input_${Date.now()}.mp4`);
    const outputVideoPath = path.join(tempDir, `output_${Date.now()}.mp4`);
    const subtitlePath = path.join(tempDir, `subtitles_${Date.now()}.srt`);

    // Write video buffer to temp file
    fs.writeFileSync(inputVideoPath, videoBuffer);

    // Get caption options
    const options = {
      language: req.body.language || 'hi',
      fontSize: parseInt(req.body.fontSize) || 24,
      fontFamily: req.body.fontFamily || 'Arial',
      fontColor: req.body.fontColor || '#FFFFFF',
      backgroundColor: req.body.backgroundColor || 'rgba(0,0,0,0.7)',
      position: req.body.position || 'bottom',
      maxWordsPerLine: parseInt(req.body.maxWordsPerLine) || 8
    };

    // First, get captions from Deepgram
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      videoBuffer,
      {
        model: 'nova-2',
        language: options.language,
        smart_format: true,
        punctuate: true,
        paragraphs: true,
        utterances: true,
        diarize: true,
        detect_language: true
      }
    );

    if (error) {
      throw new Error(`Deepgram error: ${error.message}`);
    }

    const transcript = result.results.channels[0].alternatives[0].transcript;
    const words = result.results.channels[0].alternatives[0].words || [];

    if (!transcript || words.length === 0) {
      return res.status(200).json({
        message: 'No speech detected in video',
        data: { transcript: 'No speech detected', captions: [] }
      });
    }

    // Generate SRT subtitle file
    let srtContent = '';
    let subtitleIndex = 1;
    
    for (let i = 0; i < words.length; i += options.maxWordsPerLine) {
      const wordGroup = words.slice(i, i + options.maxWordsPerLine);
      const startTime = wordGroup[0].start;
      const endTime = wordGroup[wordGroup.length - 1].end;
      const text = wordGroup.map(w => w.word).join(' ');

      srtContent += `${subtitleIndex}\n`;
      srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
      srtContent += `${text}\n\n`;
      subtitleIndex++;
    }

    // Write SRT file
    fs.writeFileSync(subtitlePath, srtContent);

    // Generate video with burned-in subtitles using FFmpeg
    await new Promise((resolve, reject) => {
      const positionY = options.position === 'top' ? 50 : 
                       options.position === 'center' ? '(h-text_h)/2' : 
                       'h-text_h-50';

      ffmpeg(inputVideoPath)
        .videoFilters([
          {
            filter: 'subtitles',
            options: {
              filename: subtitlePath,
              force_style: `FontName=${options.fontFamily},FontSize=${options.fontSize},PrimaryColour=${hexToFFmpegColor(options.fontColor)},BackColour=${hexToFFmpegColor(options.backgroundColor)},Alignment=2`
            }
          }
        ])
        .output(outputVideoPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Read the output video
    const outputBuffer = fs.readFileSync(outputVideoPath);

    // Clean up temp files
    [inputVideoPath, outputVideoPath, subtitlePath].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    // Send the video with captions as response
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="video_with_captions.mp4"',
      'Content-Length': outputBuffer.length
    });
    
    res.send(outputBuffer);

  } catch (error) {
    console.error('Video caption generation error:', error);
    res.status(500).json({ 
      message: 'Error generating video with captions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to format time for SRT
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

// Helper function to convert hex color to FFmpeg color format
function hexToFFmpegColor(hex) {
  if (hex.startsWith('rgba')) {
    // Handle rgba colors - simplified conversion
    return '&H80000000'; // Semi-transparent black as fallback
  }
  
  if (hex.startsWith('#')) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `&H00${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`;
  }
  
  return '&H00FFFFFF'; // White as fallback
}

module.exports = {
  generateCaptions,
  generateVideoWithCaptions,
  upload
};
