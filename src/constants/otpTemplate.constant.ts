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
};
