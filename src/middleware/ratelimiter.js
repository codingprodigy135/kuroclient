const { RateLimiterMemory, BurstyRateLimiter } = require('rate-limiter-flexible')

const generalRateLimiter = new RateLimiterMemory({
    points: 2,
    duration: 1,
    inMemoryBlockOnConsumed: 1
})
const mediumRateLimiter = new RateLimiterMemory({
    points: 3,
    duration: 6,
    inMemoryBlockOnConsumed: 1
})
const strictRateLimiter = new RateLimiterMemory({
    points: 3,
    duration: 3600,
})
const userRateLimiter = new RateLimiterMemory({
    points: 12,
    duration: 7200,
})

async function rateLimiterMiddleware(req, res, next){
    if(req.url === '/webhook') next()
    const strictEndpoints = ['/api/forgot-password','/api/verify_email']
    const mediumEndpoints = ['/api/voice_session_activity', '/api/session_activity', '/gateway']
    const userEndpoints = ['/api/login', '/api/register']
    if(strictEndpoints.includes(req.url)){
        try{
            await strictRateLimiter.consume(req.connection.remoteAddress)
            next();
        }catch(e){
          return res.status(429).json({success: 'false', error: 'Too Many Requests'})
        }
    }else if(mediumEndpoints.includes(req.url)){
        try{
            await mediumRateLimiter.consume(req.connection.remoteAddress)
            next();
        }catch(e){
          return res.status(429).json({success: 'false', error: 'Too Many Requests'})
        }
    }else if(userEndpoints.includes(req.url)){
        try{
            await userRateLimiter.consume(req.connection.remoteAddress)
            next();
        }catch(e){
          return res.status(429).json({success: 'false', error: 'Too Many Requests'})
        }
    }else{
        try{
            await generalRateLimiter.consume(req.connection.remoteAddress)
            next();
        }catch(e){
          return res.status(429).json({success: 'false', error: 'Too Many Requests'})
        }
    }

};

module.exports = {
    rateLimiterMiddleware
 }