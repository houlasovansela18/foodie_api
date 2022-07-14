import clientPromise from "../../../lib/mongodb";
import { clientEmail } from "../../../lib/SMTPClient";
import { validationResult } from "express-validator";
import {
	validateUserType,
	validateFoodieUserSignUp,
	validateUserAccountSignUp,
} from "../../../lib/validate";

const EMAIl = process.env.email;
const PASSWORD = process.env.password;

export default async function handler(req, res) {
	if (req.method != "POST") {
		return res.status(405).send({
			status: "error",
			error: "Only POST requests allowed",
		});
	}
	await validateUserType(req, res);
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			status: "error",
			error: errors.array()[0].msg,
		});
	}
	try {
		const client = await clientPromise;
		const db = client.db();
		const db_collection = process.env.user_collections;
		const userData = req.body;
		const gmail = process.env.gmail;
		if (userData.userType === "foodie-user") {
			let user;
			await validateFoodieUserSignUp(req, res);
			const errors = validationResult(req);
			if (!errors.isEmpty())
				return res.status(422).json({
					status: "error",
					error: errors.array()[0].msg,
				});
			const d = new Date();
			if (userData.email === EMAIl && userData.password === PASSWORD) {
				user = await db.collection(db_collection).insertOne({
					...userData,
					role: ["admin"],
					createDate: d.toDateString(),
				});
			} else {
				user = await db.collection(db_collection).insertOne({
					...userData,
					createDate: d.toDateString(),
				});
			}
			await clientEmail
				.sendAsync({
					text: `
					\nWelcome! ${userData.username} to FOODIE Application.
					\nHope you enjoy!
					\nThank FOODIE team!`,
					from: `FOODIE <${gmail}>`,
					to: `<${userData.email}>`,
					subject: "[FOODIE] New user register from FOODIE",
				})
				.then((message) => {
					console.log(message);
					return res.status(200).json({
						status: user ? "success" : "error",
						message: user
							? "User created successfully"
							: "Failed to register user",
					});
				})
				.catch((message) => {
					console.log(message);
				});
		}
		await validateUserAccountSignUp(req, res);
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(422).json({
				status: "error",
				error: errors.array()[0].msg,
			});
		const d = new Date();
		const user = await db.collection(db_collection).insertOne({
			...userData,
			createDate: d.toDateString(),
		});
		await clientEmail
			.sendAsync({
				text: `
				\nWelcome! ${userData.username} to FOODIE Application.
				\nHope you enjoy!
				\nThank FOODIE team!`,
				from: `FOODIE <${gmail}>`,
				to: `<${userData.email}>`,
				subject: "[FOODIE] New user register from FOODIE",
			})
			.then((message) => {
				console.log(message);
				return res.status(200).json({
					status: user ? "success" : "error",
					message: user
						? "User created successfully"
						: "Failed to register user",
				});
			})
			.catch((message) => {
				console.log(message);
			});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			error: error,
		});
	}
}
