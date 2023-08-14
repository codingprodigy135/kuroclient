const moment = require("moment");
const fetch = require("node-fetch");
const activity = require("./activity");
const { User } = require("../mongo/db.js");

const { add_deleted_message, add_nitro } = require("../mongo/db.js");
const {
	WebhookClient,
	MessageEmbed,
	MessageAttachment,
} = require("discord.js-selfbot-v13");

async function invalidateWebhook(account_id, type) {
	const data = await User.find({ account_id: account_id });
	if (data.length !== 0) {
		const settings = JSON.parse(data[0].settings);
		settings["webhooks"][type]["working"] = false;
		await User.updateOne(
			{ account_id: account_id },
			{ $set: { settings: JSON.stringify(settings) } }
		);
	}
}

async function on_message(payload) {
	if (payload.session.nitrosnipe) {
		const regex = {
			gift: /(discord.gift|discord.com|discordapp.com\/gifts)\/\w{16,25}/gim,
			url: /(discord\.gift\/|discord\.com\/gifts\/|discordapp\.com\/gifts\/)/gim,
		};
		if (payload.message.content.match(regex.gift)) {
			var author_name = payload.message.author.tag;
			var channel_name =
				payload.message.channel.type == `DM`
					? `dm with ${payload.message.channel.recipient.username}#${payload.message.channel.recipient.discriminator}`
					: payload.message.channel.name;
			var author_pfp_url = payload.message.author.avatarURL();
			var content = payload.message.cleanContent;
			var server_name = payload.message?.guild?.name || null;
			var createdTimestamp = payload.message.createdTimestamp;
			var type = payload.message.channel.type;
			var url = payload.message.url;

			try {
				await payload.client.redeemNitro(payload.message.content);
				add_nitro(
					JSON.stringify({
						[payload.account_id]: {
							author_name: author_name,
							channel_name: channel_name,
							author_pfp_url: author_pfp_url,
							content: content,
							server_name: server_name,
							createdTimestamp: createdTimestamp,
							type: type,
							url: url,
							redeemed: true,
						},
					}),
					payload.plan
				);
				//WS.SEND
			} catch (e) {
				if (e.toString().includes(`Unknown Gift Code`)) {
					add_nitro(
						JSON.stringify({
							[payload.account_id]: {
								author_name: author_name,
								channel_name: channel_name,
								author_pfp_url: author_pfp_url,
								content: content,
								server_name: server_name,
								createdTimestamp: createdTimestamp,
								type: type,
								url: url,
								redeemed: false,
							},
						}),
						payload.plan
					);
					//WS.SEND
				}
			}
		}
	}
}

async function on_client_message(payload) {
	if (payload.session.deleteAfter || payload.session.deleteAfter === 0) {
		if (payload.session.deleteAfter !== 0) {
			setTimeout(async () => {
				try {
					payload.message.delete();
				} catch {}
			}, payload.session.deleteAfter * 1000);
		} else {
			try {
				payload.message.delete();
			} catch {}
		}
	}
	activity.send_general(payload.session);
}

