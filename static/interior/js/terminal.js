let loaded = false;
let authorized = false;
const terminal_box = document.getElementById("terminal_box")
const checkBox1Label = document.getElementById("checkbox-1-label")
const checkBox2Label = document.getElementById("checkbox-2-label")
const checkBox3Label = document.getElementById("checkbox-3-label")
const checkBox4Label = document.getElementById("checkbox-4-label")
const checkBox1 = document.getElementById("checkbox-1")
const checkBox2 = document.getElementById("checkbox-2")
const checkBox3 = document.getElementById("checkbox-3")
const checkBox4 = document.getElementById("checkbox-4")

const watching_events = ['COMMAND_STARTED','REQUEST', 'MESSAGE_CREATE', "TYPING", 'MEMBER_JOINED']
let allowed_events = ['COMMAND_STARTED']

 
function arrayRemove(arr, value) { 
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}
checkBox1Label.addEventListener("click", (e)=>{
    if(!checkBox1.checked){
        allowed_events.push('MESSAGE_CREATE')
    }else{
        allowed_events = arrayRemove(allowed_events, 'MESSAGE_CREATE')
    }
})
checkBox2Label.addEventListener("click", (e)=>{
    if(!checkBox2.checked){
        allowed_events.push('TYPING')
    }else{
        allowed_events = arrayRemove(allowed_events, 'TYPING')
    }
})
checkBox3Label.addEventListener("click", (e)=>{
    if(!checkBox3.checked){
        allowed_events.push('REQUEST')
    }else{
        allowed_events = arrayRemove(allowed_events, 'REQUEST')
    }
})
checkBox4Label.addEventListener("click", (e)=>{
    if(!checkBox4.checked){
        allowed_events.push('MEMBER_JOINED')
    }else{
        allowed_events = arrayRemove(allowed_events, 'MEMBER_JOINED')
    }
})

async function display_terminal(message){
    const event_type = Object.keys(message)[0]
    if(allowed_events.indexOf(event_type) === -1){return}

    switch(event_type){
        case 'COMMAND_STARTED':
            var args = message[event_type].args.join(' ')
            var command = message[event_type].command
            var prefix_ = message[event_type].prefix
            var timestamp = message[event_type].timestamp
            output = `Started command: ${prefix_}${command} ${args} at ${timestamp}`
            terminal_box.insertAdjacentHTML("afterbegin", `<p style="font-weight: 500;margin-bottom: 7px !important;font: 1.1rem Inconsolata, monospace;margin: 0; color: gold">${output}</p>`);
            break
        case 'REQUEST': 
            var method = message[event_type].method
            var path = message[event_type].path
            output = `${method.toUpperCase()} <span style="color: #67c937">${path}</span>`
            terminal_box.insertAdjacentHTML("afterbegin", `<p style="font-weight: 500;margin-bottom: 7px !important;font: 1.1rem Inconsolata, monospace;margin: 0; color: #80ff43">${output}</p>`);
            break
        case 'MESSAGE_CREATE': 
            var tag = message[event_type].tag
            var content = message[event_type].content
            var where = message[event_type].guild || 'DMS'
            var timestamp = new Date(message[event_type].timestamp).toLocaleTimeString("en-US")
            output = `<span style="color: #58a9ff">[${where}]</span> ${tag} - ${content} | ${timestamp}</span>`
            terminal_box.insertAdjacentHTML("afterbegin", `<p style="font-weight: 500;margin-bottom: 7px !important;font: 1.1rem Inconsolata, monospace;margin: 0; color: #98B3EB">${output}</p>`);
            break
        case 'TYPING': 
            var type = message[event_type].channel === 'DMChannel' ? 'DMS' : 'SERVER'
            var name = message[event_type].name
            var timestamp = new Date(message[event_type].timestamp).toLocaleTimeString("en-US")
            output = `<span style="color: #58a9ff">[${type}]</span> ${name} started typing | ${timestamp}</span>`
            terminal_box.insertAdjacentHTML("afterbegin", `<p style="font-weight: 500;margin-bottom: 7px !important;font: 1.1rem Inconsolata, monospace;margin: 0; color: #98B3EB">${output}</p>`);
            break
        case 'MEMBER_JOINED': 
            var guild = message[event_type].guild
            var member = message[event_type].member
            output = `${member} joined ${guild}`
            terminal_box.insertAdjacentHTML("afterbegin", `<p style="font-weight: 500;margin-bottom: 7px !important;font: 1.1rem Inconsolata, monospace;margin: 0; color: #98B3EB">${output}</p>`);
            break
        }
}


async function connect_ws(){
    if(loaded){return}
    websocket = new WebSocket(`ws://${location.host}/gateway`);
    websocket.onopen = function(evt) {
        websocket.send(JSON.stringify({account_id: account_id}))
    };
    websocket.onmessage = async (message) => {
        var parsed_message = JSON.parse(message.data)
        if(parsed_message.success == 'true' && parsed_message.session_data !== undefined){
            authorized = true;
            var logs_fetch = await fetch('/api/session_logs', {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'authorization': account_id,
                  'x-csrf-token': csrfToken
                },
            })
            var logs = await logs_fetch.json()
            if(logs.data){
                const commands = Object.values(logs.data)
                for (let i = 0; i < commands.length; i++) {
                    display_terminal(commands[i])
                }
            }
        }
        if(authorized){
            try{
              var event_type = Object.keys(parsed_message)[0]
              if(watching_events.includes(event_type)){
                    display_terminal(parsed_message)
              }
            }catch(e){
                console.log(e)
            }

        }
    }
}

if(plan !== 'free'){
    document.querySelectorAll('.locked').forEach(e => e.classList.remove('locked'));
    document.getElementById('pro_plan_h6').remove()
}

if(token && token !== 'none'){
    connect_ws()
    loaded = true
}
