import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const mailSender = async (email, title, body) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Academix <${process.env.MAIL_FROM || 'onboarding@resend.dev'}>`,
      to: email,
      subject: title,
      html: body,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error(error.message)
    }

    console.log('Email sent successfully:', data.id)
    return data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export default mailSender
