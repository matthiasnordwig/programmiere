---
title: "Build Log 2026-W44: a click into empty space that froze the app for up to 12 seconds"
description: "Why a click next to a table froze a WebKit app for 7–12 s while accessibility was active, how a small selection guard fixed it, and what else moved this week."
date: 2026-11-01
type: build-log
project: matrix
tags: [matrix, webkit, accessibility, performance, wordpress]
draft: false
---

Matrix LLM lets you ask your own documents on iPhone, iPad and Mac, offline; its interface runs in a WebKit view. A week earlier, a user had reported that the Mac app hung on clicks in Tables, its spreadsheet-like view. I could not reproduce it. Testing the web build in headless Chrome ruled out the obvious suspects — the click sent no call to the backend at all — but the cause stayed open. So this week I set up a headless macOS 27 guest (a virtual machine without a window on my own screen) to test the real app. There the hang finally showed up and I could sample it: clicking empty space next to the table froze the whole UI for 7–12 seconds — with a table of 1 372 rows, on every such click.

The cost is paid inside WebKit (which is why headless Chrome never showed it); my page just made it large. A click on empty space doesn't land in text; it puts an invisible caret *between the child elements* of a block. Normally that costs nothing. But as soon as anything uses the window's accessibility interface — VoiceOver, window tools, or an agent driving the app — WebKit describes that new caret position on the main thread by counting every visible character from the start of the surrounding block up to it. The stack trace showed `FrameSelection::notifyAccessibilityForSelectionChange` → `AXObjectCache::characterOffsetFromVisiblePosition`. A caret inside text is cheap, because the count stays within one text node.

The fix is a small selection guard (`app/src/selectionGuard.ts`, installed once in `main.tsx`) that works in two places:

- on `mousedown` (capture phase) it stops a click on empty space from moving the selection at all — after user input, WebKit describes the new selection before any `selectionchange` handler gets to run, so reacting later is too late;
- on `selectionchange` it drops a caret that ends up between elements anyway, for example after a re-render removed its text.

Clicks on controls, focusable or draggable elements and scrollbars, carets in text, real selections and fields are left alone, so focus still moves as with a normal click. The decision rules are pure functions with their own tests. Separately, Tables now renders only the visible rows (`@tanstack/react-virtual`); on one sample table that took the page from 24 782 to 508 DOM nodes. After both changes, a 65-minute continuous run of version 0.2.5 in the VM finished without a hang.

What else moved:

- **Matrix search across languages:** the keyword channel of a collection no longer counts when the question's language differs from most of its vector hits. Measured mean reciprocal rank (how high the right passage ranks): 0.539 → 0.612 without reranking, 0.666 → 0.682 with it.
- **Matrix share menu:** version 0.2.5 adds a share extension for iOS and macOS, so files can be sent into the app from other apps, and files can be attached directly to a chat. On macOS it may need to be switched on once under Edit Extensions; whether the store build does that by itself is still open.
- **[Invisible Anti-Spam for WordPress](/projects/gdpr-recaptcha/) 6.3.0** (released 2026-10-29): the "Fieldname:prefix" setting for flagging spam shows up in the form's e-mail again — it had been lost since 4.1 — and now also for fields sent as JSON (e.g. Ninja Forms, REST requests).
