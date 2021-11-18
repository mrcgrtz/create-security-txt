#!/usr/bin/env node

import meow from 'meow';
import {addDays, formatRFC7231} from 'date-fns';
import flags from './flags.js';

const cli = meow(`
    Usage: create-security-txt -c URL -e DAYS [OPTIONS...]

    Options:
      --contact, -c     A link or e-mail address for people to contact
                        you about security issues. Remember to include
                        "https://" for URLs, and "mailto:" for e-mails.
      --expires, -e     Expiration in days from now when the content of
                        the security.txt file should be considered stale
                        (so security researchers should then not trust
                        it).
      --lang, -l        A language code that your security team speaks.
      --canonical, -u   The URLs for accessing your security.txt file.
                        It is important to include this if you are
                        digitally signing the security.txt file, so that
                        the location of the security.txt file can be
                        digitally signed too.
      --encryption, -x  A link to a key which security researchers
                        should use to securely talk to you. Remember to
                        include "https://".
      --ack, -a         A link to a web page where you say thank you to
                        security researchers who have helped you.
                        Remember to include "https://".
      --policy, -p      A link to a policy detailing what security
                        researchers should do when searching for or
                        reporting security issues. Remember to include
                        "https://".
      --hiring, -h      A link to any security-related job openings in
                        your organisation. Remember to include
                        "https://".

    Examples:
      Write to stdout:
        create-security-txt -c security@example.com -e 30
      Write a GPG signed file to the .well-known directory:
        create-security-txt -c itsec@example.org -e 7 | gpg --clearsign > .well-known/security.txt
`, {
	importMeta: import.meta,
	flags,
});

if (cli.flags.contact.length === 0 || !cli.flags.expires) {
	cli.showHelp();
} else {
	const flagLabels = {};
	for (const [key, {label}] of Object.entries(flags)) {
		flagLabels[key] = label;
	}

	const securitytxt = Object.entries(cli.flags).flatMap(([flag, values]) => {
		switch (flag) {
			case 'contact': {
				return values.map(value => {
					// Fix email address URLs
					if (value.includes('@') && value.startsWith('mailto:') === false) {
						return `${flagLabels[flag]}: mailto:${value}`;
					}

					return `${flagLabels[flag]}: ${value}`;
				});
			}

			case 'expires': {
				const now = new Date();
				const expires = addDays(now, values);
				return `${flagLabels[flag]}: ${formatRFC7231(expires)}`;
			}

			case 'lang': {
				if (Array.isArray(values) && values.length > 0) {
					return `${flagLabels[flag]}: ${values.join(', ')}`;
				}

				return null;
			}

			default: {
				return values.map(value => `${flagLabels[flag]}: ${value}`);
			}
		}
	}).filter(Boolean).join('\n');

	console.log(securitytxt);
}
