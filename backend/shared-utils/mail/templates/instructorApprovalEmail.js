export const instructorApprovalEmail = (firstName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instructor Application Approved</title>
    </head>
    <body style="font-family:Arial,sans-serif;margin:0;padding:0;background-color:#0f0f1a;">
      <div style="max-width:600px;margin:20px auto;background:#1a1a2e;border-radius:12px;border:1px solid #374151;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e1e3f,#2d1f5e);padding:28px 32px;text-align:center;">
          <h1 style="color:#fcd34d;margin:0;font-size:24px;font-weight:700;">🎉 Congratulations!</h1>
          <p style="color:#a78bfa;margin:8px 0 0;font-size:14px;">Your instructor application has been approved</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#e5e7eb;font-size:15px;margin:0 0 16px;">Hi <strong style="color:#fff;">${firstName}</strong>,</p>
          <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 16px;">
            Great news — your application to become an instructor on <strong style="color:#fcd34d;">Academix</strong>
            has been <strong style="color:#4ade80;">approved</strong>! You now have full access to create and publish courses
            for students on the platform.
          </p>
          <div style="background:#0d2818;border:1px solid #166534;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="color:#86efac;margin:0;font-size:13px;">✓ Your account has been upgraded to Instructor</p>
            <p style="color:#86efac;margin:8px 0 0;font-size:13px;">✓ You can now create and publish courses</p>
            <p style="color:#86efac;margin:8px 0 0;font-size:13px;">✓ Access instructor analytics and earnings</p>
          </div>
          <p style="color:#d1d5db;font-size:14px;margin:0 0 24px;">
            Head to your dashboard to get started — we're excited to have you as part of the Academix instructor community!
          </p>
          <div style="text-align:center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/instructor"
               style="display:inline-block;padding:12px 28px;background:#fcd34d;color:#1a1a2e;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">
              Go to Instructor Dashboard →
            </a>
          </div>
        </div>
        <div style="background:#111827;padding:16px 32px;text-align:center;border-top:1px solid #374151;">
          <p style="color:#6b7280;font-size:12px;margin:0;">© ${new Date().getFullYear()} Academix. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
