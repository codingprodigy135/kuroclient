const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		emailaddress: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		discord_token: { type: String },
		plan: { type: String, required: true },
		account_id: { type: String, unique: true },
		createdAt: {
			type: Number,
			default: () => new Date().getTime(),
			immutable: true,
		},
		settings: { type: String, required: true },
		stripe_customer_id: { type: String, required: true },
		verified: { type: Boolean, required: true },
		two_factor: { type: String, required: true },
	},
	{ strict: false, collection: "users" }
);

const MessagesSchema = new mongoose.Schema(
	{
		account_id: { type: String, required: true, unique: true },
		messages: [String],
	},
	{ strict: false, collection: "messages" }
);

const VoiceSessionsActivitySchema = new mongoose.Schema(
	{
		account_id: { type: String, required: true, unique: true },
		ids: [String],
	},
	{ strict: false, collection: "voice_session_ids" }
);

const NitroSchema = new mongoose.Schema(
	{
		account_id: { type: String, required: true, unique: true },
		messages: [String],
	},
	{ strict: false, collection: "nitros" }
);

const usermodel = mongoose.model("UserSchema", UserSchema);
const nitromodel = mongoose.model("NitroSchema", NitroSchema);
const messagemodel = mongoose.model("MessagesSchema", MessagesSchema);
const vcactivitymodel = mongoose.model(
	"VoiceSessionsActivitySchema",
	VoiceSessionsActivitySchema
);

async function connect() {
	try {
		await mongoose.connect(process.env.DB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		console.log("Connected to mongodb");
	} catch (e) {
		console.log(e);
	}
}

async function add_nitro(data, plan) {
	try {
		let MAX_MESSAGES;
		if (plan == "ultimate") {
			MAX_MESSAGES = 200;
		} else if (plan == "pro") {
			MAX_MESSAGES = 100;
		} else {
			MAX_MESSAGES = 20;
		}

		var account_id = Object.keys(JSON.parse(data))[0];
		var message = JSON.stringify(Object.values(JSON.parse(data))[0]);
		var message_user = await nitromodel.find({ account_id: account_id });
		if (message_user.length == 0) {
			const db_message = await nitromodel.create({
				account_id: account_id,
				messages: [message],
			});
		} else {
			var messages = message_user[0].messages;
			if (messages.length >= MAX_MESSAGES) {
				messages.pop();
			}
			messages.unshift(message);
			await nitromodel.updateOne(
				{ account_id: account_id },
				{ $set: { messages: messages } }
			);
		}
	} catch (e) {
		console.log(e);
	}
}

async function add_deleted_message(data, plan) {
	try {
		let MAX_MESSAGES;
		if (plan == "ultimate") {
			MAX_MESSAGES = 200;
		} else if (plan == "pro") {
			MAX_MESSAGES = 100;
		} else {
			MAX_MESSAGES = 20;
		}

		var account_id = Object.keys(JSON.parse(data))[0];
		var message = JSON.stringify(Object.values(JSON.parse(data))[0]);

		var message_user = await messagemodel.find({ account_id: account_id });

		if (message_user.length == 0) {
			await messagemodel.create({
				account_id: account_id,
				messages: [message],
			});
		} else {
			var messages = message_user[0].messages;
			if (messages.length >= MAX_MESSAGES) {
				messages.pop();
			}
			messages.unshift(message);
			await messagemodel.updateOne(
				{ account_id: account_id },
				{ $set: { messages: messages } }
			);
		}
	} catch (e) {
		console.log(e);
	}
}

async function addVcActivityId(account_id, id) {
	try {
		var vcActivityUser = await vcactivitymodel.find({ account_id: account_id });

		if (vcActivityUser.length == 0) {
			await vcactivitymodel.create({
				account_id: account_id,
				ids: [id],
			});
		} else {
			var ids = vcActivityUser[0].ids;
			ids.push(id);
			await vcactivitymodel.updateOne(
				{ account_id: account_id },
				{ $set: { ids: ids } }
			);
		}
	} catch (err) {
		if (err.code === 11000) {
		} else {
			console.log(err);
		}
	}
}

async function updateAllDbs(searchObject, key, value) {
	await usermodel.updateOne(searchObject, { $set: { [key]: value } });
	await nitromodel.updateOne(searchObject, { $set: { [key]: value } });
	await messagemodel.updateOne(searchObject, { $set: { [key]: value } });

	await vcactivitymodel.updateOne(searchObject, { $set: { [key]: value } });
}

module.exports = {
	User: usermodel,
	Message: messagemodel,
	Nitro: nitromodel,
	VoiceActivity: vcactivitymodel,
	add_deleted_message: add_deleted_message,
	add_nitro: add_nitro,
	addVcActivityId: addVcActivityId,
	updateAllDbs: updateAllDbs,
};
