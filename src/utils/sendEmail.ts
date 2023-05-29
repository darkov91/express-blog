import { createTransport } from "nodemailer";

type SendEmailOptions = {
  email: string;
  subject: string;
  message: string;
};

export default async function sendEmail(options: SendEmailOptions) {
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  } as any);

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transport.sendMail(message);
  console.log(`Message sent: `, info.messageId);
}
