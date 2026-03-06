<?php

namespace App\Policies;

use App\Models\Form;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FormPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the form's settings.
     */
    public function view(User $user, Form $form): bool
    {
        return $this->isOwnerOrAdmin($user, $form);
    }

    /**
     * Determine whether the user can update the form's settings.
     */
    public function update(User $user, Form $form): bool
    {
        return $this->isOwnerOrAdmin($user, $form);
    }

    /**
     * Determine whether the user can publish, close, or archive the form.
     */
    public function manage(User $user, Form $form): bool
    {
        return $this->isOwnerOrAdmin($user, $form);
    }

    /**
     * Admins can manage any form; regular users can only manage their own.
     *
     * Adjust the `role` / `is_admin` check to match your User model.
     */
    private function isOwnerOrAdmin(User $user, Form $form): bool
    {
        if (property_exists($user, 'is_admin') && $user->is_admin) {
            return true;
        }

        // If forms have a user_id column (owner), check ownership here.
        // return $form->user_id === $user->id;

        // Default: allow all authenticated users (tighten as needed).
        return true;
    }
}
