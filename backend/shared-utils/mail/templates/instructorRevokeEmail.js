export const instructorRevokeEmail = (firstName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instructor Access Update</title>
    </head>
    <body style="font-family:Arial,sans-serif;margin:0;padding:0;background-color:#0f0f1a;">
      <div style="max-width:600px;margin:20px auto;background:#1a1a2e;border-radius:12px;border:1px solid #374151;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e1e3f,#3f2a0a);padding:28px 32px;text-align:center;">
          <h1 style="color:#fcd34d;margin:0;font-size:24px;font-weight:700;">Instructor Access Update</h1>
          <p style="color:#fb923c;margin:8px 0 0;font-size:14px;">Your instructor access has been revoked</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#e5e7eb;font-size:15px;margin:0 0 16px;">Hi <strong style="color:#fff;">${firstName}</strong>,</p>
          <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 16px;">
            We're writing to inform you that your instructor access on <strong style="color:#fcd34d;">Academix</strong>
            has been <strong style="color:#fb923c;">revoked</strong> by an administrator.
          </p>
          <div style="background:#1a1208;border:1px solid #92400e;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="color:#fde68a;font-size:13px;font-weight:600;margin:0 0 8px;">What this means for you:</p>
            <p style="color:#fcd34d;margin:4px 0;font-size:13px;">• Your existing courses remain published for enrolled students</p>
            <p style="color:#fcd34d;margin:4px 0;font-size:13px;">• You can no longer create new courses</p>
            <p style="color:#fcd34d;margin:4px 0;font-size:13px;">• Your account has been set to Student</p>
          </div>
          <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:16px 0;">
            If you believe this was made in error or would like to re-apply, you can submit a new instructor
            application from your dashboard.
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
