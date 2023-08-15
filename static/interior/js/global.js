const test1 = document.getElementById("test1");
const test2 = document.getElementById("test2");
const sign_out = document.getElementById("sign_out");
const settings_div = document.getElementById("settings_div");
const csrfToken = document
	.querySelector("div[csrfToken]")
	.getAttribute("csrfToken");
const account_id = document
	.querySelector("div[account_id]")
	.getAttribute("account_id");
const verified = document
	.querySelector("div[verified]")
	.getAttribute("verified");
const plan = document.querySelector("div[plan]")
	? document.querySelector("div[plan]").getAttribute("plan")
	: undefined;
const token = document.querySelector("div[token]")
	? document.querySelector("div[token]").getAttribute("token")
	: undefined;
const username = document.querySelector("div[username]")
	? document.querySelector("div[username]").getAttribute("username")
	: undefined;
const createdAt = document.querySelector("div[createdAt]")
	? document.querySelector("div[createdAt]").getAttribute("createdAt")
	: undefined;
const settings = document.querySelector("div[settings]")
	? document.querySelector("div[settings]").getAttribute("settings")
	: undefined;
const email = document.querySelector("div[emailaddress]")
	? document.querySelector("div[emailaddress]").getAttribute("emailaddress")
	: undefined;
const prefix =
	(document.querySelector("div[prefix]")
		? document.querySelector("div[prefix]").getAttribute("prefix")
		: undefined) || ".";
let webhook = document.querySelector("div[webhook]")
	? document.querySelector("div[webhook]").getAttribute("webhook")
	: undefined;
if (webhook) {
	webhook = JSON.parse(webhook);
}

let settings_open = false;

setInterval(() => {
	try {
		account_id ||
			(window.location = `${window.location.protocol}//${window.location.host}/login`);
	} catch {
		window.location = `${window.location.protocol}//${window.location.host}/login`;
	}
}, 2e3);

document.body.addEventListener("click", function (e) {
	if (e.target.id === "example1_button") {
		document.getElementById("example1").remove();
	}
});

sign_out.addEventListener("click", async (e) => {
	var logout_fetch = await fetch("/logout", {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			authorization: account_id,
			"x-csrf-token": csrfToken,
		},
	});
	var logout_response = await logout_fetch.json();
	if (logout_response.success == "true") {
		window.location = `${window.location.protocol}//${window.location.host}/login`;
	}
});

settings_div.addEventListener("click", (e) => {
	settings_open = !settings_open;
	if (settings_open) {
		test1.classList.add("show");
		test2.classList.add("show");
	} else {
		test1.classList.remove("show");
		test2.classList.remove("show");
	}
});

function token_regex(token) {
	return (
		token.match(/mfa\.[\w-]{84}/) !== null ||
		token.match(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/) !== null
	);
}

function email_regex(email) {
	return email.match(
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	);
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function break_emojis(text) {
	var new_text = text;
	var emojis = text.match(/<a?:[\w\d_]*:\d{16,19}>/g);
	if (emojis) {
		for (var i in emojis) {
			var broken_emoji = emojis[i].match(/.{1,22}/g).join(" ");
			new_text = new_text.replace(emojis[i], broken_emoji);
		}
		return new_text;
	} else {
		return text;
	}
}

const formatAMPM = (date) => {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();

	let hours = date.getHours();
	let minutes = date.getMinutes();
	let ampm = hours >= 12 ? "pm" : "am";
	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes.toString().padStart(2, "0");
	return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
};

function isEmail(email) {
	var regexp =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regexp.test(String(email).toLowerCase());
}
