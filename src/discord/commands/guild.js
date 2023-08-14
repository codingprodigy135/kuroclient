const {channel_send, command_error} = require('./functions.js')
const moment = require('moment');

exports.serverinfo = async function serverinfo(ctx, args){
    try{
        if(ctx.message.guild?.available){
            const data = []
            let owner = await ctx.client.users.fetch(ctx.message.guild.ownerId)
            if(owner){
                owner = `${owner.username}#${owner.discriminator}`
            }else{
                owner = ctx.message.guild.ownerId
            }
            // var roles = ctx.message.guild.roles.cache.map(role => role.name)
            // if(roles){
            //     data.push(roles.join(", "))
            // }
            data.push(`Owner: ${owner}`)
            data.push(`Server id: ${ctx.message.guild.id}`)
            data.push(`Members: ${ctx.message.guild.memberCount}`)
            data.push(`Server created: ${moment(ctx.message.guild.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`)
            if(desc){
            data.push(`Description: ${desc > 150 ? desc.slice(0, 4)+"..." : desc}`)
            }
            data.push(`Channels: ${ctx.message.guild.channels.channelCountWithoutThreads}`)
            const text = data.join("\n")
            channel_send(ctx, `\`\`\`yaml\n${text}\`\`\``)
        }
    }catch(e){
        console.log(e)
    }
}
exports.serverpfp = async function serverpfp(ctx, args){
    try{
        if(ctx.message.guild?.available){
            if(!ctx.message.guild.icon) return
            const url = await ctx.message.guild.iconURL({dynamic: true})
            if(url) channel_send(ctx, url)
        }
    }catch(e){
        console.log(e)
    }   
}
exports.serverbanner = async function serverbanner(ctx, args){
    try{
        if(ctx.message.guild?.available){
            if(!ctx.message.guild.banner) return
            const url = await ctx.message.guild.bannerURL({dynamic: true})
            if(url) channel_send(ctx, url)
        }
    }catch(e){
        console.log(e)
    }
}
exports.hiddenvcs = async function hiddenvcs(ctx, args){
    try{
        if(ctx.message.guild?.available){
            const hiddenChannels = ctx.message.guild.channels.cache.filter(channel => channel.viewable === false)
            if(hiddenChannels){
                const data = []
                const channels = [...hiddenChannels.values()];
                if(channels.length === 0) return
                for(i in channels){
                    const channel = channels[i]
                    const name = channel.name
                    const userLimit = channel.userLimit
                    const memberCount = channel.members?.size || 0
                    let members = null;
                    if(memberCount !== 0){
                        const names = channel.members.map(member => `-${member.user.username}#${member.user.discriminator}`)
                        members = names.join('\n')
                    }
                    if(members){
                      data.push(`${name} (${memberCount}/${userLimit})\nIn call:\n${members}`)
                    }else{
                      data.push(`${name} (${memberCount}/${userLimit})`)
                    }
                }
                const text = data.join("\n\n")
                channel_send(ctx, `\`\`\`fix\n${text}\`\`\``)
            }else{
                channel_send(ctx, `\`\`\`fix\nNo voice channels found\`\`\``)
            }
        }
    }catch(e){
        console.log(e)
    }
}