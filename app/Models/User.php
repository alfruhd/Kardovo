<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

#[Fillable(['name', 'email', 'password', 'two_factor_enabled', 'two_factor_code', 'two_factor_expires_at', 'role', 'permissions', 'status', 'max_events_limit', 'max_whatsapp_limit', 'max_sms_limit', 'suspension_reason', 'phone', 'company', 'avatar', 'gate_label', 'customer_id', 'has_payment_override'])]
#[Hidden(['password', 'remember_token', 'two_factor_code'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
            'two_factor_expires_at' => 'datetime',
            'permissions' => 'array',
            'max_events_limit' => 'integer',
            'max_whatsapp_limit' => 'integer',
            'max_sms_limit' => 'integer',
            'has_payment_override' => 'boolean',
        ];
    }

    /**
     * Generate a 6-digit OTP security code valid for 10 minutes.
     */
    public function generateTwoFactorCode(): string
    {
        $code = sprintf('%06d', random_int(100000, 999999));

        $this->forceFill([
            'two_factor_code' => Hash::make($code),
            'two_factor_expires_at' => now()->addMinutes(10),
        ])->save();

        return $code;
    }

    /**
     * Verify a submitted OTP security code.
     */
    public function verifyTwoFactorCode(string $code): bool
    {
        if (! $this->two_factor_code || ! $this->two_factor_expires_at) {
            return false;
        }

        if (now()->isAfter($this->two_factor_expires_at)) {
            return false;
        }

        return Hash::check($code, $this->two_factor_code);
    }

    /**
     * Clear active OTP code after successful authentication.
     */
    public function clearTwoFactorCode(): void
    {
        $this->forceFill([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ])->save();
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function cardTemplates()
    {
        return $this->hasMany(CardTemplate::class);
    }

    public function scanners()
    {
        return $this->hasMany(User::class, 'customer_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function scans()
    {
        return $this->hasMany(ScanLog::class, 'scanner_id');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isScanner(): bool
    {
        return $this->role === 'scanner';
    }

    public function isSubAdmin(): bool
    {
        return $this->role === 'sub_admin';
    }

    public function assignedOrganizers()
    {
        return $this->belongsToMany(User::class, 'sub_admin_assignments', 'sub_admin_id', 'customer_id');
    }

    public function assignedEvents()
    {
        return $this->belongsToMany(Event::class, 'sub_admin_assignments', 'sub_admin_id', 'event_id');
    }

    public function assignedSubAdmins()
    {
        return $this->belongsToMany(User::class, 'sub_admin_assignments', 'customer_id', 'sub_admin_id');
    }

    public static function defaultPermissions(): array
    {
        return [
            'can_create_events' => true,
            'can_import_guests' => true,
            'can_send_broadcasts' => true,
            'can_customize_templates' => true,
            'can_manage_scanners' => true,
            'can_export_data' => true,
        ];
    }

    public function getEffectivePermissionsAttribute(): array
    {
        $custom = $this->permissions ?? [];
        if (is_string($custom)) {
            $custom = json_decode($custom, true) ?: [];
        }

        return array_merge(self::defaultPermissions(), $custom);
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isAdmin() || $this->isSubAdmin()) {
            return true;
        }

        if (($this->status ?? 'active') === 'suspended') {
            return false;
        }

        $effective = $this->effective_permissions;

        return ! empty($effective[$permission]);
    }

    public function canCreateEvents(): bool
    {
        return $this->hasPermission('can_create_events');
    }

    public function canImportGuests(): bool
    {
        return $this->hasPermission('can_import_guests');
    }

    public function canSendBroadcasts(): bool
    {
        return $this->hasPermission('can_send_broadcasts');
    }

    public function canCustomizeTemplates(): bool
    {
        return $this->hasPermission('can_customize_templates');
    }

    public function canManageScanners(): bool
    {
        return $this->hasPermission('can_manage_scanners');
    }

    public function canExportData(): bool
    {
        return $this->hasPermission('can_export_data');
    }

    public function isActive(): bool
    {
        return ($this->status ?? 'active') === 'active';
    }

    public function whatsappSentCount(): int
    {
        return Message::whereHas('event', function ($q) {
            $q->where('user_id', $this->id);
        })->where('channel', 'whatsapp')->count();
    }

    public function smsSentCount(): int
    {
        return Message::whereHas('event', function ($q) {
            $q->where('user_id', $this->id);
        })->where('channel', 'sms')->count();
    }

    public function canSendWhatsApp(int $quantity = 1): bool
    {
        if (is_null($this->max_whatsapp_limit)) {
            return true;
        }
        $used = $this->whatsappSentCount();

        return ($used + $quantity) <= $this->max_whatsapp_limit;
    }

    public function canSendSms(int $quantity = 1): bool
    {
        if (is_null($this->max_sms_limit)) {
            return true;
        }
        $used = $this->smsSentCount();

        return ($used + $quantity) <= $this->max_sms_limit;
    }

    public function getMessageQuotaStats(): array
    {
        $waUsed = $this->whatsappSentCount();
        $smsUsed = $this->smsSentCount();

        return [
            'whatsapp_limit' => $this->max_whatsapp_limit,
            'whatsapp_used' => $waUsed,
            'whatsapp_remaining' => is_null($this->max_whatsapp_limit) ? null : max(0, $this->max_whatsapp_limit - $waUsed),
            'sms_limit' => $this->max_sms_limit,
            'sms_used' => $smsUsed,
            'sms_remaining' => is_null($this->max_sms_limit) ? null : max(0, $this->max_sms_limit - $smsUsed),
        ];
    }
}
