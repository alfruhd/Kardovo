<?php

namespace App\Http\Controllers;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Guest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardTemplateController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Enforce template customization permission for organizers
        if ($user && ! $user->isAdmin() && ! $user->isSubAdmin() && ! $user->isScanner()) {
            if (! $user->canCustomizeTemplates() || $user->status === 'suspended') {
                return redirect()->route('dashboard')->with('error', 'Access Restricted: Your organizer account is not permitted to customize card templates. Contact platform administration.');
            }
        }

        $templatesQuery = CardTemplate::query();
        if ($user && $user->isAdmin()) {
            // System Administrator only sees global master templates and admin templates (no customer private templates)
            $templatesQuery->where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            });
        } elseif ($user) {
            // Customer sees global master templates + their own personalized templates
            $templatesQuery->where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            });
        } else {
            $templatesQuery->whereNull('user_id');
        }

        $templates = $templatesQuery
            ->orderByRaw("CASE WHEN template_type = 'gradient_card' THEN 0 ELSE 1 END, id ASC")
            ->get();

        if ($user && $user->isAdmin()) {
            $events = Event::with('user')->get();
        } elseif ($user) {
            $events = Event::where('user_id', $user->id)->get();
        } else {
            $events = Event::all();
        }

        $selectedTemplate = null;
        if ($request->filled('template_id')) {
            $selectedTemplate = $templates->firstWhere('id', (int) $request->template_id);
        }
        if (! $selectedTemplate) {
            $selectedTemplate = $templates->first();
        }

        $sampleEvent = $events->first();
        $sampleGuest = $sampleEvent ? $sampleEvent->guests()->first() : null;

        return Inertia::render('Customer/CardTemplates', [
            'templates' => $templates,
            'selectedTemplate' => $selectedTemplate,
            'events' => $events,
            'sampleEvent' => $sampleEvent,
            'sampleGuest' => $sampleGuest,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if (! $user->isAdmin() && ! $user->canCustomizeTemplates()) {
            return back()->with('error', 'Card template studio & customization permissions are disabled for your organizer account. Please contact system administration.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'template_type' => 'required|in:custom_art,gradient_card',
            'image_path' => 'nullable|string',
            'headline' => 'nullable|string|max:255',
            'brand_color_from' => 'nullable|string|max:50',
            'brand_color_to' => 'nullable|string|max:50',
            'font_family' => 'nullable|string|max:100',
            'show_qr' => 'boolean',
            'show_category_badge' => 'boolean',
            'show_unique_code' => 'boolean',
            'footer_text' => 'nullable|string|max:255',
            'elements_config' => 'nullable|array',
            'image_file' => 'nullable|file|mimes:jpeg,png,jpg,webp,svg,gif,bmp,avif|max:20480', // 20MB max
        ]);

        if ($request->hasFile('image_file')) {
            $assetsDir = public_path('template_assets');
            if (! file_exists($assetsDir)) {
                mkdir($assetsDir, 0755, true);
            }
            $file = $request->file('image_file');
            $extension = $file->getClientOriginalExtension() ?: 'png';
            $fileName = 'custom_tpl_'.time().'_'.uniqid().'.'.$extension;
            $destinationPath = $assetsDir.'/'.$fileName;
            $file->move($assetsDir, $fileName);
            $validated['image_path'] = '/template_assets/'.$fileName;
            $validated['template_type'] = 'custom_art';

            // Auto-detect dimensions & aspect ratio
            $elementsConfig = $validated['elements_config'] ?? [];
            $imageInfo = @getimagesize($destinationPath);
            if ($imageInfo && $imageInfo[0] > 0 && $imageInfo[1] > 0) {
                $w = $imageInfo[0];
                $h = $imageInfo[1];
                $ratio = round($w / $h, 4);
                $elementsConfig['image_width'] = $w;
                $elementsConfig['image_height'] = $h;
                $elementsConfig['aspect_ratio'] = (string) $ratio;
                $elementsConfig['orientation'] = $w > $h ? 'landscape' : ($w === $h ? 'square' : 'portrait');
            }
            $validated['elements_config'] = $elementsConfig;
        }

        $validated['user_id'] = $user->id;
        $validated['headline'] = $validated['headline'] ?? "YOU'RE INVITED";
        $validated['brand_color_from'] = $validated['brand_color_from'] ?? '#1144A0';
        $validated['brand_color_to'] = $validated['brand_color_to'] ?? '#117534';
        $validated['font_family'] = $validated['font_family'] ?? 'Inter';
        $validated['footer_text'] = $validated['footer_text'] ?? 'Generated & secured by KARDOVO';

        $template = CardTemplate::create($validated);

        return redirect()->route('templates.index', ['template_id' => $template->id])
            ->with('success', "Custom artwork '{$template->name}' imported and created successfully!");
    }

    public function update(Request $request, CardTemplate $cardTemplate)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        // If this is another user's personal template, forbid
        if ($cardTemplate->user_id && $cardTemplate->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403, 'Unauthorized to modify this template.');
        }

        if (! $user->isAdmin() && ! $user->canCustomizeTemplates()) {
            return back()->with('error', 'Card template studio & customization permissions are disabled for your organizer account. Please contact system administration.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'template_type' => 'required|in:custom_art,gradient_card',
            'image_path' => 'nullable|string',
            'headline' => 'nullable|string|max:255',
            'brand_color_from' => 'nullable|string|max:50',
            'brand_color_to' => 'nullable|string|max:50',
            'font_family' => 'nullable|string|max:100',
            'show_qr' => 'boolean',
            'show_category_badge' => 'boolean',
            'show_unique_code' => 'boolean',
            'footer_text' => 'nullable|string|max:255',
            'elements_config' => 'nullable|array',
            'image_file' => 'nullable|file|mimes:jpeg,png,jpg,webp,svg,gif,bmp,avif|max:20480',
        ]);

        if ($request->hasFile('image_file')) {
            $assetsDir = public_path('template_assets');
            if (! file_exists($assetsDir)) {
                mkdir($assetsDir, 0755, true);
            }
            $file = $request->file('image_file');
            $extension = $file->getClientOriginalExtension() ?: 'png';
            $fileName = 'custom_tpl_'.time().'_'.uniqid().'.'.$extension;
            $destinationPath = $assetsDir.'/'.$fileName;
            $file->move($assetsDir, $fileName);
            $validated['image_path'] = '/template_assets/'.$fileName;
            if (($validated['template_type'] ?? '') !== 'gradient_card') {
                $validated['template_type'] = 'custom_art';
            }

            // Auto-detect dimensions & aspect ratio
            $elementsConfig = $validated['elements_config'] ?? ($cardTemplate->elements_config ?? []);
            $imageInfo = @getimagesize($destinationPath);
            if ($imageInfo && $imageInfo[0] > 0 && $imageInfo[1] > 0) {
                $w = $imageInfo[0];
                $h = $imageInfo[1];
                $ratio = round($w / $h, 4);
                $elementsConfig['image_width'] = $w;
                $elementsConfig['image_height'] = $h;
                $elementsConfig['aspect_ratio'] = (string) $ratio;
                $elementsConfig['orientation'] = $w > $h ? 'landscape' : ($w === $h ? 'square' : 'portrait');
            }
            $validated['elements_config'] = $elementsConfig;
        }

        // Security rule: If this is a global administrator template (user_id === null) and the current user is NOT admin:
        // Do NOT overwrite the system administrator master template! Instead, fork into a customer personal copy.
        if (is_null($cardTemplate->user_id) && ! $user->isAdmin()) {
            $validated['user_id'] = $user->id;
            $customerCopy = CardTemplate::create($validated);

            return back()->with('success', "Saved as your customized template: '{$customerCopy->name}'. System master template remains protected.");
        }

        // System Administrator editing global template, or Customer editing their own template
        $cardTemplate->update($validated);

        return back()->with('success', "Card template '{$cardTemplate->name}' updated successfully.");
    }

    public function destroy(Request $request, CardTemplate $cardTemplate)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        // Only admin can delete global system templates (user_id === null)
        if (is_null($cardTemplate->user_id) && ! $user->isAdmin()) {
            abort(403, 'Only System Administrators can delete default system templates.');
        }

        if ($cardTemplate->user_id && $cardTemplate->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403, 'Unauthorized to delete this card template.');
        }

        // Reassign any events currently using this template to the first available template
        $fallbackTemplate = CardTemplate::where('id', '!=', $cardTemplate->id)->first();
        if ($fallbackTemplate) {
            Event::where('card_template_id', $cardTemplate->id)
                ->update(['card_template_id' => $fallbackTemplate->id]);
        }

        $templateName = $cardTemplate->name;
        $cardTemplate->delete();

        return back()->with('success', "Card template '{$templateName}' was deleted successfully.");
    }

    public function guestCard(Request $request, Guest $guest)
    {
        $guest->load(['event.cardTemplate', 'event.user']);

        return Inertia::render('Customer/GuestCardView', [
            'guest' => $guest,
            'event' => $guest->event,
            'template' => $guest->event->cardTemplate,
        ]);
    }
}
