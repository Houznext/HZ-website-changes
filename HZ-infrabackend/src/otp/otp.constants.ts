/** Same DLT template IDs as HZ-backend otp.service */
export const DLT_TEMPLATES = {
  LOGIN_OTP: {
    id: '1707176050742281427',
    text: (otp: string) =>
      `Dear User, Your login verification OTP Code is ${otp}. Please do not share this OTP with anyone. Houznext`,
  },
  HOUZNEXT_SMS_OTP: {
    id: '1707176050746186677',
    text: (otp: string) =>
      `Dear User, Your Houznext verification OTP Code is ${otp}. Please do not share this OTP with anyone.`,
  },
};

export function otpEmailHtml(otp: string): string {
  return `
  <div style="font-family:Inter,sans-serif;padding:24px;background:#f5f7fa">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #dde8f5">
      <h2 style="color:#0f2a44;font-family:Montserrat,sans-serif">Your verification code</h2>
      <p style="color:#5a6a7e">Use this OTP to sign in to Houznext Infra:</p>
      <p style="font-size:28px;font-weight:800;letter-spacing:0.2em;color:#2f80ed;font-family:Montserrat,sans-serif">${otp}</p>
      <p style="color:#5a6a7e;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  </div>`;
}
