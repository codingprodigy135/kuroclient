const {addVcActivityId} = require('../mongo/db.js')

const GATHER_DATA_INTERVAL = 300000
const MAX_GENERAL_DATA = 500

function startTracking(session){
    const dataGatherInterval = setInterval(()=>{
        try{
            if(session.activity.general.data.length >= 100){
                session.activity.general.data.pop()
            }
            var count = session.activity.general.count;
            session.activity.general.data.push({[count]: new Date()});
            session.activity.general.count = 0;
        }catch(e){
          clearInterval(dataGatherInterval)
        }
    },GATHER_DATA_INTERVAL)
    session.activity = {
      general : {
        count: 0,
        data: [],
        dataGatherInterval: dataGatherInterval
      },
    }

    if(session.plan == 'pro'){

    }

}


function send_general(session){
    if(session.activity?.general){
        session.activity.general.count+=1
    }
    //session.activity.general.count+=Math.floor(Math.random() * 200) + 1
}

async function track_channel(session, channel){
    if(session.activity){
        if(session.plan == 'pro'){
            if(channel?.members?.length !== 0){
                channel.members.forEach(async (member) => {
                    if(member.id !== session.client.user.id){
                        await addVcActivityId(session.account_id, member.id)
                    }
                })
            }
        }
    }
}

function destroyTracking(session){
    clearInterval(session.activity.dataGatherInterval)
    session.activity = null
}


module.exports = {
    startTracking: startTracking,
    destroyTracking: destroyTracking,
    send_general: send_general,
    track_channel: track_channel
}
