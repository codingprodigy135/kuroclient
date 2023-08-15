var invalid_token_html = `
<div id="no_token" style="">
    <div class="card box-margin">
        <div class="card-body">
            <h5 class="card-title mb-2">Your connected discord account login is invalid</h5>

            <p style="margin-bottom: 0px !important; font-size: 15px; font-weight: 800;">Possible reasons</p>

            <p style="margin-bottom: 0px !important;">
                - Changed password<br />
                - Account locked<br />
                - Something went wrong on our end and you just need to re renter your token<br />
                - Sometimes when you log out your discord account, your token can change
            </p>
            <div class="text-center">
                <a href="discord" class="btn btn-primary" style="font-weight: 900;background-color: #ff0000; border-color: #ff0000; color: white;">
                    Change account
                </a>
            </div>
        </div>
    </div>
    <div id="no_token_overlay"></div>
</div>
`


const id = document.getElementById("id");
const plan_div = document.getElementById("plan");
const uptime = document.getElementById("uptime");
const prefix_div = document.getElementById("prefix");
const enabled = document.getElementById("enabled");
const no_token = document.getElementById("no_token");
const username_div = document.getElementById("username");
const nitrosnipe = document.getElementById("nitrosnipe");
const deleteafter = document.getElementById("deleteafter");
const voice_activity_ids_div = document.getElementById("voice_activity_ids")
const pro_plan_overlays = document.getElementsByClassName("pro_plan_overlay");
const email_verifcation_div = document.getElementById("send_email_verifcation");
const success_payment_anim = document.getElementsByClassName("success_payment_anim");

let chart;
let websocket;
let startTime;
let retries = 0;
let loaded = false;
let email_sent = false;

async function update_uptime(){
      endTime = new Date();
      var timeDiff = endTime - startTime; //in ms
      // strip the ms
      timeDiff /= 1000;

      // get seconds
      var seconds = Math.round(timeDiff);
      var sec_num = parseInt(seconds, 10); // don't forget the second param
      var hours   = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);

      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      uptime.innerHTML = hours+':'+minutes+':'+seconds
}

async function load_dasboard(data){
    loaded=true
    startTime = new Date(Date.now() - data.uptime);
    setInterval(update_uptime,1000)
    nitrosnipe.innerText = `Auto claim nitro: ${(data.nitrosnipe ? "Enabled" : "Disabled")}`
    prefix_div.innerText = `Prefix: ${data.prefix}`
    plan_div.innerText = `Plan: ${capitalizeFirstLetter(data.plan)}`
    id.innerText = `ID: ${data.id}`
    username_div.innerText = `Username: ${data.username}#${data.discriminator}`
    deleteafter.innerText = `Auto delete messages: ${(data.deleteAfter ? data.deleteAfter.toString() + " seconds" : "Disabled")}`
    enabled.innerText = `Bot status: ${(data.status ? "Enabled" : "Disabled")}`

    if(data.plan == 'pro'){
        for (let i = 0; i < pro_plan_overlays.length; i++) {
            pro_plan_overlays[i].style="display:none"
        }
        voice_activity_ids_div.innerHTML = ``
        var voice_activity_fetch = await fetch('/api/voice_session_activity', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'authorization': account_id,
              'x-csrf-token': csrfToken
            },
        })
        var voice_activity_response = await voice_activity_fetch.json()
        if(voice_activity_response.success == 'true'){
            let voice_activity_response_data = voice_activity_response.data.reverse()
            for (let i = 0; i < voice_activity_response_data.length; i++) {
                var data = voice_activity_response_data[i]
                var avatar_url = data.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png"
                var tag = data.tag

                var status = data.status
                var clientStatus = data.clientStatus
                if(status && clientStatus){
                    let color;
                    if(status == 'online'){
                        color = '#3ba55d'
                    }else if(status == 'idle'){
                        color = '#faa91b'
                    }else if(status == 'offline '){
                        color = '#707d89'
                    }else if(status == 'dnd'){
                        color = '#ec4244'
                    }else{
                        color = '#fff'
                    }
                    if(Object.keys(clientStatus)[0] == undefined){
                        clientStatus_formatted = ''
                    }else{
                        var clientStatus_formatted = Object.keys(clientStatus).includes('desktop') && Object.keys(clientStatus).includes('mobile') ? 'On desktop and mobile' : `On ${Object.keys(clientStatus)[0]}`
                    }

                    var voice_activity_html = `
                    <li class="d-flex justify-content-between mb-20 align-items-center">
                        <div class="d-flex align-items-center">
                            <div>
                                <a class="user-avatar mr-2"><img style="height: 2.2rem; margin-right: 10px;" src="${avatar_url}" alt="user" class="thumb-md mb-2 rounded-circle" crossorigin="anonymous"/> </a>
                            </div>
                            <div class="media-support-info">
                                <h6 class="mb-1 font-15">${tag}</h6>
                                <p style="color: ${color};" class="mb-0 font-13">${status}</p>
                            </div>
                        </div>
                        <div class="media-support-amount">
                            <p class="mb-0 font-13">${clientStatus_formatted}</p>
                        </div>
                    </li>
                    `
                    voice_activity_ids.insertAdjacentHTML("afterbegin", voice_activity_html);
                }else{
                    var voice_activity_html = `
                    <li class="d-flex justify-content-between mb-20 align-items-center">
                        <div class="d-flex align-items-center">
                            <div>
                                <a class="user-avatar mr-2"><img style="height: 2.2rem; margin-right: 10px;" src="${avatar_url}" alt="user" class="thumb-md mb-2 rounded-circle" crossorigin="anonymous"/> </a>
                            </div>
                            <div class="media-support-info">
                                <h6 class="mb-1 font-15">${tag}</h6>
                                <p style="color: #00cd92;" class="mb-0 font-13">Seen usually in voice channels</p>
                            </div>
                        </div>
                        <div class="media-support-amount">
                            <p class="mb-0 font-13"></p>
                        </div>
                    </li>
                    `
                    voice_activity_ids.insertAdjacentHTML("afterbegin", voice_activity_html);
                }



            }
        }
    }


    var activity_fetch = await fetch('/api/session_activity', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': account_id,
          'x-csrf-token': csrfToken
        },
    })
    var activity_response = await activity_fetch.json()

    if(activity_response.success == 'true'){
        const x_axis_data = activity_response.data.map((obj) => obj[Object.keys(obj)[0]])
        const key_data = activity_response.data.map((obj) => parseInt(Object.keys(obj)[0]))

        var options = {
            series: [{
            name: 'Actions done',
            data: key_data
          }],
            chart: {
            height: 350,
            type: 'area',
            background: '#151515'
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth'
          },
          xaxis: {
            type: 'datetime',
            categories: x_axis_data,
            labels: {
                format: 'dd/MM mm:hh'
            }
          },

          theme: {
            mode: 'dark',
          },
          fill: {
            type: 'gradient',
            gradient: {
              shade: 'dark',
              type: "horizontal",
              shadeIntensity: 0.5,
              inverseColors: true,
              opacityFrom: 0,
              opacityTo: .5,
            }
          }
        };

        chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
    }

}

