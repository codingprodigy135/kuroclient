const {channel_send, getMemberOrDefault, getMember, HELP_WEBSITE, command_error} = require('./functions.js')
const moment = require('moment');
require('moment-duration-format')

exports.ban = async function ban(ctx, args){
    try{
        if(args.length != 0){
            if(!ctx.message.member.permissions.has("BAN_MEMBERS")){
                return
            }
            const member = ctx.message.mentions.users.first() || ctx.message.guild.members.cache.get(args[0])
            if(!member){
                return
            }
            var reason = args.slice(1).join(' ').toString() || null
            await ctx.message.guild.members.ban(member, {reason: reason})
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (ping) [reason]`, null)
        }
    }catch{}
}
exports.kick = async function kick(ctx, args){
    try{
        if(args.length != 0){
            if(!ctx.message.member.permissions.has("KICK_MEMBERS")){
                return
            }
            const member = ctx.message.mentions.users.first() || ctx.message.guild.members.cache.get(args[0])
            if(!member){
                return
            }
            var reason = args.slice(1).join(' ').toString() || null
            await ctx.message.guild.members.kick(member, {reason: reason})
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (ping) [reason]`, null)
        }
    }catch{}
}
exports.members = async function kick(ctx, args){
    try{
        if(ctx.message.guild?.memberCount){
            channel_send(ctx, `\`\`\`css\n${ctx.message.guild.memberCount}\`\`\``)
        }
    }catch{}
}