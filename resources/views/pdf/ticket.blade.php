<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Ticket - {{ $ticket->ticket_number }}</title>
    <style>
        @page {
            margin: 8mm;
            size: a5 landscape;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F8FAFC;
            color: #FFFFFF;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        .ticket-card {
            width: 100%;
            background: #0F172A;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #1E293B;
        }
        .top-accent {
            height: 5px;
            background: {{ $tier->color ?? ($event->ticket_template_config['accent_color'] ?? '#10B981') }};
        }
        .ticket-layout {
            width: 100%;
            border-collapse: collapse;
        }
        .main-section {
            padding: 20px 24px;
            vertical-align: top;
            width: 67%;
        }
        .divider-col {
            width: 22px;
            vertical-align: middle;
            text-align: center;
            border-left: 2px dashed #334155;
            position: relative;
        }
        .stub-section {
            padding: 18px 20px;
            vertical-align: top;
            width: 33%;
            background: #0B1324;
            text-align: center;
            border-left: 1px solid #1E293B;
        }
        .badge-official {
            display: inline-block;
            color: {{ $tier->color ?? ($event->ticket_template_config['accent_color'] ?? '#10B981') }};
            border: 1px solid {{ $tier->color ?? ($event->ticket_template_config['accent_color'] ?? '#10B981') }};
            background: rgba(16, 185, 129, 0.12);
            font-weight: 800;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 2px 8px;
            border-radius: 9999px;
        }
        .badge-status {
            display: inline-block;
            background: rgba(16, 185, 129, 0.2);
            color: #34D399;
            border: 1px solid rgba(16, 185, 129, 0.4);
            font-weight: 800;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 2px 8px;
            border-radius: 9999px;
            float: right;
        }
        .event-title {
            font-size: 20px;
            font-weight: 900;
            color: #FFFFFF;
            margin: 8px 0 10px 0;
            line-height: 1.2;
            letter-spacing: -0.3px;
        }
        .tier-pill {
            display: inline-block;
            background: {{ $tier->color ?? ($event->ticket_template_config['accent_color'] ?? '#10B981') }};
            color: #0F172A;
            font-weight: 900;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 2px 8px;
            border-radius: 9999px;
            margin-right: 6px;
        }
        .ticket-code-sub {
            font-family: monospace;
            font-size: 11px;
            color: #94A3B8;
            font-weight: bold;
        }
        .grid-table {
            width: 100%;
            border-collapse: collapse;
            background: #1E293B;
            border-radius: 12px;
            margin-top: 10px;
        }
        .grid-table td {
            padding: 8px 12px;
            vertical-align: top;
            width: 25%;
        }
        .grid-label {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #94A3B8;
            font-weight: 700;
            margin-bottom: 2px;
        }
        .grid-val {
            font-size: 12px;
            font-weight: 800;
            color: #FFFFFF;
            white-space: nowrap;
            overflow: hidden;
        }
        .meta-boxes {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin-top: 8px;
            margin-left: -8px;
        }
        .meta-box-td {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 10px;
            padding: 8px 12px;
            width: 50%;
        }
        .meta-box-title {
            font-size: 11px;
            font-weight: 800;
            color: #FFFFFF;
        }
        .meta-box-desc {
            font-size: 10px;
            color: #94A3B8;
            margin-top: 2px;
        }
        .footer-notice {
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            font-size: 9px;
            color: #64748B;
        }
        .qr-box {
            background: #FFFFFF;
            padding: 8px;
            border-radius: 12px;
            display: inline-block;
            margin: 8px auto 4px auto;
        }
        .qr-image {
            width: 120px;
            height: 120px;
            display: block;
            margin: 0 auto;
        }
        .unique-code {
            font-family: monospace;
            font-size: 11px;
            font-weight: 900;
            color: #0F172A;
            letter-spacing: 1.5px;
            margin-top: 4px;
        }
        .stub-title {
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748B;
            font-family: monospace;
        }
        .stub-attendee {
            font-size: 12px;
            font-weight: 800;
            color: #FFFFFF;
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px;
            margin-left: auto;
            margin-right: auto;
        }
        .stub-code {
            font-family: monospace;
            font-size: 10px;
            font-weight: 800;
            color: {{ $tier->color ?? ($event->ticket_template_config['accent_color'] ?? '#10B981') }};
        }
        .barcode-graphic {
            margin-top: 6px;
            letter-spacing: -1px;
            font-family: monospace;
            font-size: 13px;
            font-weight: bold;
            color: #FFFFFF;
        }
        .barcode-sub {
            font-size: 7.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748B;
            font-family: monospace;
            margin-top: 2px;
        }
        .stub-vertical-text {
            font-size: 8px;
            font-family: monospace;
            font-weight: 800;
            color: #64748B;
            letter-spacing: 2px;
        }
    </style>
