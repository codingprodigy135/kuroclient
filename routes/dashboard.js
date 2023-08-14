const fetch = require("node-fetch");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tools = require("../src/util/tools.js");
const selfbot = require("../src/discord/selfbot.js");
const { csrf, json } = require("../src/middleware/general.js");
const { sendVerifyEmail } = require("../src/nodemail/mail.js");
const { rateLimiterMiddleware } = require("../src/middleware/ratelimiter.js");
const { User, Message, VoiceActivity, Nitro } = require("../src/mongo/db.js");
const {
	verifyRequired,
	accountIdAuthorization,
	accountIdAuthorizationProPlan,
} = require("../src/middleware/auth.js");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
function isEmail(email) {
	var regexp =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regexp.test(String(email).toLowerCase());
}

router.get(
	"/api/verify_email",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	async (req, res, next) => {
		try {
			if (!req.user.verified) {
				var token = jwt.sign({ email: req.user.emailaddress }, JWT_SECRET, {});
				if (process.env.PRODUCTION == "TRUE") {
					var link = `${process.env.PRODUCTION_BASE_URL}/verify-email/${token}`;
				} else {
					var link = `${req.get("host")}/verify-email/${token}`;
				}
				sendVerifyEmail(req.user.emailaddress, link);
				return res.json({ success: "true" });
			} else {
				return res.json({ success: "false", error: "Already verified" });
			}
		} catch (e) {
			console.log(e);
			return res.json({ success: "false", error: "Request failed" });
		}
	}
);

router.get(
	"/api/deleted_messages",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res, next) => {
		try {
			var messages = await Message.find({
				account_id: req.headers.authorization,
			});
			if (messages.length !== 0) {
				return res.json({
					success: "true",
					deleted_messages: messages[0].messages,
				});
			} else {
				return res.json({ success: "false", error: "No messages found" });
			}
		} catch (e) {
			console.log(e);
			return res.json({ success: "false", error: "Request failed" });
		}
	}
);

router.get(
	"/api/nitros_sent",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorizationProPlan,
	verifyRequired,
	async (req, res, next) => {
		try {
			var messages = await Nitro.find({
				account_id: req.headers.authorization,
			});
			if (messages.length !== 0) {
				return res.json({ success: "true", nitros_sent: messages[0].messages });
			} else {
				return res.json({ success: "false", error: "No messages found" });
			}
		} catch (e) {
			console.log(e);
			return res.json({ success: "false", error: "Request failed" });
		}
	}
);

// router.get('/api/deleted_images', csrf, json, rateLimiterMiddleware, accountIdAuthorizationProPlan, verifyRequired, async (req, res, next) =>{
//     try{
//         return res.json({success : 'false', error: 'test'})
//         // var messages = await Images.find({account_id: req.headers.authorization})
//         // if(messages.length !== 0){
//         //     return res.json({success : 'true', deleted_messages: messages[0].images})
//         // }else{
//         //     return res.json({success : 'false', error: 'No messages found'})
//         // }
//     }catch(e){
//         console.log(e)
//         return res.json({success: 'false', error: 'Request failed'})
//     }
// })

router.get(
	"/api/session_activity",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res, next) => {
		try {
			const session = await selfbot.get_session(req.headers.authorization);
			if (session) {
				return res.json({
					success: "true",
					data: session.activity.general.data,
				});
			} else {
				return res.json({ success: "false", error: "Request failed" });
			}
		} catch (e) {
			console.log(e);
			return res.json({ success: "false", error: "Request failed" });
		}
	}
);

router.get(
	"/api/session_logs",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res, next) => {
		try {
			const session = await selfbot.get_session(req.headers.authorization);
			if (session) {
				return res.json({ success: "true", data: session.logs });
			} else {
				return res.json({ success: "false", error: "Request failed" });
			}
		} catch (e) {
			console.log(e);
			return res.json({ success: "false", error: "Request failed" });
		}
	}
);

router.get(
	"/api/voice_session_activity",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorizationProPlan,
	verifyRequired,
	async (req, res, next) => {
		try {
			const session = await selfbot.get_session(req.headers.authorization);
			if (session) {
				var voice_activity = await VoiceActivity.find({
					account_id: req.headers.authorization,
				});
				if (voice_activity.length !== 0) {
					var users = [];
					var sorted_ids = tools.sort_ids(voice_activity[0].ids);

					for (var i in sorted_ids) {
						var id = sorted_ids[i];
						var data = {};
						let user = await session.client.users.fetch(id, false);
						data.avatar_url = user.avatarURL();
						data.tag = user.tag;
						try {
							var presence = await user.presenceFetch();
							data.status = presence.status;
							data.clientStatus = presence.clientStatus;
						} catch (e) {
							data.status = null;
							data.clientStatus = null;
						}
						users.push(data);
					}
					return res.json({ success: "true", data: users });
				} else {
					return res.json({ success: "false", error: "No ids yet" });
				}
			} else {
				return res.json({ success: "false", error: "No session" });
			}
		} catch (e) {
			console.log(e);
			return res.json({ success: "false", error: "Request failed" });
		}
	}
);

