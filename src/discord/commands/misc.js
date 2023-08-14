const yahooStockPrices = require('yahoo-stock-prices')
const {channel_send, command_error} = require('./functions.js')
const translate_ = require('translate');


exports.stockprice = async function stockprice(ctx, args){
    try{
        if(args.length != 0){
            const data = await yahooStockPrices.getCurrentData(args[0].toUpperCase());
            if(data){
                return channel_send(ctx, `\`\`\`css\n[${data.price}]\`\`\``)
            }
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (ticker symbol)`, `\nIf this stock price isnt accurate try adding -usd to the end of the ticker\nEx:\n${ctx.prefix}stockprice btc-usd\n${ctx.prefix}stockprice tsla`)
        }
    }catch(e){
        console.log(e)
    }
}
exports.translate = async function translate(ctx, args){
    try{
        if(args.length != 0){
            const input = args[0]
            if(ctx.message.reference){
                const msg = await ctx.message.channel.messages.fetch(ctx.message.reference.messageId)
                if(msg){
                    try{
                        const text = await translate_(msg.content, input);
                        return channel_send(ctx, `\`\`\`fix\nTranslated to ${input}:\n${text}\`\`\``)
                    }catch(e){
                       if(e.message.toString().includes("is not part of the ISO 639-1")){
                          return channel_send(ctx, `\`\`\`css\n[Language not found]\`\`\``)
                       }
                    }
                }
            }else{
                return channel_send(ctx, `You need to reply to message you want to translate`)
            }
        }else{
            command_error(ctx, `${ctx.prefix}${ctx.command} (language)`, ``)
        }
    }catch(e){
        console.log(e)
    }
}