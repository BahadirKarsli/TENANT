<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class NewsController extends Controller
{
    /**
     * List all news items (admin)
     */
    public function index(): JsonResponse
    {
        $news = NewsItem::orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get();
        
        return response()->json(['news' => $news]);
    }

    /**
     * Create a news item
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:500',
            'content' => 'nullable|string',
            'image_url' => 'nullable|url',
            'badge' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|in:blue,green,red,yellow',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        $news = NewsItem::create($validated);

        return response()->json([
            'message' => 'News item created successfully',
            'news' => $news,
        ], 201);
    }

    /**
     * Get a single news item
     */
    public function show(NewsItem $news): JsonResponse
    {
        return response()->json(['news' => $news]);
    }

    /**
     * Update a news item
     */
    public function update(Request $request, NewsItem $news): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'summary' => 'nullable|string|max:500',
            'content' => 'nullable|string',
            'image_url' => 'nullable|url',
            'badge' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|in:blue,green,red,yellow',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ]);

        // Set published_at when publishing for the first time
        if (($validated['is_published'] ?? false) && !$news->is_published) {
            $validated['published_at'] = now();
        }

        $news->update($validated);

        return response()->json([
            'message' => 'News item updated successfully',
            'news' => $news,
        ]);
    }

    /**
     * Delete a news item
     */
    public function destroy(NewsItem $news): JsonResponse
    {
        $news->delete();

        return response()->json([
            'message' => 'News item deleted successfully',
        ]);
    }

    /**
     * Toggle publish status
     */
    public function togglePublish(NewsItem $news): JsonResponse
    {
        $news->is_published = !$news->is_published;
        
        if ($news->is_published && !$news->published_at) {
            $news->published_at = now();
        }
        
        $news->save();

        return response()->json([
            'message' => $news->is_published ? 'News published' : 'News unpublished',
            'news' => $news,
        ]);
    }
}
