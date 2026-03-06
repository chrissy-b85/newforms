<?php

use App\Http\Controllers\Api\FormCategoryController;
use App\Http\Controllers\Api\FormSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// Form categories (read-only; used to populate category dropdowns)
Route::middleware('auth:sanctum')->get('form-categories', [FormCategoryController::class, 'index']);

// Form settings management — requires authentication
Route::middleware('auth:sanctum')->prefix('forms/{form}')->group(function () {
    Route::get('settings', [FormSettingsController::class, 'show']);
    Route::patch('settings', [FormSettingsController::class, 'update']);
    Route::post('publish', [FormSettingsController::class, 'publish']);
    Route::post('close', [FormSettingsController::class, 'close']);
    Route::post('archive', [FormSettingsController::class, 'archive']);
});
