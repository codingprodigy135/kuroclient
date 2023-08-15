let currentDate = new Date();
let refresh_loading = false;
let refresh_loading_ = false;

async function update_nitro() {
	const message_box = document.getElementById("nitro_box");
	const refresh_box = document.getElementById("refresh_box");
	if (refresh_loading) {
		return;
	}
	refresh_loading = true;
	try {
		nitro_box.innerHTML = ``;
		var resp = await fetch("/api/nitros_sent", {
			headers: {
				accept: "application/json",
				"accept-language": "en-US,en;q=0.9",
				authorization: account_id,
				"content-type": "application/json",
				token: token,
				"x-csrf-token": csrfToken,
			},
		});
		var data = await resp.json();
		if (data.success == "true" && data.nitros_sent) {
			nitros_sent = Object.values(data.nitros_sent);

			for (i in nitros_sent.reverse()) {
				var message = JSON.parse(nitros_sent[i]);
				var content = message["content"];
				var channel_name = message["channel_name"];
				var author_name = message["author_name"];
				var author_pfp_url = message["author_pfp_url"];
				var createdTimestamp = message["createdTimestamp"];
				var url = message["url"];
				var redeemed = message["redeemed"];
				var server_name = message["server_name"];
				var msg =
					redeemed == true
						? `<span style="color:#20ff20">Redeemed nitro ${content}`
						: `<span style="color:red">Invalid nitro ${content}`;
				var message_html = `
              <div class="admi-mail-item">
                  <a>
                      <div class="admi-mail-body d-flex align-items-center mr-3">
                          <div class="div">
                              <div class="admi-mail-from">From: ${author_name}</div>
                              <div class="admi-mail-subject">
                                  <p style="width: 40vw;" class="mb-0 mail-subject--text--">
                                      <span class="message__">${msg}</span>
                                      <br>
                                      <a href="${url}" target="_blank" style="color: #63abff;font-size: 14px;" class="mb-0">View message</a>
                                      <span style="font-size: 14px;" class="message__">${
																				server_name || channel_name
																			}</span>
                                  </p>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="admi-mail-date">${formatAMPM(
										new Date(createdTimestamp)
									)}</div>
              </div>
              `;
				nitro_box.insertAdjacentHTML("afterbegin", message_html);
				document.getElementsByClassName("message__")[0].innerText = content;
			}
		}
		setTimeout(() => {
			refresh_loading = false;
		}, 2000);
	} catch (e) {
		setTimeout(() => {
			refresh_loading = false;
		}, 2000);
	}
	setTimeout(() => {
		refresh_loading = false;
	}, 2000);
}

async function update_messages() {
	const message_box = document.getElementById("message_box");
	const refresh_box = document.getElementById("refresh_box");
	if (refresh_loading) {
		return;
	}
	refresh_loading = true;
	try {
		message_box.innerHTML = ``;
		var resp = await fetch("/api/deleted_messages", {
			headers: {
				accept: "application/json",
				"accept-language": "en-US,en;q=0.9",
				authorization: account_id,
				"content-type": "application/json",
				token: token,
				"x-csrf-token": csrfToken,
			},
		});
		var data = await resp.json();
		if (data.success == "true" && data.deleted_messages) {
			deleted_messages = Object.values(data.deleted_messages);

			for (i in deleted_messages.reverse()) {
				var message = JSON.parse(deleted_messages[i]);
				var content = message["content"];
				var channel_name = message["channel_name"];
				var author_name = message["author_name"];
				var author_pfp_url = message["author_pfp_url"];
				var createdTimestamp = message["createdTimestamp"];
				var url = message["url"];
				var server_name = message["server_name"];
				var message_html = `
            <div class="admi-mail-item">
                <a>
                    <div class="admi-mail-body d-flex align-items-center mr-3">
                        <div class="mail-thumb flex-40-thubm mr-3">
                            <img class="border-radius-50" src="${author_pfp_url}" crossorigin="anonymous">
                        </div>
                        <div class="div">
                            <div class="admi-mail-from">${author_name}</div>
                            <div class="admi-mail-subject">
                                <p style="width: 40vw;" class="mb-0 mail-subject--text--">
                                    <span class="message__"></span>
                                    <br>
                                    <a href="${url}" target="_blank" style="color: #63abff;font-size: 14px;" class="mb-0">View message</a>
                                    <span style="font-size: 14px;" class="message__">${
																			server_name || channel_name
																		}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </a>
                <div class="admi-mail-date">${formatAMPM(
									new Date(createdTimestamp)
								)}</div>
            </div>
            `;
				message_box.insertAdjacentHTML("afterbegin", message_html);
				if (window.outerWidth < 400) {
					document.getElementsByClassName("message__")[0].innerText =
						break_emojis(content);
				} else {
					document.getElementsByClassName("message__")[0].innerText = content;
				}
			}
		}
		setTimeout(() => {
			refresh_loading = false;
		}, 2000);
	} catch (e) {
		setTimeout(() => {
			refresh_loading = false;
		}, 2000);
	}
	setTimeout(() => {
		refresh_loading = false;
	}, 2000);
}

