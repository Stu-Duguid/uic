behaviours: {
	enabled: true,
		events: [
			{ name: "change", attachToShadows: true, recurseFrames: true },
			{ name: "click", recurseFrames: true },
			{ name: "unload", target: window },
			{ name: "resize", target: window },
			{ name: "scroll", target: window },
			{ name: "mousemove", recurseFrames: true },
			{ name: "orientationchange", target: window },
			{ name: "error", target: window },
		]
},

behaviours: {
	rageclick: {
		enable: true,
		// clicks: 6,
		// area: 80,
		// time: 4000,
		// blocklist: []
	},
	deadclick: {
		enable: true,
		// time: 2000,
		// blocklist: []
	},
	errorclick: {
		enable: true,
		// time: 200,
		// blocklist: []
	},
	excessscroll: {
		enable: true,
		// scale: 2,
		// blocklist: []
	},
	thrashing: {
		enable: true,
		// time: 3000,
		// blocklist: []
	},
},