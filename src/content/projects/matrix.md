---
title: Matrix
summary: A local, offline-capable RAG system for regulatory documents — pure-Rust core, Tauri app, runs on macOS and on an iPhone.
status: Active
order: 1
featured: true
---

Matrix turns large document sets into something you can question — without the documents ever
leaving the machine. Documents are chunked (LLM-guided or purely structural), embedded either
remotely or on-device (ONNX / GGUF on Apple silicon), retrieved with a hybrid of vector and
full-text search, and answered with citations that are verified against the source text.
A GraphRAG pipeline extracts an ontology of the corpus on top.
