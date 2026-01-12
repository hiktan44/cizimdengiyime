
/**
 * Google Analytics Event Tracking Utility
 */

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js' | 'set',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}

/**
 * Tracks a custom event in Google Analytics
 * @param eventName Name of the event (e.g., 'generate_image')
 * @param params Additional parameters for the event
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, {
        ...params,
        timestamp: new Date().toISOString(),
      });
      console.log(`[Analytics] Event tracked: ${eventName}`, params);
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  } else {
    console.warn(`[Analytics] gtag not found. Event ${eventName} not tracked.`);
  }
};

/**
 * Common Event Types for Fasheone
 */
export const ANALYTICS_EVENTS = {
  // Generation Events
  GENERATE_PRODUCT: 'generate_product_from_sketch',
  GENERATE_MODEL: 'generate_model_from_product',
  GENERATE_TECH_PACK: 'generate_tech_pack',
  GENERATE_VIDEO: 'generate_video',
  GENERATE_AD: 'generate_ad_genius',
  GENERATE_FOTOMATIK: 'generate_fotomatik',
  GENERATE_PIXSHOP: 'generate_pixshop',
  GENERATE_COLLAGE: 'generate_collage',

  // User Interaction
  DOWNLOAD_CONTENT: 'download_content',
  SHARE_CONTENT: 'share_content',

  // Payment Events
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE_SUCCESS: 'purchase_success',
  PURCHASE_FAILURE: 'purchase_failure',
};
