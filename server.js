"use strict";

require("dotenv").config();
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const moment = require("moment");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const compression = require("compression");
const { User } = require("./src/mongo/db.js");
const tools = require("./src/util/tools.js");
const cookieParser = require("cookie-parser");
const basicAuth = require("express-basic-auth");
const selfbot = require("./src/discord/selfbot.js");
const { stripeRouter } = require("./stripe/stripe.js");
const Socket = require("./src/discord/websockets.js");
const { csrf, json } = require("./src/middleware/general.js");
const { error_handler } = require("./src/middleware/handler.js");
const { accountIdInCookie } = require("./src/middleware/auth.js");
const { googleAnalytics } = require("./src/middleware/analytics.js");

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const PRODUCTION = process.env.PRODUCTION;
const HELP_WEBSITE = process.env.HELP_WEBSITE;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const GOOGLE_SITE_KEY = process.env.GOOGLE_SITE_KEY;
const BILLING_PORTAL_URL =
	PRODUCTION == "TRUE"
		? process.env.STRIPE_PRODUCTION_BILLING_PORTAL_URL
		: process.env.STRIPE_BILLING_PORTAL_URL;
PRODUCTION == "TRUE"
	? (process.env.NODE_ENV = "production")
	: (process.env.NODE_ENV = undefined);

const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");
const dashboardRoute = require("./routes/dashboard");

app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "static")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
	cookieParser({
		key: COOKIE_SECRET,
		sameSite: true,
		httpOnly: true,
		secure: true,
	})
);
app.use(helmet());
app.use(
	helmet.contentSecurityPolicy({
		useDefaults: true,
		directives: {
			"frame-src": [
				"'self'",
				"https://checkout.stripe.com",
				"https://www.google.com/recaptcha/",
				"https://recaptcha.google.com/recaptcha/",
			],
			"script-src": [
				"'self'",
				"www.googletagmanager.com",
				"https://checkout.stripe.com",
				"https://www.google.com/recaptcha/",
				"https://www.gstatic.com/recaptcha/",
			],
			"img-src": [
				"'self'",
				"https://*.stripe.com",
				"cdn.discordapp.com",
				"data:",
			],
			"connect-src": [
				"'self'",
				"https://checkout.stripe.com",
				"https://discord.com/api/v9/users/@me",
			],
		},
	})
);
app.use(
	cors({
		origin: "same",
		methods: ["GET", "POST"],
	})
);
app.use(compression());

