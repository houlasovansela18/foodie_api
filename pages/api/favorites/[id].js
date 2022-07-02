import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
const KEY = process.env.JWT_KEY;

export default async function handler(req, res) {
	let token;
	const id = req.query;
	token = req.headers["authorization"];
	if (!["GET", "PUT", "DELETE"].includes(req.method)) {
		return res.status(405).json({
			status: "error",
			success: false,
			error: "Method Not Allowed!",
		});
	}
	if (!token) {
		return res.status(499).json({
			status: "error",
			success: false,
			error: "Authentication token required!",
		});
	}
	try {
		token = token.split(" ")[1];
		jwt.verify(token, KEY);
		const client = await clientPromise;
		const db = client.db();
		const db_collection = process.env.favorite_collections;
		if (req.method == "GET") {
			const recipe = await db
				.collection(db_collection)
				.findOne({ _id: ObjectId(id) });
			return res.status(200).json({
				status: "success",
				success: true,
				recipe: recipe,
			});
		} else if (req.method == "PUT") {
			const recipe = req.body;
			const updatedRecipe = await db
				.collection(db_collection)
				.updateOne({ _id: ObjectId(id) }, { $set: recipe });
			return res.status(200).json({
				status: "success",
				success: updatedRecipe.acknowledged,
				matchedCount: updatedRecipe.matchedCount,
				modifiedCount: updatedRecipe.modifiedCount,
			});
		} else if (req.method == "DELETE") {
			const deleteRecipe = await db
				.collection(db_collection)
				.deleteOne({ _id: ObjectId(id) });
			return res.status(200).json({
				status: "success",
				success: deleteRecipe.acknowledged,
				deleteCounts: deleteRecipe.deletedCount,
			});
		}
	} catch (error) {
		return res.status(400).json({
			status: "error",
			success: false,
			error: error,
		});
	}
}
