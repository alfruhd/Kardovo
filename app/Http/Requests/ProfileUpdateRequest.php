<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,20}$/'],
            'company' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string'],
            'avatar_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:5120'],
            'two_factor_enabled' => ['nullable', 'boolean'],
            'max_whatsapp_limit' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'max_sms_limit' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'max_events_limit' => ['nullable', 'integer', 'min:1', 'max:10000'],
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Your full name is required.',
            'name.min' => 'Full name must be at least 2 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered to another account.',
            'phone.regex' => 'Please provide a valid international or local phone number (e.g. +255 712 345 678).',
            'avatar_file.image' => 'The uploaded file must be a valid image.',
            'avatar_file.mimes' => 'Profile image must be in JPG, PNG, WEBP, or SVG format.',
            'avatar_file.max' => 'Profile image cannot exceed 5MB in size.',
            'max_whatsapp_limit.min' => 'WhatsApp quota cannot be negative.',
            'max_sms_limit.min' => 'SMS quota cannot be negative.',
            'max_events_limit.min' => 'Event quota must be at least 1.',
        ];
    }
}
