<?php

namespace App\Console\Commands;

use App\Models\FinancialBill;
use App\Models\User;
use App\Notifications\BillReminderNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckBillReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finance:check-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan pending billed expenses and dispatch due-date alerts to administrators';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today();
        $this->info("Scanning billed expenses as of {$today->toDateString()}...");

        // 1. Update overdue status
        $overdueBills = FinancialBill::where('status', 'pending')
            ->whereDate('due_date', '<', $today)
            ->get();

        $overdueCount = $overdueBills->count();
        if ($overdueCount > 0) {
            FinancialBill::where('status', 'pending')
                ->whereDate('due_date', '<', $today)
                ->update(['status' => 'overdue']);

            $this->warn("Updated {$overdueCount} bills to overdue status.");
        }

        // 2. Find bills due soon that need notification
        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            $this->error('No administrators found to receive reminders.');

            return self::FAILURE;
        }

        $billsToRemind = FinancialBill::whereIn('status', ['pending', 'overdue'])
            ->where('reminder_enabled', true)
            ->where(function ($query) use ($today) {
                $query->whereNull('reminded_at')
                    ->orWhereDate('reminded_at', '<', $today);
            })
            ->get()
            ->filter(function (FinancialBill $bill) use ($today) {
                $dueDate = Carbon::parse($bill->due_date);
                $daysDiff = $today->diffInDays($dueDate, false);

                // Remind if overdue or if within reminder_days_before window
                return $daysDiff <= $bill->reminder_days_before;
            });

        $reminderCount = 0;
        foreach ($billsToRemind as $bill) {
            foreach ($admins as $admin) {
                try {
                    $admin->notify(new BillReminderNotification($bill));
                } catch (\Throwable $e) {
                    $this->error("Failed sending reminder for {$bill->bill_number} to {$admin->email}: {$e->getMessage()}");
                }
            }

            $bill->update(['reminded_at' => now()]);
            $reminderCount++;
        }

        $this->info("Successfully processed {$reminderCount} bill reminders.");

        return self::SUCCESS;
    }
}
