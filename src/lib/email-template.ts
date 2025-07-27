/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/email-template.ts

// Helper function to build the HTML for a single archive post
const createArchiveItemHtml = (post: any) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:2px solid #eeeeee;">
    <tr>
      <td style="padding:20px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="80" valign="top" style="width:80px;" class="archive-img">
              <img src="${post.image_url || 'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/cho-cloud-hero.png'}" width="80" height="80" alt="" style="">
            </td>
            <td valign="top" style="padding-left:20px;" class="archive-text">
              <h3 style="font-family:'Work Sans',Arial,sans-serif;font-size:18px;font-weight:bold;color:#000;margin:0 0 5px;">${post.title}</h3>
              <p style="font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#000;margin:0 0 10px;">${post.subtext || ''}</p>
              <a href="https://toastedsesametherapy.com/posts/${post.slug}" target="_blank" style="font-family:'Work Sans',Arial,sans-serif;font-weight:bold;color:#000;">Read more &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

// This is the main function that builds the entire email.
export const getEmailHtml = (data: any): string => {
  const archiveHtml = data.archive_posts.map(createArchiveItemHtml).join('');

  // This is your full, final HTML template with placeholders for your content.
  return `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
    <title>toasty tidbits</title>

    <!--[if !mso]><!-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700;900&display=swap" rel="stylesheet">
    <!--<![endif]-->

    <style>
      html, body {
        margin: 0 auto !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        background: #F9F5F2;
        font-family: 'Work Sans', Arial, sans-serif;
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
      a { text-decoration: none; }
      @media screen and (max-width: 680px) {
          .email-container { width: 100% !important; }
          .card-wrapper { padding: 0 10px 20px 10px !important; }
          .mobile-padding { padding-left: 15px !important; padding-right: 15px !important; }
          .h1 { font-size: 32px !important; line-height: 1.2 !important; }
          .h2 { font-size: 24px !important; line-height: 1.3 !important; }
          .archive-img { width: 60px !important; height: 60px !important; }
          .archive-text { padding-left: 15px !important; }
      }
    </style>
  </head>

  <body width="100%" style="margin:0; padding:0; background-color:#F9F5F2;">
    <center style="width:100%; background-color:#F9F5F2;">
      <div style="max-width:680px; margin:0 auto;" class="email-container">
        <!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="680" style="width:680px;" align="center">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0">
          <!-- Header -->
          <tr>
            <td style="padding:40px 30px; text-align:center;" class="mobile-padding">
              <img src="https://mcusercontent.com/f4b2666465f26c26e8f765b7e/images/bae03227-4033-0c24-6304-fc4189935fd5.png" width="300" alt="Toasted Sesame Therapy Logo" style="display:block; margin:0 auto 20px auto; max-width:300px; height:auto;">
              <h1 class="h1" style="font-family:'Work Sans',Arial,sans-serif; font-size:44px; font-weight:900; line-height:1.1; color:#000000; margin:0;">${data.header_title}</h1>
              <p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.5; color:#000000; margin:10px 0 0;">${data.formatted_date}</p>
            </td>
          </tr>
          <!-- Main Article -->
          <tr>
            <td style="padding:0 20px 20px 20px;" class="card-wrapper">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#ffffff; border:3px solid #000000; ">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td><img src="${data.main_image_url}" width="640" alt="Main Article" style="width:100%; max-width:100%; height:auto; border-radius:9px 9px 0 0;"></td></tr>
                      <tr><td style="padding:20px 30px 0 30px;" class="mobile-padding"><h2 class="h2" style="font-family:'Work Sans',Arial,sans-serif; font-size:28px; font-weight:bold; color:#000000; margin:0;">${data.main_title}</h2></td></tr>
                      <tr><td style="padding:15px 30px 30px 30px;" class="mobile-padding">${data.main_body}</td></tr>
                    </table>
                  </td>
                  <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                </tr>
                <tr>
                  <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                  <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Toasty Tidbit -->
          <tr>
              <td style="padding:0 20px 20px 20px;" class="card-wrapper">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                          <td style="background-color:#7FBC8C; border:3px solid #000000; ">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr><td style="padding:20px 30px 10px 30px;" class="mobile-padding"><img src="https://mcusercontent.com/f4b2666465f26c26e8f765b7e/images/f55df04f-ec82-a245-d156-765ea70160d7.png" width="250" alt="Toasty Tidbit Icon" style="max-width:250px; height:auto;"></td></tr>
                                  <tr><td style="padding:0 30px 30px 30px;" class="mobile-padding"><p style="font-family:'Work Sans',Arial,sans-serif; font-size:18px; line-height:1.5; color:#000000; margin:0;">"${data.toasty_take}"<br><br>&ndash; Your favorite therapist, Kay</p></td></tr>
                              </table>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                      </tr>
                  </table>
              </td>
          </tr>
          <!-- From the Archive -->
          <tr>
              <td style="padding:0 20px 20px 20px;" class="card-wrapper">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                          <td style="background-color:#ffffff; border:3px solid #000000; ">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr><td style="padding:20px 30px 0 30px;" class="mobile-padding"><h2 class="h2" style="font-family:'Work Sans',Arial,sans-serif; font-size:28px; font-weight:bold; color:#000000; margin:0;">From the Archive</h2></td></tr>
                                  <tr><td style="padding:15px 30px 30px 30px;" class="mobile-padding">${archiveHtml}</td></tr>
                              </table>
                          </td>
                          <td width="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td height="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                          <td height="4" width="4" style="font-size:1px; line-height:1px; background-color: #000000;">&nbsp;</td>
                      </tr>
                  </table>
              </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:20px 30px;" class="mobile-padding">
              <h2 class="h2" style="font-family:'Work Sans',Arial,sans-serif; font-size:28px; font-weight:bold; text-align:center; color:#000000; margin:0 0 20px;">Ready to go deeper?</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><a href="https://yourwebsite.com/contact" target="_blank" style="display:inline-block; padding:12px 25px; font-family:'Work Sans',Arial,sans-serif; font-size:16px; font-weight:bold; text-decoration:none; color:#000000; background-color:#F7BD01; border:2px solid #000000; box-shadow:4px 4px 0 0; ">Book a Free Consultation</a></td></tr></table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 30px; text-align:center;" class="mobile-padding">
              <p style="font-family:'Work Sans',Arial,sans-serif; font-size:13px; font-style:italic; line-height:1.5; color:#666666; margin:0 0 15px;">These toasty thoughts are here to offer warmth and connection... Please remember, this content isn't a substitute for personalized therapy...</p>
              <p style="font-family:'Work Sans',Arial,sans-serif; font-size:12px; line-height:1.5; color:#666666; margin:0;"><a href="https://toastedsesametherapy.com" target="_blank" style="font-weight:bold; color:#C5A1FF;">Toasted Sesame Therapy</a><br><br><br>You are receiving this email because you opted in.<br><a href="*|UNSUB|*" target="_blank" style="color:#666666; text-decoration:underline;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
        </div>
        <!--[if mso | IE]>
        </td>
        </tr>
        </table>
        <![endif]-->
    </center>
    </body>
    </html>
  `;
};
