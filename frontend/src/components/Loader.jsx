import React, { useState, useEffect } from 'react';

// Framer Motion components (simulated for this environment)
const MotionDiv = ({ children, initial, animate, transition, style, className, ...props }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const animatedStyle = {
    ...style,
    opacity: mounted ? (animate?.opacity ?? 1) : (initial?.opacity ?? 0),
    transform: `translateY(${mounted ? (animate?.y ?? 0) : (initial?.y ?? 20)}px) scale(${mounted ? (animate?.scale ?? 1) : (initial?.scale ?? 0.8)})`,
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  };
  
  return (
    <div style={animatedStyle} className={className} {...props}>
      {children}
    </div>
  );
};

const motion = {
  div: MotionDiv
};

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const textStates = [
      'Initializing...',
      'Loading resources...',
      'Preparing interface...',
      'Almost ready...',
      'Complete!'
    ];

    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + Math.random() * 12 + 3;
        
        // Update loading text based on progress
        if (newProgress >= 90) setLoadingText(textStates[4]);
        else if (newProgress >= 70) setLoadingText(textStates[3]);
        else if (newProgress >= 45) setLoadingText(textStates[2]);
        else if (newProgress >= 20) setLoadingText(textStates[1]);
        else setLoadingText(textStates[0]);

        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Animated dots for loading text
  const [dots, setDots] = useState('');
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @media (min-width: 640px) {
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .progress-shimmer {
          background: linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #3B82F6);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
        .glow-text {
          text-shadow: 0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3);
        }
        @media (min-width: 640px) {
          .glow-text {
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4);
          }
        }
      `}</style>

      <div className="text-center w-full max-w-lg px-4 sm:px-6 md:px-8">
        {/* Logo/Brand with animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 sm:mb-12 md:mb-16"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 mb-3 sm:mb-4 glow-text tracking-wider">
            VIG
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"
            style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
          />
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          {/* Progress Bar Container */}
          <div className="relative">
            <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-full h-2 sm:h-3 border border-gray-700/30 overflow-hidden">
              <div
                className="progress-shimmer h-2 sm:h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Progress bar glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12" />
              </div>
            </div>
            {/* Progress percentage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -top-6 sm:-top-8 left-0 transition-all duration-500 ease-out"
              style={{ left: `${Math.min(progress, 95)}%` }}
            >
              <div className="bg-gray-800/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-gray-600/30 transform -translate-x-1/2">
                <span className="text-blue-400 font-mono text-xs sm:text-sm font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <p className="text-gray-300 text-sm sm:text-base md:text-lg font-medium tracking-wide px-4 sm:px-0">
              {loadingText.replace('...', '')}<span className="text-blue-400">{loadingText.includes('...') ? dots : ''}</span>
            </p>
          </motion.div>

          {/* Loading Spinner */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-600 rounded-full animate-spin border-t-blue-500 border-r-purple-500" />
              <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-2 border-transparent rounded-full animate-ping border-t-blue-400/30" />
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom decorative elements */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-8 sm:mt-12 md:mt-16 flex justify-center space-x-1.5 sm:space-x-2"
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              style={{
                animation: `pulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Loader;