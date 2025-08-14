const User = require('../models/User');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ElevenLabs API configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Generate text-to-speech audio using ElevenLabs
const generateAudio = async (req, res) => {
  try {
    const { text, voice_id = 'pNInz6obpgDQGcFmaJgB', model_id = 'eleven_monolingual_v1' } = req.body;
    const userId = req.user.id;

    // Points check: require 1 point to generate audio
    if (req.user.points <= 0) {
      return res.status(402).json({ message: 'Insufficient points. Please purchase more credits.' });
    }

    // Validate input
    if (!text) {
      return res.status(400).json({ 
        message: 'Text is required for text-to-speech generation' 
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({ 
        message: 'Text must be less than 5000 characters' 
      });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ 
        message: 'ElevenLabs API key not configured' 
      });
    }

    console.log('Generating TTS audio with ElevenLabs...');

    try {
      // Generate audio using ElevenLabs API
      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${voice_id}`,
        {
          text: text,
          model_id: model_id,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          },
          responseType: 'arraybuffer'
        }
      );
    } catch (apiError) {
      // If ElevenLabs API fails (401, rate limit, etc.), return error without deducting credits
      console.warn('ElevenLabs API failed:', apiError.response?.status, apiError.response?.statusText);
      
      return res.status(503).json({
        message: 'TTS service temporarily unavailable. Please try again later or contact support.',
        error: 'ElevenLabs API key needs to be updated',
        pointsRemaining: req.user.points
      });
    }

    // Create temporary file to store the audio
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `tts_${userId}_${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);

    // Write audio buffer to file
    fs.writeFileSync(filePath, response.data);

    // Create audio generation record
    const audioRecord = {
      userId,
      text,
      voice_id,
      model_id,
      streamUrl: `/api/audio/stream/${fileName}`,
      downloadUrl: `/api/audio/download/${fileName}`,
      generatedAt: new Date(),
      status: 'completed'
    };

    // TODO: Save to database if you create an Audio model
    // const audio = new Audio(audioRecord);
    // await audio.save();

    // Deduct one point after successful generation
    try {
      req.user.points = Math.max(0, (req.user.points || 0) - 1);
      await req.user.save();
    } catch (saveErr) {
      console.error('Failed to deduct point:', saveErr);
    }

    res.status(200).json({
      message: 'Text-to-speech audio generated successfully',
      audio: {
        id: Date.now(),
        text,
        voice_id,
        model_id,
        streamUrl: audioRecord.streamUrl,
        downloadUrl: audioRecord.downloadUrl,
        generatedAt: audioRecord.generatedAt
      },
      pointsRemaining: req.user.points
    });

  } catch (error) {
    console.error('ElevenLabs TTS generation error:', error);
    res.status(500).json({ 
      message: 'Error generating text-to-speech audio',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's audio generation history
const getAudioHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // TODO: Implement with Audio model
    // const audioHistory = await Audio.find({ userId })
    //   .sort({ generatedAt: -1 })
    //   .limit(limit)
    //   .skip((page - 1) * limit);

    // Mock response for now
    const audioHistory = [
      {
        id: 1,
        prompt: 'A peaceful piano melody with gentle rain sounds',
        duration: 30,
        format: 'mp3',
        audioUrl: 'https://api.example.com/audio/1.mp3',
        generatedAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: 2,
        prompt: 'Upbeat electronic music with synthesizers',
        duration: 60,
        format: 'wav',
        audioUrl: 'https://api.example.com/audio/2.wav',
        generatedAt: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];

    res.status(200).json({
      message: 'Audio history retrieved successfully',
      audioHistory,
      pagination: {
        page,
        limit,
        total: audioHistory.length,
        pages: Math.ceil(audioHistory.length / limit)
      }
    });

  } catch (error) {
    console.error('Get audio history error:', error);
    res.status(500).json({ 
      message: 'Error retrieving audio history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Stream audio file for preview (inline playback)
const streamAudio = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../temp', fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found' });
    }

    // Set appropriate headers for streaming/preview
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the file for inline playback
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ 
      message: 'Error streaming audio file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Download generated audio file
const downloadAudio = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../temp', fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found' });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file for download
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up file after download (optional)
    fileStream.on('end', () => {
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000); // Delete after 5 seconds
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      message: 'Error downloading audio file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get available voices from ElevenLabs
const getVoices = async (req, res) => {
  try {
    // Fallback voices in case API key is not configured or API fails
    const fallbackVoices = [
      { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade', description: 'Deep, mature male voice' },
      { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'premade', description: 'Young, energetic female voice' },
      { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'premade', description: 'Confident, strong female voice' },
      { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'premade', description: 'Soft, gentle female voice' },
      { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'premade', description: 'Well-rounded, versatile male voice' }
    ];

    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured, returning fallback voices');
      return res.status(200).json({ 
        message: 'Voices retrieved successfully (fallback)',
        voices: fallbackVoices
      });
    }

    try {
      const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        }
      });
      
      res.status(200).json({
        message: 'Voices retrieved successfully',
        voices: response.data.voices.map(voice => ({
          voice_id: voice.voice_id,
          name: voice.name,
          category: voice.category,
          description: voice.description || ''
        }))
      });
    } catch (apiError) {
      console.warn('ElevenLabs API error, returning fallback voices:', apiError.message);
      res.status(200).json({
        message: 'Voices retrieved successfully (fallback)',
        voices: fallbackVoices
      });
    }

  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ 
      message: 'Error retrieving voices',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  generateAudio,
  getAudioHistory,
  streamAudio,
  downloadAudio,
  getVoices
}; 