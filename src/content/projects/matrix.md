---
title: Matrix LLM
summary: "Ask questions about your own documents on iPhone, iPad, Mac and Windows, offline. Every answer shows the exact passage it is based on. Free on the App Store and in the Microsoft Store."
status: On the App Store and Microsoft Store
order: 1
featured: true
links:
  - label: App Store
    url: https://apps.apple.com/app/id6786311747
  - label: Microsoft Store
    url: https://apps.microsoft.com/detail/9PGLD9C1DQJW
---

Some work means reading thousands of pages where every statement needs a source: regulations,
circulars, contracts. An answer that only sounds right is no use there. I built Matrix for that
kind of work, and it keeps the documents on your own device.

## Three ways to use it

**Ask.** You put one question to the whole collection. The model searches the documents itself,
reads the passages it finds and answers. Then Matrix checks every quote against the original text
and flags any quote that isn't actually there.

**Tables.** A table runs the same question over hundreds of rows, either passages or a list you
upload. Every answer has to fit a fixed schema that you define, and a live preview shows exactly
what the model will see.

**Knowledge graph.** It shows who relates to what. Every link carries a word-for-word quote from
the source, and anything doubtful goes into a review queue instead of being dropped silently.

## How it's built

One core in Rust with thin layers on top: a macOS app, a Windows app, an iPhone app and a web server use the same
engine. Local models run on Apple's GPU and Neural Engine, and on Windows on the graphics card through Vulkan. When a task needs more, cloud models can
be connected through the same interface. Documents are split along their actual structure, turned
into vectors (embedded) and searched with a mix of vector and full-text search.

## Current status

Asking and tables work today, with a local model or through a gateway. The knowledge graph works
in two stages: a local model gives a quick first map, but a graph you can rely on needs a stronger
model.
