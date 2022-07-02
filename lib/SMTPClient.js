import { SMTPClient } from "emailjs";
const gmail = process.env.gmail;
const gmail_password = process.env.gmail_password;

const clientEmail = new SMTPClient({
	user: gmail,
	password: gmail_password,
	host: "smtp.gmail.com",
	port: 465,
	ssl: true,
});
export { clientEmail };
