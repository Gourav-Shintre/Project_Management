import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://task-manager.com/",
    },
  });
  // Generate an HTML email with the provided content
  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

  //this is used when it supports html email so we use generate
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    secure : true, // true for 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  // Define the email options
  const mail = {
    from: "gouravshintre02@gmail.com",
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailHtml,
  };

  // Send the email
  try {
    await transporter.sendMail(mail);
    console.log("email sent successfully",options.email);
    
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to App! We're very excited to have you on board.",
      action: {
        instructions: "To get started with App, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const forgotPasswordVerificationMailgenContent = (
  username,
  passwordResetUrl
) => {
  return {
    body: {
      name: username,
      intro: "We get the request to reset password of your account",
      action: {
        instructions: "To reset password, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordVerificationMailgenContent,
  sendEmail
};
