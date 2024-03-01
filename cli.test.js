import test from 'node:test';
import assert from 'node:assert';
import {execa} from 'execa';

test('Input without "contact" or "expires" flags shows help', async () => {
	const {exitCode} = await execa('./cli.js').catch(error => error);
	assert.strictEqual(exitCode, 2);
});

test('Input with "contact", but without "expires" flags shows help', async () => {
	const {exitCode} = await execa('./cli.js', [
		'-c itsec@acme.org',
	]).catch(error => error);
	assert.strictEqual(exitCode, 2);
});

test('Input with "expires", but without "contact" flags shows help', async () => {
	const {exitCode} = await execa('./cli.js', [
		'-e 7',
	]).catch(error => error);
	assert.strictEqual(exitCode, 2);
});

test('Input with minimal flags', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
	]);
	assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
	assert.match(stdout, /Expires:\s(.+)/);
});

test('Input with all flags', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
		'--lang=en',
		'--canonical=https://acme.org/.well-known/security.txt',
		'--encryption=https://acme.org/key.asc',
		'--ack=https://acme.org/security/acknowledgments.txt',
		'--policy=https://acme.org/security/policy.txt',
		'--hiring=https://acme.org/jobs',
	]);
	assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
	assert.match(stdout, /Expires:\s(.+)\n/);
	assert.match(stdout, /Preferred-Languages:\sen\n/);
	assert.match(stdout, /Canonical:\shttps:\/\/acme\.org\/\.well-known\/security\.txt\n/);
	assert.match(stdout, /Encryption:\shttps:\/\/acme\.org\/key\.asc\n/);
	assert.match(stdout, /Acknowledgments:\shttps:\/\/acme\.org\/security\/acknowledgments\.txt\n/);
	assert.match(stdout, /Policy:\shttps:\/\/acme\.org\/security\/policy\.txt\n/);
	assert.match(stdout, /Hiring:\shttps:\/\/acme\.org\/jobs/);
});

test('Input with more than one contact point', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--contact=https://acme.org/contact',
		'--expires=6',
	]);
	assert.match(stdout, /Contact:\smailto:itsec@acme.org\n/);
	assert.match(stdout, /Contact:\shttps:\/\/acme\.org\/contact\n/);
	assert.match(stdout, /Expires:\s(.+)/);
});

test('Input with more than one preferred language', async () => {
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

test('Input with "expires" as a numeric value', async () => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
	]);
	assert.match(stdout, /Expires:\s(.+)/);
});

test('Input with "expires" as an ISO date', async () => {
	const date = '2080-08-01T15:00:00Z';
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		`--expires=${date}`,
	]);
	assert.match(stdout, /Expires:\s(\w+)/);
});

test('Input with an unparseable "expires" value shows help', async () => {
	const {exitCode} = await execa('./cli.js', [
		'-c itsec@acme.org',
		'-e FAIL',
	]).catch(error => error);
	assert.strictEqual(exitCode, 2);
});
