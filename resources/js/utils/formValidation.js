/**
 * Client-side form validation utilities.
 *
 * These rules mirror the backend FormPublishingService so that
 * validation feedback is instant without a round-trip to the server.
 */

/**
 * Validate a form data object before publishing.
 *
 * @param {Object} formData   - Current form settings state object.
 * @param {number} fieldCount - Number of fields currently on the form.
 * @returns {{ valid: boolean, errors: Array<{field: string, message: string, tab: string}> }}
 */
export function validateFormForPublishing(formData, fieldCount = 0) {
  const errors = [];

  // --- General tab ---
  if (!formData.form_name || formData.form_name.trim() === '') {
    errors.push({
      field: 'form_name',
      message: 'Form name is required before publishing.',
      tab: 'general',
    });
  }

  if (fieldCount === 0) {
    errors.push({
      field: 'fields',
      message: 'The form must have at least one field before publishing.',
      tab: 'general',
    });
  }

  // --- Access tab ---
  if (formData.access_type === 'role_based') {
    const roles = formData.allowed_roles ?? [];
    if (roles.length === 0) {
      errors.push({
        field: 'allowed_roles',
        message: 'At least one role must be selected for role-based access.',
        tab: 'access',
      });
    }
  }

  if (formData.access_type === 'specific_users') {
    const ids = formData.allowed_user_ids ?? [];
    if (ids.length === 0) {
      errors.push({
        field: 'allowed_user_ids',
        message: 'At least one user ID must be specified for restricted access.',
        tab: 'access',
      });
    }
  }

  // --- Scheduling tab ---
  if (formData.scheduling_enabled && formData.open_at && formData.close_at) {
    if (new Date(formData.close_at) <= new Date(formData.open_at)) {
      errors.push({
        field: 'close_at',
        message: 'The closing date/time must be after the opening date/time.',
        tab: 'scheduling',
      });
    }
  }

  // --- Notifications tab ---
  if (formData.notify_on_submission && formData.notification_type === 'specific_people') {
    const recipients = formData.notification_recipients ?? [];
    if (recipients.length === 0) {
      errors.push({
        field: 'notification_recipients',
        message: 'At least one notification recipient is required.',
        tab: 'notifications',
      });
    }
  }

  // --- Confirmation tab ---
  if (formData.after_submission_action === 'redirect') {
    if (!formData.redirect_url || formData.redirect_url.trim() === '') {
      errors.push({
        field: 'redirect_url',
        message: 'A redirect URL is required when the after-submission action is set to redirect.',
        tab: 'confirmation',
      });
    } else {
      try {
        new URL(formData.redirect_url);
      } catch {
        errors.push({
          field: 'redirect_url',
          message: 'The redirect URL must be a valid URL (including http:// or https://).',
          tab: 'confirmation',
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Group an array of error objects by their `tab` property.
 *
 * @param {Array<{field: string, message: string, tab: string}>} errors
 * @returns {Record<string, Array<{field: string, message: string, tab: string}>>}
 */
export function groupErrorsByTab(errors) {
  return errors.reduce((acc, err) => {
    const tab = err.tab || 'general';
    if (!acc[tab]) acc[tab] = [];
    acc[tab].push(err);
    return acc;
  }, {});
}

/**
 * Convert a tab ID into a human-readable label.
 *
 * @param {string} tabId
 * @returns {string}
 */
export function getTabLabel(tabId) {
  const labels = {
    general:      'General',
    access:       'Access',
    scheduling:   'Scheduling',
    notifications: 'Notifications',
    confirmation: 'Confirmation',
  };
  return labels[tabId] ?? tabId.charAt(0).toUpperCase() + tabId.slice(1);
}
