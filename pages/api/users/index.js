import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
const KEY = process.env.JWT_KEY;
const EMAIL = process.env.email;
const PASSWORD = process.env.password;

export default async function handler(req, res) {
	let token;
	token = req.headers["authorization"];
	if (!["GET"].includes(req.method)) {
		return res.status(405).json({
			status: "error",
			success: false,
			message: "Method Not Allowed",
		});
	}
	if (!token) {
		return res.status(499).json({
			status: "error",
			success: false,
			message: "Authentication token required",
		});
	}
	try {
		token = token.split(" ")[1];
		const decode = jwt.verify(token, KEY);
		const client = await clientPromise;
		const db = client.db();
		const db_collection = process.env.user_collections;

		if (req.method == "GET") {
			if (decode.email === EMAIL && decode.password === PASSWORD) {
				return res.status(200).json({
					status: "success",
					success: true,
					data: await db
						.collection(db_collection)
						.find({})
						// .limit(10)
						.toArray(),
				});
			} else {
				const user = await db
					.collection(db_collection)
					.findOne({ _id: ObjectId(decode._id) });
				return res.status(200).json({
					status: "success",
					success: true,
					data: user,
				});
			}
		}
	} catch (error) {
		return res.status(400).json({
			status: "error",
			success: false,
			message: error,
		});
	}
}
