import initMiddleware from "./init-middleware";
import validateMiddleware from "./validate-middleware";
import { check, validationResult } from "express-validator";
import clientPromise from "./mongodb";

const validateUserType = initMiddleware(
	validateMiddleware(
		[
			check("userType")
				.exists()
				.withMessage("userType must be required")
				.isIn(["foodie-user", "google-user", "facebook-user"])
				.withMessage("invalid userType value"),
		],
		validationResult
	)
);
const validateFoodieUserSignIn = initMiddleware(
	validateMiddleware(
		[
			check("email")
				.exists()
				.withMessage("email address must be required!")
				.isEmail()
				.withMessage("incorrect email address"),
			check("password")
				.exists()
				.withMessage("password is required!")
				.isLength({ min: 8, max: 32 })
				.withMessage("password must be 8+ characters long"),
			check("userType")
				.isIn("foodie-user")
				.withMessage("invalid userType value"),
		],
		validationResult
	)
);
const validateUserAccountSignIn = initMiddleware(
	validateMiddleware(
		[
			check("userId").exists().withMessage("userId must be required!"),
			check("username").exists().withMessage("username must be required!"),
			check("email")
				.optional(true)
				.isEmail()
				.withMessage("incorrect email address, check again!"),
			check("picture")
				.isObject()
				.withMessage(
					"picture must be an object which contain {url} as attribute!"
				),
			check("userType").isIn(["google-user", "facebook-user"]),
		],
		validationResult
	)
);

const validateFoodieUserSignUp = initMiddleware(
	validateMiddleware(
		[
			check("email")
				.exists()
				.withMessage("email address must be required!")
				.isEmail()
				.withMessage("incorrect email address")
				.custom(async (value) => {
					const client = await clientPromise;
					const db = client.db();
					const db_collection = process.env.user_collections;
					return db
						.collection(db_collection)
						.findOne({ email: value })
						.then((user) => {
							if (user) return Promise.reject(`${value} is already in used!`);
						});
				}),
			check("username")
				.exists()
				.withMessage("username is required!")
				.isLength({ min: 6, max: 32 })
				.withMessage("username must be 6+ characters long")
				.custom(async (value) => {
					const client = await clientPromise;
					const db = client.db();
					const db_collection = process.env.user_collections;
					return db
						.collection(db_collection)
						.findOne({ username: value })
						.then((user) => {
							if (user) return Promise.reject(`${value} is already in used!`);
						});
				}),
			,
			check("password")
				.exists()
				.withMessage("password is required!")
				.isLength({ min: 8, max: 32 })
				.withMessage("password must be 8+ characters long"),
			,
			check("picture")
				.isObject()
				.withMessage(
					"picture must be an object which contain {url,filename} as attribute!"
				),
			check("userType")
				.isIn("foodie-user")
				.withMessage("invalid userType value"),
		],
		validationResult
	)
);
const validateUserAccountSignUp = initMiddleware(
	validateMiddleware(
		[
			check("userId")
				.exists()
				.withMessage("userId must be required!")
				.custom(async (value) => {
					const client = await clientPromise;
					const db = client.db();
					const db_collection = process.env.user_collections;
					return db
						.collection(db_collection)
						.findOne({ userId: value })
						.then((user) => {
							if (user)
								return Promise.reject(
									`You are already sign up with this account!`
								);
						});
				}),
			check("username")
				.exists()
				.withMessage("username is required!")
				.isLength({ min: 6, max: 32 })
				.withMessage("username must be 6+ characters long")
				.custom(async (value) => {
					const client = await clientPromise;
					const db = client.db();
					const db_collection = process.env.user_collections;
					return db
						.collection(db_collection)
						.findOne({ username: value })
						.then((user) => {
							if (user)
								return Promise.reject(
									`${value} is already sign up! Sign In instead.`
								);
						});
				}),
			check("email")
				.optional(true)
				.isEmail()
				.withMessage("incorrect email address, check again!")
				.custom(async (value) => {
					const client = await clientPromise;
					const db = client.db();
					const db_collection = process.env.user_collections;
					return db
						.collection(db_collection)
						.findOne({ email: value })
						.then((user) => {
							if (user)
								return Promise.reject(
									`${value} is already sign up! Sign In instead.`
								);
						});
				}),
			check("picture")
				.isObject()
				.withMessage(
					"picture must be an object which contain {url} as attribute!"
				),
			check("userType").isIn(["google-user", "facebook-user"]),
		],
		validationResult
	)
);

const validateEmail = initMiddleware(
	validateMiddleware(
		[
			check("email")
				.exists()
				.withMessage("email must be required!")
				.isEmail()
				.withMessage("incorrect email address, check again!")
				.custom(async (value) => {
					const client = await clientPromise;
					const db = client.db();
					const db_collection = process.env.user_collections;
					return db
						.collection(db_collection)
						.findOne({ email: value, userType: "foodie-user" })
						.then((user) => {
							if (!user) return Promise.reject(`email: ${value} is not found!`);
							if (user.userType != "foodie-user")
								return Promise.reject(
									`${user.userType} can not reset password`
								);
						});
				}),
			check("device").exists().withMessage("device status must be required!"),
		],
		validationResult
	)
);

const validateResetPassword = initMiddleware(
	validateMiddleware(
		[
			check("email")
				.exists()
				.withMessage("email must be required!")
				.isEmail()
				.withMessage("incorrect email address, check again!")
				.custom(async (value) => {
					const client = await clientPromise;
					const db = client.db();
					const db_collection = process.env.user_collections;
					return db
						.collection(db_collection)
						.findOne({ email: value })
						.then((user) => {
							if (!user) return Promise.reject(`email: ${value} is not found!`);
							if (user.userType != "foodie-user")
								return Promise.reject(
									`${user.userType} can not reset password`
								);
						});
				}),
			check("password")
				.exists()
				.withMessage("password is required!")
				.isLength({ min: 8, max: 32 })
				.withMessage("password must be 8+ characters long")
				.custom(async (value) => {
					const client = await clientPromise;
					const db = client.db();
					const db_collection = process.env.user_collections;
					return db
						.collection(db_collection)
						.findOne({ password: value, userType: "foodie-user" })
						.then((user) => {
							if (user)
								return Promise.reject(
									`password has been already used!, Try a new one.`
								);
						});
				}),
			,
		],
		validationResult
	)
);

export {
	validateUserType,
	validateFoodieUserSignIn,
	validateUserAccountSignIn,
	validateFoodieUserSignUp,
	validateUserAccountSignUp,
	validateEmail,
	validateResetPassword,
};
