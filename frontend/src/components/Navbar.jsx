import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Combine firstName and lastName for display
  const getFullName = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const baseClass = "relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group cursor-pointer";
    return isActive(path) 
      ? `${baseClass} text-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20` 
      : `${baseClass} text-gray-300 hover:text-white hover:bg-white/5`;
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-gray-900/95 backdrop-blur-lg shadow-2xl' : 'bg-gray-900/90 backdrop-blur-md'
        }`}
        style={{
          animation: 'slideDown 0.6s ease-out'
        }}
      >
        {/* Gradient border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => handleNavClick('/')}
            >
              <div className="flex items-center space-x-3 text-xl font-bold text-white hover:text-cyan-400 transition-colors duration-300">
                <span 
                  className="text-2xl animate-pulse"
                  style={{
                    animation: 'bounce 2s infinite'
                  }}
                >
                  ⚡
                </span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  VIG
                </span>
              </div>
            </div>

            {/* Center Navigation - Home Button */}
            <div className="hidden md:flex items-center space-x-4">
              <div 
                className={`${navLinkClass('/')} transform hover:scale-105 active:scale-95`}
                onClick={() => handleNavClick('/')}
              >
                Home
                {isActive('/') && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl -z-10"
                    style={{
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  />
                )}
              </div>

              <div 
                className={`${navLinkClass('/')} transform hover:scale-105 active:scale-95`}
                onClick={() => handleNavClick('/audio')}
              >
                Audio Generator
                {isActive('/audio') && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl -z-10"
                    style={{
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  />
                )}
              </div>

              <div 
                className={`${navLinkClass('/')} transform hover:scale-105 active:scale-95`}
                onClick={() => handleNavClick('/caption')}
              >
                Auto Caption
                {isActive('/caption') && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl -z-10"
                    style={{
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  />
                )}
              </div>


              <div 
                className={`${navLinkClass('/')} transform hover:scale-105 active:scale-95`}
                onClick={() => handleNavClick('/credits')}
              >
                {`Credits${user?.points != null ? ` (${user.points})` : ''}`}
                {isActive('/credits') && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl -z-10"
                    style={{
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Side Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getFullName().charAt(0).toUpperCase()}
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl z-50"
                         style={{
                           animation: 'slideDown 0.2s ease-out'
                         }}>
                      <div className="p-4 border-b border-gray-700">
                        <div className="text-sm text-gray-400">Welcome back,</div>
                        <div className="text-cyan-400 font-medium">{getFullName()}</div>
                        <div className="text-xs text-gray-500 mt-1">{user?.email}</div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            handleNavClick('/profile');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profile</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div 
                    className={`${navLinkClass('/login')} transform hover:scale-105 active:scale-95`}
                    onClick={() => handleNavClick('/login')}
                  >
                    Login
                    {isActive('/login') && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl -z-10"
                        style={{
                          animation: 'fadeIn 0.3s ease-out'
                        }}
                      />
                    )}
                  </div>
                  <div className="transform hover:scale-105 active:scale-95">
                    <button
                      onClick={() => handleNavClick('/register')}
                      className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    >
                      <span className="relative z-10">Register</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 hover:opacity-20 transition-opacity duration-300" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 transform active:scale-90"
              >
                <span className="sr-only">Open main menu</span>
                <div 
                  className="transform transition-transform duration-200"
                  style={{
                    transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}
                >
                  {isMenuOpen ? (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-2 pt-2 pb-6 space-y-2 sm:px-3 border-t border-gray-700/50">
              {/* Always show Home */}
              <div
                className={`block ${navLinkClass('/')} transform transition-all duration-200`}
                onClick={() => handleNavClick('/')}
                style={{
                  animation: isMenuOpen ? 'slideInLeft 0.3s ease-out' : ''
                }}
              >
                Home
              </div>

              <div
                className={`block ${navLinkClass('/')} transform transition-all duration-200`}
                onClick={() => handleNavClick('/audio')}
                style={{
                  animation: isMenuOpen ? 'slideInLeft 0.3s ease-out' : ''
                }}
              >
                Audio Generator
              </div>

              <div
                className={`block ${navLinkClass('/')} transform transition-all duration-200`}
                onClick={() => handleNavClick('/caption')}
                style={{
                  animation: isMenuOpen ? 'slideInLeft 0.3s ease-out' : ''
                }}
              >
                Auto Caption
              </div>

              <div
                className={`block ${navLinkClass('/')} transform transition-all duration-200`}
                onClick={() => handleNavClick('/credits')}
                style={{
                  animation: isMenuOpen ? 'slideInLeft 0.3s ease-out' : ''
                }}
              >
                Credits
              </div>

              {isAuthenticated ? (
                <div 
                  className="pt-4 pb-3 border-t border-gray-700/50"
                  style={{
                    animation: isMenuOpen ? 'slideInLeft 0.6s ease-out' : ''
                  }}
                >
                  <div className="px-4 text-sm text-gray-400 mb-3">
                    Welcome, <span className="text-cyan-400 font-medium">{getFullName()}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-gray-300 hover:text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-red-500/10 transform active:scale-95"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={`block ${navLinkClass('/login')} transform transition-all duration-200`}
                    onClick={() => handleNavClick('/login')}
                    style={{
                      animation: isMenuOpen ? 'slideInLeft 0.4s ease-out' : ''
                    }}
                  >
                    Login
                  </div>
                  <div
                    style={{
                      animation: isMenuOpen ? 'slideInLeft 0.5s ease-out' : ''
                    }}
                  >
                    <button
                      onClick={() => handleNavClick('/register')}
                      className="block w-full text-left bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-500/25 transform active:scale-95"
                    >
                      Register
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;