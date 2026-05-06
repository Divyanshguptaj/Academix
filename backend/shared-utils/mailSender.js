import nodemailer from 'nodemailer'

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: 'Academix | StudyNotion',
      to: email,
      subject: title,
      html: body,
    })

    console.log('Email sent successfully:', info.response)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export default mailSender
