export const paymentSuccessEmail = (name, amount, orderId, paymentId) => {
  return `<!DOCTYPE html>
  <html>

  <head>
      <meta charset="UTF-8">
      <title>Payment Confirmation</title>
      <style>
          body {
              background-color: #ffffff;
              font-family: Arial, sans-serif;
              font-size: 16px;
              line-height: 1.4;
              color: #333333;
              margin: 0;
              padding: 0;
          }

          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
          }

          .logo {
              max-width: 200px;
              margin-bottom: 20px;
          }

          .message {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #2563eb;
          }

          .body {
              font-size: 16px;
              margin-bottom: 20px;
          }

          .payment-details {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
              border-left: 4px solid #2563eb;
          }

          .payment-details h3 {
              margin-top: 0;
              color: #1e40af;
          }

          .payment-details p {
              margin: 8px 0;
          }

          .highlight {
              font-weight: bold;
              color: #2563eb;
          }

          .cta {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-size: 16px;
              font-weight: bold;
              margin-top: 20px;
          }

          .support {
              font-size: 14px;
              color: #64748b;
              margin-top: 30px;
          }

          .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #64748b;
          }
      </style>
  </head>

  <body>
      <div class="container">
          <a href="https://studynotion-edtech-project.vercel.app">
              <img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo">
          </a>

          <div class="message">Payment Successful! 🎉</div>

          <div class="body">
              <p>Dear <span class="highlight">${name}</span>,</p>
              <p>Thank you for your payment! We have successfully received your payment and your transaction has been completed.</p>

              <div class="payment-details">
                  <h3>Payment Details</h3>
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <p><strong>Payment ID:</strong> ${paymentId}</p>
                  <p><strong>Amount Paid:</strong> ₹${amount}</p>
                  <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">Successful</span></p>
              </div>

              <p>You can now access your purchased courses in your dashboard. If you have any questions about your courses or need assistance, please don't hesitate to reach out to us.</p>

              <a href="https://studynotion-edtech-project.vercel.app/dashboard" class="cta">Go to Dashboard</a>
          </div>

          <div class="support">
              If you have any questions or need further assistance, please contact our support team at
              <a href="mailto:support@studynotion.com">support@studynotion.com</a>
          </div>

          <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 StudyNotion. All rights reserved.</p>
          </div>
      </div>
  </body>

  </html>`;
};
