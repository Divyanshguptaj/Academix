export const paymentFailureEmail = (name, amount, orderId, paymentId, refundId) => {
  return `<!DOCTYPE html>
  <html>

  <head>
      <meta charset="UTF-8">
      <title>Payment Failed - Refund Initiated</title>
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
              color: #dc2626;
          }

          .body {
              font-size: 16px;
              margin-bottom: 20px;
          }

          .payment-details {
              background-color: #fef2f2;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
              border-left: 4px solid #dc2626;
          }

          .payment-details h3 {
              margin-top: 0;
              color: #b91c1c;
          }

          .payment-details p {
              margin: 8px 0;
          }

          .highlight {
              font-weight: bold;
              color: #dc2626;
          }

          .refund-info {
              background-color: #fffbeb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
              border-left: 4px solid #d97706;
          }

          .refund-info h3 {
              margin-top: 0;
              color: #92400e;
          }

          .refund-info p {
              margin: 8px 0;
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

          .status-badge {
              display: inline-block;
              padding: 4px 12px;
              background-color: #fee2e2;
              color: #dc2626;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              border: 1px solid #fecaca;
          }

          .refund-badge {
              display: inline-block;
              padding: 4px 12px;
              background-color: #fffbeb;
              color: #d97706;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              border: 1px solid #fde68a;
          }
      </style>
  </head>

  <body>
      <div class="container">
          <a href="https://academix-sigma.vercel.app/">
              <img class="logo" src="https://www.kindpng.com/picc/m/129-1299556_transparent-fail-payment-failed-failed-icon-hd-png.png" alt="StudyNotion Logo">
          </a>

          <div class="message">Payment Failed - Refund Initiated ⚠️</div>

          <div class="body">
              <p>Dear <span class="highlight">${name}</span>,</p>
              <p>We regret to inform you that your recent payment could not be completed successfully. However, we have automatically initiated a refund for the full amount.</p>

              <div class="payment-details">
                  <h3>Payment Details</h3>
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <p><strong>Payment ID:</strong> ${paymentId}</p>
                  <p><strong>Amount:</strong> ₹${amount}</p>
                  <p><strong>Payment Status:</strong> <span class="status-badge">Failed</span></p>
              </div>

              <div class="refund-info">
                  <h3>Refund Information</h3>
                  <p><strong>Refund Status:</strong> <span class="refund-badge">Initiated</span></p>
                  <p><strong>Refund Amount:</strong> ₹${amount}</p>
                  <p><strong>Refund ID:</strong> ${refundId || 'Processing'}</p>
                  <p><strong>Timeline:</strong> The refund will be processed back to your original payment method within 5-7 business days.</p>
                  <p><strong>Note:</strong> Please allow 2-3 additional business days for the refund to reflect in your account, depending on your bank's processing time.</p>
              </div>

              <p>We apologize for any inconvenience this may have caused. If you believe this is an error or if you have any questions about this transaction, please don't hesitate to contact our support team.</p>

              <p>If you'd like to try the payment again, you can visit your dashboard to retry the enrollment.</p>
          </div>

          <div class="support">
              If you need assistance or have questions about this transaction, please contact our support team at
              <a href="mailto:support@studynotion.com">support@studynotion.com</a>
              or reply to this email.
          </div>

          <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 StudyNotion. All rights reserved.</p>
          </div>
      </div>
  </body>

  </html>`;
};