app.get("/", csrf, json, googleAnalytics, async (req, res) => {
	res.render("home/index", {
		csrfToken: req.csrfToken(),
		loggedIN: Boolean(req.cookies.account_id),
	});
});
app.get("/login", csrf, json, googleAnalytics, async (req, res) => {
	res.render("home/login", {
		csrfToken: req.csrfToken(),
		siteKey: GOOGLE_SITE_KEY,
	});
});
app.get("/register", csrf, json, googleAnalytics, async (req, res) => {
	res.render("home/register", {
		csrfToken: req.csrfToken(),
		siteKey: GOOGLE_SITE_KEY,
	});
});
app.get("/pricing", csrf, json, googleAnalytics, async (req, res) => {
	let hasProPlan = false;

	if (req.cookies.account_id) {
		const user = await User.find({ account_id: req.cookies.account_id });
		if (user.length !== 0) {
			if (user[0].plan == "pro") {
				hasProPlan = true;
			}
		}
	}

	res.render("home/pricing", {
		account_id: req.cookies.account_id,
		csrfToken: req.csrfToken(),
		loggedIN: Boolean(req.cookies.account_id),
		hasProPlan: hasProPlan,
	});
});
app.get("/privacy-policy", csrf, googleAnalytics, json, async (req, res) => {
	res.render("home/privacy-policy", {
		csrfToken: req.csrfToken(),
		loggedIN: Boolean(req.cookies.account_id),
	});
});
app.get("/support", csrf, json, googleAnalytics, async (req, res) => {
	try {
		var support_json = JSON.parse(
			await fs.promises.readFile("./src/util/support.json")
		);
		res.render("home/support", {
			csrfToken: req.csrfToken(),
			data: support_json,
			loggedIN: Boolean(req.cookies.account_id),
		});
	} catch {
		res.render("home/index", { csrfToken: req.csrfToken() });
	}
});
app.get("/support/:id", csrf, json, googleAnalytics, async (req, res) => {
	try {
		const id = req.params.id;
		var match = /^\d+$/.test(id);
		if (!match) {
			res.render("home/index", { csrfToken: req.csrfToken() });
		}
		var support_json = JSON.parse(
			await fs.promises.readFile("./src/util/support.json")
		);
		const data = support_json.sections.filter((x) => x.id == id);
		if (data || data.length !== 0) {
			res.render("home/support-single", {
				csrfToken: req.csrfToken(),
				related: data.related,
				data: data[0],
				loggedIN: Boolean(req.cookies.account_id),
			});
		} else {
			res.render("home/support", {
				csrfToken: req.csrfToken(),
				data: support_json,
				loggedIN: Boolean(req.cookies.account_id),
			});
		}
	} catch {
		res.render("home/index", {
			csrfToken: req.csrfToken(),
			loggedIN: Boolean(req.cookies.account_id),
		});
	}
});
app.get("/terms-of-service", csrf, json, googleAnalytics, async (req, res) => {
	res.render("home/terms-of-service", {
		csrfToken: req.csrfToken(),
		loggedIN: Boolean(req.cookies.account_id),
	});
});
app.get("/forgot-password", csrf, json, googleAnalytics, async (req, res) => {
	res.render("home/forgot-password", { csrfToken: req.csrfToken() });
});
app.get(
	"/dashboard",
	csrf,
	json,
	accountIdInCookie,
	googleAnalytics,
	async (req, res) => {
		res.render("dashboard/dashboard", {
			account_id: req.account_id,
			csrfToken: req.csrfToken(),
			token: req.user.discord_token,
			verified: req.user.verified,
			session_url: Boolean(req.user.stripe_customer_id !== "none")
				? BILLING_PORTAL_URL
				: null,
		});
	}
);
app.get(
	"/discord",
	csrf,
	json,
	accountIdInCookie,
	googleAnalytics,
	async (req, res) => {
		res.render("dashboard/discord", {
			account_id: req.account_id,
			csrfToken: req.csrfToken(),
			token: req.user.discord_token,
			verified: req.user.verified,
			session_url: Boolean(req.user.stripe_customer_id !== "none")
				? BILLING_PORTAL_URL
				: null,
		});
	}
);
app.get(
	"/messages",
	csrf,
	json,
	accountIdInCookie,
	googleAnalytics,
	async (req, res) => {
		let webhook =
			JSON.parse(req.user.settings)?.webhooks?.image_logger?.url !== undefined
				? JSON.stringify(JSON.parse(req.user.settings).webhooks)
				: undefined;
		res.render("dashboard/messages", {
			account_id: req.account_id,
			csrfToken: req.csrfToken(),
			plan: req.user.plan,
			prefix: req.user.prefix,
			token: req.user.discord_token,
			verified: req.user.verified,
			webhook: webhook,
			session_url: Boolean(req.user.stripe_customer_id !== "none")
				? BILLING_PORTAL_URL
				: null,
		});
	}
);
app.get(
	"/terminal",
	csrf,
	json,
	accountIdInCookie,
	googleAnalytics,
	async (req, res) => {
		res.render("dashboard/terminal", {
			account_id: req.account_id,
			plan: req.user.plan,
			token: req.user.discord_token,
			csrfToken: req.csrfToken(),
			verified: req.user.verified,
			session_url: Boolean(req.user.stripe_customer_id !== "none")
				? BILLING_PORTAL_URL
				: null,
		});
	}
);
app.get(
	"/settings",
	csrf,
	json,
	accountIdInCookie,
	googleAnalytics,
	async (req, res) => {
		res.render("dashboard/settings", {
			plan: req.user.plan.charAt(0).toUpperCase() + req.user.plan.slice(1),
			settings: req.user.settings,
			username: req.user.username,
			emailaddress: req.user.emailaddress,
			csrfToken: req.csrfToken(),
			account_id: req.account_id,
			verified: req.user.verified,
			createdAt: moment(req.user.createdAt).format("YYYY-MM-DD HH:m:s"),
			session_url: Boolean(req.user.stripe_customer_id !== "none")
				? BILLING_PORTAL_URL
				: null,
		});
	}
);
app.get("/commands", csrf, json, accountIdInCookie, async (req, res) => {
	res.redirect(HELP_WEBSITE);
});
app.get(
	"/reset-password/:id/:token",
	googleAnalytics,
	csrf,
	async (req, res) => {
		try {
			const { id, token } = req.params;
			let user = await User.findOne({ _id: id });
			user = null;
			if (user == null) {
				user = await User.findById({ _id: id });
			}
			jwt.verify(token, JWT_SECRET + user.password, (err, decoded) => {
				if (err) {
					return res.redirect("/login");
				} else {
					if (user.length !== 0) {
						res.render("home/reset-password", { csrfToken: req.csrfToken() });
					} else {
						return res.redirect("/login");
					}
				}
			});
		} catch (e) {
			console.log(e);
			return res.redirect("/login");
		}
	}
);
app.get("/verify-email/:token", googleAnalytics, csrf, async (req, res) => {
	try {
		const token = req.params.token;
		jwt.verify(token, JWT_SECRET, async (err, decoded) => {
			if (err) {
				return res.redirect("/login");
			} else {
				const user = await User.find({ emailaddress: decoded.email });
				if (user.length !== 0) {
					if (user[0].verified) {
						return res.redirect("dashboard");
					}
					res.render("home/verfiy-email", {
						csrfToken: req.csrfToken(),
						siteKey: GOOGLE_SITE_KEY,
					});
				} else {
					return res.redirect("/login");
				}
			}
		});
	} catch (e) {
		console.log(e);
		return res.redirect("/login");
	}
});
app.get(
	"/supersecretcool",
	basicAuth({
		challenge: true,
		users: { ez: "chiken" },
	}),
	async (req, res) => {
		const users = [];
		const user_collection = await User.find({});
		user_collection.forEach(async (data) => {
			users.push(data.toJSON());
		});
		let session_count = 0;
		const user_count = users.length;
		users.forEach((data) => {
			if (data.discord_token !== "none") {
				session_count += 1;
			}
		});
		res.render("admin/dashboard", {
			sessions: users,
			user_count: user_count,
			session_count: session_count,
		});
	}
);
app.use(error_handler);
app.use("/", userRoute);
// app.use('/', adminRoute)
// app.use('/', stripeRouter)
app.use("/", dashboardRoute);

