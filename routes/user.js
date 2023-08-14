require("dotenv").config({ path: "../.env" });

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const tools = require("../src/util/tools.js");
const selfbot = require("../src/discord/selfbot.js");
const { User, updateAllDbs } = require("../src/mongo/db.js");
const {
	sendChangePasswordEmail,
	changePasswordNotifyEmail,
	sendVerifyEmail,
} = require("../src/nodemail/mail.js");
const { csrf, json } = require("../src/middleware/general.js");
const { captchaVerify } = require("../src/middleware/auth.js");
const { rateLimiterMiddleware } = require("../src/middleware/ratelimiter.js");

const router = express.Router();
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

const cookieOptions = {
	sameSite: true,
	secure: true,
	httpOnly: true,
	secret: COOKIE_SECRET,
	expires: new Date(new Date().setMonth(new Date().getMonth() + 3)),
	overwrite: true,
};

function isEmail(email) {
	var regexp =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regexp.test(String(email).toLowerCase());
}

router.post(
	"/api/register",
	csrf,
	json,
	rateLimiterMiddleware,
	captchaVerify,
	async (req, res, next) => {
		try {
			var username = req.body.username;
			var emailaddress = req.body.emailaddress;
			var password = await bcrypt.hash(req.body.password, 10);
			var discord_token = "none";
			var plan = "free";
			var settings = "{}";
			var stripe_customer_id = "none";
			var verified = false;
			var two_factor = "none";

			if (!isEmail(emailaddress)) {
				return res.json({ status: "error", error: "Invalid email" });
			}
			if (tools.special_chars(username)) {
				return res.json({ status: "error", error: "Invalid username" });
			}
			if (username.length > 20) {
				return res.json({ status: "error", error: "Username too long" });
			}
			if (username.length == 0) {
				return res.json({ status: "error", error: "Username too short" });
			}
			if (req.body.password.length < 5) {
				return res.json({ status: "error", error: "Password too short" });
			}
			if (req.body.password.length > 40) {
				return res.json({ status: "error", error: "Password too long" });
			}
		} catch (e) {
			return res.json({ status: "error", error: "Bad request" });
		}

		try {
			var account_id = tools.encode(emailaddress + req.body.password);
			var user = await User.create({
				username,
				emailaddress,
				password,
				discord_token,
				plan,
				account_id,
				settings,
				stripe_customer_id,
				verified,
				two_factor,
			});
			res.cookie("account_id", account_id, cookieOptions);

			var token = jwt.sign({ email: emailaddress }, JWT_SECRET, {});
			if (process.env.PRODUCTION == "TRUE") {
				var link = `${process.env.PRODUCTION_BASE_URL}/verify-email/${token}`;
			} else {
				var link = `${req.get("host")}/verify-email/${token}`;
			}
			sendVerifyEmail(emailaddress, link);

			return res.json({ status: "success" });
		} catch (err) {
			if (err.code === 11000) {
				var duplicate_value = Object.keys(
					JSON.parse(JSON.stringify(err))["keyPattern"]
				)[0];
				if (duplicate_value == "emailaddress") {
					duplicate_value = "Email address";
				}
				if (duplicate_value == "username") {
					return res.json({ status: "error", error: `Username already taken` });
				} else {
					return res.json({
						status: "error",
						error: `${tools.capitalize(duplicate_value)} already registered`,
					});
				}
			} else {
				return res.json({
					status: "error",
					error: "Something went wrong on our end, please try again later",
				});
			}
		}
	}
);
router.post(
	"/api/login",
	csrf,
	json,
	rateLimiterMiddleware,
	captchaVerify,
	async (req, res, next) => {
		try {
			var emailaddress = req.body.emailaddress;
			var password = req.body.password;
			var user = await User.find({ emailaddress: emailaddress }).lean();
			if (user.length != 0) {
				if (await bcrypt.compare(password, user[0].password)) {
					var account_id = tools.encode(emailaddress + password);
					res.cookie("account_id", account_id, cookieOptions);
					return res.json({ status: "success" });
				} else {
					return res.json({ status: "error", error: "Wrong password" });
				}
			} else {
				return res.json({ status: "error", error: "Email not found" });
			}
		} catch (e) {
			console.log(e);
			return res.json({ status: "error", error: "Bad request" });
		}
	}
);
router.post(
	"/api/forgot-password",
	csrf,
	json,
	rateLimiterMiddleware,
	async (req, res, next) => {
		try {
			var email = req.body.emailaddress;
			var user = await User.find({ emailaddress: email }).lean();
			if (user.length != 0) {
				var id = user[0]._id.toString();
				var token = jwt.sign(
					{ email: email, ip: req.ip },
					JWT_SECRET + user[0].password,
					{ expiresIn: "15m" }
				);
				if (process.env.PRODUCTION == "TRUE") {
					var link = `${process.env.PRODUCTION_BASE_URL}/reset-password/${id}/${token}`;
				} else {
					var link = `${req.get("host")}/reset-password/${id}/${token}`;
				}
				sendChangePasswordEmail(email, "Password reset", link);
				return res.json({ success: "true" });
			} else {
				return res.json({ success: "false", error: `Email not found` });
			}
		} catch (e) {
			return res.json({ success: "false", error: `Request failed` });
		}
	}
);
router.post(
	"/api/change-password",
	csrf,
	json,
	rateLimiterMiddleware,
	async (req, res, next) => {
		try {
			var id = req.body.id;
			var token = req.body.token;
			var new_password = await bcrypt.hash(req.body.password, 10);
			var user = await User.findOne({ _id: id });

			if (user.length != 0) {
				jwt.verify(token, JWT_SECRET + user.password, async (err, decoded) => {
					if (err) {
						return res.json({
							success: "false",
							error: `Password change failed`,
						});
					} else {
						if (req.body.password.length < 5) {
							return res.json({ status: "error", error: "Password too short" });
						}
						if (req.body.password.length > 40) {
							return res.json({ status: "error", error: "Password too long" });
						}
						await User.updateOne(
							{ _id: id },
							{ $set: { password: new_password } }
						);

						var account_id = tools.encode(
							user.emailaddress + req.body.password
						);
						await updateAllDbs(
							{ account_id: user.account_id },
							"account_id",
							account_id
						);
						await selfbot.reload_session(user.account_id, {
							account_id: account_id,
						});
						res.cookie("account_id", account_id, cookieOptions);
						changePasswordNotifyEmail(user.emailaddress, {
							ip: req.ip,
							time: new Date(),
						});
						return res.json({ success: "true" });
					}
				});
			} else {
				return res.json({ success: "false", error: `Password change failed` });
			}
		} catch (e) {
			console.log(e);
		}
	}
);
router.post(
	"/api/verify",
	csrf,
	json,
	rateLimiterMiddleware,
	captchaVerify,
	async (req, res, next) => {
		try {
			var token = req.body.token;
			jwt.verify(token, JWT_SECRET, async (err, decoded) => {
				if (err) {
					return res.json({ success: "false", error: `Request failed` });
				} else {
					const user = await User.find({ emailaddress: decoded.email });
					if (user.length !== 0) {
						await User.updateOne(
							{ emailaddress: decoded.email },
							{ $set: { verified: true } }
						);
						return res.json({ success: "true" });
					} else {
						return res.json({ success: "false", error: `Request failed` });
					}
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
);
// router.get('/api/test', rateLimiterMiddleware, async (req, res, next) =>{
//     return res.json({status : true})
// })

module.exports = router;
