require("dotenv").config({ path: "../.env" });

const { Client, RichPresence, getUUID } = require("discord.js-selfbot-v13");
const custom_events = require("events");
const commands = require("./commands");
const events = require("./events");
const ws = require("./websockets");
const activity = require("./activity");
const { User } = require("../mongo/db.js");
const { DEFAULT_PREFIX } = require("../util/globals.js");

async function trigger_command(ctx) {
	const args = ctx.message.content.split(" ").splice(1);
	commands.run(ctx.command, ctx, args);
}

async function trigger_event(event_name, payload) {
	events.run(event_name, payload);
}

class SelfbotSession {
	constructor(
		account_id,
		token,
		prefix,
		nitrosnipe,
		deleteAfter,
		plan,
		enabled,
		default_activity,
		settings
	) {
		this.logs = [];
		this.activity = {};
		this.plan = plan;
		this.token = token;
		this.ready = false;
		this.purging = false;
		this.prefix = prefix;
		this.enabled = enabled;
		this.settings = settings;
		this.account_id = account_id;
		this.nitrosnipe = nitrosnipe;
		this.deleteAfter = deleteAfter;
		this.default_activity = default_activity;
		this.client = new Client({ checkUpdate: false });
		this.events = new custom_events.EventEmitter();

		this.client.on("ready", async () => {
			console.log(`Logged in ${this.client.user.tag}`);
			if (!this.ready) {
				this.ready = true;
				if (default_activity && plan === "free") {
					const r = new RichPresence()
						.setApplicationId("1030953813722546266")
						.setType("PLAYING")
						.setURL("https://www.youtube.com/watch?v=OaKrjpFk8TY")
						.setState(" ")
						.setName("kuroclient")
						.setDetails(" ")
						// .setParty({
						// 	max: 9,
						// 	current: 1,
						// 	id: getUUID(),
						// })
						.setStartTimestamp(Date.now())
						//To get asset id
						//1. Go to the rich presence page on discord developer page
						//2. Add the asset you want and want and wait around 10 minutes
						//3. Go to the visualizer page and put the assets in the large or small image key
						//4.  Open inspect elemtn and click on the image inside the preview
						//5. the src will be https://cdn.discordapp.com/app-assets/APP_ID/ASSET_ID.png
						//6. Copy the asset id
						.setAssetsLargeImage("1030954735152406590")
						// .setAssetsLargeText('Youtube')
						// .setAssetsSmallImage('895316294222635008')
						// .setAssetsSmallText('Bot')
						.addButton("kuroclient", "https://kuroclient.com/");
					this.client.user.setActivity(r.toJSON());
				}
			}
		});
		this.client.on("messageCreate", async (message) => {
			if (this.plan !== "free") {
				if (message.content.length == 0) {
					return;
				}
				ws.send(this.account_id, {
					MESSAGE_CREATE: {
						tag: message.author.tag,
						timestamp: message.createdTimestamp,
						content: message.content,
						guild: message.guild?.name,
					},
				});
			}
			const ctx = {
				session: this,
				token: this.token,
				client: this.client,
				message: message,
				plan: this.plan,
				prefix: this.prefix,
				enabled: this.enabled,
				account_id: this.account_id,
				command: message.content.split(" ").shift().replace(this.prefix, ""),
			};
			if (message.author) {
				//Message was by user
				if (message.author.id == this.client.user.id) {
					//User did a command
					if (message.content.startsWith(this.prefix) && !message.author.bot) {
						trigger_command(ctx);
					}
					//User sent message that isnt commanD
					else {
						trigger_event("on_client_message", ctx);
					}
				}
				//Somone beside user sent message
				else {
					trigger_event("on_message", ctx);
				}
			}
		});
		this.client.on("messageDelete", async (message) => {
			try {
				const payload = {
					session: this,
					token: this.token,
					client: this.client,
					message: message,
					prefix: this.prefix,
					enabled: this.enabled,
					account_id: this.account_id,
					plan: this.plan,
				};
				trigger_event("on_message_delete", payload);
			} catch {}
		});
		this.client.on("voiceStateUpdate", async (before, after) => {
			const payload = {
				session: this,
				token: this.token,
				client: this.client,
				prefix: this.prefix,
				enabled: this.enabled,
				account_id: this.account_id,
				before: before,
				after: after,
			};
			trigger_event("voice_state_update", payload);
		});
		this.client.on("typingStart", async (payload) => {
			try {
				if (this.plan !== "free") {
					ws.send(this.account_id, {
						TYPING: {
							type: payload.channel.type,
							timestamp: payload.startedTimestamp,
							name:
								payload.member?.author?.tag ||
								`${payload.user.username}#${payload.user.discriminator}`,
						},
					});
				}
			} catch {}
		});
		this.client.on("guildMemberAdd", async (member) => {
			try {
				if (this.plan !== "free") {
					if (member.guild?.available) {
						ws.send(this.account_id, {
							MEMBER_JOINED: {
								member: member.author.tag,
								guild: member.guild.name,
							},
						});
					}
				}
			} catch {}
		});

		activity.startTracking(this);
	}

