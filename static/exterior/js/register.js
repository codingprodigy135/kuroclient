const csrfToken = document.getElementById("csrf-token").value;
const form = document.getElementById("register_form");
const spinner = document.getElementById("loading");
const error_message = document.getElementById("error_message");
const login_anchor = document.getElementById("login_anchor");

if (/#paid/.test(window.location.href)) {
	window.location = `${window.location.protocol}//${window.location.host}/login`;
}

let redirect_to = null;
if (/redirect_to=(\w*)_payment/.exec(window.location.href)) {
	var plan = /redirect_to=(\w*)_payment/.exec(window.location.href)[1];
	if (plan == "pro" || plan == "ultimate") {
		login_anchor.href = `register?redirect_to=${plan}_payment`;
		redirect_to = plan;
	}
}

let loading = false;
form.addEventListener("submit", registerUser);

if (!navigator.cookieEnabled) {
	error_message.innerText = `This website requires cookies to function properly, we have no reason to track you or want your info. Enable cookies and refresh the page to continue`;
}

function show_loader() {
	spinner.style = "";
}
function hide_loader() {
	spinner.style = "display:none";
}

async function registerUser(e) {
	e.preventDefault();
	if (loading) {
		return;
	}
	if (!navigator.cookieEnabled) {
		return;
	}
	error_message.innerText = ``;

	if (!document.getElementById("flexCheckChecked").checked) {
		error_message.innerText = `You must agree with the Terms & Conditions to continue`;
		return;
	}

	if (document.querySelector("#g-recaptcha-response").value == 0) {
		error_message.innerText = `You must submit the captcha first`;
		return;
	}

	try {
		loading = true;
		show_loader();
		const username = document.getElementById("username").value;
		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;
		const captcha = document.querySelector("#g-recaptcha-response").value;
		const resp = await fetch("/api/register", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"x-csrf-token": csrfToken,
			},
			body: JSON.stringify({
				username: username,
				emailaddress: email,
				password: password,
				captcha: captcha,
			}),
		});
		const response = await resp.json();
		if (response.status == "success") {
			if (!redirect_to) {
				window.location = `${window.location.protocol}//${window.location.host}/dashboard`;
			} else {
				window.location = `${window.location.protocol}//${window.location.host}/pricing#${redirect_to}`;
			}
		} else {
			error_message.innerText = response.error;
			grecaptcha.reset();
		}
	} catch (e) {
		error_message.innerText = `Something is wrong on our end. Please try again later`;
	}
	loading = false;
	hide_loader();
}
