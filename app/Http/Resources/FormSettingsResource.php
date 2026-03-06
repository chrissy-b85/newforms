<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormSettingsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // General
            'form_name'            => $this->form_name,
            'internal_description' => $this->internal_description,
            'category_id'          => $this->category_id,
            'status'               => $this->status,
            'reference_prefix'     => $this->reference_prefix,
            'submission_limit'     => $this->submission_limit,

            // Access
            'access_type'                => $this->access_type,
            'allowed_roles'              => $this->allowed_roles ?? [],
            'allowed_user_ids'           => $this->allowed_user_ids ?? [],
            'allow_multiple_submissions' => $this->allow_multiple_submissions,
            'allow_save_resume'          => $this->allow_save_resume,
            'password_protected'         => $this->password_protected,
            // access_password is intentionally omitted (hidden on the model)

            // Scheduling
            'scheduling_enabled'  => $this->scheduling_enabled,
            'open_at'             => $this->open_at?->toIso8601String(),
            'close_at'            => $this->close_at?->toIso8601String(),
            'before_open_message' => $this->before_open_message,
            'after_close_message' => $this->after_close_message,

            // Notifications
            'notify_on_submission'          => $this->notify_on_submission,
            'notification_type'             => $this->notification_type,
            'notification_recipients'       => $this->notification_recipients ?? [],
            'notification_subject'          => $this->notification_subject,
            'send_participant_confirmation' => $this->send_participant_confirmation,
            'confirmation_email_field'      => $this->confirmation_email_field,
            'confirmation_subject'          => $this->confirmation_subject,
            'confirmation_message'          => $this->confirmation_message,
            'attach_pdf_to_confirmation'    => $this->attach_pdf_to_confirmation,

            // Confirmation / After-submission
            'after_submission_action' => $this->after_submission_action,
            'confirmation_heading'    => $this->confirmation_heading,
            'confirmation_body'       => $this->confirmation_body,
            'show_reference_number'   => $this->show_reference_number,
            'allow_pdf_download'      => $this->allow_pdf_download,
            'show_resubmit_button'    => $this->show_resubmit_button,
            'redirect_url'            => $this->redirect_url,
            'redirect_delay_seconds'  => $this->redirect_delay_seconds,

            // Lifecycle timestamps (ISO 8601)
            'published_at' => $this->published_at?->toIso8601String(),
            'closed_at'    => $this->closed_at?->toIso8601String(),
            'archived_at'  => $this->archived_at?->toIso8601String(),
            'created_at'   => $this->created_at?->toIso8601String(),
            'updated_at'   => $this->updated_at?->toIso8601String(),

            // Computed fields
            'is_open'           => $this->isOpen(),
            'has_reached_limit' => $this->hasReachedSubmissionLimit(),

            // Relationships
            'category' => $this->whenLoaded('category', fn () => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
        ];
    }
}
