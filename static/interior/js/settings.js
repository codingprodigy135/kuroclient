let email_input = document.getElementById("email_input");
let change_email = document.getElementById("change_email");
let username_form = document.getElementById("username_form");
let email_display = document.getElementById("email_display");
let username_input = document.getElementById("username_input");
let change_password = document.getElementById("change_password");
let username_display = document.getElementById("username_display");

username_form.addEventListener("submit", async (e) => {
	e.preventDefault();
	username_error.innerText = ``;
	username_error.style = "color:red;";
	var change_username_fetch = await fetch("/api/change_username", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			authorization: account_id,
			"x-csrf-token": csrfToken,
		},
		body: JSON.stringify({ username: username_input.value }),
	});
	var change_username_response = await change_username_fetch.json();
	if (change_username_response.success == "false") {
		username_error.innerText = change_username_response.error;
	} else {
		username_error.innerText = "Username changed!";
		username_error.style = "color:#31ff31;";
		username_display.innerText = username_input.value;
	}
});

change_password.addEventListener("click", (e) => {
	swal({
		title: "Change password",
		text: `You will recieve a email at ${email} directing you to reseting your password.`,
		icon: "warning",
		buttons: true,
		dangerMode: true,
	}).then(async (result) => {
		if (result) {
			var forgot_password_fetch = await fetch("/api/forgot-password", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					authorization: account_id,
					"x-csrf-token": csrfToken,
				},
				body: JSON.stringify({ emailaddress: email }),
			});
			var forgot_password_response = await forgot_password_fetch.json();
			if (forgot_password_response.success == "true") {
				swal(
					"Sent!, should arrive in your email in less than 3 minutes. You may have to check your spam folder"
				);
			} else {
				swal("Failed to send email...\nTry again later");
			}
		}
	});
});

//This will allow you to change email if you type in write password
change_email.addEventListener("click", async (e) => {
	var email_result = await swal("Write something here:", {
		text: "Enter new email",
		content: "input",
		button: {
			text: "Change!",
			closeModal: false,
		},
	});
	if (isEmail(email_result)) {
		var password_result = await swal("Password", {
			text: "Enter your current password to change your email",
			content: "input",
			button: {
				text: "Enter!",
				closeModal: false,
			},
		});
		if (password_result) {
			var change_email_fetch = await fetch("/api/change_email", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					authorization: account_id,
					"x-csrf-token": csrfToken,
				},
				body: JSON.stringify({
					emailaddress: email,
					password: password_result,
					newEmailaddress: email_result,
				}),
			});
			var change_email_response = await change_email_fetch.json();
			if (change_email_response.success == "true") {
				swal("Email changed!");
				email_display.innerText = email_result;
				email = newEmailaddress;
			} else {
				swal(change_email_response.error);
			}
		}
	} else {
		if (email_result !== null) {
			swal("Not valid email");
		}
	}
});

// e
