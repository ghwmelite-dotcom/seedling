/**
 * Push Notification Utilities for Seedling
 * Handles Web Push API for wealth milestone notifications
 */

// VAPID Public Key (safe to expose in frontend)
export const VAPID_PUBLIC_KEY = 'BK7sf3LMxPlQzwqUzcHPHI03p8XYM-aK7OonNRjn_ueQUkJRmU3zIV1Gu31OlTgK24FVxlxkzRwAGrmnjZB8Pkg';

// API endpoint for push subscriptions
const API_BASE = 'https://seedling-api.siaboromeo.workers.dev';

// Wealth milestones configuration
export const WEALTH_MILESTONES = [
  { amount: 10000, label: '$10K', emoji: '🌱', message: 'Your first $10,000! The seed is planted.' },
  { amount: 25000, label: '$25K', emoji: '🌿', message: '$25,000 milestone! Your wealth is taking root.' },
  { amount: 50000, label: '$50K', emoji: '🪴', message: 'Halfway to six figures! $50,000 reached.' },
  { amount: 100000, label: '$100K', emoji: '🌳', message: 'SIX FIGURES! $100,000 - A major milestone!' },
  { amount: 250000, label: '$250K', emoji: '🌲', message: 'Quarter millionaire! $250,000 achieved.' },
  { amount: 500000, label: '$500K', emoji: '🏔️', message: 'Halfway to a million! $500,000!' },
  { amount: 1000000, label: '$1M', emoji: '🎉', message: 'MILLIONAIRE STATUS! $1,000,000!' },
  { amount: 2500000, label: '$2.5M', emoji: '💎', message: 'Multi-millionaire! $2.5 million reached!' },
  { amount: 5000000, label: '$5M', emoji: '🚀', message: 'FIVE MILLION DOLLARS! Incredible growth!' },
  { amount: 10000000, label: '$10M', emoji: '👑', message: 'TEN MILLION! Generational wealth unlocked!' },
];

/**
 * Check if push notifications are supported
 */
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications not supported' };
  }

  try {
    const permission = await Notification.requestPermission();
    return { success: permission === 'granted', permission };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Convert URL-safe base64 to Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications not supported' };
  }

  try {
    // First request permission
    const permissionResult = await requestNotificationPermission();
    if (!permissionResult.success) {
      return permissionResult;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Send subscription to backend
    const response = await fetch(`${API_BASE}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription on server');
    }

    // Store subscription locally
    localStorage.setItem('push-subscription', JSON.stringify(subscription.toJSON()));
    localStorage.setItem('push-enabled', 'true');

    return { success: true, subscription };
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe locally
      await subscription.unsubscribe();

      // Notify backend
      await fetch(`${API_BASE}/api/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
    }

    localStorage.removeItem('push-subscription');
    localStorage.setItem('push-enabled', 'false');

    return { success: true };
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user is subscribed to push
 */
export const isSubscribedToPush = async () => {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
};

/**
 * Send a local notification (for testing/immediate feedback)
 */
export const showLocalNotification = async (title, options = {}) => {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      ...options,
    });
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

/**
 * Check simulation results for milestone achievements and notify
 */
export const checkMilestonesAndNotify = async (simulationResult, previousMilestones = []) => {
  if (!simulationResult?.scenario?.tree) return [];

  const isEnabled = localStorage.getItem('push-enabled') === 'true';
  if (!isEnabled) return [];

  const newMilestones = [];
  const scenarioNetWorth = simulationResult.scenario.tree.netWorth || 0;

  // Check which milestones have been reached
  for (const milestone of WEALTH_MILESTONES) {
    if (scenarioNetWorth >= milestone.amount && !previousMilestones.includes(milestone.amount)) {
      newMilestones.push(milestone);
    }
  }

  // Show notifications for new milestones
  for (const milestone of newMilestones) {
    await showLocalNotification(`${milestone.emoji} Wealth Milestone Reached!`, {
      body: milestone.message,
      tag: `milestone-${milestone.amount}`,
      data: { milestone: milestone.amount, url: '/' },
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'share', title: 'Share' },
      ],
    });
  }

  return newMilestones.map((m) => m.amount);
};

/**
 * Get milestone progress for a given net worth
 */
export const getMilestoneProgress = (netWorth) => {
  const achieved = WEALTH_MILESTONES.filter((m) => netWorth >= m.amount);
  const next = WEALTH_MILESTONES.find((m) => netWorth < m.amount);

  let progress = 0;
  if (next && achieved.length > 0) {
    const lastAchieved = achieved[achieved.length - 1];
    progress = ((netWorth - lastAchieved.amount) / (next.amount - lastAchieved.amount)) * 100;
  } else if (next && achieved.length === 0) {
    progress = (netWorth / next.amount) * 100;
  } else {
    progress = 100;
  }

  return {
    achieved,
    next,
    progress: Math.min(100, Math.max(0, progress)),
    totalMilestones: WEALTH_MILESTONES.length,
    achievedCount: achieved.length,
  };
};

export default {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  showLocalNotification,
  checkMilestonesAndNotify,
  getMilestoneProgress,
  WEALTH_MILESTONES,
  VAPID_PUBLIC_KEY,
};
