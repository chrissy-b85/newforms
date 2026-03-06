<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateFormSettingsRequest;
use App\Http\Resources\FormSettingsResource;
use App\Models\Form;
use App\Services\FormPublishingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class FormSettingsController extends Controller
{
    public function __construct(
        private readonly FormPublishingService $publishingService,
    ) {}

    /**
     * GET /api/forms/{form}/settings
     *
     * Return the settings for the given form.
     */
    public function show(Form $form): FormSettingsResource
    {
        $form->load('category');

        return new FormSettingsResource($form);
    }

    /**
     * PATCH /api/forms/{form}/settings
     *
     * Update form settings.
     */
    public function update(UpdateFormSettingsRequest $request, Form $form): JsonResponse
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();

            // Hash the access password if it was supplied (and is non-empty).
            if (!empty($data['access_password'])) {
                $data['access_password'] = Hash::make($data['access_password']);
            } else {
                // Do not wipe an existing password when the field is absent / empty.
                unset($data['access_password']);
            }

            $form->update($data);

            DB::commit();

            Log::info('Form settings updated', [
                'form_id' => $form->id,
                'user_id' => optional(auth()->user())->id,
            ]);

            $form->load('category');

            return response()->json([
                'message' => 'Settings saved successfully.',
                'data'    => new FormSettingsResource($form),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Failed to update form settings', [
                'form_id' => $form->id,
                'error'   => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'An error occurred while saving the settings.',
            ], 500);
        }
    }

    /**
     * POST /api/forms/{form}/publish
     *
     * Publish the form after validating it meets all requirements.
     */
    public function publish(Form $form): JsonResponse
    {
        try {
            $result = $this->publishingService->validateForPublishing($form);

            if (!$result['valid']) {
                return response()->json([
                    'message' => 'The form is not ready to be published.',
                    'errors'  => $result['errors'],
                ], 422);
            }

            DB::beginTransaction();

            $form->update([
                'status'       => 'active',
                'published_at' => now(),
            ]);

            DB::commit();

            Log::info('Form published', [
                'form_id' => $form->id,
                'user_id' => optional(auth()->user())->id,
            ]);

            return response()->json([
                'message' => 'Form published successfully.',
                'data'    => new FormSettingsResource($form),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Failed to publish form', [
                'form_id' => $form->id,
                'error'   => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'An error occurred while publishing the form.',
            ], 500);
        }
    }

    /**
     * POST /api/forms/{form}/close
     *
     * Close the form so it no longer accepts submissions.
     */
    public function close(Form $form): JsonResponse
    {
        try {
            DB::beginTransaction();

            $form->update([
                'status'    => 'closed',
                'closed_at' => now(),
            ]);

            DB::commit();

            Log::info('Form closed', [
                'form_id' => $form->id,
                'user_id' => optional(auth()->user())->id,
            ]);

            return response()->json([
                'message' => 'Form closed successfully.',
                'data'    => new FormSettingsResource($form),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Failed to close form', [
                'form_id' => $form->id,
                'error'   => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'An error occurred while closing the form.',
            ], 500);
        }
    }

    /**
     * POST /api/forms/{form}/archive
     *
     * Archive the form.
     */
    public function archive(Form $form): JsonResponse
    {
        try {
            DB::beginTransaction();

            $form->update([
                'status'      => 'archived',
                'archived_at' => now(),
            ]);

            DB::commit();

            Log::info('Form archived', [
                'form_id' => $form->id,
                'user_id' => optional(auth()->user())->id,
            ]);

            return response()->json([
                'message' => 'Form archived successfully.',
                'data'    => new FormSettingsResource($form),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Failed to archive form', [
                'form_id' => $form->id,
                'error'   => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'An error occurred while archiving the form.',
            ], 500);
        }
    }
}
