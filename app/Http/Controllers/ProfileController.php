<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\PhoneNormalizer;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Organizers cannot set/edit their own dispatch quotas. Only platform admins have this authority.
        if ($request->user()->role !== 'admin') {
            unset($validated['max_whatsapp_limit'], $validated['max_sms_limit'], $validated['max_events_limit']);
        } else {
            if (array_key_exists('max_whatsapp_limit', $validated)) {
                $validated['max_whatsapp_limit'] = ($validated['max_whatsapp_limit'] !== '' && !is_null($validated['max_whatsapp_limit'])) ? (int) $validated['max_whatsapp_limit'] : null;
            }

            if (array_key_exists('max_sms_limit', $validated)) {
                $validated['max_sms_limit'] = ($validated['max_sms_limit'] !== '' && !is_null($validated['max_sms_limit'])) ? (int) $validated['max_sms_limit'] : null;
            }

            if (array_key_exists('max_events_limit', $validated)) {
                $validated['max_events_limit'] = ($validated['max_events_limit'] !== '' && !is_null($validated['max_events_limit'])) ? (int) $validated['max_events_limit'] : null;
            }
        }

        if ($request->hasFile('avatar_file')) {
            $file = $request->file('avatar_file');
            $destination = public_path('avatars');
            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }
            $fileName = 'avatar_' . $request->user()->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($destination, $fileName);
            $validated['avatar'] = '/avatars/' . $fileName;
        } elseif ($request->boolean('remove_avatar')) {
            $validated['avatar'] = null;
        }

        if (!empty($validated['phone'])) {
            $validated['phone'] = PhoneNormalizer::formatDisplay($validated['phone']);
        }

        $request->user()->fill($validated);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
