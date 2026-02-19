export const paymentFailureEmail = (name, amount, orderId, reason = 'Unknown error') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
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
          background-color: #f44336;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 30px;
          color: #333;
        }
        .error-icon {
          text-align: center;
          font-size: 60px;
          color: #f44336;
          margin-bottom: 20px;
        }
        .details {
          background-color: #fff3cd;
          padding: 20px;
          border-left: 4px solid #ffc107;
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
        .retry-button {
          background-color: #2196F3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <div class="error-icon">✗</div>
          <h2>We couldn't process your payment, ${name}</h2>
          <p>Unfortunately, your payment could not be completed at this time.</p>

          <div class="details">
            <h3>Transaction Details</h3>
            <p><strong>Amount:</strong> ₹${amount}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <h3>What you can do:</h3>
          <ul>
            <li>Check if your payment method has sufficient funds</li>
            <li>Verify your card details are correct</li>
            <li>Try using a different payment method</li>
            <li>Contact your bank if the issue persists</li>
          </ul>

          <p>You can retry your purchase anytime. The courses will be waiting for you!</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button retry-button">Try Again</a>
            <a href="${process.env.FRONTEND_URL}/contact" class="button">Contact Support</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Academix. All rights reserved.</p>
          <p>If you need help, please contact our support team at support@academix.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}
