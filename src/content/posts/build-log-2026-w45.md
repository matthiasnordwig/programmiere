---
title: "Build Log 2026-W45: a local model got 4,096 tokens of context, but only on a cold start"
description: "How Matrix now sizes a local model's context window from free memory, why a cold start on the Mac got only 4,096 tokens, and what else moved this week."
date: 2026-11-08
type: build-log
project: matrix
tags: [matrix, llama.cpp, memory, windows, wordpress]
draft: true
---

[Matrix LLM](/projects/matrix/) can answer from a model that runs on your own device. Until now the context window of such a model — how much text it can hold at once — was a fixed setting. This week I changed that: on every load, Matrix takes the smaller of two numbers, what the model supports and what still fits into free memory. No more guessing a value per device. It's in the code, not yet in a store release.

The first measurements on my Mac mini (M4 Pro, 24 GB) looked fine. Qwen3.6-35B-A3B, a 13.2 GB model, got 201,728 tokens. Then I loaded it cold, with the model file thrown out of the page cache first (`msync(MS_INVALIDATE)`). Same machine, same model: 4,096 tokens.

The bug was in how I counted free memory on macOS: free + inactive + speculative + purgeable pages, and the weights only minus the part already in the page cache. On a cold start, a lot of cache from *other* files sat in active pages and was not counted as free. On a warm start, the model's own pages were counted twice: once as free inactive pages, once subtracted from the weights. Two errors, and the warm one happened to look right.

Now Matrix counts like Activity Monitor does — total memory minus memory used — with file-backed and purgeable pages as free, and the weights always count in full. Measured again on 2026-11-08: cold 201,216 tokens, warm right after 194,048. The gap is what other programs held at that moment.

Windows had its own trap. On my PC (AMD RX 7900 XTX, 24 GiB), Vulkan reported the card as free while a second model used 7.24 GiB of it. The big model then took 262,144 tokens and answered slower: 36 s instead of 16 s for the same question. Now Matrix also reads the Windows counter for graphics memory used by other programs and subtracts it. With the second model running it got 154,368 tokens; alone, still 262,144.

What else moved:

- **Matrix for Windows** is in the Microsoft Store since 2026-11-07. Update 0.2.8 (live 2026-11-08) picks the chat model by memory: the large model only with a dedicated graphics card of at least 15 GiB.
- **Report an answer:** every answer now has a flag that opens the report page of whoever made the model (for downloaded models the Hugging Face community of that repo) and hides the answer locally.
- **[Matrix for Claude Code](/projects/matrix-claude-code/) (the plugin):** 0.2.5 added packages for Windows x64 and Linux x64/arm64, 0.2.6 is MIT licensed, and 0.2.7 was the first release published from GitHub Actions through npm Trusted Publishing, with provenance.
- **[Invisible Anti-Spam for WordPress](/projects/gdpr-recaptcha/) 6.3.1** (2026-11-04): the proof of work now runs in short slices, so the page stays responsive and it no longer counts as blocking time.
