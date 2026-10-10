---
title: Invisible Anti-Spam for WordPress
summary: A reCAPTCHA alternative for every WordPress form — no puzzles, no Google, no cookies. The visitor's browser quietly proves it's real; bots pay in compute.
status: Free on WordPress.org · ~4,000 sites
order: 2
featured: true
links:
  - label: Install from WordPress.org
    url: https://wordpress.org/plugins/gdpr-compliant-recaptcha-for-all-forms/
---

**Your visitors never see it.** No image grids, no "I'm not a robot" box, nothing to click. While
they hit *Send*, their browser solves a tiny cryptographic challenge in a few milliseconds. Humans
don't notice; mass-spam bots either fail or have to burn so much computing power per message that
spamming stops paying off.

**Every form, not a list of integrations.** Logins, registrations, comments, WooCommerce checkout
and reviews, Contact Form 7, Elementor, WPForms, Gravity Forms, Ninja Forms, Fluent Forms,
Formidable and dozens more. The plugin recognises a submission by its signature rather than by
hooking into each form plugin — so a hand-coded form or an exotic builder can be taught in under a
minute: submit it once in analysis mode, click save.

**Nothing leaves your server.** No account, no API keys, no third-party scripts, no cookie-banner
entry. Nothing external can go down and take your forms with it, and nothing external slows the
page.

## Why not reCAPTCHA, hCaptcha, Turnstile or Akismet?

They need accounts and keys, load scripts from someone else's servers or send your visitors'
messages away for analysis, and still challenge real people when in doubt. This plugin does none of
that.

## Who maintains it

Mostly [an AI loop with a human gate](/projects/maintainer-loop/): it reads the support forum,
drafts fixes and replies, and nothing ships until I approve it.
