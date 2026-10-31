Module.register("MMM-HATodo", {
	defaults: {
		haUrl: "http://your.homeassistant.local",
		token: "",
		entity: "todo.my_tasks",
		maxItems: 10, // items shown at once; longer lists cycle through in pages
		cycleInterval: 10 * 1000, // time each page is shown, in ms
		showPageIndicator: true, // shows "1/3" under the list when there is more than one page
		updateInterval: 5 * 60 * 1000, // 5 minutes
		showDueDates: true,
		animationSpeed: 1000
	},

	start () {
		this.items = [];
		this.error = null;
		this.loaded = false;
		this.page = 0;
		this.cycleTimer = null;

		this.sendSocketNotification("HATODO_CONFIG", {
			identifier: this.identifier,
			config: this.config
		});
		this.scheduleCycle();
	},

	suspend () {
		clearInterval(this.cycleTimer);
	},

	resume () {
		this.scheduleCycle();
	},

	getStyles () {
		return ["MMM-HATodo.css"];
	},

	pageCount () {
		return Math.max(1, Math.ceil(this.items.length / this.config.maxItems));
	},

	scheduleCycle () {
		clearInterval(this.cycleTimer);
		this.cycleTimer = setInterval(() => {
			if (!this.loaded || this.error) return;
			const pages = this.pageCount();
			if (pages <= 1) return;
			this.page = (this.page + 1) % pages;
			this.updateDom(this.config.animationSpeed);
		}, this.config.cycleInterval);
	},

	socketNotificationReceived (notification, payload) {
		if (payload.identifier !== this.identifier) return;

		if (notification === "HATODO_ITEMS") {
			this.items = payload.items;
			this.error = null;
			// the list may have shrunk since the last refresh
			if (this.page >= this.pageCount()) this.page = 0;
		} else if (notification === "HATODO_ERROR") {
			this.error = payload.message;
		} else {
			return;
		}

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	getDom () {
		const wrapper = document.createElement("div");
		wrapper.className = "hatodo";

		if (!this.loaded) {
			wrapper.className += " dimmed light small";
			wrapper.textContent = "Loading…";
			return wrapper;
		}

		if (this.error) {
			wrapper.className += " dimmed light small";
			wrapper.textContent = this.error;
			return wrapper;
		}

		if (this.items.length === 0) {
			wrapper.className += " dimmed light small";
			wrapper.textContent = "Nothing to do 🎉";
			return wrapper;
		}

		const start = this.page * this.config.maxItems;
		const visible = this.items.slice(start, start + this.config.maxItems);

		const list = document.createElement("ul");
		visible.forEach((item) => {
			const li = document.createElement("li");
			li.className = "hatodo-item small";

			const text = document.createElement("span");
			text.textContent = item.summary;
			li.appendChild(text);

			if (this.config.showDueDates && item.due) {
				const due = document.createElement("span");
				due.className = "hatodo-due dimmed";
				due.textContent = moment(item.due).format("MMM D");
				li.appendChild(due);
			}

			list.appendChild(li);
		});

		wrapper.appendChild(list);

		const pages = this.pageCount();
		if (this.config.showPageIndicator && pages > 1) {
			const indicator = document.createElement("div");
			indicator.className = "hatodo-page dimmed xsmall";
			indicator.textContent = `${this.page + 1} / ${pages}`;
			wrapper.appendChild(indicator);
		}

		return wrapper;
	}
});