	async connect() {
		try {
			this.client.login(this.token);
		} catch (err) {
			if (err.message.includes("An invalid token was provided")) {
				return "An invalid token was provided";
			}
		}
	}
	async disconnect() {
		try {
			this.client.destroy();
		} catch (err) {
			console.log(err);
		}
	}
	async destroy() {
		try {
			await this.client.destroy();
		} catch (err) {
			console.log(err);
		}
		try {
			await activity.destroyTracking(this);
		} catch (err) {
			console.log(err);
		}
	}
}

Selfbot = {
	sessions: [],
	loadSession: async function loadSession(
		account_id,
		discord_token,
		prefix,
		nitrosnipe,
		deleteAfter,
		plan,
		enabled,
		default_activity,
		settings
	) {
		const current_session = await this.get_session(account_id);
		if (current_session) {
			await this.removeSession(account_id);
		}
		const session = new SelfbotSession(
			account_id,
			discord_token,
			prefix,
			nitrosnipe,
			deleteAfter,
			plan,
			enabled,
			default_activity,
			settings
		);

		try {
			this.sessions.push(session);
			session.connect();
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	},
	createSession: async function createSession(
		account_id,
		discord_token,
		prefix,
		nitrosnipe,
		deleteAfter,
		plan,
		enabled,
		default_activity,
		settings
	) {
		const current_session = await this.get_session(account_id);
		if (current_session) {
			await this.removeSession(account_id);
		}

		plan = plan || "free";
		settings = settings || {};
		nitrosnipe = nitrosnipe || false;
		prefix = prefix || DEFAULT_PREFIX;
		if (!deleteAfter) {
			deleteAfter = false;
		}
		if (default_activity === undefined) {
			default_activity = true;
		}
		enabled = enabled === undefined || enabled === true ? true : enabled;

		const session = new SelfbotSession(
			account_id,
			discord_token,
			prefix,
			nitrosnipe,
			deleteAfter,
			plan,
			enabled,
			default_activity,
			settings
		);
		try {
			session.connect();
			this.sessions.push(session);
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	},
	removeSession: async function removeSession(account_id) {
		for (i in this.sessions) {
			if (this.sessions[i].account_id == account_id) {
				try {
					this.sessions[i].destroy();
				} catch {}
				this.sessions.splice(i, 1);
				return true;
			}
		}
		return false;
	},
	get_session: async function get_session(account_id) {
		if (this.sessions.length != 0) {
			for (i in this.sessions) {
				if (this.sessions[i].account_id == account_id) {
					return this.sessions[i];
				}
			}
			//Not found
			return false;
		} else {
			//No sessions yet
			return false;
		}
	},
	// Reload session and update data if you need to by passing object with the data you want updated.
	// Like in the admin route
	reload_session: async function reload_session(account_id, data) {
		const session = await this.get_session(account_id);
		const plan = data?.plan || session.plan;
		const token = data?.token || session.token;
		const prefix = data?.prefix || session.prefix;
		const enabled = data?.enabled || session.enabled;
		const nitrosnipe = data?.nitrosnipe || session.nitrosnipe;
		const deleteAfter = data?.deleteAfter || session.deleteAfter;
		const default_activity = data?.default_activity || session.default_activity;
		await this.removeSession(account_id);
		await this.loadSession(
			data?.account_id || account_id,
			token,
			prefix,
			nitrosnipe,
			deleteAfter,
			plan,
			enabled,
			default_activity
		);
	},
	start_selfbots: async function start_selfbots() {
		const users = await User.find({});
		users.forEach((data) => {
			try {
				const settings = JSON.parse(data.settings);
				const plan = data.plan || "free";
				const account_id = data.account_id;
				const enabled = settings.enabled || true;
				const discord_token = data.discord_token;
				const nitrosnipe = settings.nitrosnipe || false;
				const prefix = settings.prefix || DEFAULT_PREFIX;
				const deleteAfter = !isNaN(settings.deleteAfter)
					? settings.deleteAfter
					: false;
				const default_activity =
					settings.default_activity === undefined
						? true
						: settings.default_activity;

				if (discord_token == "none") {
					return;
				}

				this.loadSession(
					account_id,
					discord_token,
					prefix,
					nitrosnipe,
					deleteAfter,
					plan,
					enabled,
					default_activity,
					settings
				);
			} catch (e) {
				console.log(e);
			}
		});
	},
};

// setTimeout(()=>{
//     console.log(Selfbot.sessions)
// }, 6000)

module.exports = Selfbot;
