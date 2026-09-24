<?php

namespace App\Notifications;

use App\Models\FinancialBill;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BillReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public FinancialBill $bill) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $dueDate = Carbon::parse($this->bill->due_date)->format('M d, Y');
        $isOverdue = Carbon::parse($this->bill->due_date)->isPast() && ! Carbon::parse($this->bill->due_date)->isToday();
        $urgency = $isOverdue ? 'OVERDUE NOTICE' : 'PAYMENT REMINDER';

        $mail = (new MailMessage)
            ->subject("[{$urgency}] {$this->bill->vendor_name} - {$this->bill->bill_number}")
            ->greeting("Hello {$notifiable->name},")
            ->line('This is an automated alert for the following accounts payable expense:')
            ->line("**Bill Number:** {$this->bill->bill_number}")
            ->line("**Vendor / Creditor:** {$this->bill->vendor_name}")
            ->line("**Description:** {$this->bill->title}")
            ->line('**Amount:** '.number_format($this->bill->amount, 2)." {$this->bill->currency}")
            ->line("**Due Date:** {$dueDate} (".($isOverdue ? 'Overdue' : 'Due Soon').')');

        if ($this->bill->vendor_account_reference) {
            $mail->line("**Payment Account/Reference:** {$this->bill->vendor_account_reference}");
        }

        return $mail->action('View Financial Analysis & Pay', route('admin.finance', ['tab' => 'bills']))
            ->line('Prompt settlement ensures continued service availability without interruption.');
    }
}
