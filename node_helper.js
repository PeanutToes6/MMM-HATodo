const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
	timers: {},

	socketNotificationReceived (notification, payload) {
		if (notification !== "HATODO_CONFIG") return;

		const { identifier, config } = payload;
		clearInterval(this.timers[identifier]);

		this.fetchItems(identifier, config);
		this.timers[identifier] = setInterval(
			() => this.fetchItems(identifier, config),
			config.updateInterval
		);
	},

	async fetchItems (identifier, config) {
		const url = `${config.haUrl.replace(/\/$/, "")}/api/services/todo/get_items?return_response`;

		try {
			const res = await fetch(url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${config.token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					entity_id: config.entity,
					status: "needs_action"
				})
			});

			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}

			const data = await res.json();
			const items = data.service_response?.[config.entity]?.items || [];

			this.sendSocketNotification("HATODO_ITEMS", {
				identifier,
				items: items.map((i) => ({
					summary: i.summary,
					due: i.due || null
				}))
			});
		} catch (err) {
			Log.error(`[MMM-HATodo] Failed to fetch items: ${err.message}`);
			this.sendSocketNotification("HATODO_ERROR", {
				identifier,
				message: "Can't reach Home Assistant"
			});
		}
	}
});
