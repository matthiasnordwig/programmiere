---
title: Matrix for Claude Code
summary: "A free plugin that gives Claude Code a local, searchable index of your PDFs, Word files, scans and charts. Measured on 442 pages: on average 42 instead of 126 seconds per question, less than half the input tokens."
status: Public · v0.2.3
order: 1.5
featured: true
links:
  - label: GitHub
    url: https://github.com/matthiasnordwig/matrix-mcp
---

On its own, Claude Code reads documents the slow way: convert to text, grep, read, repeat, and all
of that again for every question. Matrix indexes a folder once on your own Mac. After that, every
question starts with a search by meaning, and every hit comes with file, page and passage.
