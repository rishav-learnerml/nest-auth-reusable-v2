export const OTP_TEMPLATE = {
  verify_email: {
    subject: 'Verify your email - Action Required',
    getHtml: (firstname: string, otp: string) => `
           <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; padding: 30px; text-align: center;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <img src="https://nestjs.com/img/logo_text.svg" alt="Nest-logo" style="width: 120px; margin-bottom: 20px; text:center" />
              <h2 style="color: #333333;">Verify Your Email</h2>
              <p style="color: #555; font-size: 15px;">
                Hello <b>${firstname || 'User'}</b>,<br/>
                Please use the following One-Time Password (OTP) to verify your email address:
              </p>
              
              <div style="margin: 20px 0; font-size: 24px; font-weight: bold; color: #2c7be5; letter-spacing: 2px;">
                ${otp}
              </div>
        
              <p style="color: #999; font-size: 13px;">
                This OTP will expire in <b>5 minutes</b>. Do not share it with anyone for your security.
              </p>
        
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
              <p style="color: #aaa; font-size: 12px;">
                If you didn’t request this, please ignore this email.
              </p>
            </div>
          </div>
        `,
  },

  reset_password: {
    subject: 'Reset Your Password - Action Required',
    getHtml: (firstname: string, reset_link: string) => `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; padding: 30px; text-align: center;">
        <div style="max-width: 580px; margin: auto; background: #ffffff; border-radius: 10px; padding: 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: left;">
          
          <div style="text-align:center;">
            <img src="https://nestjs.com/img/logo_text.svg" alt="Nest-logo" style="width: 120px; margin-bottom: 18px;" />
            <h2 style="color: #333333; margin-top: 0;">Reset Your Password</h2>
          </div>

          <p style="color: #555; font-size: 15px;">
            Hello <b>${firstname || 'User'}</b>,
          </p>

          <p style="color: #555; font-size: 15px; line-height: 1.5;">
            We received a request to reset the password for your account. Click the button below to set a new password. This link is single-use and will expire in <b>15 minutes</b>.
          </p>

          <div style="text-align: center; margin: 22px 0;">
            <a href="${reset_link}" target="_blank" rel="noopener noreferrer"
               style="display: inline-block; padding: 12px 22px; border-radius: 8px; background: linear-gradient(90deg,#2c7be5,#1b6fd8); color: #fff; font-weight: 600; text-decoration: none; box-shadow: 0 6px 20px rgba(44,123,229,0.18);">
              Reset Password
            </a>
          </div>

          <p style="color: #777; font-size: 13px; word-break: break-word;">
            If the button doesn't work, copy and paste this link into your browser:
            <br/>
            <a href="${reset_link}" target="_blank" rel="noopener noreferrer" style="color: #1b6fd8; text-decoration: none; font-size: 13px;">
              ${reset_link}
            </a>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

          <p style="color: #999; font-size: 13px;">
            If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
          </p>

          <p style="color: #aaa; font-size: 12px; margin-top: 8px;">
            Need help? Reply to this email and our support team will assist you.
          </p>
        </div>
      </div>
    `,
  },
};
