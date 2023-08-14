const {channel_send, command_error} = require('./functions.js')
const {RichPresence} = require("discord.js-selfbot-v13");
const tools = require("../../util/tools.js");

exports.stream = async function stream(ctx, args){
    try{
      if(args.length != 0){
          var stream_url = args[0].toString()
          var text = args.slice(1).join(' ').toString()


          if((stream_url.includes('https://www.twitch.tv/') || stream_url.includes('youtube.com/watch?')) && text){
              const r = new RichPresence()
              	.setType('STREAMING')
              	.setURL(stream_url)
                .setName(text)
              ctx.client.user.setActivity(r.toJSON());



              //ctx.client.user.setPresence({status: text, activity: {name: "test", type: "STREAMING", url: stream_url}});
              ctx.message.react('✅')

          }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (twitch_url) (whatever text you want)`, null)
          }
      }else{
          command_error(ctx, `${ctx.prefix}${ctx.command} (twitch_url) (whatever text you want)`, null)
      }
    }catch(e){
      console.log(e)
    }
}
exports.watching = async function watching(ctx, args){
    try{
      if(args.length != 0){
          var text = args.join(' ')
          if(text){
              ctx.client.user.setActivity(text, { type: 'WATCHING' });
              ctx.message.react('✅')
          }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (whatever text you want)`, null)
          }
      }else{
          command_error(ctx, `${ctx.prefix}${ctx.command} (whatever text you want)`, null)
      }
    }catch(e){
      console.log(e)
    }
}
exports.listening = async function listening(ctx, args){
    try{
      if(args.length != 0){
          var text = args.join(' ')
          if(text){
              ctx.client.user.setActivity(text, { type: 'LISTENING' });
              ctx.message.react('✅')
          }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (whatever text you want)`, null)
          }
      }else{
          command_error(ctx, `${ctx.prefix}${ctx.command} (whatever text you want)`, null)
      }
    }catch(e){
      console.log(e)
    }
}
exports.playing = async function playing(ctx, args){
    try{
      if(args.length != 0){
          var text = args.join(' ')
          if(text){
              ctx.client.user.setActivity(text, { type: 'PLAYING' });
              ctx.message.react('✅')
          }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (whatever text you want)`, null)
          }
      }else{
          command_error(ctx, `${ctx.prefix}${ctx.command} (whatever text you want)`, null)
      }
    }catch(e){
      console.log(e)
    }
}
exports.competing = async function competing(ctx, args){
    try{
      if(args.length != 0){
          var text = args.join(' ')
          const r = new RichPresence()
          	.setType('COMPETING')
            .setName(text)
          ctx.client.user.setActivity(r.toJSON());
          ctx.message.react('✅')
      }else{
          command_error(ctx, `${ctx.prefix}${ctx.command} (twitch_url) (whatever text you want)`, null)
      }
    }catch(e){
      console.log(e)
    }
}
exports.clear = async function clear(ctx, args){
  try{
      ctx.client.user.setActivity(null);
      ctx.message.channel.send("This may will take a while").then(msg => {
        setTimeout(async ()=>{
           msg.delete()
        },3000)
      })
  }catch(e){
    console.log(e)
  }
}