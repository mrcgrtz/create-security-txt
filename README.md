# create-security-txt

> Create a [security.txt](https://securitytxt.org/) file.

[![Test](https://github.com/mrcgrtz/create-security-txt/actions/workflows/test.yml/badge.svg)](https://github.com/mrcgrtz/create-security-txt/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/mrcgrtz/create-security-txt/badge.svg?branch=main)](https://coveralls.io/github/mrcgrtz/create-security-txt?branch=main)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![MIT license](https://img.shields.io/github/license/mrcgrtz/create-security-txt.svg)](https://github.com/mrcgrtz/create-security-txt/blob/main/LICENSE.md)

## Usage

```bash
$ npx create-security-txt --help

  Create a security.txt file.

  Usage: create-security-txt -c URL -e DAYS [OPTIONS...]

  Options:
    --contact, -c     A link or e-mail address for people to
                      contact you about security issues. 
                      Remember to include "https://" for URLs,
                      and "mailto:" for e-mails.
    --expires, -e     Expiration in days from now when the
                      content of the security.txt file should
                      be considered stale (so security
                      researchers should then not trust
                      it).
    --lang, -l        A language code that your security team
                      speaks.
    --canonical, -u   The URLs for accessing your security.txt
                      file. It is important to include this if
                      you are digitally signing the
                      security.txt file, so that the location
                      of the security.txt file can be digitally
                      signed too.
    --encryption, -x  A link to a key which security researchers
                      should use to securely talk to you.
                      Remember to include "https://".
    --ack, -a         A link to a web page where you say thank
                      you to security researchers who have
                      helped you. Remember to include
                      "https://".
    --policy, -p      A link to a policy detailing what security
                      researchers should do when searching for
                      or reporting security issues. Remember to
                      include "https://".
    --hiring, -h      A link to any security-related job
                      openings in your organisation. Remember
                      to include "https://".

    Examples:
      Write to stdout:
        create-security-txt -c security@example.com -e 30
      Write a GPG signed file to the .well-known directory:
        create-security-txt -c itsec@example.org -e 7 | gpg --clearsign > .well-known/security.txt
```

## Optional installation

Using [npm](https://www.npmjs.com/get-npm):

```bash
npm install create-security-txt --global
```

Using [yarn](https://yarnpkg.com/):

```bash
yarn global add create-security-txt
```

## License

MIT © [Marc Görtz](https://marcgoertz.de/)
