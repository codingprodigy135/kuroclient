const tools = require("../../util/tools.js");
const {channel_send, delete_message, command_error} = require('./functions.js')
const request = require("request");

async function clear(ctx, index) {
    try{
        const authToken = ctx.session.token;
        const authorId = ctx.client.user.id;
        const channelId = ctx.message.channelId;
        if(/^\d+$/.test(index)){
            if(parseInt(index) == 0){return}
        }else if(index?.toLowerCase() === 'all'){
          index = null
        }else{
          command_error(ctx, `${ctx.prefix}${ctx.command} (number)`, `You can also type all to delete all messages`)
          return
        }
    
    
        let deleted = 0;
        const wait = async (ms) => new Promise(done => setTimeout(done, ms))
    
        const headers = {
            "Authorization": authToken
        };
    
        const recurse = (before) => {
            let params = before ? `?before=${before}` : ``;
    
            request({
                url: `https://discord.com/api/v9/channels/${channelId}/messages${params}`,
                headers: headers,
                json: true
            }, async (error, response, result) => {
                if (response === undefined) {
                    return recurse(before);
                }
    
                if (response.statusCode === 202) {
                    const w = response.retry_after;
                    await wait(w);
                    return recurse(before);
                }
    
                if (response.statusCode !== 200) {
                    return
                }
    
                for (let i in result) {
                    if(deleted !== 0 && deleted == index){
                      return ctx.session.purging = false;
                    }
                    let message = result[i];
    
                    if (message.author.id === authorId && message.type !== 3) {
                        await new Promise((resolve) => {
    
                            const deleteRecurse = () => {
                                request.delete({
                                    url: `https://discord.com/api/v9/channels/${channelId}/messages/${message.id}`,
                                    headers: headers,
                                    json: true
                                }, async (error, response, result) => {
    
                                    if (error) {
                                        return deleteRecurse();
                                    }else if (result) {
                                      if (result.retry_after !== undefined) {
                                          //console.log(`Rate-limited! Waiting ${result.retry_after}ms to continue the purge.`)
                                          await wait(result.retry_after * 1000);
                                          return deleteRecurse();
                                      }
                                    }else{
                                        if(index !== null){
                                            deleted+=1
                                        }
                                    }
                                    
    
                                    resolve()
                                });
                            }
    
                            deleteRecurse();
                        });
                    }
                }
    
                if (result.length === 0) {
                  ctx.session.purging = false;
                } else {
                    recurse(result[result.length - 1].id);
                }
            });
        }
    
        recurse();
    }catch{

    }
}

async function slowClear(ctx, index) {
    try{
        const authToken = ctx.session.token;
        const authorId = ctx.client.user.id;
        const channelId = ctx.message.channelId;
        if(/^\d+$/.test(index)){
            if(parseInt(index) == 0){return}
        }else if(index?.toLowerCase() === 'all'){
          index = null
        }else{
          command_error(ctx, `${ctx.prefix}${ctx.command} (number)`, `You can also type all to delete all messages`)
          return
        }
    
    
        let deleted = 0;
        const wait = async (ms) => new Promise(done => setTimeout(done, ms))
    
        const headers = {
            "Authorization": authToken
        };
    
        const recurse = (before) => {
            let params = before ? `?before=${before}` : ``;
    
            request({
                url: `https://discord.com/api/v9/channels/${channelId}/messages${params}`,
                headers: headers,
                json: true
            }, async (error, response, result) => {
                await wait(1000);
                if (response === undefined) {
                    return recurse(before);
                }
    
                if (response.statusCode === 202) {
                    const w = response.retry_after;
                    await wait(w);
                    return recurse(before);
                }
    
                if (response.statusCode !== 200) {
                    return
                }
    
                for (let i in result) {
                    if(deleted !== 0 && deleted == index){
                      return ctx.session.purging = false;
                    }
                    let message = result[i];
    
                    if (message.author.id === authorId && message.type !== 3) {
                        await new Promise((resolve) => {
    
                            const deleteRecurse = () => {
                                request.delete({
                                    url: `https://discord.com/api/v9/channels/${channelId}/messages/${message.id}`,
                                    headers: headers,
                                    json: true
                                }, async (error, response, result) => {
    
                                    if (error) {
                                        return deleteRecurse();
                                    }else if (result) {
                                      if (result.retry_after !== undefined) {
                                          //console.log(`Rate-limited! Waiting ${result.retry_after}ms to continue the purge.`)
                                          await wait(result.retry_after * 1000);
                                          return deleteRecurse();
                                      }
                                    }else{
                                        if(index !== null){
                                            deleted+=1
                                        }
                                    }
                                    
                                    await wait(1000);
                                    resolve()
                                });
                            }
    
                            deleteRecurse();
                        });
                    }
                }
    
                if (result.length === 0) {
                  ctx.session.purging = false;
                } else {
                    recurse(result[result.length - 1].id);
                }
            });
        }
    
        recurse();
    }catch{

    }
}

exports.slowpurge = async function slowpurge(ctx, args){
    if(args.length != 0){
        try{
            slowClear(ctx, args[0])
        }catch(e){
            console.log(e)
            ctx.session.purging = false;
        }
    }else{
        command_error(ctx, `${ctx.prefix}${ctx.command} (number)`, `You can also type all to delete all messages`)
    }
}

exports.purge = async function purge(ctx, args){
    if(args.length != 0){
        try{
            clear(ctx, args[0])
        }catch(e){
            console.log(e)
            ctx.session.purging = false;
        }
    }else{
        command_error(ctx, `${ctx.prefix}${ctx.command} (number)`, `You can also type all to delete all messages`)
    }
}
exports.cancelpurge = async function cancelpurge(ctx, args){
    ctx.session.purging = false
    ctx.message.react('✅')
}
