const csrfToken = document.querySelector("div[csrfToken]").getAttribute('csrfToken')
const account_id = document.querySelector("div[account_id]").getAttribute('account_id')
const proPaymentButton = document.getElementById("payment1")

async function checkout(){
    const response = await fetch('/checkout-session-5', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'authorization': account_id
      }
    })
    if(response.ok){
        const data = await response.json()
        if(data.success == 'true'){
            window.location = data.url
        }else{
            if(data.error == 'Unauthorized'){
                window.location = `${window.location.protocol}//${window.location.host}/register?redirect_to=${plan}_payment`
            }
        }
    }
}


if(window.location.href.indexOf('#') > -1){
    var plan = window.location.href.split('#')[1]
    if(plan == 'paid'){
        window.location = `${window.location.protocol}//${window.location.host}/dashboard#paid`
    }
    if(plan == 'pro'){
        checkout()
    }
    // if(plan == 'ultimate'){
    //     checkout('ultimate')
    // }

}

proPaymentButton.addEventListener('click', async(e)=>{
    if(e.target.innerText === 'Current plan'){
      return
    }

    if(csrfToken && account_id){
        checkout()
    }
    if(account_id === ''){
        window.location = `${window.location.protocol}//${window.location.host}/register?redirect_to=pro_payment`
    }
})

// ultimatePaymentButton.addEventListener('click', async()=>{
//     if(csrfToken && account_id){
//         checkout('ultimate')
//     }
//     if(!account_id && csrfToken){
//         window.location = `${window.location.protocol}//${window.location.host}/register?redirect_to=ultimate_payment`
//     }
// })
