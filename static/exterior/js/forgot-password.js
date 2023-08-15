const csrfToken = document.getElementById("csrf-token").value;
const form = document.getElementById("email_form");
const email = document.getElementById("email");
const error_message = document.getElementById("error_message");
const submit_button = document.getElementById("submit_button");

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		error_message.innerText = ``;
		error_message.style = "";
		var forgot_password_fetch = await fetch("/api/forgot-password", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"x-csrf-token": csrfToken,
			},
			body: JSON.stringify({ emailaddress: email.value }),
		});
		var forgot_password_response = await forgot_password_fetch.json();
		if (forgot_password_response.success == "true") {
			error_message.style = "color: #1eff35;";
			error_message.innerText =
				"Sent!, should arrive in your email in less than 3 minutes. You may have to check your spam folder";
			submit_button.remove();
		} else {
			error_message.innerText = forgot_password_response.error;
		}
	} catch (e) {
		error_message.innerText = `Something is wrong on our end. Please try again later`;
	}
});
