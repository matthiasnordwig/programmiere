---
title: Matrix
summary: Ask a thousand pages a question — on a phone, offline. Answers come with the exact sentence that proves them.
status: Active
order: 1
featured: true
---

Some work means reading thousands of pages where every statement needs a source: regulations,
circulars, contracts. "Sounds right" is not good enough. Matrix is built for exactly that, and it
keeps the documents on your own device.

## Three ways in

**Ask.** Put one question to the whole collection. The model searches the documents itself,
reads the passages it finds, and answers. Afterwards the system checks every citation against
the original text — a quote that isn't really there gets flagged.

**Ask a hundred times.** The grid runs the same question over hundreds of rows — passages or a
list you upload — and every answer has to fit a fixed schema you define, with a live preview of
exactly what the model will see.

**See the whole picture.** A knowledge graph of who relates to what. Every link carries a verbatim
quote from the source, and anything doubtful lands in a review queue instead of silently
disappearing.

## Under the hood

One core in Rust, thin adapters on top: a macOS app, an iPhone app and a web server share the same
engine. Local models run on Apple's GPU and Neural Engine; cloud models plug in through the same
cockpit when the task needs them. Documents are split along their actual structure, embedded,
and searched with a mix of vector and full-text search.

## Honest status

Asking and the grid work today, with a local model or a gateway. The knowledge graph is two-tier:
a local model gives a fast first map; a graph you can rely on needs a stronger model. Matrix went
from a 48-hour prototype to this in two weeks.
