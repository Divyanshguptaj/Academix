import nodemailer from 'nodemailer'

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_FROM,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    })

    const info = await transporter.sendMail({
      from: `Academix <${process.env.MAIL_FROM}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log('Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error.message)
    throw error
  }
}

export default mailSender
