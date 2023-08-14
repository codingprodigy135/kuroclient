const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID


async function googleAnalytics(req, res, next){
    res.locals.gtag_id = GOOGLE_ANALYTICS_ID
    next()
}

module.exports = {
   googleAnalytics
}
