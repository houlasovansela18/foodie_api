import { clientEmail } from "../../../lib/SMTPClient";

const gfg = () => {
	return ("" + Math.random()).substring(2, 8);
};

export default async function handler(req, res) {
	if (req.method != "POST") {
		return res.status(405).send({
			status: "error",
			success: false,
			error: "Only POST requests allowed",
		});
	}
	try {
		const body = req.body;
		const gmail = process.env.gmail;
		const passcode = gfg();
		if (body.email)
			await clientEmail.sendAsync({
				text: `
				\nHello!, ${body.email}.
				\nThis is your verification passcode: ${passcode}
				\nThank FOODIE team!`,
				from: `FOODIE <${gmail}>`,
				to: `<${body.email}>`,
				subject: "[FOODIE] Verification passcode from FOODIE",
			});
		return res.status(200).json({
			status: "success",
			success: true,
			data: {
				email: body.email,
				passcode: passcode,
			},
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			success: false,
			error: error,
		});
	}
}
