export const refundRejectedEmail = (firstName, courseName, reason) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Request Update</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; color: #333; }
        .icon { text-align: center; font-size: 60px; color: #f44336; margin-bottom: 20px; }
        .details { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details p { margin: 10px 0; }
        .reason-box { background-color: #fff3f3; border-left: 4px solid #f44336; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #555; }
        .notice { background-color: #e8f5e9; border-left: 4px solid #4CAF50; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #555; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; color: #777; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Request Update</h1>
        </div>
        <div class="content">
          <div class="icon">✗</div>
          <h2>Hi ${firstName}, we reviewed your refund request.</h2>
          <p>Unfortunately, your refund request for <strong>${courseName}</strong> was not approved after review by our team.</p>

          <div class="details">
            <h3>Request Details</h3>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Decision:</strong> Not Approved</p>
            <p><strong>Reviewed On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          ${reason && reason !== 'Not specified' ? `
          <div class="reason-box">
            <strong>Reason:</strong> ${reason}
          </div>
          ` : ''}

          <div class="notice">
            ✓ Your access to <strong>${courseName}</strong> continues unchanged. You can keep learning!
          </div>

          <p>If you believe this decision was made in error or have further questions, please contact our support team and we will be happy to assist.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard/enrolled-courses" class="button">Continue Learning</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Academix. All rights reserved.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
