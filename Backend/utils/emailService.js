import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email notification
 */
export const sendEmailNotification = async (to, subject, html) => {
  try {
   // console.log("email started");
    const mailOptions = {
      from: `"Fleet Management" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };
//console.log("mailOptions", mailOptions);

    await transporter.sendMail(mailOptions);
    console.log(`📩 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};