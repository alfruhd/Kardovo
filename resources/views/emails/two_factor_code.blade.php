<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kardovo Security</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 16px;">
        <tr>
            <td align="center">
                <!-- MINIMAL CONTAINER (Max Width 460px) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 460px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
                    
                    <!-- BRAND -->
                    <tr>
                        <td align="center" style="padding-bottom: 24px;">
                            <div style="font-size: 17px; font-weight: 900; letter-spacing: 0.16em; color: #091322; text-transform: uppercase;">
                                KARDOVO
                            </div>
                            <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: #0284C7; text-transform: uppercase; margin-top: 2px;">
                                SECURITY
                            </div>
                        </td>
                    </tr>

                    <!-- GREETING & INTRO -->
                    <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.02em;">
                                Sign-in verification
                            </h1>
                            <p style="margin: 0; font-size: 13.5px; color: #64748B; line-height: 1.5;">
                                Hello {{ $userName }}, here is your one-time verification code:
                            </p>
                        </td>
                    </tr>

                    <!-- MINIMALIST OTP CODE BOX -->
                    <tr>
                        <td align="center" style="padding-bottom: 24px;">
                            <div style="background-color: #F1F5F9; border-radius: 14px; padding: 18px 24px; text-align: center; border: 1px solid #E2E8F0;">
                                <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 0.25em; color: #0F172A; margin-left: 0.25em; line-height: 1.1;">
                                    {{ $code }}
                                </div>
                            </div>
                            <div style="font-size: 11px; font-weight: 600; color: #94A3B8; margin-top: 8px;">
                                Expires in 10 minutes
                            </div>
                        </td>
                    </tr>

                    <!-- SHORT NOTICE -->
                    <tr>
                        <td align="center" style="border-top: 1px solid #F1F5F9; padding-top: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5; text-align: center;">
                                If you didn't request this code, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
