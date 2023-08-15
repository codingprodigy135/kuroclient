let loading = false;
const submit = document.getElementById('submit');
const error_message = document.getElementById('error_message');
const csrfToken = document.querySelector("div[csrfToken]").getAttribute('csrfToken')



submit.addEventListener('click', async (e)=>{
    e.preventDefault()

    if(document.querySelector('#g-recaptcha-response').value == 0){
        error_message.innerText = `You must submit the captcha first`
        return
    }
    const captcha = document.querySelector('#g-recaptcha-response').value;
    const token = window.location.href.split('/')[window.location.href.split('/').length -1]
    var resp = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          captcha: captcha,
          token: token
        })
    })
    var data = await resp.json()
    if(data.success === 'true'){
        window.location = `${window.location.protocol}//${window.location.host}/dashboard`
    }else{
        error_message.innerText = 'Verification failed, please try again later'
    }
})
