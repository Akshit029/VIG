import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Music, Download, Loader2, Mic, Coins } from 'lucide-react'
import audioService from '../services/audioService'
import { useAuth } from '../context/AuthContext.jsx'

export default function AudioGenerator() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [text, setText] = useState('')
  const [downloadURL, setDownloadURL] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('pNInz6obpgDQGcFmaJgB') // Default voice
  const [voices, setVoices] = useState([])

  // Load available voices on component mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await audioService.getVoices()
        setVoices(response.voices || [])
      } catch (error) {
        console.error('Error loading voices:', error)
        // Set some default voices if API fails
        setVoices([
          { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade' },
          { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'premade' },
          { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'premade' }
        ])
      }
    }
    loadVoices()
  }, [])

  const generateAudio = async () => {
    if (!text.trim()) return
    
    // Check if user has enough credits
    if (!user || (user.points || 0) <= 0) {
      alert('You are out of credits. Please purchase more to continue.')
      navigate('/credits')
      return
    }
    
    setIsGenerating(true)
    setDownloadURL(null)
    
    try {
      const response = await audioService.generateTTS(text, selectedVoice)
      // Convert relative URL to full URL for download
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001'
      
      const fullDownloadURL = response.audio.downloadUrl.startsWith('http') 
        ? response.audio.downloadUrl 
        : `${baseURL}${response.audio.downloadUrl}`
      
      setDownloadURL(fullDownloadURL)  // For download only
      
      // Refresh user profile to get updated credits
      await refreshProfile()
    } catch (error) {
      console.error('TTS generation error:', error)
      if (String(error.message).toLowerCase().includes('insufficient points')) {
        alert('You are out of credits. Please purchase more to continue.')
        navigate('/credits')
      }
    } finally {
      setIsGenerating(false)
    }
  }



  const downloadAudio = async () => {
    if (downloadURL) {
      try {
        await audioService.downloadAudio(downloadURL, `generated-speech.mp3`)
      } catch (error) {
        console.error('Download error:', error)
        // Fallback to direct download
        const link = document.createElement('a')
        link.href = downloadURL
        link.download = `generated-speech.mp3`
        link.click()
      }
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto pt-8 sm:pt-16"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            >
              <Music className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Text to Speech
            </h1>
          </div>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto mb-4">
            Convert your text into natural-sounding speech with ElevenLabs AI voices
          </p>
          
          {/* Credit Display */}
          <div className="items-center justify-center gap-2 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl px-4 py-2 inline-flex ">
            <Coins className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">{user?.points || 0}</span>
            <span className="text-gray-400 text-sm">credits available</span>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl mb-8"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Text to Convert
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech... (up to 5000 characters)"
                  className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                  maxLength={5000}
                />
              </motion.div>
              <div className="mt-2 text-right">
                <span className="text-gray-400 text-sm">{text.length}/5000 characters</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Voice Selection
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              >
                {voices.map((voice) => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} ({voice.category})
                  </option>
                ))}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateAudio}
              disabled={!text.trim() || isGenerating}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Audio...
                  </motion.div>
                ) : (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Mic className="w-5 h-5" />
                    Generate Speech
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">1 credit</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* Download Section */}
        <AnimatePresence mode="wait">
          {downloadURL && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Speech Generated Successfully!</h3>
                <p className="text-gray-300 mb-6">Your text has been converted to speech. Click below to download the audio file.</p>
                
                {/* Download Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadAudio}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                >
                  <Download className="w-5 h-5" />
                  Download Speech Audio
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 