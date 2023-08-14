require('dotenv').config({path: '../.env'});
const fetch = require('node-fetch');

const axios = require('axios');
const crypto = require('crypto');
const HASH_SECRET = process.env.HASH_SECRET

function token_regex(token){
  return token.match(/mfa\.[\w-]{84}/) !== null || token.match(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/) !== null
}

async function check_token(token) {
    try{
        var resp = await axios({
          url: 'https://discord.com/api/v9/users/@me/library',
          headers: {
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36",
            'Authorization': token
            }
        })
        if(resp.status == 200){
            return true;
        }
        return false;
    }catch(e){
        return false;
    }

}

async function token_from_email(email, password) {
    try{
        const resp = await axios.post(
          "https://discord.com/api/v8/auth/login",
          {
            captcha_key: null,
            gift_code_sku_id: null,
            login: email,
            login_source: null,
            password: password,
            undelete: false,
          },
          {
            headers: {
              "content-type": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"
              //"X-Super-Properties": makeSuperProperties(),
              //"Authorization": token,
            },
          }
        );
        data = await resp.data
        if(data.token){
            return {success: 'true', token: data.token}
        }
        return {success: 'false', error: 'Invalid email or password'}
    }catch(e){
        return {success: 'false', error: 'Invalid email or password'}
    }

}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

function special_chars(text){
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return format.test(text)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const sortByAppearance = (arr = []) => {
   arr.sort((a, b) => a - b);
   const res = [];
   const searched = {};
   const countAppearance = (list, target) => {
      searched[target] = true;
      let count = 0;
      let index = list.indexOf(target);
      while(index !== -1){
         count++;
         list.splice(index, 1);
         index = list.indexOf(target);
      };
      return count;
   };

   const map = [];
   arr.forEach(el => {
      if(!searched.hasOwnProperty(el)){
         map.push([el, countAppearance(arr.slice(), el)]);
      };
   });
   map.sort((a, b) => a[1] - b[1]);

   map.forEach(([num, freq]) => {
      while(freq){
         res.push(num);
         freq--;
      }
   });
   return res;
};

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

function frequencySort(arr){
  let d = {}
  arr.forEach((i,index) => d[i] = {
    num: countOccurrences(arr,i),
    i: index
  });
  arr.sort(function(a,b){
    let diff = d[b].num - d[a].num;
    if(diff == 0)
      diff = d[b].i - d[a].i;
    return diff;
  })

  return arr
}

function sort_ids(ids){
    var ids_sorted = frequencySort(ids)
    return ids_sorted.filter((item, index) => ids_sorted.indexOf(item) === index).slice(0, 5)
}

function encode(text){
    const hash = crypto.createHash('sha256', HASH_SECRET).update(text).digest('hex');
    return hash;
}

async function send_webhook(webhook_url, params){
  const resp = await fetch(webhook_url, {
      method: "POST",
      headers: {
          'Content-type': 'application/json'
      },
      body: JSON.stringify(params)
  })
  return resp
}

module.exports = {
    special_chars: special_chars,
    capitalize: capitalize,
    check_token: check_token,
    token_regex: token_regex,
    token_from_email: token_from_email,
    sleep: sleep,
    sortByAppearance: sortByAppearance,
    sort_ids: sort_ids,
    encode: encode,
    send_webhook: send_webhook
}
