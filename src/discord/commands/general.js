const {channel_send, update_settings, getMemberOrDefault, HELP_WEBSITE, command_error} = require('./functions.js')
const moment = require('moment');

exports.enable = async function enable(ctx, args){
    try{
        update_settings({
            ctx: ctx,
            token: ctx.token,
            name: 'enabled',
            value: true,
            updateSession: true
        })
    }catch(e){
      console.log(e)
    }
}
exports.disable = async function disable(ctx, args){
    try{
        update_settings({
            ctx: ctx,
            token: ctx.token,
            name: 'enabled',
            value: false,
            updateSession: true
        })
    }catch(e){
      console.log(e)
    }
}
exports.help = async function help(ctx, args){
    try{
        await channel_send(ctx, HELP_WEBSITE)
    }catch{}
}
exports.userinfo = async function userinfo(ctx, args){
    try{
        var member = await getMemberOrDefault(ctx)
        if(!member){
            return channel_send(ctx, '> Failed to find member')
        }
        var info = []
        try{
          const tag = member.tag
          if(tag){
              info.push(tag)
          }
        }catch{}
        try{
            const member_id = member.id
            if(member_id){
                info.push(`ID: ${member_id}`)
            }
        }catch{}
        try{
            const created = member.createdAt
            if(created){
                info.push(`Created at: ${moment(created).format('LLLL')}`)
            }
        }catch{}
        try{
            const avatar_url = member.displayAvatarURL()
            if(avatar_url){
                info.push(`Avatar url: ${avatar_url}`)
            }
        }catch{}
        await channel_send(ctx, `\`\`\`${info.join('\n')}\`\`\``)
    }catch(e){}
}
exports.settings = async function settings(ctx, args){
    var message = `\`\`\`css\n[Settings]\nnitrosnipe = ${ctx.session.nitrosnipe === true ? 'enabled': 'disabled'}\nAuto delete messsages = ${ctx.session.deleteAfter === false ? 'disabled': `${ctx.session.deleteAfter}s`}\n\`\`\``
    await channel_send(ctx, message)
}
exports.prefix = async function prefix(ctx, args){
    try{
        if(args.length != 0){
            var prefix = args[0]
            update_settings({
                ctx: ctx,
                token: ctx.token,
                name: 'prefix',
                value: prefix,
                updateSession: true
            })              
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (prefix)`, null)
        }
    }catch(e){
      console.log(e)
    }
}
exports.uptime = async function uptime(ctx, args){
    try{
        await channel_send(ctx, "> The uptime is **" + moment.duration(ctx.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]') + "**")
    }catch{}
}
exports.nitrosnipe = async function nitrosnipe(ctx, args){
    try{
        if(args.length != 0){
            var nitrosnipe = args[0].toLowerCase()
            if(nitrosnipe == 'true' || nitrosnipe == 'false'){
                update_settings({
                    ctx: ctx,
                    token: ctx.token,
                    name: 'nitrosnipe',
                    value: nitrosnipe,
                    updateSession: true
                })                    
            }else{
                command_error(ctx, `${ctx.prefix}${ctx.command} (true or false)`, null)
            }
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (true or false)`, null)
        }
    }catch(e){
      console.log(e)
    }
}
exports.deleteafter = async function deleteafter(ctx, args){
    try{
        if(args.length != 0){
            const input = args[0]
            if(!isNaN(input)){
                const duration = Number(input)
                if(duration < 0){
                    return channel_send(ctx, 'Duation cannot be less than zero')
                }
                if(duration > 86400){
                    return channel_send(ctx, 'Duation cannot be longer than a day')
                }

                update_settings({
                    ctx: ctx,
                    token: ctx.token,
                    name: 'deleteAfter',
                    value: duration,
                    updateSession: true
                })                    
            }else if(input.toLowerCase() === 'off'){
                update_settings({
                    ctx: ctx,
                    token: ctx.token,
                    name: 'deleteAfter',
                    value: false,
                    updateSession: true
                }) 
            }
            else{
                command_error(ctx, `${ctx.prefix}${ctx.command} (duration in seconds)`, null)
            }
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (duration in seconds)`, null)
        }
    }catch(e){
      console.log(e)
    }
}