app.ws("/gateway", function (ws, req) {
	ws.on("message", async function (msg) {
		try {
			const data = JSON.parse(msg);
			const user = await User.find({ account_id: data.account_id });
			if (user.length == 0) {
				ws.send(
					JSON.stringify({ success: "false", error: "Account id not found" })
				);
				return;
			}
			if (!user[0].verified) {
				ws.send(
					JSON.stringify({ success: "false", error: "Email not verified" })
				);
				return;
			}

			const token = user[0].discord_token;

			if (!token || token == "none") {
				ws.send(
					JSON.stringify({ success: "false", error: "Token is not set" })
				);
				return;
			}

			if (!tools.token_regex(token)) {
				ws.send(JSON.stringify({ success: "false", error: "Token invalid" }));
				return;
			}

			const valid_token = await tools.check_token(token);
			if (!valid_token) {
				ws.send(
					JSON.stringify({ success: "false", error: "Token not working" })
				);
				return;
			}
			const session = await selfbot.get_session(data.account_id);
			if (session) {
				try {
					const session_data = {
						token: session.token,
						nitrosnipe: session.nitrosnipe,
						deleteAfter: session.deleteAfter,
						enabled: session.enabled,
						prefix: session.prefix,
						id: session.client.user.id,
						username: session.client.user.username,
						discriminator: session.client.user.discriminator,
						emailAddress: session.client.user.emailAddress,
						uptime: session.client.uptime,
						status: session.client.presence,
						plan: session.plan,
					};
					ws.send(
						JSON.stringify({ success: "true", session_data: session_data })
					);
					Socket.authorize_socket(data.account_id, ws);
				} catch (e) {
					console.log(e);
					ws.send(JSON.stringify({ success: "true", session_data: null }));
					return;
				}
			} else {
				ws.send(JSON.stringify({ success: "true", session_data: null }));
				return;
			}
		} catch (e) {
			console.log(e);
			ws.send(JSON.stringify({ success: "false" }));
		}
	});
});

//This has to be below all routes
app.all("*", (req, res, next) => {
	if (req.url === "/static/exterior/img/logo.jpg") {
		res.sendFile(path.join(__dirname, "static/exterior/img/logo.jpg"));
	} else {
		res.render("home/404");
	}
});

fs.promises.readFile("./src/util/support.json").then((data) => {
	JSON.parse(data);
});

app.listen(PORT);