</head>
<body>
    <div class="ticket-card">
        <div class="top-accent"></div>
        <table class="ticket-layout">
            <tr>
                <!-- Main Pass Body -->
                <td class="main-section">
                    <div>
                        <span class="badge-official">
                            {{ $event->ticket_template_config['badge_text'] ?? 'OFFICIAL PASS' }}
                        </span>
                        @if($event->event_type)
                            <span style="font-size: 9px; font-weight: 700; color: #94A3B8; text-transform: uppercase; margin-left: 5px;">
                                • {{ $event->event_type }}
                            </span>
                        @endif

                        <span class="badge-status">
                            {{ $ticket->status === 'checked_in' ? 'ADMITTED' : 'VALID PASS' }}
                        </span>
                    </div>

                    <div style="margin-top: 8px;">
                        <span class="tier-pill">{{ $tier->name }}</span>
                        <span class="ticket-code-sub">#{{ $ticket->ticket_number }}</span>
                    </div>

                    <h1 class="event-title">{{ $event->title }}</h1>

                    <!-- 4-Grid Key Details -->
                    <table class="grid-table">
                        <tr>
                            <td>
                                <div class="grid-label">PASS HOLDER</div>
                                <div class="grid-val">{{ $ticket->attendee_name }}</div>
                            </td>
                            <td>
                                <div class="grid-label">TICKET CODE</div>
                                <div class="grid-val" style="color: {{ $tier->color ?? '#10B981' }}; font-family: monospace;">
                                    #{{ $ticket->ticket_number }}
                                </div>
                            </td>
                            <td>
                                <div class="grid-label">GATE / DOOR</div>
                                <div class="grid-val">{{ $ticket->gate_label ?? 'Main Gate' }}</div>
                            </td>
                            <td>
                                <div class="grid-label">PRICE PAID</div>
                                <div class="grid-val" style="color: #34D399; font-family: monospace;">
                                    {{ $ticket->formatted_price }}
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Date & Venue Split Boxes -->
                    <table class="meta-boxes">
                        <tr>
                            <td class="meta-box-td">
                                <div class="meta-box-title">{{ $event->event_date?->format('l, d F Y') }}</div>
                                <div class="meta-box-desc">{{ $event->event_time ?? 'Doors open early' }}</div>
                            </td>
                            <td class="meta-box-td">
                                <div class="meta-box-title">{{ $event->venue }}</div>
                                <div class="meta-box-desc">{{ $event->city }}</div>
                            </td>
                        </tr>
                    </table>

                    <!-- Security Note -->
                    <div class="footer-notice">
                        <table style="width: 100%;">
                            <tr>
                                <td style="color: #64748B; font-size: 8.5px;">
                                    {{ $event->ticket_instructions ?? ($event->ticket_template_config['custom_instructions'] ?? 'Present this pass at the gate for live digital scan. Valid for single admission.') }}
                                </td>
                                <td style="text-align: right; color: #475569; font-family: monospace; font-size: 8px; font-weight: bold; width: 100px;">
                                    HASH: {{ strtoupper(substr($ticket->qr_token, 0, 8)) }}
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>

                <!-- Perforated Divider Column -->
                <td class="divider-col">
                    <span class="stub-vertical-text">STUB</span>
                </td>

                <!-- Scannable Gate Stub -->
                <td class="stub-section">
                    <div class="stub-title">VERIFIED GATE SCAN</div>
                    <div class="stub-attendee">{{ $ticket->attendee_name }}</div>
                    <div class="stub-code">#{{ $ticket->ticket_number }}</div>

                    <div class="qr-box">
                        <img src="{{ $qrDataUri }}" class="qr-image" alt="Gate QR Pass" />
                        <div class="unique-code">{{ $ticket->unique_code }}</div>
                    </div>

                    <div class="barcode-graphic">|||||| ||||| ||||||| |||| |||||</div>
                    <div class="barcode-sub">SCAN AT GATE • ADMIT ONE</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