async function connect_ws(){
    if(loaded){return}
    websocket = new WebSocket(`ws://${location.host}/gateway`);
    websocket.onopen = function(evt) {
        websocket.send(JSON.stringify({account_id: account_id}))
    };

    websocket.onmessage = (message) => {
        var parsed_message = JSON.parse(message.data)
        if(parsed_message.success == 'true'){
            if(parsed_message.session_data){
                no_token.style="display:none"
                load_dasboard(parsed_message.session_data)
                loaded = true
            }else{
                if(retries == 0){
                  var options = {
                     series: [{
                     name: 'series1',
                     data: [31, 40, 28, 51, 42, 109, 100]
                   }],
                     chart: {
                     height: 350,
                     type: 'area'
                   },
                   dataLabels: {
                     enabled: false
                   },
                   stroke: {
                     curve: 'smooth'
                   },
                   xaxis: {
                     type: 'datetime',
                     categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
                   },
                   tooltip: {
                     x: {
                       format: 'dd/MM/yy HH:mm'
                     },
                   },
                   };

                   var chart = new ApexCharts(document.querySelector("#chart"), options);
                   chart.render();
                }
                if(retries >= 2){return}
                websocket.close()
                retries+=1
                setTimeout(()=>{
                    connect_ws()
                },1000)
                return
            }
        }

        if(parsed_message.success == 'false'){
            if(parsed_message.error == "Account id not found"){
                window.location = `${window.location.protocol}//${window.location.host}/login`
            }
            if(parsed_message.error == "Token is not set"){
                no_token.style=""
            }
            if(parsed_message.error == "Token not working"){
                no_token.innerHTML=invalid_token_html
            }
        }

        //var event_type = Object.keys(parsed_message)[0]
        //console.log(event_type)
        // if(event_type == 'on_message'){
        //     document.dispatchEvent(on_message);
        // }
    }
}
if(email_verifcation_div){
    email_verifcation_div.addEventListener('click', async()=>{
        if(!email_sent){
            var resp = await fetch('/api/verify_email', {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'authorization': account_id,
                  'x-csrf-token': csrfToken
                },
            })
            swal("Sent!, should arrive in your email in less than 3 minutes. You may have to check your spam folder");
            email_sent = true
        }else{
            swal("Email already sent or is being sent, please check your email.");
        }
    })
}


connect_ws()

















// #
