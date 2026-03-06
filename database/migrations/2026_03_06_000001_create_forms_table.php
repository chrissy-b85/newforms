<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('forms', function (Blueprint $table) {
            $table->id();

            // General
            $table->string('form_name');
            $table->text('internal_description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('form_categories')->nullOnDelete();
            $table->string('status')->default('draft'); // draft, active, closed, archived
            $table->string('reference_prefix', 20)->nullable();
            $table->unsignedInteger('submission_limit')->nullable();

            // Access
            $table->string('access_type')->default('public'); // public, authenticated, role_based, specific_users
            $table->json('allowed_roles')->nullable();
            $table->json('allowed_user_ids')->nullable();
            $table->boolean('allow_multiple_submissions')->default(true);
            $table->boolean('allow_save_resume')->default(false);
            $table->boolean('password_protected')->default(false);
            $table->string('access_password')->nullable();

            // Scheduling
            $table->boolean('scheduling_enabled')->default(false);
            $table->timestamp('open_at')->nullable();
            $table->timestamp('close_at')->nullable();
            $table->text('before_open_message')->nullable();
            $table->text('after_close_message')->nullable();

            // Notifications
            $table->boolean('notify_on_submission')->default(false);
            $table->string('notification_type')->nullable(); // all_admins, specific_people, role_based
            $table->json('notification_recipients')->nullable();
            $table->string('notification_subject')->nullable();
            $table->boolean('send_participant_confirmation')->default(false);
            $table->string('confirmation_email_field')->nullable();
            $table->string('confirmation_subject')->nullable();
            $table->text('confirmation_message')->nullable();
            $table->boolean('attach_pdf_to_confirmation')->default(false);

            // Confirmation / After submission
            $table->string('after_submission_action')->default('message'); // message, redirect
            $table->string('confirmation_heading')->nullable();
            $table->text('confirmation_body')->nullable();
            $table->boolean('show_reference_number')->default(false);
            $table->boolean('allow_pdf_download')->default(false);
            $table->boolean('show_resubmit_button')->default(false);
            $table->string('redirect_url')->nullable();
            $table->unsignedInteger('redirect_delay_seconds')->default(0);

            // Lifecycle timestamps
            $table->timestamp('published_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamp('archived_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status');
            $table->index('category_id');
            $table->index('open_at');
            $table->index('close_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forms');
    }
};