router.post(
	"/api/set_token",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res, next) => {
		try {
			let token;
			if (req.body.token !== undefined) {
				token = req.body.token;
				if (!tools.token_regex(token)) {
					return res.json({
						success: "false",
						error: "Please enter proper token",
					});
				}
				const valid_token = await tools.check_token(token);
				if (!valid_token) {
					return res.json({ success: "false", error: "Token not working" });
				}
			} else {
				email = req.body.email;
				password = req.body.password;
				if (email && password) {
					var response = await tools.token_from_email(email, password);
					if (response.success == "true") {
						token = response.token.replace(/\s/g, "");
					} else {
						return res.json({ status: "error", error: response.error });
					}
				} else {
					return res.json({ status: "error", error: "Bad request" });
				}
			}
			const token_user = await User.find({
				discord_token: token.replace(/\s/g, ""),
			});
			if (token_user.length != 0) {
				if (token_user[0].account_id == req.headers.authorization) {
					return res.json({
						status: "error",
						error: "Already logged into this discord account",
					});
				} else {
					return res.json({
						status: "error",
						error: "Discord account already in use by another client",
					});
				}
			}

			await selfbot.removeSession(req.headers.authorization);
			await selfbot.createSession(
				req.headers.authorization,
				token.replace(/\s/g, "")
			);
			await User.updateOne(
				{ account_id: req.headers.authorization },
				{ $set: { discord_token: token } }
			);
			return res.json({ success: "true", token: token });
		} catch (e) {
			console.log(e);
			return res.json({ status: "error", error: "Bad request" });
		}
	}
);

router.post(
	"/api/token_logout",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res) => {
		if (req.body.token) {
			var token = req.body.token;
			if (!tools.token_regex(token)) {
				return res.json({
					success: "false",
					error: "Please enter proper token",
				});
			}

			const token_user = await User.find({ discord_token: token });
			if (token_user.length !== 0) {
				try {
					if (token_user[0].account_id !== req.account_id) {
						return;
					}
					await selfbot.removeSession(req.account_id);
					await User.updateOne(
						{ discord_token: token },
						{ $set: { discord_token: "none" } }
					);
					return res.json({ success: "true" });
				} catch (e) {
					return res.json({ success: "false", error: "Request failed" });
				}
			} else {
				return res.json({ success: "false", error: "Token not found" });
			}
		}
		return res.json({ success: "false", error: "Bad request" });
	}
);

router.get(
	"/logout",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	async (req, res) => {
		try {
			res.clearCookie("account_id");
			return res.json({ success: "true" });
		} catch (e) {
			console.log(e);
			return res.json({ success: "false", error: "Failed" });
		}
	}
);

router.post(
	"/api/change_username",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res) => {
		try {
			const username = req.body.username;
			if (username) {
				if (!tools.special_chars(username)) {
					if (username.length > 20) {
						return res.json({ success: "false", error: "Username too long" });
					}
					if (username.length < 5) {
						return res.json({ success: "false", error: "Username too short" });
					}
					const user = await User.find({
						account_id: req.headers.authorization,
					});
					if (user.length != 0) {
						await User.updateOne(
							{ account_id: req.headers.authorization },
							{ $set: { username: req.body.username } }
						);
						return res.json({ success: "true" });
					} else {
						return res.json({ success: "false", error: "Invalid account_id" });
					}
				} else {
					return res.json({ success: "false", error: "Invalid username" });
				}
			} else {
				return res.json({
					success: "false",
					error: "Missing username in body",
				});
			}
		} catch (e) {
			console.log(e);
			return res.json({ success: "false", error: "Failed" });
		}
	}
);

