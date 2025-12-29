<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SiteSettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index(): JsonResponse
    {
        $settings = SiteSetting::all()->groupBy('group');
        
        return response()->json([
            'settings' => $settings,
            'flat' => SiteSetting::getAllCached(),
        ]);
    }

    /**
     * Get settings by group
     */
    public function group(string $group): JsonResponse
    {
        $settings = SiteSetting::where('group', $group)->get();
        
        return response()->json([
            'group' => $group,
            'settings' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            SiteSetting::where('key', $setting['key'])
                ->update(['value' => $setting['value']]);
        }

        SiteSetting::clearCache();

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => SiteSetting::getAllCached(),
        ]);
    }

    /**
     * Update a single setting
     */
    public function updateSingle(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'nullable|string',
        ]);

        $setting = SiteSetting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        $setting->update(['value' => $validated['value']]);
        SiteSetting::clearCache();

        return response()->json([
            'message' => 'Setting updated successfully',
            'setting' => $setting,
        ]);
    }
}
