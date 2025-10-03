import test from 'node:test';
import assert from 'node:assert';
import {execa} from 'execa';

// Helper function to test help output
async function expectHelp(args = []) {
	let code;
	try {
		const {exitCode} = await execa('./cli.js', args);
		code = exitCode;
	} catch (error) {
		code = error.exitCode;
	}

	assert.strictEqual(code, 2);
}

test('Help output for missing required flags', async t => {
	await t.test('No flags shows help', async () => {
		await expectHelp();
	});

	await t.test('Missing "expires" flag shows help', async () => {
		await expectHelp(['--contact=itsec@acme.org']);
	});

	await t.test('Missing "contact" flag shows help', async () => {
		await expectHelp(['--expires=7']);
	});

	await t.test('Empty "expires" value shows help', async () => {
		await expectHelp(['--contact=itsec@acme.org', '--expires=']);
	});

	await t.test('Empty "contact" value shows help', async () => {
		// Simulate empty contact array by not providing contact
		await expectHelp(['--expires=7', '--contact=']);
	});
});

test('Basic functionality', async t => {
	await t.test('Minimal flags are handled correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=6',
		]);
		assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
		assert.match(stdout, /Expires:\s(.+)/);
	});

	await t.test('All flags are handled correctly', async () => {
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
});

test('Contact handling', async t => {
	await t.test('Email address without `mailto:` protocol gets prefixed automatically', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=6',
		]);
		assert.match(stdout, /Contact: mailto:itsec@acme.org\n/);
	});

	await t.test('Email address with explicit `mailto:` protocol remains intact', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=mailto:itsec@acme.org',
			'--expires=6',
		]);
		assert.match(stdout, /Contact: mailto:itsec@acme.org\n/);
	});

	await t.test('URL contact point is handled correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=https://acme.org/contact',
			'--expires=6',
		]);
		assert.match(stdout, /Contact: https:\/\/acme\.org\/contact\n/);
	});

	await t.test('More than one contact point is handled correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--contact=https://acme.org/contact',
			'--expires=6',
		]);
		assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
		assert.match(stdout, /Contact:\shttps:\/\/acme\.org\/contact\n/);
		assert.match(stdout, /Expires:\s(.+)/);
	});

	await t.test(
		'Email address with `@` symbol but already having the `mailto:` protocol is not double-prefixed',
		async () => {
			const {stdout} = await execa('./cli.js', [
				'--contact=mailto:security@example.com',
				'--expires=7',
			]);
			assert.match(stdout, /Contact: mailto:security@example\.com\n/);
			assert.doesNotMatch(stdout, /(?:mailto:){2}/);
		},
	);

	await t.test('Contact point without `@` symbol is handled as URL', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=https://acme.org/contact',
			'--expires=7',
		]);
		assert.match(stdout, /Contact: https:\/\/acme\.org\/contact\n/);
	});
});

test('Language handling', async t => {
	await t.test('Multiple languages are handled correctly', async () => {
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

	await t.test('Single language is handled correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=7',
			'--lang=de',
		]);
		assert.match(stdout, /Preferred-Languages: de/);
	});

	await t.test('No languages does not output `Preferred-Languages` field', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=6',
		]);
		assert.doesNotMatch(stdout, /Preferred-Languages:/);
	});

	await t.test('Empty language does not output `Preferred-Languages` field', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=7',
			'--lang=',
		]);
		assert.doesNotMatch(stdout, /Preferred-Languages:/);
	});
});

test('Expires handling', async t => {
	await t.test('Numeric value is handled correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=6',
		]);
		assert.match(stdout, /Expires:\s(.+)/);
	});

	await t.test('ISO date string is handled correctly', async () => {
		const date = '2080-08-01T15:00:00Z';
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			`--expires=${date}`,
		]);
		assert.match(stdout, /Expires:\s(.+)/);
	});

	await t.test('Past date still generates valid output', async () => {
		const pastDate = '2020-01-01T00:00:00Z';
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			`--expires=${pastDate}`,
		]);
		assert.match(stdout, /Expires: (.+)/);
	});

	await t.test('Zero expires value is handled correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=test@example.com',
			'--expires=0',
		]);
		assert.match(stdout, /Contact: mailto:test@example\.com\n/);
		assert.match(stdout, /Expires: (.+)/);
	});

	await t.test('Negative expires value is handled correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=-5',
		]);
		assert.match(stdout, /Contact: mailto:itsec@acme\.org\n/);
		assert.match(stdout, /Expires: (.+)/);
	});

	await t.test('Large numeric expires value is handled correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=999999',
		]);
		assert.match(stdout, /Contact: mailto:itsec@acme\.org/);
		assert.match(stdout, /Expires: (.+)/);
	});

	await t.test('Unparseable expires date shows help', async () => {
		await expectHelp(['--contact=itsec@acme.org', '--expires=FAIL']);
	});

	await t.test('Malformed ISO date string shows help', async () => {
		await expectHelp([
			'--contact=itsec@acme.org',
			'--expires=2024-13-45T25:99:99Z',
		]);
	});
});

test('Flag formats and multiple values', async t => {
	await t.test('Short flags work the same as long flags', async () => {
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

	await t.test('Multiple flags of the same type are handled correctly', async () => {
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

	await t.test('Multiple CSAF URLs are handled correctly', async () => {
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

	await t.test('All flag types with single values are processed correctly', async () => {
		const {stdout} = await execa('./cli.js', [
			'--contact=itsec@acme.org',
			'--expires=7',
			'--canonical=https://acme.org/.well-known/security.txt',
			'--encryption=https://acme.org/pgp.asc',
			'--ack=https://acme.org/thanks',
			'--policy=https://acme.org/policy',
			'--hiring=https://acme.org/jobs',
		]);

		assert.match(stdout, /Contact: mailto:itsec@acme\.org/);
		assert.match(stdout, /Canonical: https:\/\/acme\.org\/\.well-known\/security\.txt/);
		assert.match(stdout, /Encryption: https:\/\/acme\.org\/pgp\.asc/);
		assert.match(stdout, /Acknowledgments: https:\/\/acme\.org\/thanks/);
		assert.match(stdout, /Policy: https:\/\/acme\.org\/policy/);
		assert.match(stdout, /Hiring: https:\/\/acme\.org\/jobs/);
	});
});
