# 0005 — Keine Drittanfragen, kein Tracking

**Status:** gilt · 2026-10-10

**Entscheidung.** Die Seite lädt nichts von Dritten: keine Web-Fonts von Google & Co. (System-
und Mono-Stacks), keine Analytics, keine Cookies, keine eingebetteten Fremd-Widgets
(Videos als Link oder selbst gehostet). Astro-Telemetrie ist in den npm-Skripten abgeschaltet.

**Warum.** Glaubwürdigkeit: der Autor eines DSGVO-Plugins betreibt keine Seite, die Besucher
an Dritte meldet. Und keine Cookie-Banner.

**Konsequenzen.** Reichweite wird nicht gemessen, sondern über Links/Erwähnungen und wp.org-
Zahlen beobachtet. Wer später Statistik will: nur serverseitig/cookielos, neue Entscheidung.
