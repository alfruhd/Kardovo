<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordCodeNotification extends BaseResetPassword
{
    use Queueable;

    public string $code;

    /**
     * Create a notification instance with the 6-digit reset code.
     */
    public function __construct(string $code)
    {
        parent::__construct($code);
        $this->code = $code;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kardovo Security: Your Password Reset Code is '.$this->code)
            ->view('emails.password_reset_code', [
                'userName' => $notifiable->name ?? 'there',
                'code' => $this->code,
            ]);
    }
}
