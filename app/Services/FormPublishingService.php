<?php

namespace App\Services;

use App\Models\Form;

class FormPublishingService
{
    /**
     * Validate a form and return whether it is ready to be published.
     *
     * @return array{valid: bool, errors: array<int, array{field: string, message: string, tab: string}>}
     */
    public function validateForPublishing(Form $form): array
    {
        $errors = [];

        // --- General tab ---
        if (empty($form->form_name)) {
            $errors[] = [
                'field'   => 'form_name',
                'message' => 'Form name is required before publishing.',
                'tab'     => 'general',
            ];
        }

        // At least one field must exist
        if ($form->fields()->count() === 0) {
            $errors[] = [
                'field'   => 'fields',
                'message' => 'The form must have at least one field before publishing.',
                'tab'     => 'general',
            ];
        }

        // --- Access tab ---
        if ($form->access_type === 'role_based') {
            $roles = $form->allowed_roles ?? [];
            if (empty($roles)) {
                $errors[] = [
                    'field'   => 'allowed_roles',
                    'message' => 'At least one role must be selected for role-based access.',
                    'tab'     => 'access',
                ];
            }
        }

        if ($form->access_type === 'specific_users') {
            $ids = $form->allowed_user_ids ?? [];
            if (empty($ids)) {
                $errors[] = [
                    'field'   => 'allowed_user_ids',
                    'message' => 'At least one user ID must be specified for restricted access.',
                    'tab'     => 'access',
                ];
            }
        }

        // --- Scheduling tab ---
        if ($form->scheduling_enabled) {
            if ($form->open_at && $form->close_at && $form->close_at->lte($form->open_at)) {
                $errors[] = [
                    'field'   => 'close_at',
                    'message' => 'The closing date/time must be after the opening date/time.',
                    'tab'     => 'scheduling',
                ];
            }
        }

        // --- Notifications tab ---
        if ($form->notify_on_submission) {
            if ($form->notification_type === 'specific_people') {
                $recipients = $form->notification_recipients ?? [];
                if (empty($recipients)) {
                    $errors[] = [
                        'field'   => 'notification_recipients',
                        'message' => 'At least one notification recipient is required.',
                        'tab'     => 'notifications',
                    ];
                }
            }
        }

        // --- Confirmation tab ---
        if ($form->after_submission_action === 'redirect') {
            if (empty($form->redirect_url)) {
                $errors[] = [
                    'field'   => 'redirect_url',
                    'message' => 'A redirect URL is required when the after-submission action is set to redirect.',
                    'tab'     => 'confirmation',
                ];
            } elseif (!filter_var($form->redirect_url, FILTER_VALIDATE_URL)) {
                $errors[] = [
                    'field'   => 'redirect_url',
                    'message' => 'The redirect URL must be a valid URL.',
                    'tab'     => 'confirmation',
                ];
            }
        }

        return [
            'valid'  => empty($errors),
            'errors' => $errors,
        ];
    }
}
