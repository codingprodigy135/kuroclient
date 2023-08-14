const fs = require('fs')
const ws = require("./websockets.js");
const activity = require('./activity');

let commands = {}
let ignored_files = ['functions.js', 'player.js']
// fs.readdir('./src/discord/commands', (err, files) => {
//     files.forEach(file => {
//         if(!ignored_files.includes(file)){
//             const _ = require(`./commands/${file}`)
//             for(var i in Object.keys(_)){
//                 commands[Object.keys(_)[i]] = _[Object.keys(_)[i]]
//             }
//         }
//     })
//     console.log("Loaded commands")
// })

async function command_started(ctx, args){
    console.log(`${ctx.client.user.tag} - ${ctx.command} ${args}`)
    activity.send_general(ctx.session)
    ws.send(ctx.account_id, {
      "COMMAND_STARTED": {
        command : ctx.command,
        timestamp: ctx.message.createdAt,
        prefix: ctx.prefix,
        args : args
      }
    }, {log: true, session: ctx.session})
    setTimeout(async ()=>{
        // if(ctx.message.content.indexOf(ctx.command) != -1){
        try{
            ctx.message.delete()
        }catch{}
        //}
    },1000)
    
}

const pro_commands = [
    'deleteafter',
    'nitrosnipe',
    'stealpfp',
    'stream',
    'find',
    'nuke',
    'kickall',
    'banall',
    'deleteallchannels',
    'deleteallroles',
    'deleteallemotes',
    'deleteallstickers',
    'masscreateroles',
    'masscreatechannel'
]
const aliases = [
    {'av': ['avatar']},
    {'whois': ['wi']},
    {'serverpfp': ['spp']},
    {'serverbanner': ['sb']},
    {'hiddenvcs': ['hvc']},
    {'cancelpurge': ['cp']},
    {'deleteafter': ['da']},
    {'deleteallchannels': ['dac']},
    {'deleteallroles': ['dar']},
    {'deleteallemotes': ['dae']},
    {'deleteallstickers': ['das']},
    {'masscreateroles': ['mcr']},
    {'masscreatechannel': ['mcc']}
]


module.exports = {
  run: function run(command_name, ctx, args){
      try{
          if(!ctx.enabled){
            if(ctx.command == 'enable'){
                commands['enable'](ctx, args)
            }
            return
          }
          if(ctx.plan !== 'pro' && pro_commands.includes(ctx.command)){
              try{
                  ctx.message.edit("Upgrade plan to use this feature")
              }catch{}
              return
          }
          const isAlias = aliases.find(alias=> Object.values(alias)[0].includes(command_name))
          if(isAlias){
            command_name = Object.keys(isAlias)[0]
          }
          commands[command_name](ctx, args)
          command_started(ctx, args)
      }catch(e){
        if(e.toString().includes(`commands[command_name] is not a function`)){
            //Command not found
        }else if(e.toString().includes('TypeError: eval(...) is not a function')){
            //Its when they type sumn before prefix k.av, this error is fine
        }else if(e.toString().includes(`SyntaxError: Unexpected token \'${ctx.prefix}\'`)){
              //When they type {prefix}{prefix}{command} EX: ..av
        }else{
            console.log(e)
        }
      }
  }
};
