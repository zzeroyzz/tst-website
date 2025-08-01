/* eslint-disable @typescript-eslint/no-unused-vars */
// src/lib/custom-email-templates.ts

interface WelcomeEmailData {
  name: string;
}

interface ContactConfirmationData {
  name: string;
}

interface ContactWarmupData {
  name: string;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Base template with dark mode bypass
const getBaseEmailTemplate = (content: string, img: string) => `
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
      .force-light {
        background-color: #F9F5F2 !important;
        color: #000000 !important;
      }
      .force-white {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      .force-black-text {
        color: #000000 !important;
      }
      .force-yellow {
        background-color: #F7BD01 !important;
      }
      .force-purple {
        background-color: #C5A1FF !important;
      }
      .force-green {
        background-color: #7FBC8C !important;
      }
      .force-shadow {
        background-color: #000000 !important;
      }
    }

    /* Gmail dark mode specific */
    [data-ogsc] .force-light {
      background-color: #F9F5F2 !important;
      color: #000000 !important;
    }
    [data-ogsc] .force-white {
      background-color: #ffffff !important;
      color: #000000 !important;
    }
    [data-ogsc] .force-black-text {
      color: #000000 !important;
    }
    [data-ogsc] .force-yellow {
      background-color: #F7BD01 !important;
    }
    [data-ogsc] .force-purple {
      background-color: #C5A1FF !important;
    }
    [data-ogsc] .force-green {
      background-color: #7FBC8C !important;
    }
    [data-ogsc] .force-shadow {
      background-color: #000000 !important;
    }

    /* Outlook dark mode */
    [data-ogsb] .force-light {
      background-color: #F9F5F2 !important;
      color: #000000 !important;
    }
    [data-ogsb] .force-white {
      background-color: #ffffff !important;
      color: #000000 !important;
    }
    [data-ogsb] .force-black-text {
      color: #000000 !important;
    }
    [data-ogsb] .force-yellow {
      background-color: #F7BD01 !important;
    }
    [data-ogsb] .force-purple {
      background-color: #C5A1FF !important;
    }
    [data-ogsb] .force-green {
      background-color: #7FBC8C !important;
    }
    [data-ogsb] .force-shadow {
      background-color: #000000 !important;
    }

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

    img {
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
      height: auto;
      display: block;
      border: 0;
    }

    a {
      text-decoration: none;
      color: #000000 !important;
    }

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

// Welcome email - Using table-based shadow with proper light mode forcing
export const getWelcomeEmailTemplate = (data: WelcomeEmailData): string => {
  // Fix: Use data.name instead of undefined 'name' variable
  const escapedName = escapeHtml(data.name);

  const img = `<img src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/toasty-tidbits-logo-2.png" alt="Toasted Tidbits Logo" style="max-width: 250px; margin: 0 auto 20px auto; display: block;">`;
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

                    <!-- Welcome Headline -->
                    <h1 style="font-family:'Work Sans',Arial,sans-serif; font-size:48px; font-weight:900; color:#000000 !important; margin:0 0 40px; line-height:1.2;" class="h1 force-black-text">
                      Welcome to toasty tidbits, ${escapedName}!
                    </h1>

                    <!-- Welcome Message -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 30px;" class="mobile-text force-black-text">
                      I'm so glad you're here. Taking the first step to care for yourself is a big deal, and I'm honored to be a small part of your journey.
                    </p>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 50px;" class="mobile-text force-black-text">
                      As promised, here are your free guides. I hope you find them supportive and helpful.
                    </p>

                    <!-- Guide Buttons with Table-Based Shadows -->
                    <div style="margin-bottom:20px;">
                      <!-- Button 1 with shadow -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-bottom:50px;">
                        <tr>
                          <td style="background-color:#F7BD01 !important; border:3px solid #000000;" class="force-yellow">
                            <a href="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/free-guides/Navigating%20your%20care%20with%20confidence%20-%20Toasted%20Sesame%20Therapy.pdf" target="_blank"
                               style="display:block; padding:20px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Guide 1: Navigating your care with confidence
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                            <!-- Spacer -->
                            <div style="height:30px; line-height:30px; font-size:1px;">&nbsp;</div>

