export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: Date
}

// Email templates
export const emailTemplates = {
  reply: (customerName: string, originalMessage: string, replyMessage: string): EmailTemplate => ({
    subject: `Re: ${originalMessage}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reply from Thrift Haven</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .message-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #374151; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thrift Haven</h1>
              <p>Customer Support Response</p>
            </div>
            
            <div class="content">
              <h2>Hello ${customerName},</h2>
              
              <p>Thank you for contacting us. We have received your message and are happy to help!</p>
              
              <div class="message-box">
                <h3>Your Original Message:</h3>
                <p><em>"${originalMessage}"</em></p>
              </div>
              
              <div class="message-box">
                <h3>Our Response:</h3>
                <p>${replyMessage}</p>
              </div>
              
              <p>If you have any further questions, please don't hesitate to contact us again.</p>
              
              <a href="mailto:support@thrifthaven.com" class="button" style="background: #374151; color: white; text-decoration: none;">Contact Support</a>
              
              <div class="footer">
                <p>Best regards,<br>
                <strong>Thrift Haven Customer Support Team</strong></p>
                
                <p>
                  📧 support@thrifthaven.com<br>
                  📞 +62 123 456 7890<br>
                  📍 Jakarta, Indonesia
                </p>
                
                <p><small>This is an automated response from our customer support system.</small></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${customerName},

Thank you for contacting Thrift Haven. We have received your message and are happy to help!

Your Original Message:
"${originalMessage}"

Our Response:
${replyMessage}

If you have any further questions, please don't hesitate to contact us again.

Best regards,
Thrift Haven Customer Support Team

Email: support@thrifthaven.com
Phone: +62 123 456 7890
Address: Jakarta, Indonesia
    `
  }),

  resolved: (customerName: string, originalSubject: string): EmailTemplate => ({
    subject: `Resolved: ${originalSubject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Issue Resolved - Thrift Haven</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; color: #059669; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thrift Haven</h1>
              <p>Issue Resolved</p>
            </div>
            
            <div class="content">
              <div class="success-icon">✅</div>
              
              <h2>Hello ${customerName},</h2>
              
              <p>Great news! Your support request regarding "<strong>${originalSubject}</strong>" has been successfully resolved.</p>
              
              <p>We hope our solution met your expectations. If you have any additional questions or concerns, please don't hesitate to reach out to us.</p>
              
              <p>Thank you for choosing Thrift Haven!</p>
              
              <a href="mailto:support@thrifthaven.com" class="button" style="background: #374151; color: white; text-decoration: none;">Contact Support</a>
              
              <div class="footer">
                <p>Best regards,<br>
                <strong>Thrift Haven Customer Support Team</strong></p>
                
                <p>
                  📧 support@thrifthaven.com<br>
                  📞 +62 123 456 7890<br>
                  📍 Jakarta, Indonesia
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${customerName},

Great news! Your support request regarding "${originalSubject}" has been successfully resolved.

We hope our solution met your expectations. If you have any additional questions or concerns, please don't hesitate to reach out to us.

Thank you for choosing Thrift Haven!

Best regards,
Thrift Haven Customer Support Team

Email: support@thrifthaven.com
Phone: +62 123 456 7890
Address: Jakarta, Indonesia
    `
  })
}

// Send email function using Resend API
export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  try {
    // Check if we have Resend API key for production
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      // Development mode: log email content
      console.log('=== EMAIL SENT (DEVELOPMENT MODE) ===')
      console.log('To:', to)
      console.log('Subject:', template.subject)
      console.log('Text:', template.text)
      console.log('HTML:', template.html)
      console.log('=====================================')
      return true
    }

    // Production mode: Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Thrift Haven Support <support@thrifthaven.com>',
        to: [to],
        subject: template.subject,
        text: template.text,
        html: template.html,
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Email sent successfully via Resend:', result.id)
      return true
    } else {
      const error = await response.json()
      console.error('Resend API error:', error)
      return false
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Send reply email
export async function sendReplyEmail(
  customerEmail: string,
  customerName: string,
  originalSubject: string,
  replyMessage: string
): Promise<boolean> {
  const template = emailTemplates.reply(customerName, originalSubject, replyMessage)
  return await sendEmail(customerEmail, template)
}

// Send resolved email
export async function sendResolvedEmail(
  customerEmail: string,
  customerName: string,
  originalSubject: string
): Promise<boolean> {
  const template = emailTemplates.resolved(customerName, originalSubject)
  return await sendEmail(customerEmail, template)
}
