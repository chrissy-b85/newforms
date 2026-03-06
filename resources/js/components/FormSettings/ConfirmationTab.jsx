import React from 'react';

/**
 * Confirmation / After-Submission Settings Tab
 *
 * Covers: action selector (message vs redirect), confirmation heading/body,
 * reference number, PDF download, resubmit button, redirect URL, and delay.
 *
 * @param {{
 *   formData: Object,
 *   onChange: (field: string, value: any) => void,
 *   errors: Record<string, string>,
 * }} props
 */
export default function ConfirmationTab({ formData, onChange, errors }) {
  const isMessage  = formData.after_submission_action !== 'redirect';
  const isRedirect = formData.after_submission_action === 'redirect';

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
      {/* Action selector */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-3">After Submission Action</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: 'message',  label: 'Show a Message',  icon: '💬', desc: 'Display a confirmation message to the respondent.' },
            { value: 'redirect', label: 'Redirect to URL', icon: '🔗', desc: 'Send the respondent to another page.' },
          ].map(({ value, label, icon, desc }) => (
            <label
              key={value}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.after_submission_action === value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="after_submission_action"
                value={value}
                checked={formData.after_submission_action === value}
                onChange={() => onChange('after_submission_action', value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{icon} {label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Message section */}
      {isMessage && (
        <div className="space-y-4">
          {/* Confirmation Heading */}
          <div>
            <label htmlFor="confirmation_heading" className="block text-sm font-medium text-gray-700 mb-1">
              Heading
            </label>
            <input
              id="confirmation_heading"
              type="text"
              value={formData.confirmation_heading ?? ''}
              onChange={(e) => onChange('confirmation_heading', e.target.value)}
              placeholder="Thank you!"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirmation Body */}
          <div>
            <label htmlFor="confirmation_body" className="block text-sm font-medium text-gray-700 mb-1">
              Message Body
            </label>
            <textarea
              id="confirmation_body"
              rows={5}
              value={formData.confirmation_body ?? ''}
              onChange={(e) => onChange('confirmation_body', e.target.value)}
              placeholder="Your submission has been received. We will be in touch soon."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <Toggle
              field="show_reference_number"
              label="Show Reference Number"
              description="Display the unique submission reference number on the confirmation page."
            />
            <Toggle
              field="allow_pdf_download"
              label="Allow PDF Download"
              description="Let respondents download a PDF copy of their submission."
            />
            <Toggle
              field="show_resubmit_button"
              label="Show Resubmit Button"
              description="Offer a button to submit the form again after completion."
            />
          </div>

          {/* Live preview */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Preview</p>
            <div className="bg-white rounded-lg shadow-sm px-6 py-5 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {formData.confirmation_heading || 'Thank you!'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {formData.confirmation_body || 'Your response has been recorded.'}
              </p>
              {formData.show_reference_number && (
                <p className="mt-2 text-xs text-gray-400">Reference: <strong>REF-00001</strong></p>
              )}
              {formData.allow_pdf_download && (
                <button className="mt-3 px-4 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50">
                  Download PDF
                </button>
              )}
              {formData.show_resubmit_button && (
                <button className="mt-3 ml-2 px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Submit Another Response
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Redirect section */}
      {isRedirect && (
        <div className="space-y-4">
          {/* Redirect URL */}
          <div>
            <label htmlFor="redirect_url" className="block text-sm font-medium text-gray-700 mb-1">
              Redirect URL <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="redirect_url"
              type="url"
              value={formData.redirect_url ?? ''}
              onChange={(e) => onChange('redirect_url', e.target.value)}
              placeholder="https://example.com/thank-you"
              aria-required="true"
              aria-describedby={errors.redirect_url ? 'redirect_url_error' : undefined}
              className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.redirect_url ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.redirect_url && (
              <p id="redirect_url_error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.redirect_url}
              </p>
            )}
          </div>

          {/* Redirect delay */}
          <div>
            <label htmlFor="redirect_delay_seconds" className="block text-sm font-medium text-gray-700 mb-1">
              Redirect Delay: <strong>{formData.redirect_delay_seconds ?? 0} second{(formData.redirect_delay_seconds ?? 0) !== 1 ? 's' : ''}</strong>
            </label>
            <input
              id="redirect_delay_seconds"
              type="range"
              min={0}
              max={30}
              step={1}
              value={formData.redirect_delay_seconds ?? 0}
              onChange={(e) => onChange('redirect_delay_seconds', Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Instant</span>
              <span>30 s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
