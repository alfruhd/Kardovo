<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Guest List & Attendance Manifest - {{ $event->title }}</title>
    <style>
        @page {
            margin: 28px 24px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 9.5px;
            color: #1e293b;
            line-height: 1.4;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .brand-title {
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: 0.05em;
            margin: 0;
        }
        .brand-subtitle {
            font-size: 8.5px;
            font-weight: 700;
            color: #0284c7;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-top: 2px;
        }
        .event-meta {
            text-align: right;
            font-size: 8.5px;
            color: #64748b;
        }
        .event-meta strong {
            color: #0f172a;
        }

        /* Summary KPI Table */
        .summary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 5px;
            margin-bottom: 12px;
        }
        .summary-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
        }
        .summary-label {
            font-size: 7.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
        }
        .summary-value {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            font-family: 'Courier New', Courier, monospace;
            margin-top: 2px;
        }

        /* Guests Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 5px 6px;
            text-align: left;
        }
        .data-table th.text-center, .data-table td.text-center {
            text-align: center;
        }
        .data-table th.text-right, .data-table td.text-right {
            text-align: right;
        }
        .data-table td {
            padding: 4.5px 6px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 8px;
        }
        .data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        .badge-delivered {
            color: #059669;
            font-weight: 700;
        }
        .badge-failed {
            color: #e11d48;
            font-weight: 700;
        }
        .badge-pending {
            color: #d97706;
            font-weight: 700;
        }

        .footer {
            margin-top: 16px;
            border-top: 1px solid #cbd5e1;
            padding-top: 6px;
            font-size: 7.5px;
            color: #94a3b8;
            text-align: center;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td style="vertical-align: middle;">
                <h1 class="brand-title">KARDOVO</h1>
                <div class="brand-subtitle">Guest Attendance &amp; Admission Manifest</div>
                <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 4px;">{{ $event->title }}</div>
            </td>
            <td class="event-meta" style="vertical-align: middle;">
                <div><strong>Event Date:</strong> {{ $event->event_date ? (is_string($event->event_date) ? date('l, d M Y', strtotime($event->event_date)) : $event->event_date->format('l, d M Y')) : 'N/A' }}</div>
                <div><strong>Venue:</strong> {{ $event->venue ?? 'N/A' }}{{ $event->city ? ', ' . $event->city : '' }}</div>
                <div><strong>Organiser:</strong> {{ $event->user->name ?? ($event->user->company ?? 'Organiser') }}</div>
                <div><strong>Generated Date:</strong> {{ date('Y-m-d H:i:s') }} (EAT)</div>
            </td>
        </tr>
    </table>

    <!-- Summary KPIs -->
    <table class="summary-table">
        <tr>
            <td class="summary-box" style="border-left: 3px solid #0284c7; width: 25%;">
                <div class="summary-label" style="color: #0284c7;">Total Guests</div>
                <div class="summary-value" style="color: #0284c7;">{{ count($guests) }}</div>
            </td>
            <td class="summary-box" style="border-left: 3px solid #059669; width: 25%;">
                <div class="summary-label" style="color: #059669;">Total Entries Allowed</div>
                <div class="summary-value" style="color: #059669;">{{ $guests->sum('max_entries') }}</div>
            </td>
            <td class="summary-box" style="border-left: 3px solid #10b981; width: 25%;">
                <div class="summary-label" style="color: #10b981;">Admitted / Check-ins</div>
                <div class="summary-value" style="color: #10b981;">{{ $guests->sum('entries_used') }}</div>
            </td>
            <td class="summary-box" style="border-left: 3px solid #8b5cf6; width: 25%;">
                <div class="summary-label" style="color: #8b5cf6;">Confirmed RSVP</div>
                <div class="summary-value" style="color: #8b5cf6;">{{ $guests->where('rsvp_status', 'attending')->count() }}</div>
            </td>
        </tr>
    </table>

    <!-- Guests Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">#</th>
                <th style="width: 24%;">Guest Name</th>
                <th style="width: 15%;">Phone Number</th>
                <th style="width: 15%;">Category</th>
                <th style="width: 16%;">Card / Pass #</th>
                <th class="text-center" style="width: 8%;">Max</th>
                <th class="text-center" style="width: 8%;">Used</th>
                <th class="text-center" style="width: 10%;">Delivery</th>
            </tr>
        </thead>
        <tbody>
            @forelse($guests as $idx => $guest)
                <tr>
                    <td>{{ $idx + 1 }}</td>
                    <td><strong>{{ $guest->name }}</strong></td>
                    <td style="font-family: monospace;">{{ $guest->phone }}</td>
                    <td>{{ $guest->category }}</td>
                    <td style="font-family: monospace; font-size: 7.5px;">{{ $guest->card_number ?? $guest->unique_code }}</td>
                    <td class="text-center" style="font-weight: bold;">{{ $guest->max_entries }}</td>
                    <td class="text-center" style="font-weight: bold; color: {{ $guest->entries_used > 0 ? '#059669' : '#64748b' }};">
                        {{ $guest->entries_used }}
                    </td>
                    <td class="text-center {{ $guest->delivery_status === 'delivered' ? 'badge-delivered' : ($guest->delivery_status === 'failed' ? 'badge-failed' : 'badge-pending') }}">
                        {{ strtoupper($guest->delivery_status ?? 'DRAFT') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="padding: 16px; color: #94a3b8;">No attendees registered for this event.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        Confidential Document &bull; Kardovo Access &amp; Event Passes Governance &bull; Total Manifest Count: {{ count($guests) }} Attendees
    </div>

</body>
</html>
