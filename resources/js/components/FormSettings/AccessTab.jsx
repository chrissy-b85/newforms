import React, { useState } from 'react';

const AVAILABLE_ROLES = ['admin', 'editor', 'viewer', 'manager', 'support'];

/**
 * Access Settings Tab
 *
 * Covers: access type, roles, user IDs, multiple submissions,
 * save & resume, password protection.
 *
 * @param {{
 *   formData: Object,
 *   onChange: (field: string, value: any) => void,
 *   errors: Record<string, string>,
 * }} props
 */
export default function AccessTab({ formData, onChange, errors }) {
  const [userIdInput, setUserIdInput] = useState('');

  const accessTypes = [
    { value: 'public', label: 'Public', description: 'Anyone can access and submit this form.' },
    { value: 'authenticated', label: 'Authenticated Users', description: 'Only logged-in users can submit.' },
    { value: 'role_based', label: 'Role-Based', description: 'Only users with the selected roles can submit.' },
    { value: 'specific_users', label: 'Specific Users', description: 'Only the listed user IDs can submit.' },
  ];

  const toggleRole = (role) => {
    const current = formData.allowed_roles ?? [];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    onChange('allowed_roles', updated);
  };

  const addUserId = () => {
    const id = parseInt(userIdInput, 10);
    if (!isNaN(id)) {
      const current = formData.allowed_user_ids ?? [];
      if (!current.includes(id)) {
        onChange('allowed_user_ids', [...current, id]);
      }
      setUserIdInput('');
    }
  };

  const removeUserId = (id) => {
    const current = formData.allowed_user_ids ?? [];
    onChange('allowed_user_ids', current.filter((u) => u !== id));
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
        <div
          className={`w-10 h-6 rounded-full transition-colors ${
            formData[field] ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            formData[field] ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Access Type */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-3">Who can access this form?</legend>
        <div className="space-y-3">
          {accessTypes.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                formData.access_type === value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="access_type"
                value={value}
                checked={formData.access_type === value}
                onChange={() => onChange('access_type', value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Role checkboxes — shown only for role_based */}
      {formData.access_type === 'role_based' && (
        <div
          className="rounded-lg border border-blue-100 bg-blue-50 p-4"
          role="group"
          aria-labelledby="roles-label"
        >
          <p id="roles-label" className="text-sm font-medium text-gray-700 mb-2">Allowed Roles</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ROLES.map((role) => {
              const checked = (formData.allowed_roles ?? []).includes(role);
              return (
                <label
                  key={role}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-colors ${
                    checked
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleRole(role)}
                  />
                  {role}
                </label>
              );
            })}
          </div>
          {errors.allowed_roles && (
            <p role="alert" className="mt-2 text-sm text-red-600">{errors.allowed_roles}</p>
          )}
        </div>
      )}

      {/* User ID input — shown only for specific_users */}
      {formData.access_type === 'specific_users' && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Allowed User IDs</p>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              min={1}
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addUserId()}
              placeholder="Enter user ID"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addUserId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.allowed_user_ids ?? []).map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-300 text-sm"
              >
                {id}
                <button
                  type="button"
                  onClick={() => removeUserId(id)}
                  aria-label={`Remove user ${id}`}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          {errors.allowed_user_ids && (
            <p role="alert" className="mt-2 text-sm text-red-600">{errors.allowed_user_ids}</p>
          )}
        </div>
      )}

      {/* Toggles */}
      <div className="space-y-4 border-t border-gray-100 pt-4">
        <Toggle
          field="allow_multiple_submissions"
          label="Allow Multiple Submissions"
          description="Permit the same user to submit the form more than once."
        />
        <Toggle
          field="allow_save_resume"
          label="Allow Save & Resume"
          description="Let respondents save their progress and return later."
        />
        <Toggle
          field="password_protected"
          label="Password Protection"
          description="Require a password before the form can be accessed."
        />
      </div>

      {/* Password input — shown only when password protection is on */}
      {formData.password_protected && (
        <div>
          <label htmlFor="access_password" className="block text-sm font-medium text-gray-700 mb-1">
            Access Password <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="access_password"
            type="password"
            autoComplete="new-password"
            value={formData.access_password ?? ''}
            onChange={(e) => onChange('access_password', e.target.value)}
            placeholder="Minimum 6 characters"
            aria-required="true"
            aria-describedby={errors.access_password ? 'access_pwd_error' : undefined}
            className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.access_password ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.access_password && (
            <p id="access_pwd_error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.access_password}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Leave blank to keep the existing password. Enter a new value to change it.
          </p>
        </div>
      )}
    </div>
  );
}
