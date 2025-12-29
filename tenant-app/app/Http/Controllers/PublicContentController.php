<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\NewsItem;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

final class PublicContentController extends Controller
{
    /**
     * Get all site settings for public display
     */
    public function settings(): JsonResponse
    {
        return response()->json([
            'settings' => SiteSetting::getAllCached(),
        ]);
    }

    /**
     * Get published news items
     */
    public function news(): JsonResponse
    {
        $news = NewsItem::published()
            ->ordered()
            ->get(['id', 'title', 'summary', 'badge', 'badge_color', 'published_at']);

        return response()->json(['news' => $news]);
    }

    /**
     * Get a single news item
     */
    public function newsItem(int $id): JsonResponse
    {
        $news = NewsItem::published()->find($id);

        if (!$news) {
            return response()->json(['message' => 'News not found'], 404);
        }

        return response()->json(['news' => $news]);
    }
}