async function on_message_delete(payload) {
	try {
		if (!payload.message.author) {
			return;
		}
		if (payload.message.author.bot || payload.message.system) {
			return;
		}
		if (payload.message.author.id == payload.client.user.id) {
			return;
		}
		var author_name = payload.message.author.tag;
		var channel_name =
			payload.message.channel.type == `DM`
				? `dm with ${payload.message.channel.recipient.username}#${payload.message.channel.recipient.discriminator}`
				: payload.message.channel.name;
		var author_pfp_url = payload.message.author.avatarURL();
		var content = payload.message.cleanContent;
		var server_name = payload.message?.guild?.name || null;
		var createdTimestamp = payload.message.createdTimestamp;
		var type = payload.message.channel.type;
		var url = payload.message.url;
		var attachments =
			payload.message.attachments.size == 0
				? null
				: [...payload.message.attachments.values()];
		if (attachments && content.length == 0 && payload.plan == "free") {
			return;
		}
		if (content.slice(0, 2) == "<:" || content.slice(0, 2) == "<a:") {
			return;
		}

		if (
			attachments &&
			payload.plan !== "free" &&
			payload.session?.settings?.webhooks?.image_logger
		) {
			const webhook_url = payload.session.settings.webhooks.image_logger.url;
			const working = payload.session.settings.webhooks.image_logger.working;

			if (!webhook_url && working) {
				return;
			}

			const webhookMatch =
				/https:\/\/discord\.com\/api\/webhooks\/(\d{14,22})\/([\w_-]*)/g.exec(
					webhook_url
				);
			if (!webhookMatch) {
				return;
			}
			const webhookId = webhookMatch[1];
			const webhookToken = webhookMatch[2];

			try {
				const hook = new WebhookClient({ id: webhookId, token: webhookToken });
				for (var i in attachments) {
					const allowedExtensions = ["png", "jpg", "jpeg", "gif", "webp"];
					const messsageId = attachments[i].id;
					const filename = attachments[i].name;
					const image_url = attachments[i].url;
					const ext = attachments[i].contentType.split("/")[1];
					const name = payload.message?.author?.tag || "";
					const content = payload.message.cleanContent || "";
					const avatar_url =
						payload.message?.author?.displayAvatarURL({ dynamic: true }) || "";
					const timestamp = moment(payload.message.createdAt).format(
						"YYYY-MM-DD HH:m:s"
					);
					const footer =
						(payload.message.guild?.available
							? `${payload.message.guild.name} - ${payload.message.channel.name} | ${timestamp}\n${messsageId}`
							: `Direct messages | ${timestamp}\n${messsageId}`) || "";

					if (allowedExtensions.includes(ext)) {
						const imageUrlData = await fetch(image_url);
						const arrayBuffer = await imageUrlData.arrayBuffer();
						const image = Buffer.from(arrayBuffer);

						const attachment = new MessageAttachment(image, `${filename}`);
						const embed = new MessageEmbed()
							.setAuthor({ name: name, iconURL: avatar_url })
							.setDescription(content)
							.setFooter({ text: footer })
							.setImage(`attachment://${attachment.name}`);

						await hook.send({
							embeds: [embed],
							files: [attachment],
						});
					} else {
						await hook.send({
							content: image_url,
						});
					}

					try {
						hook.destroy();
					} catch (e) {
						console.log(e);
					}
				}
			} catch (e) {
				console.log(e);
				return invalidateWebhook(payload.session.account_id, "image_logger");
			}
		}
		// if(attachments && payload.plan !== 'free'){
		//     var allowedExtensions = ['jpg','webp', 'jpeg','png']
		//     for(var i in attachments){
		//         try{

		//             var url = attachments[i].url
		//             var ext = attachments[i].contentType.split('/')[1]
		//             if(!allowedExtensions.includes(ext)){return}

		//             const imageUrlData = await fetch(url);
		//             const buffer = await imageUrlData.arrayBuffer();

		//             if(payload.plan == 'pro'){
		//                 if(buffer.byteLength > 178257) return
		//             }else if(payload.plan == 'ultimate'){
		//                 if(buffer.byteLength > 59419) return
		//             }else{
		//                 return
		//             }
		//             const stringifiedBuffer = Buffer.from(buffer).toString('base64');
		//             const contentType = imageUrlData.headers.get('content-type');
		//             const imageBase64 = `data:image/${contentType};base64,${stringifiedBuffer}`;
		//             attachment_bytes.push({[url]: {
		//               base64: imageBase64,
		//               createdTimestamp: createdTimestamp,
		//               server_name: server_name,
		//               channel_name: channel_name,
		//               author_name: author_name,
		//             }})
		//         }catch(e){
		//         }
		//     }

		//     for(var i in attachment_bytes){
		//         add_deleted_image(JSON.stringify({
		//             [payload.account_id] : attachment_bytes[i]
		//         }), payload.plan);
		//     }
		// }
		add_deleted_message(
			JSON.stringify({
				[payload.account_id]: {
					author_name: author_name,
					channel_name: channel_name,
					author_pfp_url: author_pfp_url,
					content: content,
					server_name: server_name,
					createdTimestamp: createdTimestamp,
					type: type,
					token: payload.token,
					url: url,
				},
			}),
			payload.plan
		);
	} catch (e) {
		console.log(e);
	}
}

async function voice_state_update(payload) {
	//If user joined vc
	if (payload.after?.user?.id == payload.client?.user?.id) {
		if (payload.after.channel) {
			if (payload.before.channel?.id == payload.after.channel?.id) {
				//Changed state in vc
			} else {
				//Join a vc
				activity.track_channel(payload.session, payload.after.channel);
			}
		}
	} else {
	}
}

module.exports = {
	run: function run(event_name, payload) {
		try {
			eval(event_name)(payload);
		} catch (e) {
			if (
				e.toString().includes(`ReferenceError: ${event_name} is not defined`)
			) {
				console.log("Event not found");
			} else {
				console.log(e);
			}
		}
	},
};
