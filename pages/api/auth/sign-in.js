import clientPromise from "../../../lib/mongodb";
import { clientEmail } from "../../../lib/SMTPClient";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import {
	validateUserType,
	validateFoodieUserSignIn,
	validateUserAccountSignIn,
} from "../../../lib/validate";

const KEY = process.env.JWT_KEY;

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
		const device = userData.device;
		const gmail = process.env.gmail;
		if (userData.userType === "foodie-user") {
			await validateFoodieUserSignIn(req, res);
			const errors = validationResult(req);
			if (!errors.isEmpty())
				return res.status(422).json({
					status: "error",
					error: errors.array()[0].msg,
				});
			const user = await db
				.collection(db_collection)
				.findOne({ email: userData.email, password: userData.password });
			if (!user)
				return res.status(422).json({
					status: "error",
					error: "invalid username or password",
				});
			const d = new Date();
			const updateUser = {
				...user,
				lastSignIn: d.toDateString(),
			};
			const updatedUserDB = await db
				.collection(db_collection)
				.updateOne(
					{ email: userData.email, userType: userData.userType },
					{ $set: updateUser }
				);
			if (!updatedUserDB.acknowledged)
				return res.status(422).json({
					status: "error",
					error: "unable to update lastSignIn!",
				});
			await clientEmail
				.sendAsync({
					text: `
								\nHello! ${updateUser.username}
								\nBrand: ${device.brand}
								\nDeviceName: ${device.deviceName}
								\nModelName: ${device.modalName}
								\nOS: ${device.osName}
								\nVersion: ${device.osVersion} 
								\nis login to your account.
								\nContact us(${gmail}) if this isn't you!
								\nThank FOODIE team!`,
					from: `FOODIE <${gmail}>`,
					to: `<${updateUser.email}>`,
					cc: `Contact us at <${gmail}>`,
					subject: "[FOODIE] New login notice from FOODIE",
				})
				.then((message) => {
					console.log(message);
					return res.status(200).json({
						status: "success",
						message: "log in successfully",
						token: jwt.sign(updateUser, KEY),
					});
				})
				.catch((message) => {
					console.log(message);
				});
		}
		await validateUserAccountSignIn(req, res);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({
				status: "error",
				error: errors.array()[0].msg,
			});
		}
		const isUserAccountExisted = await db
			.collection(db_collection)
			.findOne({ userId: userData.userId, userType: userData.userType });
		if (!isUserAccountExisted)
			return res.status(409).json({
				status: "error",
				error: "Haven't sign up yet?, sign up now !",
			});
		const d = new Date();
		const updateUser = {
			...isUserAccountExisted,
			lastSignIn: d.toDateString(),
		};
		await db
			.collection(db_collection)
			.updateOne(
				{ userId: userData.userId, userType: userData.userType },
				{ $set: updateUser }
			);
		await clientEmail
			.sendAsync({
				text: `
						\nHello! ${userData.username}
						\nBrand: ${device.brand}
						\nDeviceName: ${device.deviceName}
						\nModelName: ${device.modalName}
						\nOS: ${device.osName}
						\nVersion: ${device.osVersion} 
						\nis login to your account.
						\nContact us(${gmail}) if this isn't you!
						\nThank FOODIE team!`,
				from: `FOODIE <${gmail}>`,
				to: `<${userData.email}>`,
				cc: `Contact us at <${gmail}>`,
				subject: "[FOODIE] New login notice from FOODIE",
			})
			.then((message) => {
				console.log(message);
				return res.status(200).json({
					status: "success",
					message: "log in successfully",
					token: jwt.sign(updateUser, KEY),
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
