Socket = {
	authorized_websockets: [],
	authorize_socket: function authorized_socket(account_id, ws) {
		this.authorized_websockets.push({ [account_id]: { ws: ws } });
	},
	send: function send(account_id, message, options = null) {
		if (options) {
			try {
				if (options.log == true && options.session) {
					options.session.logs.push(message);
				}
			} catch (e) {
				console.log(e);
			}
		}

		try {
			if (this.authorized_websockets) {
				for (i in this.authorized_websockets) {
					if (account_id in this.authorized_websockets[i]) {
						const ws = Object.values(this.authorized_websockets[i])[0].ws;
						//OPEN readyState
						if (ws.readyState === 1) {
							ws.send(JSON.stringify(message));
						}
						//Remove if websocekt state is CLOSED or CLOSING
						if (ws.readyState === 2 || ws.readyState === 3) {
							this.remove_socket(ws);
						}
					}
				}
			}
		} catch (e) {
			console.log(e);
			console.log("sending ws failed");
		}
	},
	remove_socket: function remove_socket(ws) {
		for (i in this.authorized_websockets) {
			if (ws == Object.values(this.authorized_websockets[i])[0].ws) {
				this.authorized_websockets.splice(i, 1);
				return true;
			}
		}
		return false;
	},
};

module.exports = Socket;
