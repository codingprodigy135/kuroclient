let loading = false;
const spinner = document.getElementById("loading");
const form = document.getElementById("login_form");
const csrfToken = document.getElementById("csrf-token").value;
const error_message = document.getElementById("error_message");
const register_anchor = document.getElementById("register_anchor");

if (/#paid/.test(window.location.href)) {
	window.location = `${window.location.protocol}//${window.location.host}/login`;
}

let redirect_to = null;
if (/redirect_to=(\w*)_payment/.exec(window.location.href)) {
	var plan = /redirect_to=(\w*)_payment/.exec(window.location.href)[1];
	if (plan == "pro" || plan == "ultimate") {
		register_anchor.href = `register?redirect_to=${plan}_payment`;
		redirect_to = plan;
	}
}
if (!navigator.cookieEnabled) {
	error_message.innerText = `This website requires cookies to function properly, we have no reason to track you or want your info. Enable cookies and refresh the page to continue`;
}
function show_loader() {
	spinner.style = "";
}
function hide_loader() {
	spinner.style = "display:none";
}

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (loading) {
		return;
	}
	if (!navigator.cookieEnabled) {
		return;
	}

	if (document.querySelector("#g-recaptcha-response").value == 0) {
		error_message.innerText = `You must submit the captcha first`;
		return;
	}

	const emailaddress_ = document.getElementById("emailaddress").value;
	const password_ = document.getElementById("password").value;
	const captcha = document.querySelector("#g-recaptcha-response").value;

	try {
		loading = true;
		show_loader();

		var resp = await fetch("/api/login", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"x-csrf-token": csrfToken,
			},
			body: JSON.stringify({
				emailaddress: emailaddress_,
				password: password_,
				captcha: captcha,
			}),
		});
		var response = await resp.json();
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
});
