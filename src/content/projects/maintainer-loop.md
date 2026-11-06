---
title: The maintainer loop
summary: A loop that maintains a WordPress plugin largely on its own. The model only makes proposals, a gate of plain code (no model) decides, and I approve every step that goes outside from my phone.
status: Running
order: 3
featured: true
---

Four roles share their state through files. A **scout** checks forums, reviews and competitors; it
uses no model. A **worker** implements one item at a time in a headless Claude Code session (one
without a user at the keyboard) on its own branch, and a rule-based checker, the rails verifier,
tests the result. A **concierge** talks to me over Signal. The **gate** is the only way past a step
that can't be undone, such as a release, a merge or a forum post: one approval per action, never
one approval for several.
