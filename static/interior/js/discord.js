let loading = false;
let loaded = false;
const form_data = document.getElementById("form_data");
const login_type = document.getElementById("login_type");
const default_activity_checkbox = document.getElementById("checkbox-3");
const submit_account_change = document.getElementById("submit_account_change");
const discord_form_error_message = document.getElementById(
	"discord_error_message"
);
const change_account_button_loading = document.getElementById(
	"change_account_button_loading"
);

submit_account_change.addEventListener("click", async (e) => {
	e.preventDefault();
	if (loading) {
		return;
	}
	if ((type = login_type.options[login_type.selectedIndex].value == "Token")) {
		const token_ = document.getElementById("form_token").value;
		discord_form_error_message.innerText = "";
		discord_form_error_message.style = "";
		change_account_button_loading.style = "";

		if (!token_regex(token_)) {
			discord_form_error_message.style = "color: #e41313;";
			discord_form_error_message.innerText = "Please put in a valid token";
			change_account_button_loading.style = "display:none";
			loading = false;
			return;
		}
		loading = true;

		try {
			var resp = await fetch("/api/set_token", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					authorization: account_id,
					"x-csrf-token": csrfToken,
				},
				body: JSON.stringify({ token: token_ }),
			});
			var response = await resp.json();
			if (response.success == "true") {
				discord_form_error_message.style = "color: #13e413;";
				discord_form_error_message.innerText = "Success!";
				load_dashboard(response.token);

				document.getElementsByTagName("body")[0].insertAdjacentHTML(
					"afterbegin",
					`
                <div id="example1">
                <div class="text-center">
                    <div class="example1">
                        <div class="card">
                            <h1 class="card-title">You can now try your new commands!</h1>
                            <div class="card-body">
                                <div class="example-video">
                                    <video autoplay="" muted="" loop="">
                                        <source src="exterior/img/test5.mp4"" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                            <p>Head over to your discord account and you can start using commands! Try typing .av</p>
                            <button id="example1_button" type="button" class="btn btn-rounded btn-success mb-2 mr-2">Understood</button>
                        </div>
                    </div>
                </div>
            </div>        
                `
				);
			} else {
				discord_form_error_message.style = "color: #e41313;";
				discord_form_error_message.innerText = response.error;
			}
			change_account_button_loading.style = "display:none";
			loading = false;
		} catch (e) {
			discord_form_error_message.innerText =
				"Something went wrong, please try again later";
			loading = false;
		}
	} else {
		const email_ = document.getElementById("email").value;
		const password_ = document.getElementById("password").value;

		discord_form_error_message.innerText = "";
		discord_form_error_message.style = "";
		change_account_button_loading.style = "";

		if (!email_regex(email_)) {
			discord_form_error_message.style = "color: #e41313;";
			discord_form_error_message.innerText = "Please put in a valid email";
			change_account_button_loading.style = "display:none";
			return;
		}
		if (email_.length == 0) {
			discord_form_error_message.style = "color: #e41313;";
			discord_form_error_message.innerText = "Please put in a email";
			change_account_button_loading.style = "display:none";
			return;
		}
		if (password_.length == 0) {
			discord_form_error_message.style = "color: #e41313;";
			discord_form_error_message.innerText = "Please put in a password";
			change_account_button_loading.style = "display:none";
			return;
		}
		loading = true;
		try {
			var resp = await fetch("/api/set_token", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					authorization: account_id,
					"x-csrf-token": csrfToken,
				},
				body: JSON.stringify({ email: email_, password: password_ }),
			});
			var response = await resp.json();
			if (response.success == "true") {
				discord_form_error_message.style = "color: #13e413;";
				discord_form_error_message.innerText = "Success!";
				loading = false;
				load_dashboard(response.token);
			} else {
				discord_form_error_message.style = "color: #e41313;";
				discord_form_error_message.innerText = response.error;
				loading = false;
			}
			change_account_button_loading.style = "display:none";
			loading = false;
		} catch (e) {
			discord_form_error_message.innerText =
				"Something went wrong, please try again later";
			loading = false;
		}
	}
});

