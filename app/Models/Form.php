<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Hash;

class Form extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // General
        'form_name',
        'internal_description',
        'category_id',
        'status',
        'reference_prefix',
        'submission_limit',
        // Access
        'access_type',
        'allowed_roles',
        'allowed_user_ids',
        'allow_multiple_submissions',
        'allow_save_resume',
        'password_protected',
        'access_password',
        // Scheduling
        'scheduling_enabled',
        'open_at',
        'close_at',
        'before_open_message',
        'after_close_message',
        // Notifications
        'notify_on_submission',
        'notification_type',
        'notification_recipients',
        'notification_subject',
        'send_participant_confirmation',
        'confirmation_email_field',
        'confirmation_subject',
        'confirmation_message',
        'attach_pdf_to_confirmation',
        // Confirmation
        'after_submission_action',
        'confirmation_heading',
        'confirmation_body',
        'show_reference_number',
        'allow_pdf_download',
        'show_resubmit_button',
        'redirect_url',
        'redirect_delay_seconds',
        // Lifecycle
        'published_at',
        'closed_at',
        'archived_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'access_password',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // JSON arrays
        'allowed_roles'             => 'array',
        'allowed_user_ids'          => 'array',
        'notification_recipients'   => 'array',
        // Booleans
        'allow_multiple_submissions'    => 'boolean',
        'allow_save_resume'             => 'boolean',
        'password_protected'            => 'boolean',
        'scheduling_enabled'            => 'boolean',
        'notify_on_submission'          => 'boolean',
        'send_participant_confirmation' => 'boolean',
        'attach_pdf_to_confirmation'    => 'boolean',
        'show_reference_number'         => 'boolean',
        'allow_pdf_download'            => 'boolean',
        'show_resubmit_button'          => 'boolean',
        // Integers
        'category_id'             => 'integer',
        'submission_limit'        => 'integer',
        'redirect_delay_seconds'  => 'integer',
        // Dates
        'open_at'       => 'datetime',
        'close_at'      => 'datetime',
        'published_at'  => 'datetime',
        'closed_at'     => 'datetime',
        'archived_at'   => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The category this form belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(FormCategory::class, 'category_id');
    }

    /**
     * The fields belonging to this form.
     */
    public function fields(): HasMany
    {
        return $this->hasMany(\App\Models\FormField::class);
    }

    /**
     * The submissions for this form.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(\App\Models\FormSubmission::class);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    /**
     * Scope: only active (published) forms.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: publicly accessible forms.
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('access_type', 'public');
    }

    /**
     * Scope: forms that are within their scheduled window (or have no schedule).
     */
    public function scopeScheduled(Builder $query): Builder
    {
        $now = now();

        return $query->where(function (Builder $q) use ($now) {
            $q->where('scheduling_enabled', false)
              ->orWhere(function (Builder $inner) use ($now) {
                  $inner->where('scheduling_enabled', true)
                        ->where(function (Builder $dates) use ($now) {
                            $dates->whereNull('open_at')->orWhere('open_at', '<=', $now);
                        })
                        ->where(function (Builder $dates) use ($now) {
                            $dates->whereNull('close_at')->orWhere('close_at', '>=', $now);
                        });
              });
        });
    }

    // -------------------------------------------------------------------------
    // Helper methods
    // -------------------------------------------------------------------------

    /**
     * Determine whether the form is currently accepting submissions.
     */
    public function isOpen(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->scheduling_enabled) {
            $now = now();

            if ($this->open_at && $now->lt($this->open_at)) {
                return false;
            }

            if ($this->close_at && $now->gt($this->close_at)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check whether the submission limit has been reached.
     */
    public function hasReachedSubmissionLimit(): bool
    {
        if ($this->submission_limit === null) {
            return false;
        }

        return $this->submissions()->count() >= $this->submission_limit;
    }

    /**
     * Determine whether the given user can access this form.
     *
     * @param  \App\Models\User|null  $user
     */
    public function canUserAccess($user): bool
    {
        switch ($this->access_type) {
            case 'public':
                return true;

            case 'authenticated':
                return $user !== null;

            case 'role_based':
                if ($user === null) {
                    return false;
                }
                $roles = $this->allowed_roles ?? [];
                return method_exists($user, 'hasAnyRole')
                    ? $user->hasAnyRole($roles)
                    : in_array($user->role ?? null, $roles, true);

            case 'specific_users':
                if ($user === null) {
                    return false;
                }
                $ids = $this->allowed_user_ids ?? [];
                return in_array($user->id, $ids, true);
        }

        return false;
    }

    /**
     * Verify the provided plain-text password against the stored hash.
     */
    public function verifyPassword(string $password): bool
    {
        if (!$this->password_protected || $this->access_password === null) {
            return true;
        }

        return Hash::check($password, $this->access_password);
    }
}
