const csrfToken = document.getElementById("csrf-token").value;
const form = document.getElementById("password_form");
const error_message = document.getElementById("error_message");
const submit_button = document.getElementById("submit_button");

form.addEventListener("submit", changepassword);

async function changepassword(e) {
	e.preventDefault();
	error_message.innerText = ``;
	error_message.style = "";
	try {
		const password = document.getElementById("password").value;
		const resp = await fetch("/api/change-password", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"x-csrf-token": csrfToken,
			},
			body: JSON.stringify({
				password: password,
				token:
					window.location.href.split("/")[
						window.location.href.split("/").length - 1
					],
				id: window.location.href.split("/")[
					window.location.href.split("/").length - 2
				],
			}),
		});
		const response = await resp.json();
		if (response.success == "true") {
			error_message.style = "color: #1eff35;";
			error_message.innerText = "Changed password!";
			submit_button.remove();
		} else {
			error_message.innerText = response.error;
		}
	} catch (e) {
		error_message.innerText = `Something is wrong on our end. Please try again later`;
	}
}