async function update_images() {
	const image_gallery = document.getElementById("image_gallery");
	if (refresh_loading_) {
		return;
	}
	refresh_loading_ = true;
	try {
		if (webhook) {
			if (webhook.image_logger) {
				let url = webhook.image_logger.url;
				let status = webhook.image_logger.working
					? "Connected!"
					: "Not working";
				let color = webhook.image_logger.working ? "#1dff44" : "#e41313";
				image_gallery.innerHTML = `
            <div style="padding: 16px;width: 100%;">
                  <div class="form-group mb-20">
                      <p>Webhooks are link you get from discord that allow external data such as images or text to automatically send in a channel. All deleted images will be fowarded to a discord channel of your choice.<br>If you do not know how to get a webhook <a class="mb-10" target="_blank" href="https://www.youtube.com/watch?v=-Ky-McTWJLI" style="color: #a5c9ff;font-size: 0.99rem;">click here</a></p>
                      <label id="webhook_label" style="width: 100%;font-size: 1rem;color:${color}" for="webhookInput">${status}</label>
                      <input class="myCustomForm form-control rounded-0 form-control-md" id="webhookInput" placeholder="Enter webhook" value="${url}"/>
                      <p class="form-text text-muted" style="font-size: 0.9rem;">It's recommended to make a personal server for kuroclient webhooks</p>
                  </div>
                  <button id="webhookSubmit" type="submit" class="btn btn-primary">Submit</button>
                  <button style="margin-left: 10px;" id="webhookRemove" type="submit" class="btn btn-danger">Remove</button>
            </div>      
            `;
			}
		} else {
			image_gallery.innerHTML = `
        <div style="padding: 16px;width: 100%;">
              <div class="form-group mb-20">
                  <p>Webhooks are link you get from discord that allow external data such as images or text to automatically send in a channel. All deleted images will be fowarded to a discord channel of your choice.<br>If you do not know how to get a webhook <a class="mb-10" target="_blank" href="https://www.youtube.com/watch?v=-Ky-McTWJLI" style="color: #a5c9ff;font-size: 0.99rem;">click here</a></p>
                  <label id="webhook_label" style="width: 100%;font-size: 1rem;" for="webhookInput"></label>
                  <input class="myCustomForm form-control rounded-0 form-control-md" id="webhookInput" placeholder="Enter webhook" />
                  <p class="form-text text-muted" style="font-size: 0.9rem;">It's recommended to make a personal server for kuroclient webhooks</p>
              </div>
              <button id="webhookSubmit" type="submit" class="btn btn-primary">Submit</button>
              <button style="margin-left: 10px;" id="webhookRemove" type="submit" class="btn btn-danger">Remove</button>
        </div>      
        `;
		}

		setTimeout(() => {
			refresh_loading_ = false;
		}, 2000);
	} catch (e) {
		setTimeout(() => {
			refresh_loading_ = false;
		}, 2000);
	}
	setTimeout(() => {
		refresh_loading_ = false;
	}, 2000);
}

