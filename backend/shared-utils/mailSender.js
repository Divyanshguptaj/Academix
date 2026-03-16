import * as Brevo from '@getbrevo/brevo'

const apiInstance = new Brevo.TransactionalEmailsApi()
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

const mailSender = async (email, title, body) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail()
    sendSmtpEmail.to = [{ email }]
    sendSmtpEmail.sender = { email: process.env.MAIL_FROM, name: 'Academix' }
    sendSmtpEmail.subject = title
    sendSmtpEmail.htmlContent = body

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('Email sent successfully:', result.body?.messageId)
    return result
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export default mailSender
