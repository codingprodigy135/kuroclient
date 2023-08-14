require("dotenv").config({ path: "../.env" });
const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
const { User } = require("../src/mongo/db.js");
const selfbot = require("../src/discord/selfbot.js");
const { csrf, json } = require("../src/middleware/general.js");
const { rateLimiterMiddleware } = require("../src/middleware/ratelimiter.js");

let BASE_URL;
let STRIPE_PRIVATE_KEY;
let STRIPE_ENDPOINT_SECRET;
let STRIPE_PRICE_ID;

if (process.env.PRODUCTION == "TRUE") {
	BASE_URL = process.env.PRODUCTION_BASE_URL;
	STRIPE_PRIVATE_KEY = process.env.STRIPE_PRODUCTION_PRIVATE_KEY;
	STRIPE_ENDPOINT_SECRET = process.env.STRIPE_PRODUCTION_ENDPOINT_SECRET;
	STRIPE_PRICE_ID = process.env.STRIPE_PRODUCTION_PRICE_ID;
} else {
	BASE_URL = `http://localhost:${process.env.PORT}`;
}

const stripe = require("stripe")(STRIPE_PRIVATE_KEY);

async function updatePlan(account_id, plan, customer_id) {
	console.log("Update plan");
	console.log(plan);
	console.log(plan == "pro");
	console.log(plan == "ultimate");

	try {
		if (plan == "pro" || plan == "ultimate") {
			await User.updateOne(
				{ account_id: account_id },
				{ $set: { plan: plan } }
			);
			await User.updateOne(
				{ account_id: account_id },
				{ $set: { stripe_customer_id: customer_id } }
			);
			await selfbot.reload_session(account_id, { plan: plan });
		}
	} catch (e) {
		console.log(`Failed to upgrade ${customer_id}`);
		console.log(e);
	}
}
async function removePlan(account_id, customer_id) {
	console.log(account_id);
	try {
		await User.updateOne(
			{ stripe_customer_id: customer_id },
			{ $set: { plan: "free" } }
		);
		await User.updateOne(
			{ stripe_customer_id: customer_id },
			{ $set: { stripe_customer_id: "none" } }
		);
		await stripe.customers.del(customer_id);
		await selfbot.reload_session(account_id, {
			plan: "free",
			nitrosnipe: false,
		});
	} catch (e) {
		console.log(`Failed to downgrade ${customer_id}`);
		console.log(e);
	}
}

router.get(
	"/checkout-session-5",
	csrf,
	json,
	rateLimiterMiddleware,
	async (req, res) => {
		try {
			if (!req.headers.authorization) throw "err";

			const user = await User.find({ account_id: req.headers.authorization });
			if (user.length == 0) {
				return res.send({ success: "false", error: "Unauthorized" });
			}
			if (user[0].plan == "pro" || user[0].plan == "ultimate") {
				return res.send({
					success: "false",
					error: "User is already using this plan or above",
				});
			}

			const customer = await stripe.customers.create();

			const price = await stripe.prices.retrieve(STRIPE_PRICE_ID);

			const session = await stripe.checkout.sessions.create({
				line_items: [{ price: price.id, quantity: 1 }],
				metadata: { account_id: req.headers.authorization, plan: "pro" },
				billing_address_collection: "auto",
				cancel_url: `${BASE_URL}/pricing`,
				success_url: `${BASE_URL}/pricing#paid`,
				mode: "subscription",
			});

			return res.json({ success: "true", url: session.url });
		} catch (e) {
			console.log(e);
			res.status(500).json({ error: "Payment failed" });
		}
	}
);

router.post(
	"/webhook",
	express.raw({ type: "application/json" }),
	(request, response) => {
		try {
			const sig = request.headers["stripe-signature"];
			if (!sig) {
				return;
			}
			let event;

			try {
				event = stripe.webhooks.constructEvent(
					request.body,
					sig,
					STRIPE_ENDPOINT_SECRET
				);
				send_webhook("Webhook Error 1", e.message);
			} catch (e) {
				console.log(e);
				return response.status(400).send(`Webhook Error: ${e.message}`);
			}

			console.log(event.data);
			switch (event.type) {
				//charge.succeeded
				case "checkout.session.completed":
					updatePlan(
						event.data.object.metadata.account_id,
						event.data.object.metadata.plan,
						event.data.object.customer
					);
					send_webhook(
						"payment",
						`account_id: ${event.data.object.metadata.account_id}\nCustomer: ${event.data.object.customer}`
					);
					break;
				case "customer.subscription.deleted":
					//This needs to get the metata data of account_id so removePlan can work
					removePlan(
						event.data.object.metadata.account_id,
						event.data.object.customer
					);
					break;
				//When the cancel in billing section or renew plan or more.
				// case 'customer.subscription.updated':
				//   console.log(event.data.object)
				// break;
			}
			response.send();
		} catch (e) {
			console.log(e);
			send_webhook("Webhook Error 2", e.message);
			response.status(400).send(`Webhook Error: ${e.message}`);
		}
	}
);

module.exports = {
	stripeRouter: router,
};
