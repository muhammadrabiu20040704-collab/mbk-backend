import { SendPasswordResetOTPInput } from "./email.types.js";

class EmailService {
  async sendPasswordResetOTP({ to, otp }: SendPasswordResetOTPInput) {
    // Development only
    console.log("=================================");
    console.log("📧 PASSWORD RESET OTP");
    console.log(`To: ${to}`);
    console.log(`OTP: ${otp}`);
    console.log("Expires in: 3 minutes");
    console.log("=================================");
  }
}

export const emailService = new EmailService();
