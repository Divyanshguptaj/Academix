export const instructorRejectionEmail = (firstName, rejectionReason) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instructor Application Update</title>
    </head>
    <body style="font-family:Arial,sans-serif;margin:0;padding:0;background-color:#0f0f1a;">
      <div style="max-width:600px;margin:20px auto;background:#1a1a2e;border-radius:12px;border:1px solid #374151;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e1e3f,#3f1e1e);padding:28px 32px;text-align:center;">
          <h1 style="color:#fcd34d;margin:0;font-size:24px;font-weight:700;">Instructor Application Update</h1>
          <p style="color:#f87171;margin:8px 0 0;font-size:14px;">Regarding your application on Academix</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#e5e7eb;font-size:15px;margin:0 0 16px;">Hi <strong style="color:#fff;">${firstName}</strong>,</p>
          <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 16px;">
            Thank you for your interest in becoming an instructor on <strong style="color:#fcd34d;">Academix</strong>.
            After careful review, we were unable to approve your application at this time.
          </p>
          ${rejectionReason ? `
          <div style="background:#2a1010;border-left:3px solid #ef4444;border-radius:0 8px 8px 0;padding:16px;margin:20px 0;">
            <p style="color:#fca5a5;font-size:13px;font-weight:600;margin:0 0 6px;">Reason for rejection:</p>
            <p style="color:#fecaca;font-size:13px;margin:0;line-height:1.5;">${rejectionReason}</p>
          </div>` : ''}
          <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:16px 0;">
            We encourage you to address the feedback above and re-apply. You have up to <strong style="color:#fff;">3 application attempts</strong> total.
          </p>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/become-instructor"
               style="display:inline-block;padding:12px 28px;background:#fcd34d;color:#1a1a2e;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">
              Re-apply as Instructor →
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
