const nodemailer =  require('nodemailer')

const user = process.env.NODE_EMAIL_USER
const pass = process.env.NODE_EMAIL_PWD
const service = process.env.NODE_EMAIL_SERVICE

const authObj = {
    service,
    auth: { user, pass }
}

const sendEmailService = async options => {
    try {
        let {
          toEmail,
          fromEmail,
          cc,
          bcc,
          subject,
          htmlMessage: message,
          plainMessage: altText
        } = options
        
        // if (process.env.NODE_ENV !== 'production') {
        //   message = `${message} <br> TO: ${JSON.stringify(
        //     toEmail
        //   )} FROM: ${fromEmail} CC: ${JSON.stringify(cc)} BCC: ${
        //     bcc ? JSON.stringify(bcc) : ''
        //   }`
        //   toEmail = process.env.TEST_EMAIL
        //   cc = process.env.CC_TEST_EMAIL
        //   bcc = ''
        // }
    
        if (!subject) {
          throw new Error('Subject is required to send the email')
        }
    
        if (!message && !altText) {
          throw new Error(
            'At least htmlMessage or plainMessage is required to send the mail '
          )
        }
    
        if (!toEmail && !cc && !bcc) {
          throw new Error('At least one recipient is required ')
        }
    
        if (!fromEmail) {
          throw new Error('Sender email is required')
        }
      
        let sendEmailObject = {
          from: fromEmail,
          subject
        }
        if (toEmail) {
          sendEmailObject.to = toEmail
        }
    
        if (cc) {
          sendEmailObject.cc = cc
        }
    
        if (bcc) {
          sendEmailObject.bcc = bcc
        }
    
        if (message) {
          sendEmailObject.html = message
        }
    
        if (altText) {
          sendEmailObject.text = altText
        }
        
        const client = nodemailer.createTransport(authObj)
        return new Promise((resolve, reject) => {
            client.sendMail({ ...sendEmailObject }, (err, response) => {
                if (err) {
                    reject(err)
                }
                resolve(response)
            })
        })
    } catch (err) {
        throw err
    }
}

module.exports = {
  sendEmailService
}