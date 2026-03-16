import Mailjet from 'node-mailjet'

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
)

const mailSender = async (email, title, body) => {
  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: process.env.MAIL_FROM, Name: 'Academix' },
          To: [{ Email: email }],
          Subject: title,
          HTMLPart: body,
        },
      ],
    })

    console.log('Email sent successfully:', result.body.Messages[0].Status)
    return result
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export default mailSender
