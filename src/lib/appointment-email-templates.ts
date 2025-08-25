// src/lib/appointment-email-templates.ts

interface AppointmentConfirmationData {
  name: string;
  appointmentDate: string; // e.g., "Monday, January 15, 2024"
  appointmentTime: string; // e.g., "2:00 PM EST"
  googleMeetLink: string;
  // NEW: we prefer a fully-formed cancel URL from the server
  cancelUrl?: string;
  // Fallback if cancelUrl isn't provided
  cancelToken?: string;
}

interface AppointmentNotificationData {
  clientName: string;
  clientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  questionnaireData?: {
    interestedIn: string[];
    schedulingPreference: string;
    paymentMethod: string;
    budgetWorks: boolean;
  };
}

interface AppointmentCancellationData {
  name: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  // Add missing fields for reschedule functionality
  cancelUrl?: string;
  cancelToken?: string;
}

interface AppointmentRescheduleData {
  name: string;
  oldAppointmentDate: string;
  oldAppointmentTime: string;
  newAppointmentDate: string;
  newAppointmentTime: string;
  googleMeetLink: string;
  // Prefer a fully-formed cancel URL; else build from token
  cancelUrl?: string;
  cancelToken?: string;
}

interface QuestionnaireReminderData {
  name: string;
  questionnaireUrl: string;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Build a base URL from env with sensible fallbacks
function getPublicBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    '';
  return base.replace(/\/+$/, ''); // trim trailing slash
}

function buildCancelUrl(cancelUrl?: string, cancelToken?: string): string | null {
  if (cancelUrl) return cancelUrl; // server provided the full URL — use it
  if (!cancelToken) return null;
  const base = getPublicBaseUrl();
  if (!base) return null;
  return `${base}/cancel-appointment/${encodeURIComponent(cancelToken)}`;
}

function buildRescheduleUrl(cancelUrl?: string, cancelToken?: string): string | null {
  if (cancelUrl) return cancelUrl; // server provided the full URL — use it
  if (!cancelToken) return null;
  const base = getPublicBaseUrl();
  if (!base) return null;
  return `${base}/reschedule/${encodeURIComponent(cancelToken)}`;
}

