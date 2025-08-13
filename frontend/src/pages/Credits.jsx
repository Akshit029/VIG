import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import paymentsService from '../services/paymentsService.js';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const PACKS = [
  { points: 10, price: '₹99', popular: false },
  { points: 50, price: '₹199', popular: true },
  { points: 200, price: '₹299', popular: false }
];

export default function Credits() {
  const { user, refreshProfile, getFreeCredits } = useAuth();
  const location = useLocation();
  const [loadingPoints, setLoadingPoints] = useState(null);
  const [status, setStatus] = useState(null);
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);
  const [showFreeCreditsButton, setShowFreeCreditsButton] = useState(false);
  const [isGettingFreeCredits, setIsGettingFreeCredits] = useState(false);

  const updateCreditsAfterPayment = useCallback(async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || '/api'}/payments/update-credits`,
        { sessionId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Credits updated successfully:', response.data);
      
      // Refresh user profile to get updated credits
      await refreshProfile();
      
    } catch (error) {
      console.error('Failed to update credits:', error);
      // Still refresh profile in case webhook already updated it
      await refreshProfile();
    }
  }, [refreshProfile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('status');
    const sessionId = params.get('session_id');
    
    if (s) {
      setStatus(s);
      if (s === 'success' && sessionId) {
        // Call the manual credit update endpoint
        setIsUpdatingCredits(true);
        updateCreditsAfterPayment(sessionId).finally(() => {
          setIsUpdatingCredits(false);
        });
      } else if (s === 'success') {
        refreshProfile();
      }
    }
  }, [location.search, refreshProfile, updateCreditsAfterPayment]);

  const handleGetFreeCredits = async () => {
    try {
      setIsGettingFreeCredits(true);
      const result = await getFreeCredits();
      if (result.success) {
        setStatus('free-credits');
        setTimeout(() => setStatus(null), 5000); // Clear after 5 seconds
      } else {
        alert(result.error || 'Failed to get free credits');
      }
    } catch (error) {
      alert('Failed to get free credits');
    } finally {
      setIsGettingFreeCredits(false);
    }
  };

  const buy = async (points) => {
    try {
      setLoadingPoints(points);
      const { url } = await paymentsService.createCheckout(points);
      window.location.href = url;
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to start checkout');
    } finally {
      setLoadingPoints(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Buy Credits</h1>
          <p className="text-white">1 credit = 1 audio or 1 caption generation</p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mb-6 p-4 rounded-lg bg-green-600/20 border border-green-700 text-green-300 text-center">
            <div className="flex items-center justify-center space-x-2">
              {isUpdatingCredits ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating your credits...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Payment completed! Your credits have been added to your account.</span>
                </>
              )}
            </div>
          </div>
        )}
        {status === 'cancelled' && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-600/20 border border-yellow-700 text-yellow-300 text-center">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Checkout cancelled.</span>
            </div>
          </div>
        )}
        {status === 'free-credits' && (
          <div className="mb-6 p-4 rounded-lg bg-green-600/20 border border-green-700 text-green-300 text-center">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>🎉 You received 4 free credits! Welcome to VIG!</span>
            </div>
          </div>
        )}

        {/* Current Balance */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">Your Current Balance</div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">{user?.points ?? 0}</div>
            <div className="text-gray-300">credits available</div>
            
            {/* Free Credits Button for Existing Users */}
            {user && user.points === 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={handleGetFreeCredits}
                  disabled={isGettingFreeCredits}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGettingFreeCredits ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Getting Free Credits...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🎁</span>
                      <span>Get 4 Free Credits</span>
                    </div>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-2">New users get 4 free credits to start!</p>
              </div>
            )}
          </div>
        </div>

        {/* Credit Packs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKS.map((pack) => (
            <div 
              key={pack.points} 
              className={`relative bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/30 ${
                pack.popular ? 'ring-2 ring-cyan-500/50' : ''
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{pack.points}</div>
                <div className="text-gray-400 mb-4">credits</div>
                <div className="text-2xl font-bold text-cyan-400 mb-6">{pack.price}</div>
                
                <button
                  onClick={() => buy(pack.points)}
                  disabled={loadingPoints !== null}
                  className={`w-full px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                    loadingPoints === pack.points
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                  }`}
                >
                  {loadingPoints === pack.points ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Redirecting...</span>
                    </div>
                  ) : (
                    'Buy Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-400">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Secure Payment</span>
              </div>
              <p className="text-xs text-gray-500">
                All payments are processed securely through Stripe. Your credits will be added instantly after payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


