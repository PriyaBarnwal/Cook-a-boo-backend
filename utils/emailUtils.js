import nodemailer from 'nodemailer'
import config from 'config'

const sendEmail = async(options) => {
  //create transporter object
  let transporter = nodemailer.createTransport({
    host: config.get('SMTP_HOST'),
    port: config.get('SMTP_PORT'),
    auth: {
      user: config.get('SMTP_USERNAME'),
      pass: config.get('SMTP_PWD')
    }
  })

  //send mail
  await transporter.sendMail({
    from: "Priyanka <priya.barnwal@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message
  })
}

export default sendEmail