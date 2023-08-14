const ignored_errors_code = ['EBADCSRFTOKEN', 17419, 'ERR_OUT_OF_RANGE']
const ignored_errors = ['Unexpected token', 'node_modules/discord.js-selfbot-v13']

process.on('uncaughtException', function (err) {
    if(err.name !== 'Error [TOKEN_INVALID]'){
        console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
        console.error(err.stack)
        process.exit(1)
    }
})

async function error_handler(err, req, res, next){
    console.trace("trace")
    console.log(err.stack)   
    if(ignored_errors_code.includes(err.code)){
        return next()
    }

    for (let i = 0; i < ignored_errors.length; i++) { 
        if(ignored_errors.includes(ignored_errors[i])){
            return next()
        }
    }
    process.exit(1)
}

//On close program(not when crash)
process.on('SIGINT', function() {
    process.exit();
});

process.on('unhandledRejection', function(error){
    console.log(error.stack)
    return
});

module.exports = {
    error_handler
};
