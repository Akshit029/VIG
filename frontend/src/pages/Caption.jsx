import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Download, Copy, Loader2, Video, Settings, Coins } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

//
export default function Caption() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoURL, setVideoURL] = useState(null)
  const [caption, setCaption] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('hi')
  const [showSettings, setShowSettings] = useState(false)
  const [captionOptions, setCaptionOptions] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    fontColor: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'bottom',
    maxWordsPerLine: 8
  })

  const languages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'en-US', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ]

  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia']
  const positions = [
    { value: 'bottom', label: 'Bottom' },
    { value: 'top', label: 'Top' },
    { value: 'center', label: 'Center' }
  ]

  const handleVideoUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file)
      const url = URL.createObjectURL(file)
      setVideoURL(url)
    }
  }

  const generateCaption = async () => {
    if (!selectedVideo) return
    
    // Redirect to login if user is not authenticated
    const existingToken = localStorage.getItem('token')
    if (!existingToken) {
      navigate('/login')
      return
    }

    // Check if user has enough credits
    if (!user || (user.points || 0) <= 0) {
      alert('You are out of credits. Please purchase more to continue.')
      navigate('/credits')
      return
    }

    setIsGenerating(true)
    
    try {
      const formData = new FormData()
      formData.append('video', selectedVideo)
      formData.append('language', selectedLanguage)
      formData.append('fontSize', captionOptions.fontSize)
      formData.append('fontFamily', captionOptions.fontFamily)
      formData.append('fontColor', captionOptions.fontColor)
      formData.append('backgroundColor', captionOptions.backgroundColor)
      formData.append('position', captionOptions.position)
      formData.append('maxWordsPerLine', captionOptions.maxWordsPerLine)
      
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:5001/api/caption/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if ((data.message || '').toLowerCase().includes('insufficient points')) {
          alert('You are out of credits. Please purchase more to continue.')
          navigate('/credits')
        }
        throw new Error(data.message || 'Failed to generate captions')
      }
      
      setCaption(data.data.transcript || 'No speech detected in the video.')
      
      // Refresh user profile to get updated credits
      await refreshProfile()
      
    } catch (error) {
      console.error('Caption generation error:', error)
      setCaption(`Error generating captions: ${error.message}. Please try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateVideoWithCaptions = async () => {
    if (!selectedVideo) return
    
    // Check if user has enough credits
    if (!user || (user.points || 0) <= 0) {
      alert('You are out of credits. Please purchase more to continue.')
      navigate('/credits')
      return
    }
    
    setIsGeneratingVideo(true)
    
    try {
      const formData = new FormData()
      formData.append('video', selectedVideo)
      formData.append('language', selectedLanguage)
      formData.append('fontSize', captionOptions.fontSize)
      formData.append('fontFamily', captionOptions.fontFamily)
      formData.append('fontColor', captionOptions.fontColor)
      formData.append('backgroundColor', captionOptions.backgroundColor)
      formData.append('position', captionOptions.position)
      formData.append('maxWordsPerLine', captionOptions.maxWordsPerLine)
      
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:5001/api/caption/generate-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        if ((errorData.message || '').toLowerCase().includes('insufficient points')) {
          alert('You are out of credits. Please purchase more to continue.')
          navigate('/credits')
        }
        throw new Error(errorData.message || 'Failed to generate video with captions')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedVideo.name.split('.')[0]}_with_captions.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      // Refresh user profile to get updated credits
      await refreshProfile()
      
    } catch (error) {
      console.error('Video generation error:', error)
      alert(`Error generating video: ${error.message}`)
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  const copyCaption = () => {
    navigator.clipboard.writeText(caption)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const updateCaptionOption = (key, value) => {
    setCaptionOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-start justify-center p-4 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto w-full"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12 sm:mb-16 pt-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AI Video Caption Generator
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-4">
            Generate captions for your videos with the power of artificial intelligence
          </p>
          
          {/* Credit Display */}
          <div className="items-center justify-center gap-2 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl px-4 py-2 inline-flex mt-4">
            <Coins className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">{user?.points || 0}</span>
            <span className="text-gray-400 text-sm">credits available</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Panel - Upload & Settings */}
          <div className="space-y-6">
            {/* Video Upload */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Upload Video</h3>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="w-full bg-gray-900/80 border border-gray-600/50 rounded-xl p-6 text-center transition-all duration-300 hover:border-purple-500/50">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-purple-600/20 rounded-full">
                        <Video className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {selectedVideo ? selectedVideo.name : 'Click to upload video'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {selectedVideo ? 'Click to change video' : 'Supports MP4, MOV, AVI and more'}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Language Selection */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Language</h3>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </motion.div>

            {/* Caption Settings */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Caption Settings</h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition-colors"
                >
                  <Settings className="w-5 h-5 text-purple-400" />
                </button>
              </div>
              
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Font Size */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Font Size: {captionOptions.fontSize}px</label>
                      <input
                        type="range"
                        min="16"
                        max="48"
                        value={captionOptions.fontSize}
                        onChange={(e) => updateCaptionOption('fontSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Font Family</label>
                      <select
                        value={captionOptions.fontFamily}
                        onChange={(e) => updateCaptionOption('fontFamily', e.target.value)}
                        className="w-full bg-gray-900/80 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        {fontFamilies.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>

                    {/* Font Color */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Font Color</label>
                      <input
                        type="color"
                        value={captionOptions.fontColor}
                        onChange={(e) => updateCaptionOption('fontColor', e.target.value)}
                        className="w-full h-10 bg-gray-900/80 border border-gray-600/50 rounded-lg"
                      />
                    </div>

                    {/* Position */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Position</label>
                      <select
                        value={captionOptions.position}
                        onChange={(e) => updateCaptionOption('position', e.target.value)}
                        className="w-full bg-gray-900/80 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        {positions.map(pos => (
                          <option key={pos.value} value={pos.value}>{pos.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Words Per Line */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Words Per Line: {captionOptions.maxWordsPerLine}</label>
                      <input
                        type="range"
                        min="4"
                        max="12"
                        value={captionOptions.maxWordsPerLine}
                        onChange={(e) => updateCaptionOption('maxWordsPerLine', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-3"
            >
              <button
                onClick={generateCaption}
                disabled={!selectedVideo || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Captions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Captions
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">1 credit</span>
                  </>
                )}
              </button>

              <button
                onClick={generateVideoWithCaptions}
                disabled={!selectedVideo || isGeneratingVideo || !caption}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Video...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download with Captions
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">1 credit</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Right Panel - Video Preview */}
          <div className="space-y-6">
            {/* Video Preview with Overlaid Captions */}
            <AnimatePresence>
              {videoURL && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                  className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Video Preview</h3>
                    {caption && (
                      <button
                        onClick={copyCaption}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 text-sm"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Captions
                      </button>
                    )}
                  </div>
                  
                  <div className="relative group overflow-hidden rounded-xl">
                    <video
                      src={videoURL}
                      controls
                      className="w-full h-auto rounded-xl shadow-lg"
                      style={{ maxHeight: '600px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Overlaid Captions */}
                    <AnimatePresence>
                      {caption && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`absolute inset-x-0 ${
                            captionOptions.position === 'top' ? 'top-4' :
                            captionOptions.position === 'center' ? 'top-1/2 -translate-y-1/2' :
                            'bottom-4'
                          } px-4 pointer-events-none`}
                        >
                          <div 
                            className="text-center px-3 py-2 rounded-lg max-w-full mx-auto"
                            style={{
                              backgroundColor: captionOptions.backgroundColor,
                              color: captionOptions.fontColor,
                              fontSize: `${Math.max(12, captionOptions.fontSize * 0.7)}px`,
                              fontFamily: captionOptions.fontFamily,
                              lineHeight: '1.4',
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            <p className="break-words">
                              {caption.length > 100 ? `${caption.substring(0, 100)}...` : caption}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Caption Preview Text (Collapsible) */}
                  {caption && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 bg-gray-900/30 rounded-lg p-3 text-xs text-gray-300 max-h-32 overflow-y-auto"
                    >
                      <p className="leading-relaxed">{caption}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>


          </div>
        </div>

        {/* Loading Animation */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                />
                <p className="text-gray-300 text-lg font-medium mb-2">Creating your masterpiece</p>
                <p className="text-gray-500 text-sm">This usually takes a few seconds...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Toast Notification */}
        <AnimatePresence>
          {showCopied && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            >
              Caption copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}