router.post(
	"/api/change_email",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res, next) => {
		try {
			var emailaddress = req.body.emailaddress;
			var password = req.body.password;
			var newEmailaddress = req.body.newEmailaddress;
			if (!newEmailaddress || !password || !emailaddress) {
				return res.json({ status: "error", error: "Bad request" });
			}

			email_user = await User.find({ emailaddress: newEmailaddress });
			if (email_user.length !== 0) {
				return res.json({ status: "error", error: "Email already in use" });
			}
			var user = await User.find({
				account_id: req.headers.authorization,
			}).lean();
			if (user.length !== 0) {
				if (!isEmail(emailaddress)) {
					return res.json({ status: "error", error: "Invalid email" });
				}
				if (await bcrypt.compare(password, user[0].password)) {
					await User.updateOne(
						{ account_id: req.headers.authorization },
						{ $set: { emailaddress: newEmailaddress } }
					);
					return res.json({ success: "true" });
				} else {
					return res.json({ status: "error", error: "Wrong password" });
				}
			} else {
				return res.json({ status: "error", error: "Account id not found" });
			}
		} catch (e) {
			console.log(e);
			return res.json({ status: "error", error: "Bad request" });
		}
	}
);

router.get(
	"/api/settings",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res) => {
		try {
			const user = await User.find({ account_id: req.headers.authorization });
			return res.json({ success: "true", settings: user[0].settings });
		} catch {
			return res.json({ success: "false" });
		}
	}
);

router.post(
	"/api/settings_update/default_activity",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorization,
	verifyRequired,
	async (req, res) => {
		if (typeof req.body.data !== "boolean") {
			return;
		}
		const user = await User.find({ account_id: req.headers.authorization });
		if (user.length != 0) {
			try {
				if (user[0].plan == "free") {
					return res.json({
						success: "false",
						error: "Feature not available with this plan",
					});
				}
				current_settings = JSON.parse(user[0].settings);
				current_settings["default_activity"] = req.body.data;
				await User.updateOne(
					{ account_id: req.headers.authorization },
					{ $set: { settings: JSON.stringify(current_settings) } }
				);
				const session = await selfbot.get_session(req.headers.authorization);
				if (session && !req.body.data) {
					session.client.user.setActivity(null);
				}
				return res.json({ success: "true" });
			} catch (e) {
				console.log(e);
				return res.json({ success: "false", error: "Request failed" });
			}
		} else {
			return res.json({ success: "false", error: "Account id not found" });
		}
	}
);

router.post(
	"/api/settings_update/image_webhook",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorizationProPlan,
	verifyRequired,
	async (req, res) => {
		const webhookUrl = req.body.webhook.replace(/\s/g, "");

		if (!webhookUrl) {
			return res.json({ success: "false", error: "Bad request" });
		}

		if (!/https:\/\/discord.com\/api\/webhooks\/\d{16,19}/g.test(webhookUrl)) {
			return res.json({ success: "false", error: "Improper webhook" });
		}

		const response = await fetch(webhookUrl);

		if (response.status !== 200) {
			return res.json({ success: "false", error: "Invalid webhook" });
		}

		const user = await User.find({ account_id: req.headers.authorization });
		if (user.length != 0) {
			try {
				current_settings = JSON.parse(user[0].settings);
				if (!current_settings?.webhooks?.image_logger) {
					current_settings.webhooks = {
						image_logger: {
							url: webhookUrl,
							working: true,
						},
					};
				} else {
					(current_settings.webhooks.image_logger.working = true),
						(current_settings.webhooks.image_logger.url = webhookUrl);
				}

				await User.updateOne(
					{ account_id: req.headers.authorization },
					{ $set: { settings: JSON.stringify(current_settings) } }
				);
				return res.json({ success: "true" });
			} catch (e) {
				console.log(e);
				return res.json({ success: "false", error: "Request failed" });
			}
		} else {
			return res.json({ success: "false", error: "Account id not found" });
		}
	}
);
router.post(
	"/api/settings_update/remove_webhook",
	csrf,
	json,
	rateLimiterMiddleware,
	accountIdAuthorizationProPlan,
	verifyRequired,
	async (req, res) => {
		const webhookUrl = req.body.webhook.replace(/\s/g, "");

		if (!webhookUrl) {
			return res.json({ success: "false", error: "Bad request" });
		}

		const user = await User.find({ account_id: req.headers.authorization });
		if (user.length != 0) {
			try {
				current_settings = JSON.parse(user[0].settings);
				current_settings.webhooks.image_logger = {};
				await User.updateOne(
					{ account_id: req.headers.authorization },
					{ $set: { settings: JSON.stringify(current_settings) } }
				);
				return res.json({ success: "true" });
			} catch (e) {
				console.log(e);
				return res.json({ success: "false", error: "Request failed" });
			}
		} else {
			return res.json({ success: "false", error: "Account id not found" });
		}
	}
);

module.exports = router;
