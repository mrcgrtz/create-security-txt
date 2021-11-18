import test from 'ava';
import {execa} from 'execa';
import sinon from 'sinon';

let clock;

test.beforeEach(() => {
	clock = sinon.useFakeTimers({
		shouldAdvanceTime: true,
		now: new Date(2019, 1, 1, 0, 0),
	});
});

test.afterEach(() => {
	clock.restore();
});

test('Input without "contact" or "expires" flags shows help', async t => {
	const {exitCode} = await t.throwsAsync(() => execa('./cli.js'));
	t.is(exitCode, 2);
});

test('Input with "contact", but without "expires" flags shows help', async t => {
	const {exitCode} = await t.throwsAsync(() => execa('./cli.js', [
		'-c itsec@acme.org',
	]));
	t.is(exitCode, 2);
});

test('Input with "expires", but without "contact" flags shows help', async t => {
	const {exitCode} = await t.throwsAsync(() => execa('./cli.js', [
		'-e 7',
	]));
	t.is(exitCode, 2);
});

test('Input with minimal flags', async t => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
	]);
	t.regex(stdout, /Contact:\smailto:itsec@acme.org\n/);
	t.regex(stdout, /Expires:\s(.+)/);
});

test('Input with all flags', async t => {
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
	t.regex(stdout, /Contact:\smailto:itsec@acme.org\n/);
	t.regex(stdout, /Expires:\s(.+)\n/);
	t.regex(stdout, /Preferred-Languages:\sen\n/);
	t.regex(stdout, /Canonical:\shttps:\/\/acme\.org\/\.well-known\/security\.txt\n/);
	t.regex(stdout, /Encryption:\shttps:\/\/acme\.org\/key\.asc\n/);
	t.regex(stdout, /Acknowledgments:\shttps:\/\/acme\.org\/security\/acknowledgments\.txt\n/);
	t.regex(stdout, /Policy:\shttps:\/\/acme\.org\/security\/policy\.txt\n/);
	t.regex(stdout, /Hiring:\shttps:\/\/acme\.org\/jobs/);
});

test('Input with more than one contact point', async t => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--contact=https://acme.org/contact',
		'--expires=6',
	]);
	t.regex(stdout, /Contact:\smailto:itsec@acme.org\n/);
	t.regex(stdout, /Contact:\shttps:\/\/acme\.org\/contact\n/);
	t.regex(stdout, /Expires:\s(.+)/);
});

test('Input with more than one preferred language', async t => {
	const {stdout} = await execa('./cli.js', [
		'--contact=itsec@acme.org',
		'--expires=6',
		'--lang=en',
		'--lang=fi',
	]);
	t.regex(stdout, /Contact:\smailto:itsec@acme.org\n/);
	t.regex(stdout, /Expires:\s(.+)\n/);
	t.regex(stdout, /Preferred-Languages:\sen,\sfi/);
});