                            <!-- Button 3 with shadow -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; position:relative;">
                      <!-- Button 2 with shadow -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-bottom:50px;">
                        <tr>
                          <td style="background-color:#C5A1FF !important; border:3px solid #000000;" class="force-purple">
                            <a href="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/free-guides/Communicate%20with%20heart%20and%20clarity%20-%20Toasted%20Sesame%20Therapy.pdf" target="_blank"
                               style="display:block; padding:20px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Guide 2: Communicate with heart and clarity
                            </a>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                        <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;" class="force-shadow">&nbsp;</td>
                        </tr>
                      </table>
                                <!-- Spacer -->
                            <div style="height:30px; line-height:30px; font-size:1px;">&nbsp;</div>

                            <!-- Button 3 with shadow -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; position:relative;">

                      <!-- Button 3 with shadow -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                        <tr>
                          <td style="background-color:#7FBC8C !important; border:3px solid #000000;" class="force-green">
                            <a href="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/free-guides/Reconnect%20with%20yourself%20for%20regulation%20-%20Toasted%20Sesame%20Therapy.pdf" target="_blank"
                               style="display:block; padding:20px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Guide 3: Reconnect with yourself for regulation
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

                    <!-- Spacer after buttons -->
                    <div style="height:30px; line-height:30px; font-size:1px;">&nbsp;</div>

                    <!-- Footer Message -->
                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 40px;" class="mobile-text force-black-text">
                      I'll be in touch with more resources and reflections from time to time. You can unsubscribe at any time.
                    </p>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0;" class="mobile-text force-black-text">
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
// Contact confirmation email - Using table-based shadow like email-template.ts
export const getContactConfirmationTemplate = (data: ContactConfirmationData): string => {
   const escapedName = escapeHtml(data.name);
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
                      Thanks for reaching out, ${escapedName}!
                    </h1>

                    <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 30px;" class="mobile-text force-black-text">
                      I'm so glad you took this step. The next part is easy: just click the button below to schedule your free, no-pressure 15-minute consultation.
                    </p>

                    <!-- CTA Button with table-based shadow -->
                    <div style="text-align:center; margin:50px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#F7BD01 !important; border:3px solid #000000;" class="force-yellow">
                            <a href="https://toastedsesametherapyllc.clientsecure.me/request/service" target="_blank"
                               style="display:inline-block; padding:20px 40px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Schedule Your Free Consultation
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
                      We'll use that time to chat, see if it's a good fit, and answer any questions you have. I'm looking forward to connecting with you.
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

export const getContactWarmupTemplate = (data: ContactWarmupData): string => {
     const escapedName = escapeHtml(data.name);

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
                      Checking in to see if you're still interested in scheduling your free 15-minute consultation. It's a great opportunity for us to connect, see if we're a good fit, and answer any questions you might have about therapy.
                    </p>

                     <p style="font-family:'Work Sans',Arial,sans-serif; font-size:20px; line-height:1.6; color:#000000 !important; margin:0 0 30px;" class="mobile-text force-black-text">
                        You can book a time that works for you by clicking the button below.
                        </p>

                    <!-- CTA Button with table-based shadow -->
                    <div style="text-align:center; margin:50px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                        <tr>
                          <td style="background-color:#F7BD01 !important; border:3px solid #000000;" class="force-yellow">
                            <a href="https://toastedsesametherapyllc.clientsecure.me/request/service" target="_blank"
                               style="display:inline-block; padding:20px 40px; font-family:'Work Sans',Arial,sans-serif; font-size:18px; font-weight:bold; text-decoration:none; color:#000000 !important;" class="mobile-button force-black-text">
                              Schedule Your Free Consultation
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
                      We'll use that time to chat, see if it's a good fit, and answer any questions you have. I'm looking forward to connecting with you.
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
