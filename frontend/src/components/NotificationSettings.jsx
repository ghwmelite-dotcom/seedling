import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  showLocalNotification,
  getMilestoneProgress,
  WEALTH_MILESTONES,
} from '../utils/pushNotifications';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

const NotificationSettings = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const { simulation, currency } = useStore();

  // Get milestone progress based on simulation
  const netWorth = simulation?.scenario?.tree?.netWorth || 0;
  const milestoneProgress = getMilestoneProgress(netWorth);

  // Check support and subscription status on mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsSupported(isPushSupported());
      setPermission(getNotificationPermission());
      const subscribed = await isSubscribedToPush();
      setIsSubscribed(subscribed);
    };
    checkStatus();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const result = await subscribeToPush();
      if (result.success) {
        setIsSubscribed(true);
        setPermission('granted');
      } else {
        console.error('Subscribe failed:', result.error);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    }
    setLoading(false);
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const result = await unsubscribeFromPush();
      if (result.success) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
    setLoading(false);
  };

  const handleTestNotification = async () => {
    const success = await showLocalNotification('Test Notification', {
      body: 'Push notifications are working! You\'ll receive alerts when you hit wealth milestones.',
      tag: 'test-notification',
      data: { url: '/' },
    });

    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  if (!isSupported) {
    return (
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center">
            <span className="text-2xl">🔕</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Notifications</h3>
            <p className="text-slate-400">Not supported in this browser</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm">
          Push notifications are not supported in your current browser. Try using Chrome, Firefox, or Edge for the best experience.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
          animate={isSubscribed ? {
            boxShadow: [
              '0 0 0 0 rgba(245, 158, 11, 0)',
              '0 0 0 10px rgba(245, 158, 11, 0.1)',
              '0 0 0 0 rgba(245, 158, 11, 0)',
            ],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl">{isSubscribed ? '🔔' : '🔕'}</span>
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white">Milestone Notifications</h3>
          <p className="text-slate-400">Get notified when you hit wealth milestones</p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between mb-6 p-4 bg-slate-800/50 rounded-xl">
        <div className="flex-1">
          <div className="text-white font-semibold">Push Notifications</div>
          <div className="text-slate-400 text-sm">
            {permission === 'denied'
              ? 'Blocked by browser - enable in settings'
              : isSubscribed
              ? 'You\'ll receive milestone alerts'
              : 'Enable to get wealth milestone alerts'}
          </div>
        </div>
        <motion.button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={loading || permission === 'denied'}
          className={`w-14 h-8 rounded-full p-1 transition-colors ${
            isSubscribed
              ? 'bg-seedling-500'
              : permission === 'denied'
              ? 'bg-red-500/50 cursor-not-allowed'
              : 'bg-slate-600'
          }`}
          whileTap={{ scale: loading ? 1 : 0.95 }}
        >
          {loading ? (
            <motion.div
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <motion.div
              className="w-6 h-6 bg-white rounded-full"
              animate={{ x: isSubscribed ? 22 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      </div>

      {/* Test Notification Button */}
      <AnimatePresence>
        {isSubscribed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestNotification}
              disabled={testSent}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                testSent
                  ? 'bg-seedling-500/20 text-seedling-400 border border-seedling-500/30'
                  : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {testSent ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Test Notification Sent!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Send Test Notification
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold">Milestone Progress</span>
          <span className="text-seedling-400 font-semibold">
            {milestoneProgress.achievedCount}/{milestoneProgress.totalMilestones}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-seedling-500 via-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{
              width: `${(milestoneProgress.achievedCount / milestoneProgress.totalMilestones) * 100}%`,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Next milestone */}
        {milestoneProgress.next && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Next Milestone</span>
              <span className="text-lg">{milestoneProgress.next.emoji}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-xl">{milestoneProgress.next.label}</span>
              <span className="text-amber-400 text-sm">
                {Math.round(milestoneProgress.progress)}% there
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${milestoneProgress.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Milestone List */}
      <div>
        <h4 className="text-white font-semibold mb-3">All Milestones</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {WEALTH_MILESTONES.map((milestone, index) => {
            const isAchieved = netWorth >= milestone.amount;
            const isNext = milestoneProgress.next?.amount === milestone.amount;

            return (
              <motion.div
                key={milestone.amount}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isAchieved
                    ? 'bg-seedling-500/10 border border-seedling-500/30'
                    : isNext
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-slate-800/30 border border-slate-700/30'
                }`}
              >
                <span className="text-xl">{milestone.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isAchieved ? 'text-seedling-400' : 'text-white'}`}>
                      {milestone.label}
                    </span>
                    {isAchieved && (
                      <svg className="w-4 h-4 text-seedling-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isNext && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                        Next
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${isAchieved ? 'text-seedling-400/70' : 'text-slate-500'}`}>
                    {milestone.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 flex items-start gap-2 text-xs text-slate-500">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          Notifications are triggered locally when your simulation reaches milestone amounts.
          Run a simulation with the "With Habit Change" scenario to track your progress.
        </p>
      </div>
    </motion.div>
  );
};

export default NotificationSettings;
