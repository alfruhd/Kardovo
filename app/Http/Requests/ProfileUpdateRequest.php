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
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string'],
            'avatar_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif,svg', 'max:5120'],
            'two_factor_enabled' => ['nullable', 'boolean'],
            'max_whatsapp_limit' => ['nullable', 'integer', 'min:0'],
            'max_sms_limit' => ['nullable', 'integer', 'min:0'],
            'max_events_limit' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
