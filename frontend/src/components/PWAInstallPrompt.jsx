import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check localStorage for dismissed state
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if not dismissed in the last 7 days
    if (daysSinceDismissed > 7) {
      // Delay showing the prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleDismissIOSInstructions = () => {
    setShowIOSInstructions(false);
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* Main Install Prompt */}
      <AnimatePresence>
        {showPrompt && !showIOSInstructions && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header gradient bar */}
              <div className="h-1 bg-gradient-to-r from-seedling-500 via-emerald-400 to-teal-500" />

              <div className="p-5">
                {/* App Icon and Info */}
                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-seedling-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-seedling-500/30"
                    animate={{
                      boxShadow: [
                        '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                        '0 10px 25px -3px rgba(16, 185, 129, 0.5)',
                        '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-2xl">🌱</span>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">Install Seedling</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Add to your home screen for the best experience with offline access
                    </p>
                  </div>

                  {/* Close button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDismiss}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Features */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { icon: '⚡', label: 'Fast' },
                    { icon: '📴', label: 'Offline' },
                    { icon: '🔔', label: 'Updates' },
                  ].map((feature, i) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/50"
                    >
                      <span className="text-lg">{feature.icon}</span>
                      <span className="text-xs text-slate-400">{feature.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDismiss}
                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 transition-all"
                  >
                    Not Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInstall}
                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-seedling-500 to-emerald-600 hover:from-seedling-400 hover:to-emerald-500 shadow-lg shadow-seedling-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Install
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Installation Instructions */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleDismissIOSInstructions}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="h-1 bg-gradient-to-r from-seedling-500 via-emerald-400 to-teal-500" />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-seedling-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-xl">🌱</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Install on iOS</h3>
                    <p className="text-sm text-slate-400">Follow these steps</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Tap the Share button</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Look for the{' '}
                        <span className="inline-flex items-center px-2 py-0.5 bg-slate-700 rounded text-white">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </span>{' '}
                        button in Safari
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Scroll and find "Add to Home Screen"</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Tap{' '}
                        <span className="inline-flex items-center px-2 py-0.5 bg-slate-700 rounded text-white">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add to Home Screen
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-seedling-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-seedling-400 font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Tap "Add"</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Seedling will be added to your home screen
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDismissIOSInstructions}
                  className="mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-seedling-500 to-emerald-600 shadow-lg shadow-seedling-500/25"
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAInstallPrompt;
