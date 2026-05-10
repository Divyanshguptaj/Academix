export const refundApprovedEmail = (firstName, amount, courseName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Approved</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; color: #333; }
        .icon { text-align: center; font-size: 60px; color: #4CAF50; margin-bottom: 20px; }
        .details { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details p { margin: 10px 0; }
        .notice { background-color: #fff8e1; border-left: 4px solid #FFC107; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #555; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; color: #777; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Approved</h1>
        </div>
        <div class="content">
          <div class="icon">✓</div>
          <h2>Hi ${firstName}, your refund has been approved!</h2>
          <p>We have processed your refund request for <strong>${courseName}</strong>. The amount will be credited back to your original payment method.</p>

          <div class="details">
            <h3>Refund Details</h3>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Refund Amount:</strong> ₹${amount}</p>
            <p><strong>Processed On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="notice">
            ⏱ Refunds typically appear within <strong>5–7 business days</strong> depending on your bank or payment provider. Your access to <strong>${courseName}</strong> has been revoked.
          </div>

          <p>If you have any questions or do not receive your refund within 7 business days, please reach out to our support team.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard/enrolled-courses" class="button">Go to My Courses</a>
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
