module.exports = {
	creds: {
		fb: {
		    appId: '284829388236745'
		  , appSecret: 'a1afdc76b9ff5b1a11c6fc312eadfff5'
		},
		domain: "http://local.host:3000"
	},
	database: "mongodb://localhost/cashtracker",
	template_engine: "jade",
	logging: {
		loggly: {
			auth: {
				username: 'bdefore',
				password: 'Nobjow11'
			},
			subdomain: 'bcdef',
			inputName: 'cashtracker',
			inputToken: '8150a4a2-a604-439f-aff1-9ad5956e9fa4',
			json: true
		},
		logfile: {
			filename: "winston.log",
			handleExceptions: true
		}
	}
};