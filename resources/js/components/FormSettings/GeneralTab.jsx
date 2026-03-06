import React from 'react';

/**
 * General Settings Tab
 *
 * Covers: form name, internal description, category, status badge,
 * reference prefix, and submission limit.
 *
 * @param {{
 *   formData: Object,
 *   onChange: (field: string, value: any) => void,
 *   errors: Record<string, string>,
 *   categories: Array<{id: number, name: string}>,
 * }} props
 */
export default function GeneralTab({ formData, onChange, errors, categories = [] }) {
  const statusColors = {
    draft:    'bg-gray-100 text-gray-700',
    active:   'bg-green-100 text-green-700',
    closed:   'bg-red-100 text-red-700',
    archived: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      {/* Form Name */}
      <div>
        <label htmlFor="form_name" className="block text-sm font-medium text-gray-700 mb-1">
          Form Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="form_name"
          type="text"
          value={formData.form_name ?? ''}
          onChange={(e) => onChange('form_name', e.target.value)}
          placeholder="e.g. Customer Feedback Survey"
          aria-required="true"
          aria-describedby={errors.form_name ? 'form_name_error' : undefined}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.form_name ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.form_name && (
          <p id="form_name_error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.form_name}
          </p>
        )}
      </div>

      {/* Internal Description */}
      <div>
        <label htmlFor="internal_description" className="block text-sm font-medium text-gray-700 mb-1">
          Internal Description
        </label>
        <textarea
          id="internal_description"
          rows={3}
          value={formData.internal_description ?? ''}
          onChange={(e) => onChange('internal_description', e.target.value)}
          placeholder="Optional notes visible only to admins"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">This description is not shown to respondents.</p>
      </div>

      {/* Category & Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category_id"
            value={formData.category_id ?? ''}
            onChange={(e) => onChange('category_id', e.target.value ? Number(e.target.value) : null)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— No category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status (read-only badge) */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Status</p>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
              statusColors[formData.status] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {formData.status ?? 'draft'}
          </span>
          <p className="mt-1 text-xs text-gray-500">
            Use the Publish / Close buttons to change status.
          </p>
        </div>
      </div>

      {/* Reference Prefix & Submission Limit row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Reference Prefix */}
        <div>
          <label htmlFor="reference_prefix" className="block text-sm font-medium text-gray-700 mb-1">
            Reference Prefix
          </label>
          <input
            id="reference_prefix"
            type="text"
            maxLength={20}
            value={formData.reference_prefix ?? ''}
            onChange={(e) => onChange('reference_prefix', e.target.value)}
            placeholder="e.g. SUB or 2026-"
            aria-describedby={errors.reference_prefix ? 'ref_prefix_error' : 'ref_prefix_hint'}
            className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.reference_prefix ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.reference_prefix ? (
            <p id="ref_prefix_error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.reference_prefix}
            </p>
          ) : (
            <p id="ref_prefix_hint" className="mt-1 text-xs text-gray-500">
              Letters, numbers, hyphens and underscores only.
            </p>
          )}
        </div>

        {/* Submission Limit */}
        <div>
          <label htmlFor="submission_limit" className="block text-sm font-medium text-gray-700 mb-1">
            Submission Limit
          </label>
          <input
            id="submission_limit"
            type="number"
            min={1}
            value={formData.submission_limit ?? ''}
            onChange={(e) =>
              onChange('submission_limit', e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Unlimited"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave blank for unlimited submissions.
          </p>
        </div>
      </div>
    </div>
  );
}
