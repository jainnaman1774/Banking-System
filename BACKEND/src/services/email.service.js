require('dotenv').config();
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Generic email sender
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Registration email
const sendRegistrationEmail = async (userEmail, name) => {
  const subject = 'Welcome to Backend Ledger';

  const text = `
Hello ${name},

Thanks for registering with Backend Ledger.
We're excited to have you on board.

Best Regards,
The Backend Ledger Team
  `;

  const html = `
    <h1>Welcome to Backend Ledger</h1>
    <p>Hello ${name},</p>
    <p>
      Thanks for registering with Backend Ledger.
      We're excited to have you on board.
    </p>
    <br>
    <p>
      Best Regards,<br>
      The Backend Ledger Team
    </p>
  `;

  await sendEmail(userEmail, subject, text, html);
};

//Send Transection Email
// Transaction success email
const sendTransactionEmail = async (userEmail, name, amount, toAccount) => {
  const subject = 'Transaction Successful';

  const text = `
Hello ${name},

Your transaction was completed successfully.

Amount: ${amount || 'N/A'}
To Account: ${toAccount || 'N/A'}

Thank you,
The Backend Ledger Team
  `;

  const html = `
    <h1>Transaction Successful</h1>
    <p>Hello ${name},</p>
    <p>Your transaction was completed successfully.</p>
    <ul>
      <li><strong>Amount:</strong> ${amount || 'N/A'}</li>
      <li><strong>To Account:</strong> ${toAccount || 'N/A'}</li>
    </ul>
    <p>Thank you,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
};

// Transaction failure email
const sendTransactionFailureEmail = async (userEmail, name, amount, toAccount, reason) => {
  const subject = 'Transaction Failed';

  const text = `
Hello ${name},

We could not complete your transaction.

Amount: ${amount || 'N/A'}
To Account: ${toAccount || 'N/A'}
Reason: ${reason || 'Please try again later.'}

If you need help, please contact support.

The Backend Ledger Team
  `;

  const html = `
    <h1>Transaction Failed</h1>
    <p>Hello ${name},</p>
    <p>We could not complete your transaction.</p>
    <ul>
      <li><strong>Amount:</strong> ${amount || 'N/A'}</li>
      <li><strong>To Account:</strong> ${toAccount || 'N/A'}</li>
      <li><strong>Reason:</strong> ${reason || 'Please try again later.'}</li>
    </ul>
    <p>If you need help, please contact support.<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
};

module.exports = {
  //   sendEmail,
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};