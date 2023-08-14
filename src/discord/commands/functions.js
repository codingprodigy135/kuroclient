// https://www.reddit.com/r/discordapp/comments/8lev3t/discord_colored_text_with_code_markup_guide/
// https://www.writebots.com/discord-text-formatting/

const fetch = require("node-fetch");
const {User} = require('../../mongo/db.js');
const HELP_WEBSITE = process.env.HELP_WEBSITE
const {DEFAULT_PREFIX, DEFAULT_DELETE_AFTER_COMMANDS} = require('../../util/globals.js');


async function update_settings(data){
    const ctx = data.ctx
    const token = data.token
    const name = data.name
    const value = data.value
    const updateSession = data.updateSession
    const user = await User.find({discord_token: token})
    if(user.length != 0){
        const settings = JSON.parse(user[0].settings)
        settings[name] = value
        await User.updateOne({discord_token: token}, {$set: {settings: JSON.stringify(settings)}})
        if(updateSession){
            ctx.session[name] = value
        }
    }
}
async function channel_send(ctx, message){
    try{
      ctx.message.channel.send(message).then(msg => {
            setTimeout(() => {
                try{
                    msg.delete()
                }catch{}
            }, DEFAULT_DELETE_AFTER_COMMANDS)
      })
      return true
    }catch{
      return false
    }
}
async function delete_message(headers, channel_id, message_id){
    const API_DELETE_URL = `https://discord.com/api/v9/channels/${channel_id}/messages/${message_id}`;
    var resp = await fetch(API_DELETE_URL, {headers, method: 'DELETE'});

    if(resp.status == 204){
      return {success: true, retry: 500};
    }else if(resp.status == 429){
      var resp_data = await resp.json()
      return {success: false, retry: resp_data.retry_after * 1500};
    }else{
      return {success: false, retry: 500};
    }
}
async function userInVoice(ctx, user){
  return new Promise((resolve, reject) => {
      ctx.client.guilds.cache.forEach(guild => {
        guild.members.cache.forEach(member => {
            if(member.id == user.id){
                if(member.voice && member.voice?.channel){
                    resolve(member)
                }
            }
        })
    })
    reject(false)
  })
}
async function getMemberOrDefault(ctx) {
    try{
        let mentioned = ctx.message.mentions.users.first()
        if(mentioned === undefined){
            var id_match = ctx.message.content.match(/\s\d{18}\s?/g)
            if(id_match !== null){
              try{
                var user = await ctx.client.users.fetch(id_match[0])
                return user;
              }catch{
                  return false;
              }
            }else{
              return ctx.client.user;
            }
        }else{
            return mentioned;
        }
    }catch{
        return false;
    }
}
async function getMember(ctx) {
    try{
        let mentioned = ctx.message.mentions.users.first()
        if(mentioned === undefined){
            var id_match = ctx.message.content.match(/\s\d{18}\s?/g)
            if(id_match !== null){
              try{
                var user = await ctx.client.users.fetch(id_match[0])
                return user;
              }catch{
                  return false;
              }
            }else{
              return false;
            }
        }else{
            return mentioned;
        }
    }catch{
        return false;
    }
}
async function command_error(ctx,example, description){
    if(description){
        var message = `\`\`\`Command Error: Missing arguments\nHow to use:\n${example}\n${description}\`\`\``
    }else{
        var message = `\`\`\`Command Error: Missing arguments\nHow to use:\n${example}\`\`\``
    }

     await channel_send(ctx, message)
}

module.exports = {
  update_settings,
  channel_send,
  delete_message,
  userInVoice,
  getMemberOrDefault,
  getMember,
  command_error,
  HELP_WEBSITE,
  DEFAULT_PREFIX,
  DEFAULT_DELETE_AFTER_COMMANDS
}
