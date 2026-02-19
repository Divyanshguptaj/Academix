import nodemailer from 'nodemailer'

const mailSender = async (email, title, body) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    })

    // Send email
    const info = await transporter.sendMail({
      from: `"Academix" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body
    })

    console.log('Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export default mailSender
