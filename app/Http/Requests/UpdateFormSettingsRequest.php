<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFormSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * The 'update' ability on the Form model should be defined in
     * App\Policies\FormPolicy to restrict access based on ownership or role.
     */
    public function authorize(): bool
    {
        $form = $this->route('form');

        return $this->user() && $this->user()->can('update', $form);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // General
            'form_name'            => ['required', 'string', 'max:255'],
            'internal_description' => ['nullable', 'string', 'max:2000'],
            'category_id'          => ['nullable', 'integer', 'exists:form_categories,id'],
            'status'               => ['sometimes', 'string', 'in:draft,active,closed,archived'],
            'reference_prefix'     => ['nullable', 'string', 'max:20', 'regex:/^[A-Za-z0-9_\-]+$/'],
            'submission_limit'     => ['nullable', 'integer', 'min:1'],

            // Access
            'access_type'            => ['required', 'string', 'in:public,authenticated,role_based,specific_users'],
            'allowed_roles'          => ['nullable', 'array'],
            'allowed_roles.*'        => ['string', 'max:100'],
            'allowed_user_ids'       => ['nullable', 'array'],
            'allowed_user_ids.*'     => ['integer'],
            'allow_multiple_submissions' => ['boolean'],
            'allow_save_resume'          => ['boolean'],
            'password_protected'         => ['boolean'],
            'access_password'            => [
                'nullable',
                'string',
                'min:6',
                'required_if:password_protected,true',
            ],

            // Scheduling
            'scheduling_enabled'   => ['boolean'],
            'open_at'              => ['nullable', 'date'],
            'close_at'             => ['nullable', 'date', 'after:open_at'],
            'before_open_message'  => ['nullable', 'string', 'max:2000'],
            'after_close_message'  => ['nullable', 'string', 'max:2000'],

            // Notifications
            'notify_on_submission'          => ['boolean'],
            'notification_type'             => ['nullable', 'string', 'in:all_admins,specific_people,role_based'],
            'notification_recipients'       => ['nullable', 'array'],
            'notification_recipients.*'     => ['email'],
            'notification_subject'          => ['nullable', 'string', 'max:255'],
            'send_participant_confirmation' => ['boolean'],
            'confirmation_email_field'      => ['nullable', 'string', 'max:255'],
            'confirmation_subject'          => ['nullable', 'string', 'max:255'],
            'confirmation_message'          => ['nullable', 'string', 'max:5000'],
            'attach_pdf_to_confirmation'    => ['boolean'],

            // Confirmation
            'after_submission_action' => ['required', 'string', 'in:message,redirect'],
            'confirmation_heading'    => ['nullable', 'string', 'max:255'],
            'confirmation_body'       => ['nullable', 'string', 'max:5000'],
            'show_reference_number'   => ['boolean'],
            'allow_pdf_download'      => ['boolean'],
            'show_resubmit_button'    => ['boolean'],
            'redirect_url'            => [
                'nullable',
                'url',
                'max:2048',
                'required_if:after_submission_action,redirect',
            ],
            'redirect_delay_seconds'  => ['integer', 'min:0', 'max:30'],
        ];
    }

    /**
     * Custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'form_name.required'                    => 'The form name is required.',
            'reference_prefix.regex'                => 'The reference prefix may only contain letters, numbers, hyphens, and underscores.',
            'close_at.after'                        => 'The closing date must be after the opening date.',
            'access_password.required_if'           => 'A password is required when password protection is enabled.',
            'redirect_url.required_if'              => 'A redirect URL is required when the after-submission action is set to redirect.',
            'redirect_url.url'                      => 'The redirect URL must be a valid URL (including http:// or https://).',
            'notification_recipients.*.email'       => 'Each notification recipient must be a valid email address.',
            'allowed_roles.*.string'                => 'Each role must be a string value.',
            'allowed_user_ids.*.integer'            => 'Each user ID must be an integer.',
            'redirect_delay_seconds.max'            => 'The redirect delay must be 30 seconds or less.',
            'submission_limit.min'                  => 'The submission limit must be at least 1.',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * Hash the access password if it is present and has changed.
     */
    protected function prepareForValidation(): void
    {
        // Ensure boolean fields are cast properly when coming from JSON.
        $booleanFields = [
            'allow_multiple_submissions',
            'allow_save_resume',
            'password_protected',
            'scheduling_enabled',
            'notify_on_submission',
            'send_participant_confirmation',
            'attach_pdf_to_confirmation',
            'show_reference_number',
            'allow_pdf_download',
            'show_resubmit_button',
        ];

        $merge = [];
        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $merge[$field] = filter_var($this->input($field), FILTER_VALIDATE_BOOLEAN);
            }
        }

        if ($merge) {
            $this->merge($merge);
        }
    }
}
