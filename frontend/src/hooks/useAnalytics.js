/**
 * Analytics Hook for Seedling
 * Tracks page views, events, and conversions
 */

const API_URL = import.meta.env.PROD
  ? 'https://seedling-api.ghwmelite.workers.dev'
  : '';

// Track a page view
export const trackPageView = async (page) => {
  try {
    await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pageview',
        page: page || window.location.pathname,
      }),
    });
  } catch (e) {
    // Silently fail - analytics shouldn't break the app
    console.debug('Analytics tracking failed:', e);
  }
};

// Track an event
export const trackEvent = async (eventName, metadata = {}) => {
  try {
    await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'event',
        event: eventName,
        page: window.location.pathname,
        metadata,
      }),
    });
  } catch (e) {
    console.debug('Analytics tracking failed:', e);
  }
};

// Predefined event trackers
export const analytics = {
  // Page views
  pageView: (page) => trackPageView(page),

  // Conversion events
  signupStart: () => trackEvent('signup_start'),
  signupComplete: (source) => trackEvent('signup_complete', { source }),

  // Engagement events
  ctaClick: (ctaName) => trackEvent('cta_click', { cta: ctaName }),
  demoInteraction: (action) => trackEvent('demo_interaction', { action }),
  featureView: (feature) => trackEvent('feature_view', { feature }),

  // App events
  simulationRun: () => trackEvent('simulation_run'),
  scenarioSelect: (scenario) => trackEvent('scenario_select', { scenario }),
  reportGenerate: () => trackEvent('report_generate'),

  // Scroll depth
  scrollDepth: (depth) => trackEvent('scroll_depth', { depth }),
};

export default analytics;
