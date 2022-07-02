import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";

const KEY = process.env.JWT_KEY;

export default async function handler(req, res) {
	let token;
	token = req.headers["authorization"];
	if (!["PUT", "GET", "DELETE"].includes(req.method)) {
		return res.status(405).json({
			status: "error",
			error: "Method Not Allowed",
		});
	}
	if (!token) {
		return res.status(499).json({
			status: "error",
			error: "Authentication token required",
		});
	}
	try {
		token = token.split(" ")[1];
		const decode = jwt.verify(token, KEY);
		const client = await clientPromise;
		const db = client.db();
		const db_collection = process.env.user_collections;

		if (req.method == "GET") {
			const user = await db
				.collection(db_collection)
				.findOne({ _id: ObjectId(decode._id) });
			return res.status(200).json({
				status: "success",
				message: "fetch user successfully",
				data: user,
			});
		}
		if (req.method == "DELETE") {
			const deleteUser = await db
				.collection(db_collection)
				.deleteOne({ _id: ObjectId(decode._id) });
			return res.status(200).json({
				status: "success",
				message: "delete user successfully",
				data: deleteUser,
			});
		}
		if (req.method == "PUT") {
			const user = req.body;
			if (!user)
				return res.status(403).json({
					status: "error",
					error: "request body is required",
				});
			await db
				.collection(db_collection)
				.updateOne({ _id: ObjectId(decode._id) }, { $set: user });
			const userData = await db
				.collection(db_collection)
				.findOne({ _id: ObjectId(decode._id) });
			if (!userData)
				return res.status(403).json({
					status: "error",
					error: "update user is not found!",
				});
			return res.status(200).json({
				status: "success",
				message: "update user successfully",
				token: jwt.sign(userData, KEY),
				userInfo: userData,
			});
		}
	} catch (error) {
		return res.status(502).json({
			status: "error",
			error: error,
		});
	}
}
