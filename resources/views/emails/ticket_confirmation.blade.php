<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Ticket for {{ $event->title }}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px 12px; color: #0F172A;">
    <div style="max-width: 600px; margin: 0 auto;">
        
        <!-- Header Info -->
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #154F7C; margin-bottom: 4px;">
                KARDOVO PASS DISPATCH
            </div>
            <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0;">
                Your Pass is Ready!
            </h1>
            <p style="font-size: 13px; color: #64748B; margin: 6px 0 0 0;">
                Hello <strong>{{ $ticket->attendee_name }}</strong>, here is your official digital pass for <strong>{{ $event->title }}</strong>.
            </p>
        </div>

        <!-- Authentic Ticket Voucher Card (Matches Screen & PDF Layout) -->
        <div style="background-color: #0F172A; border-radius: 18px; overflow: hidden; border: 1px solid #1E293B; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); color: #FFFFFF;">
            <!-- Top Color Accent Line -->
            <div style="height: 5px; background-color: {{ $tier->color ?? '#10B981' }}; width: 100%;"></div>

            <!-- Card Body -->
            <div style="padding: 24px 20px;">
                <!-- Status & Tier Badge Bar -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                    <tr>
                        <td>
                            <span style="display: inline-block; background-color: {{ $tier->color ?? '#10B981' }}; color: #0F172A; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; padding: 3px 9px; border-radius: 9999px;">
                                {{ $tier->name }}
                            </span>
                            <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #94A3B8; margin-left: 6px;">
                                #{{ $ticket->ticket_number }}
                            </span>
                        </td>
                        <td style="text-align: right;">
                            <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); font-weight: 800; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; padding: 2px 8px; border-radius: 9999px;">
                                VALID PASS
                            </span>
                        </td>
                    </tr>
                </table>

                <!-- Event Title -->
                <h2 style="font-size: 20px; font-weight: 900; color: #FFFFFF; margin: 0 0 16px 0; line-height: 1.25; letter-spacing: -0.3px;">
                    {{ $event->title }}
                </h2>

                <!-- Key Details 4-Column Grid -->
                <table style="width: 100%; border-collapse: collapse; background-color: #1E293B; border-radius: 12px; margin-bottom: 14px;">
                    <tr>
                        <td style="padding: 10px 12px; width: 25%; vertical-align: top;">
                            <div style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; color: #94A3B8; font-weight: 700;">PASS HOLDER</div>
                            <div style="font-size: 12px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">{{ $ticket->attendee_name }}</div>
                        </td>
                        <td style="padding: 10px 12px; width: 25%; vertical-align: top;">
                            <div style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; color: #94A3B8; font-weight: 700;">TICKET CODE</div>
                            <div style="font-size: 12px; font-weight: 800; color: {{ $tier->color ?? '#10B981' }}; font-family: monospace; margin-top: 2px;">#{{ $ticket->ticket_number }}</div>
                        </td>
                        <td style="padding: 10px 12px; width: 25%; vertical-align: top;">
                            <div style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; color: #94A3B8; font-weight: 700;">GATE / DOOR</div>
                            <div style="font-size: 12px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">{{ $ticket->gate_label ?? 'Main Gate' }}</div>
                        </td>
                        <td style="padding: 10px 12px; width: 25%; vertical-align: top;">
                            <div style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; color: #94A3B8; font-weight: 700;">PRICE</div>
                            <div style="font-size: 12px; font-weight: 800; color: #34D399; font-family: monospace; margin-top: 2px;">{{ $ticket->formatted_price }}</div>
                        </td>
                    </tr>
                </table>

                <!-- Date & Venue Grid -->
                <table style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-left: -8px; margin-bottom: 16px;">
                    <tr>
                        <td style="background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px 12px; width: 50%;">
                            <div style="font-size: 11px; font-weight: 800; color: #FFFFFF;">
                                {{ $event->event_date?->format('l, d F Y') }}
                            </div>
                            <div style="font-size: 10px; color: #94A3B8; margin-top: 2px;">
                                {{ $event->event_time ?? 'Doors open early' }}
                            </div>
                        </td>
                        <td style="background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px 12px; width: 50%;">
                            <div style="font-size: 11px; font-weight: 800; color: #FFFFFF;">
                                {{ $event->venue }}
                            </div>
                            <div style="font-size: 10px; color: #94A3B8; margin-top: 2px;">
                                {{ $event->city }}
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Perforated Divider Simulation -->
                <div style="border-top: 2px dashed #334155; margin: 18px 0; position: relative;"></div>

                <!-- Gate Stub & Scannable QR -->
                <div style="background-color: #0B1324; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #1E293B;">
                    <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #64748B; font-family: monospace;">
                        VERIFIED GATE ACCESS PASS
                    </div>
                    <div style="font-size: 13px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">
                        {{ $ticket->attendee_name }}
                    </div>

                    @if(!empty($qrDataUri))
                        <div style="background-color: #FFFFFF; padding: 10px; border-radius: 12px; display: inline-block; margin: 12px auto 4px auto; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                            <img src="{{ $qrDataUri }}" alt="Gate QR Pass" style="width: 140px; height: 140px; display: block;" />
                            <div style="font-family: monospace; font-size: 11px; font-weight: 900; color: #0F172A; letter-spacing: 2px; margin-top: 4px;">
                                {{ $ticket->unique_code }}
                            </div>
                        </div>
                    @endif

                    <div style="margin-top: 8px; font-family: monospace; font-size: 12px; letter-spacing: -1px; color: #94A3B8;">
                        |||||| ||||| ||||||| |||| |||||
                    </div>
                    <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B; font-family: monospace; margin-top: 2px;">
                        SCAN AT GATE • ADMIT ONE
                    </div>
                </div>

                <!-- Instructions -->
                <div style="margin-top: 14px; font-size: 9.5px; color: #64748B; text-align: center; line-height: 1.4;">
                    {{ $event->ticket_instructions ?? ($event->ticket_template_config['custom_instructions'] ?? 'Present this pass or show the QR code directly from your phone at the entrance gate for quick check-in.') }}
                </div>
            </div>
        </div>

        <!-- Action Link Button -->
        <div style="text-align: center; margin-top: 24px;">
            <a href="{{ $ticket->pass_url }}" style="display: inline-block; background-color: #154F7C; color: #FFFFFF; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(21, 79, 124, 0.4);">
                Open Live Pass on Phone
            </a>
            <p style="font-size: 12px; color: #64748B; margin-top: 10px;">
                📎 <em>Your official printable PDF voucher is also attached to this email.</em>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 28px; font-size: 11px; color: #94A3B8;">
            Powered by <strong>Kardovo Event Intelligence</strong> • Secure Gate Access System
        </div>
    </div>
</body>
</html>
