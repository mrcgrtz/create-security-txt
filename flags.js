const flags = {
	contact: {
		label: 'Contact',
		type: 'string',
		alias: 'c',
		isMultiple: true
	},
	expires: {
		label: 'Expires',
		type: 'number',
		alias: 'e'
	},
	lang: {
		label: 'Preferred-Languages',
		type: 'string',
		alias: 'l',
		isMultiple: true
	},
	canonical: {
		label: 'Canonical',
		type: 'string',
		alias: 'u',
		isMultiple: true
	},
	encryption: {
		label: 'Encryption',
		type: 'string',
		alias: 'x',
		isMultiple: true
	},
	ack: {
		label: 'Acknowledgments',
		type: 'string',
		alias: 'a',
		isMultiple: true
	},
	policy: {
		label: 'Policy',
		type: 'string',
		alias: 'p',
		isMultiple: true
	},
	hiring: {
		label: 'Hiring',
		type: 'string',
		alias: 'h',
		isMultiple: true
	}
};

export default flags;
