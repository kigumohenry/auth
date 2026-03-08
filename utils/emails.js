const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ subject, html, to }) => {
  try {
    const info = await transporter.sendMail({
      to,
      html,
      subject,
      from: process.env.EMAIL_FROM,
    });
    console.info(info);
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendEmail;
