import test from 'node:test';
import assert from 'node:assert';
import {execa} from 'execa';

test('Input without "contact" or "expires" flags shows help', async () => {
	let code;
	try {
		const {exitCode} = await execa('./cli.js');
		code = exitCode;
	} catch (error) {
		return error;
	}

	assert.strictEqual(code, 2);
});

test('Input with "contact", but without "expires" flags shows help', async () => {
	let code;
	try {
		const {exitCode} = await execa('./cli.js', ['-c itsec@acme.org']);
		code = exitCode;
	} catch (error) {
		return error;
	}

	assert.strictEqual(code, 2);
});

test('Input with "expires", but without "contact" flags shows help', async () => {
	let code;
	try {
		const {exitCode} = await execa('./cli.js', ['-e 7']);
		code = exitCode;
	} catch (error) {
		return error;
	}

	assert.strictEqual(code, 2);
});

test('Minimal flags are handled correctly', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
	]);
	assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
	assert.match(stdout, /Expires:\s(.+)/);
});

test('All flags are handled correctly', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
		'--lang=en',
		'--canonical=https://acme.org/.well-known/security.txt',
		'--encryption=https://acme.org/key.asc',
		'--ack=https://acme.org/security/acknowledgments.txt',
		'--policy=https://acme.org/security/policy.txt',
		'--hiring=https://acme.org/jobs',
		'--csaf=https://acme.org/csaf/provider-metadata.json',
	]);
	assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
	assert.match(stdout, /Expires:\s(.+)\n/);
	assert.match(stdout, /Preferred-Languages:\sen\n/);
	assert.match(
		stdout,
		/Canonical:\shttps:\/\/acme\.org\/\.well-known\/security\.txt\n/,
	);
	assert.match(stdout, /Encryption:\shttps:\/\/acme\.org\/key\.asc\n/);
	assert.match(
		stdout,
		/Acknowledgments:\shttps:\/\/acme\.org\/security\/acknowledgments\.txt\n/,
	);
	assert.match(stdout, /Policy:\shttps:\/\/acme\.org\/security\/policy\.txt\n/);
	assert.match(stdout, /Hiring:\shttps:\/\/acme\.org\/jobs\n/);
	assert.match(stdout, /CSAF:\shttps:\/\/acme\.org\/csaf\/provider-metadata\.json/);
});

test('More than one contact point is handled correctly', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--contact=https://acme.org/contact',
		'--expires=6',
	]);
	assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
	assert.match(stdout, /Contact:\shttps:\/\/acme\.org\/contact\n/);
	assert.match(stdout, /Expires:\s(.+)/);
});

test('Email address without `mailto:` scheme gets prefixed automatically', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
	]);
	assert.match(stdout, /Contact: mailto:itsec@acme.org\n/);
});

test('Email address with explicit `mailto:` scheme remains intact', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=mailto:itsec@acme.org',
		'--expires=6',
	]);
	assert.match(stdout, /Contact: mailto:itsec@acme.org\n/);
});

test('URL contact point is handled correctly', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=https://acme.org/contact',
		'--expires=6',
	]);
	assert.match(stdout, /Contact: https:\/\/acme\.org\/contact\n/);
});

test('More than one preferred language is handled correctly', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
		'--lang=en',
		'--lang=fi',
	]);
	assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
	assert.match(stdout, /Expires:\s(.+)\n/);
	assert.match(stdout, /Preferred-Languages:\sen,\sfi/);
});

test('Empty languages array does not output `Preferred-Languages` field', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
	]);
	assert.doesNotMatch(stdout, /Preferred-Languages:/);
});

test('More than one CSAF URL is handled correctly', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
		'--csaf=https://acme.org/csaf/provider-metadata-1.json',
		'--csaf=https://acme.org/csaf/provider-metadata-2.json',
	]);
	assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
	assert.match(stdout, /Expires:\s(.+)\n/);
	assert.match(stdout, /CSAF:\shttps:\/\/acme\.org\/csaf\/provider-metadata-1\.json\n/);
	assert.match(stdout, /CSAF:\shttps:\/\/acme\.org\/csaf\/provider-metadata-2\.json/);
});

test('Expires date as a numeric value is handled correctly', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
	]);
	assert.match(stdout, /Expires:\s(.+)/);
});

test('Expires date as an ISO date is handled correctly', async () => {
	const date = '2080-08-01T15:00:00Z';
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		`--expires=${date}`,
	]);
	assert.match(stdout, /Expires:\s(\w+)/);
});

test('Expires date in the past still generates valid output', async () => {
	const pastDate = '2020-01-01T00:00:00Z';
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		`--expires=${pastDate}`,
	]);
	assert.match(stdout, /Expires: (.+)/);
});

test('Unparseable expires date shows help', async () => {
	let code;
	try {
		const {exitCode} = await execa('./cli.js', [
			'-c itsec@acme.org',
			'-e FAIL',
		]);
		code = exitCode;
	} catch (error) {
		return error;
	}

	assert.strictEqual(code, 2);
});

test('Short flags work the same as long flags', async () => {
	const {stdout} = await execa('./cli.js', [
		'-c',
		'itsec@acme.org',
		'-e',
		'6',
		'-l',
		'en',
		'-p',
		'https://acme.org/policy.txt',
		'-s',
		'https://acme.org/csaf/provider-metadata.json',
	]);
	assert.match(stdout, /Contact: mailto:itsec@acme.org\n/);
	assert.match(stdout, /Expires: (.+)\n/);
	assert.match(stdout, /Preferred-Languages: en\n/);
	assert.match(stdout, /Policy: https:\/\/acme\.org\/policy\.txt\n/);
	assert.match(stdout, /CSAF: https:\/\/acme\.org\/csaf\/provider-metadata\.json/);
});

test('Multiple flags of the same type are handled correctly', async () => {
	const {stdout} = await execa('./cli.js', [
		'-c',
		'itsec@acme.org',
		'-c',
		'https://acme.org/contact',
		'-e',
		'6',
		'-p',
		'https://acme.org/policy1.txt',
		'-p',
		'https://acme.org/policy2.txt',
		'-s',
		'https://acme.org/csaf/provider-metadata-1.json',
		'-s',
		'https://acme.org/csaf/provider-metadata-2.json',
	]);
	assert.match(stdout, /Contact: mailto:itsec@acme.org\n/);
	assert.match(stdout, /Contact: https:\/\/acme\.org\/contact\n/);
	assert.match(stdout, /Policy: https:\/\/acme\.org\/policy1\.txt\n/);
	assert.match(stdout, /Policy: https:\/\/acme\.org\/policy2\.txt\n/);
	assert.match(stdout, /CSAF: https:\/\/acme\.org\/csaf\/provider-metadata-1\.json\n/);
	assert.match(stdout, /CSAF: https:\/\/acme\.org\/csaf\/provider-metadata-2\.json/);
});
