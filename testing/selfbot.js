const {
	Client,
	Guild,
	Permissions,
	WebhookClient,
	MessageEmbed,
	MessageAttachment,
} = require("discord.js-selfbot-v13");
const client = new Client({ checkUpdate: false }); // All partials are loaded automatically
const moment = require("moment");

client.on("ready", async () => {
	console.log(`${client.user.username} is ready!`);
});

// await message.guild.members.cache.get(args[0].slice(2).replace('>',''))

client.on("messageCreate", async (message) => {
	if (message.author.id != client.user.id) return;
	if (message.content.startsWith(".")) {
	}
});
