export const paymentSuccessEmail = (name, amount, orderId, paymentId) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 30px;
          color: #333;
        }
        .success-icon {
          text-align: center;
          font-size: 60px;
          color: #4CAF50;
          margin-bottom: 20px;
        }
        .details {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .details p {
          margin: 10px 0;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          color: #777;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Successful!</h1>
        </div>
        <div class="content">
          <div class="success-icon">✓</div>
          <h2>Thank you for your purchase, ${name}!</h2>
          <p>Your payment has been processed successfully. You now have access to your enrolled courses.</p>

          <div class="details">
            <h3>Payment Details</h3>
            <p><strong>Amount Paid:</strong> ₹${amount}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p>You can now access your courses from your dashboard.</p>

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
