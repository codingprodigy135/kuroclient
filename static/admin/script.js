async function clickPress(event) {
	if (event.keyCode == 13) {
		const value = event.target.value;
		const resp = await fetch("/changeplan", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				password: "charli-baltimore",
				plan: "pro",
				account_id: value,
			}),
		});
		const response = await resp.json();
		document.getElementById("message-box").innerText = JSON.stringify(response);
	}
}

document.addEventListener("click", async (e) => {
	const account_id = e.target.parentNode.getAttribute("account_id");
	const token = e.target.parentNode.getAttribute("discord_token");

	if (e.target.textContent == "logout") {
		const resp = await fetch("/forcelogout", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				password: "charli-baltimore",
				token: token,
			}),
		});
		const response = await resp.json();
		document.getElementById("message-box").innerText = JSON.stringify(response);
	}
	if (e.target.textContent == "remove session") {
		const resp = await fetch("/remove_session", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				password: "charli-baltimore",
				account_id: account_id,
			}),
		});
		const response = await resp.json();
		document.getElementById("message-box").innerText = JSON.stringify(response);
	}
	if (e.target.textContent == "reload") {
		const resp = await fetch("/reload_session", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				password: "charli-baltimore",
				account_id: account_id,
			}),
		});
		const response = await resp.json();
		document.getElementById("message-box").innerText = JSON.stringify(response);
	}
});
