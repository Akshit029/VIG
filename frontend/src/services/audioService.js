import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const audioService = {
  // Generate text-to-speech audio using ElevenLabs
  async generateTTS(text, voice_id, model_id = 'eleven_monolingual_v1') {
    try {
      const response = await api.post('/audio/generate', {
        text,
        voice_id,
        model_id
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Text-to-speech generation failed');
    }
  },

  // Get available voices from ElevenLabs
  async getVoices() {
    try {
      const response = await api.get('/audio/voices');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get voices');
    }
  },

  // Legacy method for backward compatibility
  async generateAudio(prompt, duration, format) {
    return this.generateTTS(prompt, 'pNInz6obpgDQGcFmaJgB');
  },

  // Get audio generation history
  async getAudioHistory(page = 1, limit = 10) {
    try {
      const response = await api.get('/audio/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get audio history');
    }
  },

  // Download audio file
  async downloadAudio(audioUrl, filename) {
    try {
      const response = await api.get(audioUrl, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw new Error('Failed to download audio file');
    }
  }
};

export default audioService; 