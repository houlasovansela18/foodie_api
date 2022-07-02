import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
const KEY = process.env.JWT_KEY;

export default async function handler(req, res) {
	let token;
	token = req.headers["authorization"];
	if (!["GET", "POST", "DELETE"].includes(req.method)) {
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
		const decode = jwt.verify(token, KEY);
		const client = await clientPromise;
		const db = client.db();
		const db_collection = process.env.favorite_collections;
		if (req.method == "GET") {
			const favoriteRecipe = await db
				.collection(db_collection)
				.find({ userId: decode._id })
				.toArray();
			return res.status(200).json({
				status: "success",
				success: true,
				favoriteRecipe: favoriteRecipe,
			});
		} else if (req.method == "POST") {
			let favoriteRecipe = req.body;
			if (!Array.isArray(favoriteRecipe)) favoriteRecipe = [favoriteRecipe];
			const d = new Date();
			favoriteRecipe = favoriteRecipe.map((recipe) => {
				return {
					...recipe,
					userId: decode._id,
					createDate: d.toDateString(),
				};
			});
			const insertedRecipe = await db
				.collection(db_collection)
				.insertMany(favoriteRecipe);
			return res.status(200).json({
				status: "success",
				success: insertedRecipe.acknowledged,
				insertedIds: insertedRecipe.insertedIds,
			});
		} else if (req.method == "DELETE") {
			const deleteRecipe = await db
				.collection(db_collection)
				.deleteMany({ userId: decode._id });
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
