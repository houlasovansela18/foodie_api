import clientPromise from "../../../lib/mongodb";
import { validationResult } from "express-validator";
import { validateResetPassword } from "../../../lib/validate";

export default async function handler(req, res) {
	if (req.method != "POST") {
		return res.status(405).send({
			status: "error",
			success: false,
			error: "Only POST requests allowed",
		});
	}
	try {
		await validateResetPassword(req, res);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({
				status: "error",
				success: false,
				error: errors.array()[0].msg,
			});
		}
		const body = req.body;
		const clientDB = await clientPromise;
		const db = clientDB.db();
		const db_collection = process.env.user_collections;
		const updateResult = await db
			.collection(db_collection)
			.updateOne({ email: body.email }, { $set: { password: body.password } });

		return res.status(200).json({
			status: "success",
			success: true,
			message: "Reset password successfully!",
			data: updateResult,
		});
	} catch (error) {
		return res.status(502).json({
			status: "error",
			success: false,
			error: error,
		});
	}
}
