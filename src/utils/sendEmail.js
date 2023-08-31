import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html, attachments }) => {
  // sender
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Receiver
  const emaiInfo = await transporter.sendMail({
    from: `"E-Commerce App" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
    attachments,
  });

  return emaiInfo.accepted.length < 1 ? false : true;
};

export default sendEmail;
