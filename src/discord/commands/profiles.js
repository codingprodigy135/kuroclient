const {channel_send, getMemberOrDefault, getMember, command_error, userInVoice} = require('./functions.js')
const moment = require('moment');
const { Permissions } = require('discord.js-selfbot-v13');

exports.av = async function av(ctx, args){
    try{
        var member = await getMemberOrDefault(ctx)
        if(!member){
            return channel_send(ctx, '> Failed to find member')
        }
        await channel_send(ctx, member.displayAvatarURL({dynamic : true}))
    }catch{}
}
exports.banner = async function banner(ctx, args){
  try{
      let member = ctx.message.mentions.users.first() || ctx.client.user;
      const user = await ctx.client.api.users(member.id).get();
      banner_url = user.banner ? `https://cdn.discordapp.com/banners/${member.id}/${user.banner}?size=512` : null
      if (banner_url){
          await channel_send(ctx, banner_url);
      }
  }catch(e){
    console.log(e)
  }
}
exports.stealpfp = async function stealpfp(ctx, args){
    try{
      var member = await getMemberOrDefault(ctx)
      if(!member){
          return channel_send(ctx, '> Failed to find member')
      }
      ctx.client.user.setAvatar(member.displayAvatarURL({dynamic : true}))
        .then(user => ctx.message.react('✅'))
        .catch(console.error);
    }catch{}
}
exports.find = async function find(ctx, args){
  try{
    if(args.length !== 0){
        var user = await getMember(ctx)
        if(!user){
            return channel_send(ctx, '> Failed to find member')
        }
        var member = await userInVoice(ctx, user)

        if(member){
            var message = `\`\`\`Found ${member.user.tag} in ${member.guild.name}\nChannel: ${member.voice.channel.name}\nMuted: ${member.voice.mute}\nDeafened: ${member.voice.deaf}\nStreaming:${member.voice.streaming}\nJoinable: ${member.voice.channel.permissionsLocked || 'Can\'t tell'}\n\nFull: ${member.voice.channel.full}\nLimit: ${member.voice.channel.userLimit == 0 ? 'None' : member.voice.channel.userLimit}\`\`\``

            channel_send(ctx, message)
            try{
                var invite = await member.voice.channel.createInvite()
                channel_send(ctx,`discord.gg/${invite.code}`)
            }catch(e){
                console.log(e)
            }
        }else{
            var message = `\`\`\`User not found in a voice channel\`\`\``
            channel_send(ctx, message)
        }
    }else{
        command_error(ctx, `${ctx.prefix}${ctx.command} (@member or id)`, 'Finds the voice channel the member is in')
    }
  }catch(e){
    console.log(e)
  }
}
exports.whois = async function whois(ctx, args){
    try{
        const member = (ctx.message.channel.guild.members.cache.find(member => member.user == ctx.message.mentions.users.first() || member.id == args[0])) || ctx.message.guild.me
        const data = []
        // member.displayHexColor
        data.push(`ID: ${member.id}`)
        data.push(`Joined at: ${moment(member.joinedAt).format('MMMM Do YYYY, h:mm:ss a')}`)
        data.push(`Created account: ${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)
        data.push(`Moderatable: ${member.moderatable}`)
        if(member.permissions.has('ADMINISTRATOR')){
            data.push(`Permissions: ADMINISTRATOR`)
        }else{
            const memberPermissions = []
            const ignoredPermissions = [
                'ATTACH_FILES',
                'REQUEST_TO_SPEAK',
                'USE_APPLICATION_COMMANDS',
                'USE_VAD',
                'SPEAK',
                'ADD_REACTIONS',
                'CREATE_INSTANT_INVITE',
                'SEND_MESSAGES_IN_THREADS',
                'START_EMBEDDED_ACTIVITIES',
                'USE_EXTERNAL_STICKERS',
                'VIEW_CHANNEL',
                'SEND_MESSAGES',
                'READ_MESSAGE_HISTORY',
                'CONNECT',
                'USE_PUBLIC_THREADS',
                'USE_PRIVATE_THREADS',
                'CREATE_PRIVATE_THREADS'
            ]
            const permissions = Object.keys(Permissions.FLAGS);
            for(i in permissions){
                if(member.permissions.has(permissions[i])){
                    if(!ignoredPermissions.includes(permissions[i])){
                        memberPermissions.push(permissions[i])
                    }
                }
            }
            data.push(`Permissions:\n${memberPermissions.join("\n")}`)
        }
        var roles = member.roles.cache.map(role => role.name)
        if(roles){data.push(`Roles:\n${roles.join(",\n ")}`)}
        const text = data.join("\n")
        channel_send(ctx, `\`\`\`yaml\n${text}\`\`\``)
    }catch(e){
      console.log(e)
    }
}

exports.hypesquad = async function hypesquad(ctx, args){
    try{
        if(args.length !== 0){
            const squad = args[0].toUpperCase()        
            if(squad.includes("BRAVERY")){
                ctx.message.react('✅')
                ctx.client.user.setHypeSquad('HOUSE_BRAVERY')
            }else if(squad.includes("BRILLIANCE")){
                ctx.message.react('✅')
                ctx.client.user.setHypeSquad('HOUSE_BRILLIANCE')
            }else if(squad.includes("BALANCE")){
                ctx.message.react('✅')
                ctx.client.user.setHypeSquad('HOUSE_BALANCE')
            }else if(squad == 'leave'){
                ctx.message.react('✅')
                ctx.client.user.setHypeSquad(0);
            }else{
                command_error(ctx, `${ctx.prefix}${ctx.command} (housename)`, `\nAllows you change your hypesquad badge\nExample:\n${ctx.prefix}hypesquad bravery`)
            }
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (housename)`, `\nAllows you change your hypesquad badge\nExample:\n${ctx.prefix}hypesquad bravery`)
        };
    }catch(e){
      console.log(e)
    }
}
  