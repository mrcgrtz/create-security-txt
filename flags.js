const flags = {
	contact: {
		label: 'Contact',
		type: 'string',
		shortFlag: 'c',
		isMultiple: true,
	},
	expires: {
		label: 'Expires',
		shortFlag: 'e',
	},
	lang: {
		label: 'Preferred-Languages',
		type: 'string',
		shortFlag: 'l',
		isMultiple: true,
	},
	canonical: {
		label: 'Canonical',
		type: 'string',
		shortFlag: 'u',
		isMultiple: true,
	},
	encryption: {
		label: 'Encryption',
		type: 'string',
		shortFlag: 'x',
		isMultiple: true,
	},
	ack: {
		label: 'Acknowledgments',
		type: 'string',
		shortFlag: 'a',
		isMultiple: true,
	},
	policy: {
		label: 'Policy',
		type: 'string',
		shortFlag: 'p',
		isMultiple: true,
	},
	hiring: {
		label: 'Hiring',
		type: 'string',
		shortFlag: 'h',
		isMultiple: true,
	},
	csaf: {
		label: 'CSAF',
		type: 'string',
		shortFlag: 's',
		isMultiple: true,
	},
};

export default flags;
