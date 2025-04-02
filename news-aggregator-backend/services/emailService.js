const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "meetadarshsnair@gmail.com",
    pass: "ggtagdhvdjmmoiid",
  },
});

export default async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: `"News App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`Email sent: ${info.response}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    return { success: false, error };
  }
}
