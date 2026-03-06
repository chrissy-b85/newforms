import React, { useState } from 'react';

/**
 * Notifications Settings Tab
 *
 * Covers: notify on submission toggle, notification type, recipients,
 * participant confirmation, email field selector, subject, message, attach PDF.
 *
 * @param {{
 *   formData: Object,
 *   onChange: (field: string, value: any) => void,
 *   errors: Record<string, string>,
 *   emailFields: Array<{id: string, label: string}>,
 * }} props
 */
export default function NotificationsTab({ formData, onChange, errors, emailFields = [] }) {
  const [recipientInput, setRecipientInput] = useState('');
  const [recipientError, setRecipientError] = useState('');

  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const addRecipient = () => {
    const email = recipientInput.trim();
    if (!isEmail(email)) {
      setRecipientError('Please enter a valid email address.');
      return;
    }
    setRecipientError('');
    const current = formData.notification_recipients ?? [];
    if (!current.includes(email)) {
      onChange('notification_recipients', [...current, email]);
    }
    setRecipientInput('');
  };

  const removeRecipient = (email) => {
    onChange(
      'notification_recipients',
      (formData.notification_recipients ?? []).filter((r) => r !== email),
    );
  };

  const Toggle = ({ field, label, description }) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={formData[field] ?? false}
          onChange={(e) => onChange(field, e.target.checked)}
          aria-label={label}
        />
        <div className={`w-10 h-6 rounded-full transition-colors ${formData[field] ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData[field] ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Notify on submission */}
      <Toggle
        field="notify_on_submission"
        label="Notify on Submission"
        description="Send an email notification when a new submission is received."
      />

      {formData.notify_on_submission && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-4">
          {/* Notification type */}
          <div>
            <label htmlFor="notification_type" className="block text-sm font-medium text-gray-700 mb-1">
              Notify
            </label>
            <select
              id="notification_type"
              value={formData.notification_type ?? ''}
              onChange={(e) => onChange('notification_type', e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select —</option>
              <option value="all_admins">All Admins</option>
              <option value="specific_people">Specific People</option>
              <option value="role_based">Role-Based</option>
            </select>
          </div>

          {/* Recipient management */}
          {formData.notification_type === 'specific_people' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Recipients</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={recipientInput}
                  onChange={(e) => { setRecipientInput(e.target.value); setRecipientError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                  placeholder="admin@example.com"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addRecipient}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {recipientError && (
                <p role="alert" className="mb-2 text-sm text-red-600">{recipientError}</p>
              )}
              {errors.notification_recipients && (
                <p role="alert" className="mb-2 text-sm text-red-600">{errors.notification_recipients}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {(formData.notification_recipients ?? []).map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-300 text-sm"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeRecipient(email)}
                      aria-label={`Remove ${email}`}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notification subject */}
          <div>
            <label htmlFor="notification_subject" className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              id="notification_subject"
              type="text"
              value={formData.notification_subject ?? ''}
              onChange={(e) => onChange('notification_subject', e.target.value)}
              placeholder="New submission: {{form_name}}"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use <code>{'{{form_name}}'}</code> and <code>{'{{reference_number}}'}</code> as merge tags.
            </p>
          </div>
        </div>
      )}

      {/* Participant confirmation section */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <Toggle
          field="send_participant_confirmation"
          label="Send Participant Confirmation"
          description="Email the respondent a copy of their submission."
        />

        {formData.send_participant_confirmation && (
          <div className="rounded-lg border border-green-100 bg-green-50 p-4 space-y-4">
            {/* Email field selector */}
            <div>
              <label htmlFor="confirmation_email_field" className="block text-sm font-medium text-gray-700 mb-1">
                Respondent Email Field
              </label>
              <select
                id="confirmation_email_field"
                value={formData.confirmation_email_field ?? ''}
                onChange={(e) => onChange('confirmation_email_field', e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select email field —</option>
                {emailFields.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Confirmation subject */}
            <div>
              <label htmlFor="confirmation_subject" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Subject
              </label>
              <input
                id="confirmation_subject"
                type="text"
                value={formData.confirmation_subject ?? ''}
                onChange={(e) => onChange('confirmation_subject', e.target.value)}
                placeholder="Thank you for your submission"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Confirmation message */}
            <div>
              <label htmlFor="confirmation_message" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Message
              </label>
              <textarea
                id="confirmation_message"
                rows={4}
                value={formData.confirmation_message ?? ''}
                onChange={(e) => onChange('confirmation_message', e.target.value)}
                placeholder="We have received your submission and will be in touch shortly."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Attach PDF */}
            <Toggle
              field="attach_pdf_to_confirmation"
              label="Attach PDF to Confirmation Email"
              description="Include a PDF copy of the submission in the confirmation email."
            />
          </div>
        )}
      </div>
    </div>
  );
}
