import React from 'react';

/**
 * Scheduling Settings Tab
 *
 * Covers: enable scheduling toggle, open/close date-time pickers,
 * before-open and after-close messages.
 *
 * @param {{
 *   formData: Object,
 *   onChange: (field: string, value: any) => void,
 *   errors: Record<string, string>,
 * }} props
 */
export default function SchedulingTab({ formData, onChange, errors }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert ISO string to local datetime-local value
  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Convert datetime-local input value to ISO string
  const fromLocalInput = (value) => {
    if (!value) return null;
    return new Date(value).toISOString();
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
      {/* Enable scheduling toggle */}
      <Toggle
        field="scheduling_enabled"
        label="Enable Scheduling"
        description="Automatically open and close the form at the specified times."
      />

      {/* Date pickers — shown only when scheduling is enabled */}
      {formData.scheduling_enabled && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-4">
          <p className="text-xs text-blue-700 font-medium">
            Timezone: {timezone}
          </p>

          {/* Open at */}
          <div>
            <label htmlFor="open_at" className="block text-sm font-medium text-gray-700 mb-1">
              Opens At
            </label>
            <input
              id="open_at"
              type="datetime-local"
              value={toLocalInput(formData.open_at)}
              onChange={(e) => onChange('open_at', fromLocalInput(e.target.value))}
              aria-describedby={errors.open_at ? 'open_at_error' : undefined}
              className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                errors.open_at ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.open_at && (
              <p id="open_at_error" role="alert" className="mt-1 text-sm text-red-600">{errors.open_at}</p>
            )}
          </div>

          {/* Close at */}
          <div>
            <label htmlFor="close_at" className="block text-sm font-medium text-gray-700 mb-1">
              Closes At
            </label>
            <input
              id="close_at"
              type="datetime-local"
              value={toLocalInput(formData.close_at)}
              onChange={(e) => onChange('close_at', fromLocalInput(e.target.value))}
              min={formData.open_at ? toLocalInput(formData.open_at) : undefined}
              aria-describedby={errors.close_at ? 'close_at_error' : undefined}
              className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                errors.close_at ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.close_at && (
              <p id="close_at_error" role="alert" className="mt-1 text-sm text-red-600">{errors.close_at}</p>
            )}
          </div>

          {/* Scheduling preview */}
          {(formData.open_at || formData.close_at) && (
            <div className="rounded-md bg-white border border-blue-200 px-3 py-2 text-xs text-blue-800">
              <strong>Preview:</strong>{' '}
              {formData.open_at && !formData.close_at && `Form opens ${new Date(formData.open_at).toLocaleString()} and stays open indefinitely.`}
              {!formData.open_at && formData.close_at && `Form is open now and closes ${new Date(formData.close_at).toLocaleString()}.`}
              {formData.open_at && formData.close_at && `Form is open from ${new Date(formData.open_at).toLocaleString()} to ${new Date(formData.close_at).toLocaleString()}.`}
            </div>
          )}
        </div>
      )}

      {/* Before open message */}
      <div>
        <label htmlFor="before_open_message" className="block text-sm font-medium text-gray-700 mb-1">
          Before Open Message
        </label>
        <textarea
          id="before_open_message"
          rows={3}
          value={formData.before_open_message ?? ''}
          onChange={(e) => onChange('before_open_message', e.target.value)}
          placeholder="Shown to visitors before the form opens (e.g. 'This form is not yet open.')"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* After close message */}
      <div>
        <label htmlFor="after_close_message" className="block text-sm font-medium text-gray-700 mb-1">
          After Close Message
        </label>
        <textarea
          id="after_close_message"
          rows={3}
          value={formData.after_close_message ?? ''}
          onChange={(e) => onChange('after_close_message', e.target.value)}
          placeholder="Shown to visitors after the form closes (e.g. 'Submissions are now closed.')"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