// Base template with dark mode bypass (reusing your existing styles)
const getBaseEmailTemplate = (content: string, img: string): string => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Toasted Sesame Therapy</title>

  <!--[if !mso]><!-->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700;900&display=swap" rel="stylesheet">
  <!--<![endif]-->

  <style>
    /* Force light mode */
    :root {
      color-scheme: light !important;
      supported-color-schemes: light !important;
    }

    /* Dark mode media query overrides */
    @media (prefers-color-scheme: dark) {
      .force-light { background-color: #F9F5F2 !important; color: #000000 !important; }
      .force-white { background-color: #ffffff !important; color: #000000 !important; }
      .force-black-text { color: #000000 !important; }
      .force-yellow { background-color: #F7BD01 !important; }
      .force-purple { background-color: #C5A1FF !important; }
      .force-green { background-color: #7FBC8C !important; }
      .force-shadow { background-color: #000000 !important; }
    }

    /* Gmail dark mode specific */
    [data-ogsc] .force-light { background-color: #F9F5F2 !important; color: #000000 !important; }
    [data-ogsc] .force-white { background-color: #ffffff !important; color: #000000 !important; }
    [data-ogsc] .force-black-text { color: #000000 !important; }
    [data-ogsc] .force-yellow { background-color: #F7BD01 !important; }
    [data-ogsc] .force-purple { background-color: #C5A1FF !important; }
    [data-ogsc] .force-green { background-color: #7FBC8C !important; }
    [data-ogsc] .force-shadow { background-color: #000000 !important; }

    /* Outlook dark mode */
    [data-ogsb] .force-light { background-color: #F9F5F2 !important; color: #000000 !important; }
    [data-ogsb] .force-white { background-color: #ffffff !important; color: #000000 !important; }
    [data-ogsb] .force-black-text { color: #000000 !important; }
    [data-ogsb] .force-yellow { background-color: #F7BD01 !important; }
    [data-ogsb] .force-purple { background-color: #C5A1FF !important; }
    [data-ogsb] .force-green { background-color: #7FBC8C !important; }
    [data-ogsb] .force-shadow { background-color: #000000 !important; }

    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background: #F9F5F2 !important;
      font-family: 'Work Sans', Arial, sans-serif;
      color-scheme: light !important;
    }

    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin: 0 auto !important;
    }

    img { -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; display: block; border: 0; }

    a { text-decoration: none; color: #000000 !important; }

    @media screen and (max-width: 680px) {
      .email-container { width: 100% !important; }
      .card-wrapper { padding: 0 10px 20px 10px !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .h1 { font-size: 36px !important; line-height: 1.2 !important; }
      .mobile-text { font-size: 18px !important; }
      .mobile-button { padding: 15px !important; font-size: 16px !important; }
    }
  </style>
</head>

<body width="100%" class="force-light" style="margin:0; padding:0; background-color:#F9F5F2 !important; color: #000000 !important;">
  <center style="width:100%; background-color:#F9F5F2;" class="force-light">
    <div style="max-width:680px; margin:0 auto;" class="email-container">
      <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0">
        <!-- Header -->
        <tr>
          <td style="padding:40px 30px; text-align:center; background-color: #F9F5F2 !important;" class="mobile-padding force-light">
            ${img}
          </td>
        </tr>

        <!-- Main Content -->
        ${content}

        <!-- Footer -->
        <tr>
          <td style="padding:20px 30px; text-align:center; background-color: #F9F5F2 !important;" class="mobile-padding force-light">
            <p style="font-family:'Work Sans',Arial,sans-serif; font-size:13px; font-style:italic; line-height:1.5; color:#666666 !important; margin:0 0 15px;">Thank you for being part of our community. We're here to support your healing journey.</p>
            <p style="font-family:'Work Sans',Arial,sans-serif; font-size:12px; line-height:1.5; color:#666666 !important; margin:0;">
              <a href="https://toastedsesametherapy.com" target="_blank" style="font-weight:bold; color:#C5A1FF !important;">Toasted Sesame Therapy</a><br><br>
              If you no longer wish to receive these emails, you can <a href="*|UNSUB|*" style="color:#666666 !important; text-decoration:underline;">unsubscribe here</a>.
            </p>
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
</html>
`;

// Client appointment confirmation email
export const getAppointmentConfirmationTemplate = (
  data: AppointmentConfirmationData
): string => {
  const formattedName = formatName(data.name);
  const escapedName = escapeHtml(formattedName);
  const escapedDate = escapeHtml(data.appointmentDate);
  const escapedTime = escapeHtml(data.appointmentTime);
  const escapedMeetLink = escapeHtml(data.googleMeetLink);

  const resolvedCancelUrl = buildCancelUrl(data.cancelUrl, data.cancelToken);
  const escapedCancelUrl = resolvedCancelUrl ? escapeHtml(resolvedCancelUrl) : '#';

  const img = `<img src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO.png" alt="Toasted Sesame Therapy Logo" style="max-width: 250px; margin: 0 auto 20px auto; display: block;">`;

  const content = `
    <!-- Main Card with Table-Based Shadow -->
    <tr>
      <td style="padding:0 20px 20px 20px; background-color: #F9F5F2 !important;" class="card-wrapper force-light">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#ffffff !important; border:3px solid #000000;" class="force-white">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:60px 40px; background-color:#ffffff !important;" class="mobile-padding force-white">

                    <!-- Confirmation Headline -->
                    <h1 style="font-family:'Work Sans',Arial,sans-serif; font-size:48px; font-weight:900; color:#000000 !important; margin:0 0 40px; line-height:1.2;" class="h1 force-black-text">
                      Your consultation is confirmed, ${escapedName}!
                    </h1>

                    <!-- Appointment Details Box -->
                    <div style="background-color:#F9F5F2 !important; border:3px solid #000000; padding:30px; margin:40px 0; text-align:center;" class="force-light">
                      <h2 style="font-family:'Work Sans',Arial,sans-serif; font-size:24px; font-weight:bold; color:#000000 !important; margin:0 0 20px;" class="force-black-text">
                        📅 Appointment Details
                      </h2>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; font-weight:bold; color:#000000 !important; margin:10px 0;" class="force-black-text">
                        ${escapedDate}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; font-weight:bold; color:#C5A1FF !important; margin:10px 0;">
                        ${escapedTime}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:16px; color:#666666 !important; margin:20px 0 0;">
                        📍 Virtual meeting via Google Meet
                      </p>
                    </div>

                    <!-- What to Expect -->
                    <h3 style="font-family:'Work Sans',Arial,sans-serif; font-size:24px; font-weight:bold; color:#000000 !important; margin:40px 0 20px;" class="force-black-text">
                      What to expect:
                    </h3>
                    <ul style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:0 0 40px; padding-left:20px;" class="force-black-text">
                      <li style="margin-bottom:10px;">We'll chat for about 15 minutes</li>
                      <li style="margin-bottom:10px;">I'll answer any questions you have about therapy</li>
                      <li style="margin-bottom:10px;">We'll see if we're a good fit to work together</li>
                      <li style="margin-bottom:10px;">No pressure, just a friendly conversation</li>
                    </ul>

                    <!-- Join Meeting Button -->
                    <div style="text-align:center; margin:50px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#7FBC8C !important; border:3px solid #000000;" class="force-green">
                            <a href="${escapedMeetLink}" target="_blank"
                               style="display:inline-block; padding:20px 40px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Join Google Meet
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Preparation Note -->
                    <div style="background-color:#F7BD01 !important; border:3px solid #000000; padding:20px; margin:40px 0;" class="force-yellow">
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:16px; font-weight:bold; color:#000000 !important; margin:0 0 10px;" class="force-black-text">
                        💡 Quick prep tip:
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:16px; color:#000000 !important; margin:0;" class="force-black-text">
                        Think about what brought you to therapy and any questions you'd like to ask. But don't stress - we'll keep it conversational and comfortable.
                      </p>
                    </div>

                    <!-- Need to Reschedule -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:40px 0 20px;" class="force-black-text">
                      Need to reschedule or cancel? No problem at all - just click the button below:
                    </p>

                    <!-- Cancel/Reschedule Button -->
                    <div style="text-align:center; margin:30px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#C5A1FF !important; border:3px solid #000000;" class="force-purple">
                            <a href="${escapedCancelUrl}" target="_blank"
                               style="display:inline-block; padding:15px 30px; font-family:'Work Sans',Arial,sans-serif; font-size:16px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Cancel or Reschedule
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Closing -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:40px 0 0;" class="force-black-text">
                      I'm really looking forward to connecting with you and learning more about how I can support your journey.
                    </p>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:30px 0 0;" class="force-black-text">
                      Warmly,<br>
                      Kay
                    </p>

                  </td>
                </tr>
              </table>
            </td>
            <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
          <tr>
            <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
            <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getBaseEmailTemplate(content, img);
};

// Admin notification email (for Kay)
export const getAppointmentNotificationTemplate = (
  data: AppointmentNotificationData
): string => {
  const formattedName = formatName(data.clientName);
  const escapedClientName = escapeHtml(formattedName);
  const escapedClientEmail = escapeHtml(data.clientEmail);
  const escapedDate = escapeHtml(data.appointmentDate);
  const escapedTime = escapeHtml(data.appointmentTime);

  const img = `<img src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO.png" alt="Toasted Sesame Therapy Logo" style="max-width: 250px; margin: 0 auto 20px auto; display: block;">`;

  const adminAppBase = getPublicBaseUrl() || process.env.NEXT_PUBLIC_APP_URL || '';
  const adminAppUrl = adminAppBase ? `${adminAppBase}/admin/appointments` : '#';

  const content = `
    <!-- Main Card with Table-Based Shadow -->
    <tr>
      <td style="padding:0 20px 20px 20px; background-color: #F9F5F2 !important;" class="card-wrapper force-light">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#ffffff !important; border:3px solid #000000;" class="force-white">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:60px 40px; background-color:#ffffff !important;" class="mobile-padding force-white">

                    <!-- Notification Headline -->
                    <h1 style="font-family:'Work Sans',Arial,sans-serif; font-size:42px; font-weight:900; color:#000000 !important; margin:0 0 40px; line-height:1.2;" class="h1 force-black-text">
                      🎉 New Consultation Scheduled!
                    </h1>

                    <!-- Client Details Box -->
                    <div style="background-color:#F7BD01 !important; border:3px solid #000000; padding:30px; margin:40px 0;" class="force-yellow">
                      <h2 style="font-family:'Work Sans',Arial,sans-serif; font-size:24px; font-weight:bold; color:#000000 !important; margin:0 0 20px;" class="force-black-text">
                        Client Information
                      </h2>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; color:#000000 !important; margin:10px 0;" class="force-black-text">
                        <strong>Name:</strong> ${escapedClientName}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; color:#000000 !important; margin:10px 0;" class="force-black-text">
                        <strong>Email:</strong> ${escapedClientEmail}
                      </p>
                    </div>

                    <!-- Appointment Details Box -->
                    <div style="background-color:#C5A1FF !important; border:3px solid #000000; padding:30px; margin:40px 0;" class="force-purple">
                      <h2 style="font-family:'Work Sans',Arial,sans-serif; font-size:24px; font-weight:bold; color:#000000 !important; margin:0 0 20px;" class="force-black-text">
                        Appointment Details
                      </h2>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; color:#000000 !important; margin:10px 0;" class="force-black-text">
                        <strong>Date:</strong> ${escapedDate}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; color:#000000 !important; margin:10px 0;" class="force-black-text">
                        <strong>Time:</strong> ${escapedTime}
                      </p>
                    </div>

                    <!-- Next Steps -->
                    <h3 style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; font-weight:bold; color:#000000 !important; margin:40px 0 20px;" class="force-black-text">
                      Next Steps:
                    </h3>
                    <ul style="font-family:'Work Sans',Arial,sans-serif; font-size:16px; line-height:1.6; color:#000000 !important; margin:0 0 40px; padding-left:20px;" class="force-black-text">
                      <li style="margin-bottom:10px;">Add to your calendar</li>
                      <li style="margin-bottom:10px;">Prepare Google Meet link</li>
                      <li style="margin-bottom:10px;">Review client's questionnaire responses</li>
                      <li style="margin-bottom:10px;">Send any pre-consultation materials if needed</li>
                    </ul>

                    <!-- Admin Dashboard Link -->
                    <div style="text-align:center; margin:40px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#F7BD01 !important; border:3px solid #000000;" class="force-yellow">
                            <a href="${adminAppUrl}" target="_blank"
                               style="display:inline-block; padding:20px 40px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              View in Admin Dashboard
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                    </div>

                  </td>
                </tr>
              </table>
            </td>
            <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
          <tr>
            <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
            <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getBaseEmailTemplate(content, img);
};

// Client appointment cancellation email
export const getAppointmentCancellationTemplate = (
  data: AppointmentCancellationData
  ): string => {
  const formattedName = formatName(data.name);
  const escapedName = escapeHtml(formattedName);
  const escapedDate = escapeHtml(data.appointmentDate);
  const escapedTime = escapeHtml(data.appointmentTime);
  const resolvedCancelUrl = buildRescheduleUrl(data.cancelUrl, data.cancelToken);
  const escapedReschedulelUrl = resolvedCancelUrl ? escapeHtml(resolvedCancelUrl) : '#';

  const img = `<img src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO.png" alt="Toasted Sesame Therapy Logo" style="max-width: 250px; margin: 0 auto 20px auto; display: block;">`;

  const content = `
    <!-- Main Card with Table-Based Shadow -->
    <tr>
      <td style="padding:0 20px 20px 20px; background-color: #F9F5F2 !important;" class="card-wrapper force-light">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#ffffff !important; border:3px solid #000000;" class="force-white">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:60px 40px; background-color:#ffffff !important;" class="mobile-padding force-white">

                    <!-- Cancellation Headline -->
                    <h1 style="font-family:'Work Sans',Arial,sans-serif; font-size:48px; font-weight:900; color:#000000 !important; margin:0 0 40px; line-height:1.2;" class="h1 force-black-text">
                      Your appointment has been cancelled, ${escapedName}
                    </h1>

                    <!-- Cancellation Message -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 30px;" class="mobile-text force-black-text">
                      I understand that plans can change. Your consultation appointment has been successfully cancelled.
                    </p>

                    <!-- Cancelled Appointment Details Box -->
                    <div style="background-color:#F9F5F2 !important; border:3px solid #000000; padding:30px; margin:40px 0; text-align:center;" class="force-light">
                      <h2 style="font-family:'Work Sans',Arial,sans-serif; font-size:24px; font-weight:bold; color:#000000 !important; margin:0 0 20px;" class="force-black-text">
                        📅 Cancelled Appointment
                      </h2>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; font-weight:bold; color:#000000 !important; margin:10px 0; text-decoration: line-through;" class="force-black-text">
                        ${escapedDate}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; font-weight:bold; color:#666666 !important; margin:10px 0; text-decoration: line-through;">
                        ${escapedTime}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:16px; color:#666666 !important; margin:20px 0 0;">
                        ❌ This appointment has been removed from our calendars
                      </p>
                    </div>

                    <!-- Next Steps -->
                    <h3 style="font-family:'Work Sans',Arial,sans-serif; font-size:24px; font-weight:bold; color:#000000 !important; margin:40px 0 20px;" class="force-black-text">
                      What's next?
                    </h3>
                    <ul style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:0 0 40px; padding-left:20px;" class="force-black-text">
                      <li style="margin-bottom:15px;">If you'd like to reschedule, I'm here and ready to help</li>
                      <li style="margin-bottom:15px;">Simply reply to this email or reach out directly</li>
                      <li style="margin-bottom:15px;">No pressure at all - I understand life happens</li>
                      <li style="margin-bottom:15px;">Your spot will always be available when you're ready</li>
                    </ul>

                    <!-- Reschedule Button -->
                    <div style="text-align:center; margin:50px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#C5A1FF !important; border:3px solid #000000;" class="force-purple">
                            <a href="${escapedReschedulelUrl}" target="_blank"
                               style="display:inline-block; padding:20px 40px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Reschedule My Consultation
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Supportive Note -->
                    <div style="background-color:#F7BD01 !important; border:3px solid #000000; padding:20px; margin:40px 0;" class="force-yellow">
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:16px; font-weight:bold; color:#000000 !important; margin:0 0 10px;" class="force-black-text">
                        💛 A gentle reminder:
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:16px; color:#000000 !important; margin:0;" class="force-black-text">
                        Taking care of yourself includes honoring your needs and boundaries. There's no judgment here - only support when you're ready.
                      </p>
                    </div>

                    <!-- Closing -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:40px 0 0;" class="force-black-text">
                      Thank you for letting me know about the change. I'm here whenever you're ready to connect.
                    </p>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:30px 0 0;" class="force-black-text">
                      With care,<br>
                      Kay
                    </p>

                  </td>
                </tr>
              </table>
            </td>
            <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
          <tr>
            <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
            <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getBaseEmailTemplate(content, img);
};

export const getAppointmentRescheduleTemplate = (
  data: AppointmentRescheduleData
): string => {
  const formattedName = formatName(data.name);
  const escapedName = escapeHtml(formattedName);
  const escapedOldDate = escapeHtml(data.oldAppointmentDate);
  const escapedOldTime = escapeHtml(data.oldAppointmentTime);
  const escapedNewDate = escapeHtml(data.newAppointmentDate);
  const escapedNewTime = escapeHtml(data.newAppointmentTime);
  const escapedMeetLink = escapeHtml(data.googleMeetLink);

  // FIX: use server-provided URL if present; else build from token
  const resolvedCancelUrl = buildCancelUrl(data.cancelUrl, data.cancelToken);
  const escapedCancelUrl = resolvedCancelUrl ? escapeHtml(resolvedCancelUrl) : '#';

  const img = `<img src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO.png" alt="Toasted Sesame Therapy Logo" style="max-width: 250px; margin: 0 auto 20px auto; display: block;">`;

  const content = `
    <!-- Main Card with Table-Based Shadow -->
    <tr>
      <td style="padding:0 20px 20px 20px; background-color: #F9F5F2 !important;" class="card-wrapper force-light">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#ffffff !important; border:3px solid #000000;" class="force-white">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:60px 40px; background-color:#ffffff !important;" class="mobile-padding force-white">

                    <!-- Reschedule Headline -->
                    <h1 style="font-family:'Work Sans',Arial,sans-serif; font-size:48px; font-weight:900; color:#000000 !important; margin:0 0 40px; line-height:1.2;" class="h1 force-black-text">
                      Your consultation has been rescheduled, ${escapedName}!
                    </h1>

                    <!-- Reschedule Message -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 30px;" class="mobile-text force-black-text">
                      Perfect! I've updated your consultation to the new time below. Thanks for letting me know about the change.
                    </p>

                    <!-- Old Appointment (Crossed Out) -->
                    <div style="background-color:#FFE6E6 !important; border:3px solid #FF6B6B; padding:25px; margin:30px 0; text-align:center;">
                      <h3 style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; color:#FF6B6B !important; margin:0 0 15px;">
                        ❌ Previous Appointment (Cancelled)
                      </h3>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; color:#999999 !important; margin:5px 0; text-decoration: line-through;">
                        ${escapedOldDate}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; color:#999999 !important; margin:5px 0; text-decoration: line-through;">
                        ${escapedOldTime}
                      </p>
                    </div>

                    <!-- New Appointment Details Box -->
                    <div style="background-color:#E8F5E8 !important; border:3px solid #7FBC8C; padding:30px; margin:40px 0; text-align:center;" class="force-light">
                      <h2 style="font-family:'Work Sans',Arial,sans-serif; font-size:24px; font-weight:bold; color:#7FBC8C !important; margin:0 0 20px;">
                        ✅ Your New Appointment
                      </h2>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:22px; font-weight:bold; color:#000000 !important; margin:10px 0;" class="force-black-text">
                        ${escapedNewDate}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:22px; font-weight:bold; color:#C5A1FF !important; margin:10px 0;">
                        ${escapedNewTime}
                      </p>
                      <p style="font-family:'Work Sans',Arial,sans-serif; font-size:16px; color:#666666 !important; margin:20px 0 0;">
                        Virtual meeting via Google Meet
                      </p>
                    </div>

                    <!-- What to Expect (Reminder) -->
                    <h3 style="font-family:'Work Sans',Arial,sans-serif; font-size:24px; font-weight:bold; color:#000000 !important; margin:40px 0 20px;" class="force-black-text">
                      What to expect:
                    </h3>
                    <ul style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:0 0 40px; padding-left:20px;" class="force-black-text">
                      <li style="margin-bottom:10px;">We'll chat for about 15 minutes</li>
                      <li style="margin-bottom:10px;">I'll answer any questions you have about therapy</li>
                      <li style="margin-bottom:10px;">We'll see if we're a good fit to work together</li>
                      <li style="margin-bottom:10px;">No pressure, just a friendly conversation</li>
                    </ul>

                    <!-- Join Meeting Button -->
                    <div style="text-align:center; margin:50px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#7FBC8C !important; border:3px solid #000000;" class="force-green">
                            <a href="${escapedMeetLink}" target="_blank"
                               style="display:inline-block; padding:20px 40px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Join Google Meet
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Need to Reschedule Again -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:40px 0 20px;" class="force-black-text">
                      Need to make another change? No worries at all - just click below:
                    </p>

                    <!-- Cancel/Reschedule Button -->
                    <div style="text-align:center; margin:30px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#C5A1FF !important; border:3px solid #000000;" class="force-purple">
                            <a href="${escapedCancelUrl}" target="_blank"
                               style="display:inline-block; padding:15px 30px; font-family:'Work Sans',Arial,sans-serif; font-size:16px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Cancel or Reschedule Again
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Closing -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:40px 0 0;" class="force-black-text">
                      I'm looking forward to our conversation at the new time. Thanks for being flexible!
                    </p>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.6; color:#000000 !important; margin:30px 0 0;" class="force-black-text">
                      See you soon,<br>
                      Kay
                    </p>

                  </td>
                </tr>
              </table>
            </td>
            <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
          <tr>
            <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
            <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getBaseEmailTemplate(content, img);
};

export const getQuestionnaireReminderTemplate = (
  data: QuestionnaireReminderData
): string => {
  const formattedName = formatName(data.name);
  const escapedName = escapeHtml(formattedName);
  const escapedUrl = escapeHtml(data.questionnaireUrl);

  const img = `<img src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO.png" alt="Toasted Sesame Therapy Logo" style="max-width: 250px; margin: 0 auto 20px auto; display: block;">`;
  const content = `
    <!-- Main Card with Table-Based Shadow -->
    <tr>
      <td style="padding:0 20px 20px 20px; background-color: #F9F5F2 !important;" class="card-wrapper force-light">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#ffffff !important; border:3px solid #000000;" class="force-white">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:60px 40px; background-color:#ffffff !important;" class="mobile-padding force-white">
                    <h1 style="font-family:'Work Sans',Arial,sans-serif; font-size:48px; font-weight:900; color:#000000 !important; margin:0 0 40px; line-height:1.2;" class="h1 force-black-text">
                     Hi, ${escapedName}!
                    </h1>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 30px;" class="mobile-text force-black-text">
                      I noticed you started filling out your questionnaire but did not get a chance to finish. No worries, it happens.
                    </p>

                     <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 30px;" class="mobile-text force-black-text">
                        Just a few quick questions will help me understand your needs so we can make the most of your free consultation.
                        </p>

                    <!-- CTA Button with table-based shadow -->
                    <div style="text-align:center; margin:50px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#F7BD01 !important; border:3px solid #000000;" class="force-yellow">
                            <a href="${escapedUrl}" target="_blank"
                               style="display:inline-block; padding:20px 40px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Finish in 2 Minutes
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:30px 0 0;" class="mobile-text force-black-text">
                      Once you finish, you will get the link to schedule your consultation. I look forward to connecting with you.
                    </p>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:40px 0 0;" class="mobile-text force-black-text">
                      Warmly,<br>
                      Kay
                    </p>
                  </td>
                </tr>
              </table>
            </td>
            <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
          <tr>
            <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
            <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getBaseEmailTemplate(content, img);
};

// Export types for use in other files
export type {
  AppointmentConfirmationData,
  AppointmentNotificationData,
  AppointmentCancellationData,
  AppointmentRescheduleData,
};
