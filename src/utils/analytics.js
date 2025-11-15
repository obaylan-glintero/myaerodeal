/**
 * Google Analytics tracking utilities
 */

// Track page views
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
};

// Track custom events
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};

// Track feature usage
export const trackFeature = (featureName, action = 'use', metadata = {}) => {
  trackEvent(`feature_${action}`, {
    feature_name: featureName,
    ...metadata
  });
};

// Track user actions
export const trackUserAction = (action, category, label = '', value = null) => {
  trackEvent(action, {
    event_category: category,
    event_label: label,
    value: value
  });
};

// Specific tracking functions for common actions
export const analytics = {
  // Lead actions
  leadCreated: () => trackEvent('lead_created', { event_category: 'leads' }),
  leadUpdated: () => trackEvent('lead_updated', { event_category: 'leads' }),
  leadDeleted: () => trackEvent('lead_deleted', { event_category: 'leads' }),
  leadConverted: () => trackEvent('lead_converted_to_deal', { event_category: 'leads', value: 1 }),

  // Aircraft actions
  aircraftCreated: () => trackEvent('aircraft_created', { event_category: 'aircraft' }),
  aircraftUpdated: () => trackEvent('aircraft_updated', { event_category: 'aircraft' }),
  aircraftDeleted: () => trackEvent('aircraft_deleted', { event_category: 'aircraft' }),
  aircraftPresented: () => trackEvent('aircraft_presented', { event_category: 'aircraft', value: 1 }),

  // Deal actions
  dealCreated: (value) => trackEvent('deal_created', { event_category: 'deals', value: value }),
  dealUpdated: () => trackEvent('deal_updated', { event_category: 'deals' }),
  dealWon: (value) => trackEvent('deal_won', { event_category: 'deals', value: value }),
  dealLost: () => trackEvent('deal_lost', { event_category: 'deals' }),
  dealStageChanged: (stage) => trackEvent('deal_stage_changed', { event_category: 'deals', event_label: stage }),

  // Task actions
  taskCreated: () => trackEvent('task_created', { event_category: 'tasks' }),
  taskCompleted: () => trackEvent('task_completed', { event_category: 'tasks', value: 1 }),

  // Document actions
  documentUploaded: (type) => trackEvent('document_uploaded', { event_category: 'documents', event_label: type }),
  documentViewed: (type) => trackEvent('document_viewed', { event_category: 'documents', event_label: type }),
  pdfExported: (type) => trackEvent('pdf_exported', { event_category: 'reports', event_label: type }),

  // AI features
  aiAssistantUsed: () => trackEvent('ai_assistant_used', { event_category: 'ai' }),
  aiDataExtracted: (type) => trackEvent('ai_data_extracted', { event_category: 'ai', event_label: type }),

  // Auth events
  userSignedUp: (method) => trackEvent('sign_up', { method: method }),
  userLoggedIn: (method) => trackEvent('login', { method: method }),
  userLoggedOut: () => trackEvent('logout'),

  // Search
  searchPerformed: (query) => trackEvent('search', { event_category: 'search', search_term: query }),
};

export default analytics;
