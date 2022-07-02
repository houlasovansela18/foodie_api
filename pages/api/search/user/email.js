import clientPromise from "../../../../lib/mongodb";
import { validationResult } from "express-validator";
import { validateEmail } from "../../../../lib/validate";
import { clientEmail } from "../../../../lib/SMTPClient";

export default async function handler(req, res) {
	if (req.method != "POST") {
		return res.status(405).send({
			status: "error",
			success: false,
			error: "Only POST requests allowed",
		});
	}
	await validateEmail(req, res);
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			status: "error",
			success: false,
			error: errors.array()[0].msg,
		});
	}
	const body = req.body;
	const device = body.device;
	const clientDB = await clientPromise;
	const db = clientDB.db();
	const db_collection = process.env.user_collections;
	const gmail = process.env.gmail;
	const users = await db
		.collection(db_collection)
		.find({ email: body.email, userType: "foodie-user" })
		.toArray();
	users.forEach((user) => {
		clientEmail.send({
			text: `
				\nHello! ${user.username}
				\nIs real device: ${device.isDevice}
				\nBrand: ${device.brand}
				\nDeviceName: ${device.deviceName}
				\nModelName: ${device.modalName}
				\nOS: ${device.osName}
				\nVersion: ${device.osVersion} 
				\nis trying to change your password.
				\nContact us(${gmail}) if this isn't you!
				\nThank FOODIE team!`,
			from: `FOODIE <${gmail}>`,
			to: `<${body.email}>`,
			subject: "[FOODIE] Password reset notice from FOODIE",
		});
	});
	return res.status(200).json({
		status: "success",
		success: true,
		data: users,
	});
}
