module.exports = {
	creds: {
		fb: {
		    appId: '210234019058633'
		  , appSecret: '8030f2759dd95d9afab2a201b68840c5'
		},
		domain: "http://cashtracker.nodejitsu.com"
	},
	database: "mongodb://nodejitsu:ad8ba547acf567721d7c6fa8f27de705@staff.mongohq.com:10041/nodejitsudb708672827726",
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
	}
};