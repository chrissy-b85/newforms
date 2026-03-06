import React, { useCallback, useEffect, useRef, useState } from 'react';
import Toast from './Toast';
import ValidationModal from './ValidationModal';
import GeneralTab from './FormSettings/GeneralTab';
import AccessTab from './FormSettings/AccessTab';
import SchedulingTab from './FormSettings/SchedulingTab';
import NotificationsTab from './FormSettings/NotificationsTab';
import ConfirmationTab from './FormSettings/ConfirmationTab';
import { validateFormForPublishing } from '../utils/formValidation';

const TABS = [
  { id: 'general',       label: 'General' },
  { id: 'access',        label: 'Access' },
  { id: 'scheduling',    label: 'Scheduling' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'confirmation',  label: 'Confirmation' },
];

const DEFAULT_FORM_DATA = {
  form_name:                    '',
  internal_description:         '',
  category_id:                  null,
  status:                       'draft',
  reference_prefix:             '',
  submission_limit:             null,
  access_type:                  'public',
  allowed_roles:                [],
  allowed_user_ids:             [],
  allow_multiple_submissions:   true,
  allow_save_resume:            false,
  password_protected:           false,
  access_password:              '',
  scheduling_enabled:           false,
  open_at:                      null,
  close_at:                     null,
  before_open_message:          '',
  after_close_message:          '',
  notify_on_submission:         false,
  notification_type:            '',
  notification_recipients:      [],
  notification_subject:         '',
  send_participant_confirmation: false,
  confirmation_email_field:     '',
  confirmation_subject:         '',
  confirmation_message:         '',
  attach_pdf_to_confirmation:   false,
  after_submission_action:      'message',
  confirmation_heading:         '',
  confirmation_body:            '',
  show_reference_number:        false,
  allow_pdf_download:           false,
  show_resubmit_button:         false,
  redirect_url:                 '',
  redirect_delay_seconds:       0,
};

/**
 * Main Form Settings component.
 *
 * Fetches settings for a form by ID and provides a tab-based interface
 * for editing and saving them.
 *
 * @param {{ formId: number|string }} props
 */
export default function FormSettings({ formId }) {
  const [activeTab,        setActiveTab]        = useState('general');
  const [formData,         setFormData]         = useState(DEFAULT_FORM_DATA);
  const [loading,          setLoading]          = useState(true);
  const [saving,           setSaving]           = useState(false);
  const [errors,           setErrors]           = useState({});
  const [toast,            setToast]            = useState(null);
  const [categories,       setCategories]       = useState([]);
  const [validationErrors, setValidationErrors] = useState(null);

  const highlightedFieldRef = useRef(null);

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const [settingsRes, categoriesRes] = await Promise.all([
          fetch(`/api/forms/${formId}/settings`),
          fetch('/api/form-categories'),
        ]);

        if (!settingsRes.ok) throw new Error('Failed to load form settings.');

        const { data } = await settingsRes.json();
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          if (!cancelled) setCategories(catData.data ?? catData);
        }

        if (!cancelled) {
          setFormData({ ...DEFAULT_FORM_DATA, ...data });
        }
      } catch (err) {
        if (!cancelled) showToast(err.message || 'Failed to load settings.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [formId]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error on change
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // -------------------------------------------------------------------------
  // Save / Publish
  // -------------------------------------------------------------------------

  const handleSave = async (isDraft = true) => {
    try {
      setSaving(true);

      const res = await fetch(`/api/forms/${formId}/settings`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
        },
        body: JSON.stringify({ ...formData, status: isDraft ? 'draft' : formData.status }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 422 && json.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(json.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
            ),
          );
          showToast('Please fix the validation errors.', 'error');
        } else {
          showToast(json.message || 'Failed to save settings.', 'error');
        }
        return;
      }

      setFormData((prev) => ({ ...prev, ...json.data }));
      showToast('Settings saved successfully.', 'success');
    } catch {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    // Client-side validation first
    const { valid, errors: valErrors } = validateFormForPublishing(formData, 0);
    if (!valid) {
      setValidationErrors(valErrors);
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/forms/${formId}/publish`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
        },
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors) {
          setValidationErrors(json.errors);
        } else {
          showToast(json.message || 'Failed to publish form.', 'error');
        }
        return;
      }

      setFormData((prev) => ({ ...prev, ...json.data }));
      showToast('Form published successfully!', 'success');
    } catch {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusAction = async (action) => {
    try {
      setSaving(true);

      const res = await fetch(`/api/forms/${formId}/${action}`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
        },
      });

      const json = await res.json();

      if (!res.ok) {
        showToast(json.message || `Failed to ${action} form.`, 'error');
        return;
      }

      setFormData((prev) => ({ ...prev, ...json.data }));
      showToast(json.message, 'success');
    } catch {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Tab navigation
  // -------------------------------------------------------------------------

  const handleJumpToTab = useCallback((tabId) => {
    setActiveTab(tabId);
    // Allow DOM to update, then scroll into view
    setTimeout(() => {
      if (highlightedFieldRef.current) {
        highlightedFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const tabProps = { formData, onChange: handleChange, errors };

  const renderTab = () => {
    switch (activeTab) {
      case 'general':       return <GeneralTab       {...tabProps} categories={categories} />;
      case 'access':        return <AccessTab        {...tabProps} />;
      case 'scheduling':    return <SchedulingTab    {...tabProps} />;
      case 'notifications': return <NotificationsTab {...tabProps} />;
      case 'confirmation':  return <ConfirmationTab  {...tabProps} />;
      default:              return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" aria-live="polite" aria-busy="true">
        <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="sr-only">Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formData.form_name || 'Untitled Form'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.status === 'draft' && (
            <>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Publish
              </button>
            </>
          )}
          {formData.status === 'active' && (
            <>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => handleStatusAction('close')}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Close Form
              </button>
            </>
          )}
          {formData.status === 'closed' && (
            <button
              onClick={() => handleStatusAction('archive')}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <nav aria-label="Settings tabs" className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div ref={highlightedFieldRef}>
        {renderTab()}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Validation modal */}
      {validationErrors && (
        <ValidationModal
          errors={validationErrors}
          onClose={() => setValidationErrors(null)}
          onJumpToTab={handleJumpToTab}
        />
      )}
    </div>
  );
}