document.body.addEventListener("click", async function (e) {
	if (e.target.id === "webhookSubmit") {
		if (
			!/https:\/\/discord.com\/api\/webhooks\/\d{19}/g.test(
				document.getElementById("webhookInput").value
			)
		) {
			document.getElementById("webhook_label").style = "color: #e41313;";
			document.getElementById("webhook_label").innerText = "Invalid webhook";
			return;
		} else {
			var resp = await fetch("/api/settings_update/image_webhook", {
				method: "POST",
				headers: {
					accept: "application/json",
					"accept-language": "en-US,en;q=0.9",
					authorization: account_id,
					"content-type": "application/json",
					"x-csrf-token": csrfToken,
				},
				body: JSON.stringify({
					webhook: document.getElementById("webhookInput").value,
				}),
			});
			var data = await resp.json();
			if (data.success == "true") {
				document.getElementById("webhook_label").style = "color: #1dff44;";
				document.getElementById("webhook_label").innerText = "Connected!";
			} else {
				document.getElementById("webhook_label").style = "color: #e41313;";
				document.getElementById("webhook_label").innerText =
					"Webhook connection failed";
			}
		}
	}
	if (e.target.id === "webhookRemove") {
		var resp = await fetch("/api/settings_update/remove_webhook", {
			method: "POST",
			headers: {
				accept: "application/json",
				"accept-language": "en-US,en;q=0.9",
				authorization: account_id,
				"content-type": "application/json",
				"x-csrf-token": csrfToken,
			},
			body: JSON.stringify({
				webhook: document.getElementById("webhookInput").value,
			}),
		});
		var data = await resp.json();
		if (data.success == "true") {
			document.getElementById("webhook_label").style = "color: #1dff44;";
			document.getElementById("webhook_label").innerText = "Removed!";
		} else {
			document.getElementById("webhook_label").style = "color: #e41313;";
			document.getElementById("webhook_label").innerText =
				"Failed to remove webhook, please try again later";
		}
		document.getElementById("webhookInput").value = "";
	}
});

if (plan == "free") {
	plan_status_message.innerHTML = `Want more message logs? <a style="color: #5eff00 !important; border: none !important; font-size: 14px;"href="pricing">Upgrade here`;
}

update_messages();
let last_active = null;
let current_active = null;

refresh_box.addEventListener("click", async (e) => {
	if (current_active === null || current_active.innerText == "Messages") {
		update_messages();
	} else if (current_active.innerText == "Images" && plan !== "free") {
		update_images();
	} else if (current_active.innerText == "Nitro" && plan !== "free") {
		update_nitro();
	}
});

document.querySelectorAll(".nav_link_filter").forEach((element) =>
	element.addEventListener("click", (event) => {
		if (last_active?.innerText == event.target.innerText) {
			return;
		}
		if (event.target.innerText == "Messages") {
			event.target.classList.add("active");
			document.getElementById("inbox_title").innerText = `Message Logger`;

			document
				.getElementById("message_box")
				.parentNode.classList.remove("hidden");
			document
				.getElementById("image_gallery")
				.parentNode.classList.add("hidden");
			document.getElementById("nitro_box").parentNode.classList.add("hidden");
			if (plan == "free") {
				plan_status_message.innerHTML = `Want more message logs? <a style="color: #5eff00 !important; border: none !important; font-size: 14px;"href="pricing">Upgrade here`;
			}
			plan_status_message.innerHTML = ``;
			update_messages();
		} else if (event.target.innerText == "Images") {
			event.target.classList.add("active");
			document.getElementById("inbox_title").innerText = `Image Logger`;
			document.getElementById("message_box").parentNode.classList.add("hidden");
			document
				.getElementById("image_gallery")
				.parentNode.classList.remove("hidden");
			document.getElementById("nitro_box").parentNode.classList.add("hidden");
			if (plan == "free") {
				plan_status_message.innerHTML = `Image logging only available with the pro plan. <a style="color: #5eff00 !important; border: none !important; font-size: 14px;"href="pricing">Upgrade here`;
			} else {
				plan_status_message.innerHTML = ``;
				update_images();
			}
		} else if (event.target.innerText == "Nitro") {
			event.target.classList.add("active");
			document.getElementById("inbox_title").innerText = `Nitro Logger`;
			document.getElementById("message_box").parentNode.classList.add("hidden");
			document
				.getElementById("image_gallery")
				.parentNode.classList.add("hidden");
			document
				.getElementById("nitro_box")
				.parentNode.classList.remove("hidden");
			if (plan == "free") {
				plan_status_message.innerHTML = `The nitro snipe feature will automatically reedeem any discord nitro sent in any server at anytime.<br>Nitro logging only available with the pro plan. <a style="color: #5eff00 !important; border: none !important; font-size: 14px;"href="pricing">Upgrade here`;
			} else {
				plan_status_message.innerHTML = `The nitro snipe feature will automatically reedeem any discord nitro sent in any server at anytime.<br>To enable nitrosniping, do the command ${prefix}nitrosnipe true`;
				update_nitro();
			}
		}
		if (!last_active) {
			document.getElementById("message_active").classList.remove("active");
		} else {
			last_active.classList.remove("active");
		}

		last_active = event.target;
		current_active = event.target;
	})
);
