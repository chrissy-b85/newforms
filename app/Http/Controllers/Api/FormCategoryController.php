<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormCategory;
use Illuminate\Http\JsonResponse;

class FormCategoryController extends Controller
{
    /**
     * GET /api/form-categories
     *
     * Return all form categories ordered by sort_order, then name.
     */
    public function index(): JsonResponse
    {
        $categories = FormCategory::orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'slug']);

        return response()->json(['data' => $categories]);
    }
}
