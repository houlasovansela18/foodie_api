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
	try {
		const users = await db
			.collection(db_collection)
			.findOne({ email: body.email, userType: "foodie-user" });
		if (body.email)
			await clientEmail.sendAsync({
				text: `
					\nHello! ${users.username}
					\nIs real device: ${device.isDevice ? device.isDevice : "false"}
					\nBrand: ${device.brand ? device.brand : "Invalid Brand"}
					\nDeviceName: ${device.deviceName ? device.deviceName : "Invalid DeviceName"}
					\nModelName: ${device.modalName ? device.modalName : "Invalid ModelName"}
					\nOS: ${device.osName ? device.osName : "Invalid OS"}
					\nVersion: ${device.osVersion ? device.osVersion : "Invalid Version"} 
					\nis trying to change your password.
					\nContact us(${gmail}) if this isn't you!
					\nThank FOODIE team!`,
				from: `<${gmail}>`,
				to: `<${body.email}>`,
				subject: "[FOODIE] Password reset notice from FOODIE",
			});
		return res.status(200).json({
			status: "success",
			success: true,
			data: [users],
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			success: false,
			error: error,
		});
	}
}