default_activity_checkbox.addEventListener("click", async (e) => {
	e.preventDefault();

	if (!loaded) {
		swal("You need to add a discord account before you can use this feature");
		return;
	}
	var resp = await fetch("/api/settings_update/default_activity", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			authorization: account_id,
			"x-csrf-token": csrfToken,
		},
		body: JSON.stringify({ data: default_activity_checkbox.checked }),
	});
	try {
		var response = await resp.json();
		if (response.success == "true") {
			default_activity_checkbox.checked = !default_activity_checkbox.checked;
		} else if (response.error == "Feature not available with this plan") {
			swal("Upgrade to pro to disable default activity");
		}
	} catch {}
});

login_type.onchange = function (e) {
	type = login_type.options[login_type.selectedIndex].value;
	if (type == "Token") {
		form_data.innerHTML = `
      <div class="form-group row">
          <label class="col-sm-3 col-form-label" for="form_token">Token</label>
          <div class="col-sm-9">
              <input type="text" class="myCustomForm form-control" id="form_token" placeholder="Enter Token" />
          </div>
      </div>
      `;
	} else {
		form_data.innerHTML = `
    <div class="form-group row">
        <label class="col-sm-3 col-form-label" for="email">Email</label>
        <div class="col-sm-9">
            <input type="text" class="myCustomForm form-control" id="email" placeholder="Enter Email" />
        </div>
    </div>
    <div class="form-group row">
        <label class="col-sm-3 col-form-label" for="password">Password</label>
        <div class="col-sm-9">
            <input type="text" class="myCustomForm form-control" id="password" placeholder="Enter Password" />
        </div>
    </div>
    `;
	}
};

async function load_settings() {
	var settings_resp = await fetch("/api/settings", {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			authorization: account_id,
			"x-csrf-token": csrfToken,
		},
	});
	settings_response = await settings_resp.json();
	if (settings_response.success == "true") {
		settings_data = JSON.parse(settings_response.settings);
		if (settings_data.default_activity === undefined) {
			default_activity_checkbox.checked = true;
		} else {
			default_activity_checkbox.checked = settings_data.default_activity;
		}
	}
}

async function load_dashboard(token) {
	loaded = true;
	logout.addEventListener("click", async () => {
		if (account_id && token) {
			var resp = await fetch("/api/token_logout", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					authorization: account_id,
					"x-csrf-token": csrfToken,
				},
				body: JSON.stringify({ token: token }),
			});
			var response = await resp.json();
			if (response.success == "true") {
				window.location.reload();
			} else {
			}
		} else {
			discord_form_error_message.innerText = "Not logged in";
		}
	});

	const avatar_div = document.getElementById("avatar");
	const username_div = document.getElementById("username");
	const bio_div = document.getElementById("bio");
	const verified_div = document.getElementById("verified");
	const mfa_enabled_div = document.getElementById("mfa_enabled");
	const nitro_div = document.getElementById("nitro");
	var resp = await fetch("https://discord.com/api/v9/users/@me", {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: token,
		},
	});
	var response = await resp.json();
	if (response.code == 0) {
		return;
	}
	var id = response.id;
	var avatar = response.avatar;
	if (avatar) {
		var avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}`;
	} else {
		var avatarUrl = `https://cdn.discordapp.com/embed/avatars/${
			parseInt(response.discriminator) % 5
		}.png`;
	}
	var bio = response.bio;
	var verified = response.verified;
	var discriminator = response.discriminator;
	var username = response.username;
	var mfa_enabled = response.mfa_enabled;
	var nitro = response.premium_type;
	if (nitro == undefined) {
		nitro = "None";
	} else {
		if (nitro == 0) {
			nitro = "None";
		} else if (nitro == 1) {
			nitro = "C lassic";
		} else if (nitro == 2) {
			nitro = "Premium";
		}
	}
	avatar_div.src = avatarUrl;
	username_div.innerText = `${username}#${discriminator}`;
	bio_div.innerText = bio;
	verified_div.innerText = verified;
	mfa_enabled_div.innerText = mfa_enabled;
	nitro_div.innerText = nitro;
}

load_settings();
if (token || token !== "none") load_dashboard(token);
