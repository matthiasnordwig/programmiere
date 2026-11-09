---
title: "A 9B with an agentic search loop beat a 35B MoE with one-shot retrieval"
description: "The software around the model mattered more than its size: a dense 9B searching on its own beat a 35B MoE with one search up front. Second finding: a 3B-active MoE kept up with a dense 27B."
date: 2026-11-09
type: deep-dive
project: matrix
tags: [matrix, local-llm, moe, rag, agentic-search, llama.cpp, qwen, benchmark]
draft: true
---

Everyone compares models. For questions on your own documents, my gut tells me the software around the model matters at least as much. The engine may be strong, but what reaches the road also depends on the gearbox. So how much of an agent's performance comes from the model, and how much from the software around it? I sat down and measured my gut feeling.

I asked questions about 14 official reports that no model could know. I let each model answer twice: once with one search up front, once searching on its own. A second question came along: same size, mixture-of-experts (MoE) vs dense, what would you still pick the dense model for today? In many company RAG setups I come across, a dense model of around 30B still does the work.

**Short version.** Without search, no model found more than 5 of 233 facts (2 %). The software mattered most, not the model. One model, the MoE Qwen3.6-35B-A3B, uses about 3B of its 35B parameters per token. With one-shot retrieval (one search up front) it found 48 % of the facts; searching on its own it found 77 %. A dense 9B that searched on its own found 65 % (one run) and beat the MoE with one search up front. With one search up front, the 4B, 9B and MoE were only 11 points apart. My second finding follows from that: with good search software, a MoE with 3B active parameters is enough. Searching on its own, the MoE is level with the dense Qwen3.6-27B (78 %) and about 3 times as fast. Three attempts to favour the dense model, plus a check with the 9B, left the two level.

**In one sentence:** before you put money into a bigger model or more GPUs, look at the software around it; and if your machine can hold the MoE, there is little reason to pick a dense model for RAG. Two conditions: the MoE needs about 13 GB of memory plus the context, and I only measured one model family, Qwen3.6.

| Unknown reports, share of facts | One search up front | Agentic search | Without search | Time per question (agentic) |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (MoE, 3B active) | 48 % | 77 % | 0 % | 22 s |
| Qwen3.5-9B (dense) | 40 % | 65 % | – | – |
| Qwen3.6-27B (dense) | – | 78 % | 1 % | 65 s |
| Claude Opus 5.5 (reference line) | – | 90 % | 2 % | – |

## What I measured, and what not

Disclosure: I build Matrix, the app I measured in. I did not ask which model is cleverer. In my experience, people mostly use models of this size locally for RAG (retrieval-augmented generation: the model answers from passages a search hands it). Many organisations cannot send their documents to a cloud model.

I measured in [Matrix](/projects/matrix/), my app for asking questions about your own documents. Matrix searches agentically: the model decides what to search for, reads the results, searches again if it needs to, and stops when it is done. The app does the fixed part (splitting, hybrid search, checking every quote against its source) and keeps a full trace of every answer. Matrix runs on macOS, iOS and Windows. The obvious objection is that it all comes down to my app. But both modes ran in the same app, one search up front and the agentic loop. So the finding is the loop against one search up front, not my app against others; it can be rebuilt with any agent framework, and appendix A describes the loop step by step.

The main set is 14 official reports from audit offices and accident investigation boards, in German and English. For the cross-check I used the Rogers Commission report on the Challenger accident, which is surely in every training set. MoE and 27B both ran as UD-IQ3_XXS (roughly 3 bits per weight) on llama.cpp, GPU only, thinking off. I scored every answer automatically; then model agents checked every answer again in a blind second review.

## 1. Knowledge does not help

**On the unknown reports no model gets more than about 2 % without search, while on Challenger the frontier model already knows 47 % from memory.**

> **Example.** Under Horizon 2020's InnovFin instruments, what share of recipients were SMEs, what share of the financing did they get, and which design feature excluded many smaller firms?
> Correct answer: 47 % of recipients, only 14 % of financing (€1.42 billion of €10.5 billion); minimum loan thresholds, often €25 million.
> Without search, MoE: "90–95 % of recipients; 40–50 % of financing, €15–17 billion" · Claude Opus 5.5: "cannot give exact figures"
> With agentic search, MoE: every figure of the correct answer, e.g. "47 % of recipients, 14 % of financing".

Everything below refers to the unknown reports; Challenger is in appendix B.

## 2. The software around the model is the biggest lever

**Letting the MoE search on its own adds 29 points over one search up front, more than the gap between any two models that search the same way.**

One search up front is the classic setup: hybrid search, a reranker, the top 5 passages, one answer. With it the MoE found 48 %, the 9B 40 % and the 4B 37 %. With the same software, a 4B and a 35B were 11 points apart. Searching on its own, even the dense 9B found 65 % (one run). On Challenger the 9B searching on its own found 68 %, the MoE with one search up front 45 %. On Challenger the MoE itself rose from 45 % with one search up front to 86 % searching on its own.

> **Example.** How high were the commitment credit for the programme renewal ZEMIS and its two tranches, by how much and when did the Federal Council cut the funds, and how high are the reserves against one project's extra need?
> Correct answer: CHF 50.66 million; second tranche 28.66 million, first 22.00 million; cut of CHF 17.9 million on 28 January 2026; reserves 15.5 million against an extra need of 6.2 million.
> MoE, one search up front: "The documents do not give the credit, tranches, date or reserves; they only mention a cut of 17.9 million."
> MoE, agentic search: every figure of the correct answer, e.g. "cut 17.9 million on 28 January 2026; reserves 15.5 against 6.2 extra need".

Small settings count too. A single default of the app, the number of hits per search, decided whether the 27B got all passages it needed for 77 % or for 89 % of the facts (seed 1337, section 4). The score did not show that. I only saw it in the trace Matrix keeps for every answer: over both seeds the 27B left the number at the default of 6 in 110 of 154 search calls, while the MoE asked for 10 in 115 of 147. Without the trace I would have compared search and reading as one number.

## 3. With good software, a 3B-active MoE is enough

**With agentic search the MoE found 77 % and the dense 27B 78 %, and the MoE needed 22 seconds per question against 65.**

On the 12 questions where neither model got full marks in any seed, the MoE found 47 % and the 27B 50 %. On Challenger they found 447 and 446 of 522 facts. An old rule of thumb from r/LocalLLaMA (2024) puts a MoE near a dense model with √(total × active) parameters, about 10B here. Qwen's model card puts the 35B-A3B close to their older dense Qwen3.5-27B on coding and agent benchmarks. A MoE at the level of the 27B does not behave like a 10B. The real difference is speed. The MoE reads the prompt about three times as fast and writes 131 against 44 tokens per second. An agentic loop rereads a growing prompt in every round, so that speed adds up.

Dense models are far from gone. On Hugging Face, the most downloaded model of this class right now is a dense 27B (Qwen3.8), and across GGUF builds of 20–40B models dense and MoE are roughly level (last 30 days, 9 November 2026). For RAG on your own documents, I would still test the MoE with good search software first.

## 4. Three attempts to give the dense model a better chance, and one check

**Three times I tried to give the dense model a better chance; in total the two stay level, apart from a slight reading edge for the dense model.**

**1. Questions that need reasoning.** I built 11 new questions around the hypothesis that the dense model reasons better. The MoE found 81 % and the 27B 83 %, and the dense model's lead did not grow with the number of reasoning steps (2 seeds; levels in appendix B.4). With 11 questions this rules out a large gap, not a small one.

**2. A wider search for the 27B.** The 27B took the default of 6 hits, so it got all passages needed for fewer facts than the MoE (77 % against 88 %, seed 1337). So I made the default follow the context window. Now the 27B got all passages for 89 % of the facts instead of 77 % (same seed). The scores barely moved: the MoE went from 179 to 190, the 27B from 180 to 189 of 233 (one seed, within the noise; that build also changed the stop hint and the hit headers). For the 27B the wider default doubled the run time and raised the answers with invented details from 4 to 16. In a control run I gave both models exactly 10 hits on 20 questions. The MoE found 91 and the 27B 93 of 114 facts. So 10 hits are enough, and with the same search the two are level.

**3. Question types.** On the unknown reports the 27B tends to do better on calculated or counted facts (23.0 against 20.0 of 41), the MoE on facts from one section (143.0 against 141.0 of 161). Both differences lie within the noise. In total the 27B found 182.5 and the MoE 178.5 of 233 facts, averaged over two seeds.

**The reading edge.** Given the same passages, the 27B found 27 facts the MoE missed, and the MoE found 7 the 27B missed (unknown reports, p = 0.013; on Challenger 20 against 15, p = 0.27). The control run with 10 hits pointed the same way, 7 against 2, but within the noise. So the 27B reads slightly more precisely; the overall result does not change (appendix B.6).

**Check: the 9B.** With the same agentic setup the dense 9B (Qwen3.5, one seed) falls clearly behind, 65 % against 77 %. So the task does separate models, and MoE and 27B are not level because the task is easy.

## 5. The frontier model is only a reference line

**Claude Opus 5.5 found 90 % with the same tools, 13.5 points above the MoE.** Claude Opus 5.5 also wrote the questions and gold answers, so this line shares their blind spots and is no neutral benchmark. Its window held only 32,768 tokens, so its score, if anything, comes out too low. Only errors in the gold can affect the comparison of MoE and 27B, and those errors hit both models in the same way.

## What this means

My guess is that the benchmarks people look at mostly reward knowledge the model already has. On your own documents only searching and reading are left, and there the software decides.

Everyone compares models, but here the software around them did much of the work. The MoE gained 29 points by searching on its own, and a dense 9B that searched on its own beat the MoE with one search up front. I suspect it is no different with coding agents. The engine roars and it is strong, but the gearbox decides just as much what gets onto the road, and so do the axle, the wheels and the rest.

So, back to the start: how much of your agent's performance comes from the model, and how much from the software around it? And same size, MoE vs dense: what would you still pick the dense model for today? (A dense model with the full 35B would be slower still; whether it would also be better, I have not measured.)

[Appendix E](#appendix-e-downloads) lists the questions, scores per question and the search traces.

---

## Appendix A: Test setup

### A.1 Models

| Model | Source and quantisation | File size | Bits per weight |
|---|---|---|---|
| Qwen3.6-35B-A3B (MoE, 3B active) | Unsloth, UD-IQ3_XXS | 13.2 GB | 3.05 |
| Qwen3.6-27B (dense) | Unsloth, UD-IQ3_XXS | 12.0 GB | 3.56 |
| Qwen3.5-9B (dense) | Unsloth, UD-IQ3_XXS | 4.0 GB | – |
| Qwen3.5-4B (dense) | Unsloth, UD-IQ3_XXS | 1.9 GB | – |
| Claude Opus 5.5 (reference line) | hosted, through a local proxy: each run answered by a fresh Claude Opus 5.5 agent through a queue, which read nothing outside that queue (no question files, no gold, no runs; checked per run) | – | – |

There is no dense Qwen3.6 below 27B, so the 9B and 4B come from Qwen3.5, with a different chat template.

### A.2 Hardware

The scored local runs ran on a PC with an AMD Radeon RX 7900 XTX (24 GB, Vulkan), AMD Ryzen 7 7800X3D, 95.1 GiB RAM, Windows 11 Pro (build 26200), graphics driver 32.0.32015.7029. The Mac mini M4 Pro with 24 GB I used for the hosted reference runs, building the index, the second review, a spot check of the app and the measurements of how much context the app picks (appendix C); none of the model comparisons ran on it.

### A.3 Settings

| Setting | Value |
|---|---|
| Context window | 159,744 tokens, fixed for all scored agentic runs except the Mac replay (appendix C); the largest with which both models fit on the card. In the `auto` runs in appendix E the app chose the context window itself |
| Reserve for the answer | 2,048 tokens |
| KV cache | f16, flash attention on |
| Sampling | temperature 0.7, top_p 0.9, top_k 40, repetition penalty 1.1 over the last 64 tokens; thinking off |
| Seeds | 1337, 2 and 3 on Challenger; 1337 and 2 on the unknown reports and the reasoning questions; 1337 only for the 9B, the re-run and the control run |
| GPU | all layers on the card (`--gpu-only`); Vulkan integer dot product off (`GGML_VK_DISABLE_INTEGER_DOT_PRODUCT=1`), which the app does not set |
| Search model | EmbeddingGemma 2, ONNX, 768 dimensions |
| Reranker (one search up front only) | bge-reranker-v2-m3, ONNX on the CPU |

### A.4 Modes

- **Without search:** the model only gets the question.
- **One search up front:** one hybrid search with the question as written, a reranker picks 5 passages, the model answers from those. No tools.
- **Agentic search:** the model gets search tools and decides itself when and what to search, see A.5.
- **Re-run after the fix** (attempt 2 in section 4): agentic, but the default number of hits is derived from the context window. Only MoE and 27B, unknown reports, seed 1337. Plus a control run with exactly 10 hits per search on 20 of the 39 questions.

### A.5 How Matrix searches

The obvious objection is that the problem lies in my app, not in the model. I expect any agentic search to work much like this, but you can judge that yourself. So here is the chain in the order a question travels through it, as it was in the build used for the runs.

**Index.** Documents are cut into sections without a language model: at headings in text and markdown, by layout in PDFs, with at most about 3,000 characters per section. Every section is embedded locally with EmbeddingGemma 2. Both models use the same index and the same search model.

**Search.** One search combines a vector search with a keyword search (SQLite FTS5/BM25; the question words are OR-ed, filler words are dropped). The two ranked lists are merged by reciprocal rank fusion with k = 10 and equal weights.

**Tools.** The model gets three tools: `search_context(query, top_k?)`, `lookup_exact(term)` for exact phrases and identifiers, and `get_chunks(ids)`, which returns whole sections. In the first round it has to call `search_context`. Two more tools exist only in an "advanced" tier that local models do not use, and a table tool only appears when the collection has tables.

**What comes back.** Each hit carries an id, the document and heading, the text and references to other passages. The text of a hit is cut to a fifth of the prompt budget (the window minus the reserve for the answer, at least 700 characters) and marked as truncated; `get_chunks` then returns the full section. In these runs the cut was at 31,539 characters and the longest section has 3,000, so nothing was ever cut.

**How many hits.** If the model gives no `top_k`, the build used for the runs returns 6 hits (maximum 20). After the fix described in attempt 2 (section 4) the default is derived from the context window. How often each model sets the number itself is in section 4.

**When the loop ends.** There is no limit on searches or rounds. The loop ends when the model answers without a tool call, or when the rest of the window is smaller than the largest result so far; then the model is told to answer. A round that brings no new section gets a stop hint telling the model to answer now. If the next round again brings nothing new, the loop ends.

**The comparison mode.** "One search up front" has no tools. One hybrid search runs with the question as written, the reranker (bge-reranker-v2-m3) picks 5 sections, and the model answers from those.

**Trace, question N24** (unknown reports; the safety recommendations in the NTSB, MAIB and RAIB reports; original search setting, seed 1337):

| | 35B-A3B (MoE) | 27B (dense) |
|---|---|---|
| first query | `safety recommendations made to organisations` | `safety recommendations NTSB Lake Erie MAIB RAIB accident investigation reports` |
| `top_k` | 20 | not given (so 6) |
| hits | 20 | 6 |
| follow-up | 3 more searches with 10, 5 and 5 hits, e.g. `MAIB Arvia recommendation 2026/159` | 4 more searches with 6 hits each, e.g. `MAIB report recommendations section` |
| ended by | model | stop hint after the fifth search |

Shortened from the trace that Matrix stores with each answer (section ids with `#`, titles shortened):

**MoE.** 4 searches in 5 rounds, ended by the model after 30.9 s; 125,682 prompt tokens in total, 1,394 written.
1. `search_context("safety recommendations made to organisations", top_k=20)`: 20 sections, all new, from all four accident reports (e.g. #282 "3.2 Probable Cause", #313 "Recommendation 6") and one from an unrelated audit report.
2. `search_context("Safety recommendations made to organisations total count", top_k=10)`: 10 sections, 1 new.
3. `search_context("MAIB Arvia recommendation 2026/159", top_k=5)`: 5 sections, 2 new (#194 and #196, title page and synopsis of the MAIB report on Arvia).
4. `search_context("MAIB Arvia recommendation 159 only one", top_k=5)`: 5 sections, 2 new.
5. Answer with 4 source markers. 25 different sections seen.

**27B.** 5 searches in 5 rounds, ended by the stop hint after 115.5 s; 92,054 prompt tokens in total, 1,899 written.
1. `search_context("safety recommendations NTSB Lake Erie MAIB RAIB accident investigation reports")`, no `top_k`: 6 sections, all new (e.g. #287 "4.1 New Recommendations").
2. Two searches in one round, `"MAIB report safety recommendations"` and `"RAIB report safety recommendations Bluebell Railway"`: 6 sections each, 5 and 2 new.
3. `"MAIB report recommendations addressed to"`: 6 sections, 2 new, both from an unrelated audit report.
4. `"MAIB report recommendations section"`: 6 sections, none new. Stop hint: answer now.
5. Answer with 6 source markers. 15 different sections seen; the title page, synopsis and narrative of the MAIB report on Arvia (#194 to #197) never came back.

**Checks after the answer**, the same for both: source markers resolved to sections (MoE 4, 27B 6), every quote found in its cited section (none unverifiable), no suspicious attribution. Then one extra model call checks each statement against its source. For the MoE it found two statements supported only in part and one not supported (1.2 s); for the 27B two only in part and two not supported (3.9 s). These flags do not enter the scoring.

With seed 2 the pattern is the same: the MoE asks for 20 hits in both of its searches, the 27B searches six times with 6 hits each.

One question is still an anecdote. Over all 39 questions the 27B finds slightly more facts than the MoE: 180 against 179 of 233 with seed 1337, 185 against 178 with seed 2. So N24 shows how the two search, not who wins overall. There are counter-examples too. On N30 the 27B with 6 hits got all 9 facts in both seeds, the MoE with 10 hits 4 and 7; summed over both seeds (365 against 357 facts), this one question accounts for 7 of the 8 facts of the gap, while per seed the picture differs. On N32 the MoE again searched wider in both seeds, but the facts went to the MoE with seed 1337 and to the 27B with seed 2. Raw data: runs `A-moe-N-ag-s1337`, `A-d27-N-ag-s1337` and the same with `-s2`, question ids `N24`, `N30`, `N32`.

### A.6 Scoring

Claude Opus 5.5 wrote the questions and gold facts from the documents. A separate check compared them with the documents again, and I froze them before the first local run. Part of the hosted reference ran on the checked but not yet committed sets; the number of facts per question in those runs matches the commit, so nothing that affects the scoring changed afterwards. Every gold fact carries a verbatim quote, and a script found all of them in the documents. I scored each answer per fact twice. First a script matched each fact with its spelling variants. Then model agents read all 1,439 different answers in a blind second review, one reviewer per answer. Each reviewer saw the question, the gold facts with their quotes and the answers, but not the model or the run. The reviewers were model agents, one per bundle of answers, 18 bundles. All scores in this post are from the second review, except the five questions on the busy Mac in appendix C, which only the script scored. With search, the two scores differed little (on Challenger by at most 11 facts per run); without search the automatic check counted far too many (54 against 18 for the MoE on Challenger), because right numbers turned up in the wrong context.

The second review has its own limits. With one reviewer per answer, the spread between reviewers is not measured. It was not completely blind either: local answers often show traces of reasoning and the hosted ones an evidence list, which gives away the style, if not the model. And the reviewer checked against the gold and its quotes, not against the whole document; wherever an answer contradicted the gold, I checked the gold against the source text, and the gold was right in every case.

### A.7 App version per number

| Numbers | App build | Search setting |
|---|---|---|
| Main table, sections 1 to 5 except the re-run and control run, appendix B | e728647a (Challenger), 9c065f9d (unknown reports) | original: default of 6 hits |
| Reference line (Claude Opus 5.5) | c2bd30df and e728647a | original |
| Re-run (attempt 2) | 41b05c59 | hits derived from the context window; the same build also softened the stop hint and changed the hit headers |
| Control run with 10 hits (attempt 2), Mac windows replayed (appendix C) | 2c5e0869 | exactly 10 hits / derived from the window |

## Appendix B: More results and examples

### B.1 Without search

| Without search | Unknown reports | Challenger |
|---|---|---|
| Qwen3.6-35B-A3B | 0 % | 5 % |
| Qwen3.6-27B | 1 % | 7 % |
| Qwen3.5-9B | – | 2 % |
| Qwen3.5-4B | – | 0 % |
| Claude Opus 5.5 (reference) | 2 % | 47 % |

### B.2 One search up front against agentic search

The reranker is bge-reranker-v2-m3. The agentic loop has none, so if anything the comparison favours the single search.

| Unknown reports | One search up front | Agentic |
|---|---|---|
| Qwen3.6-35B-A3B | 48 % | 77 % |
| Qwen3.5-9B | 40 % | 65 % |
| Qwen3.5-4B | 37 % | – |

### B.3 Agentic search per model

| Agentic, original search setting, mean over 2 seeds (9B: one) | Facts | Range over seeds | Time per question | Generation (Challenger runs) |
|---|---|---|---|---|
| Qwen3.6-35B-A3B | 77 % | 76–77 % | 22 s | 131–132 tok/s |
| Qwen3.6-27B | 78 % | 77–79 % | 65 s | 44 tok/s |
| Qwen3.5-9B | 65 % | – | – | – |

Questions with a false premise, where the right answer is to say so: over both seeds the MoE handled 6 and the 27B 8 of 14 correctly.

### B.4 Reasoning questions (attempt 1)

| Reasoning questions | Level 1 | Level 2 | Level 3 | Total |
|---|---|---|---|---|
| Qwen3.6-35B-A3B | 80 % | 85 % | 77 % | 81 % |
| Qwen3.6-27B | 97 % | 82 % | 64 % | 83 % |

The levels have 15, 17 and 11 facts. On level 1 the two seeds of the MoE alone differ by 4 facts, so none of the differences between the levels holds up.

### B.5 More examples

> **A question with a false premise.** Why did the Chief of the General Staff order the "Aufbauplan 2032+" (force build-up plan) as early as August 2021?
> What is wrong with it: in August 2021 the ministry ordered the force profile "Unser Heer"; the Chief of the General Staff ordered the build-up plan only in January 2023.
> MoE without search: accepts the premise and gives invented reasons.
> MoE and 27B with agentic search: "Not in August 2021 but January 2023; in August 2021 the ministry ordered the force profile 'Unser Heer'."

> **Search breadth (attempt 2).** Across the four accident investigation reports, how many new safety recommendations are made in total, to which organisations and how many each?
> MoE, seed 1337: asked for 20 hits; in summary, ten in total ("In total, **10** new safety recommendations are made across the four reports"): NTSB 6 (USCG 2, NOAA 3, SeaTrac 1), Carnival UK 1, Border Security Command 2, Bluebell Railway 1. With seed 2 it wrote "a total of **nine**", although its own list adds up to ten.
> 27B, seed 1337: took the default of 6; in summary, NTSB six, addressed to three organisations, US Coast Guard 1, NOAA 2, SeaTrac 1, with counts partly wrong and the rest incomplete.
> The full trace of this question is in A.5.

> **A calculation question (attempt 3).** How many marine special areas of conservation and special protection areas are there, with their areas, and by how many sites and how many km² does their simple sum exceed the marine Natura 2000 network?
> Correct answer: sums of 4,078 sites and 741,193 km², which exceed the network of 3,648 sites and 525,853 km² by 430 sites and 215,340 km².
> MoE and 27B, agentic, both seeds: "exceeds the network by 430 sites and 215,340 km²" · 9B, one search up front: "These figures do not exceed the network; they are components of it." · Claude Opus 5.5: the same figures as MoE and 27B

### B.6 Where the two differ

On the 20 questions of the unknown reports where neither model got full marks in every seed, the MoE got 60 % and the 27B 59 %; on the 12 where neither got full marks in any seed, 47 % against 50 %. The MoE reads the prompt at 2,174 to 2,325 tokens per second, the 27B at 723 to 726 (Challenger runs).

The MoE's lead on facts from a single section comes from its wider search: all sections needed reached it for 92.0 % of these facts, the 27B for 87.2 % (both sets together). Given the same passages, the 27B found 27 facts that the MoE missed, the other way round 7 (unknown reports, p = 0.013; on Challenger 20 against 15, p = 0.27). A controlled run with a fixed 10 hits for both pointed the same way (7 against 2, and 13 against 4 over all three search settings), but within the noise. The 27B reads a little more precisely, and it does not change the outcome.

A side note: the MoE stays closer to the wording of the source (of its five-word sequences 0.30 against 0.21 appear in the sections it was given on Challenger, 0.28 against 0.18 on the unknown reports), but the 27B quotes more, does not write shorter answers and names no fewer details. In a sample of 20 facts the 27B lost despite having the section, most were simply left out or came from a false premise it took over.

## Appendix C: Limits

Context was not the bottleneck. The largest prompt in the main runs was 68,175 tokens, far below the window of 159,744; with the wider default of the re-run it rose to 121,157, still below. The strength of the MoE here is the speed per search round. Its context advantage where memory is tight: on the same Mac, in two rounds of loading both models, the MoE got 104,704 against 40,960 tokens and 159,488 against 62,464; the absolute numbers move with how much memory is free at that moment. Matrix sizes the context from the memory that is free when the model loads, which is also why a busy Mac got so much less. Replayed on the PC with the windows of the first round (27B 40,960, MoE 104,704 tokens), the 27B ran out of context on 2 of 15 questions, and neither model lost measurably: 60 against 58 facts for the 27B, 62 against 61 for the MoE, of 89. Only at the extreme does it bite: on a Mac busy with other work the app fell back to 4,096 tokens for the MoE, which then found 7 instead of 16 of 25 facts it got at 21,504 (five questions, scored automatically).

Both models ran with the same 3-bit quantisation from the same source (Unsloth UD-IQ3_XXS); the dense model even got slightly more bits per weight (~3.6 vs ~3.0). Whether anything shifts at 4 bits or higher, I have not measured.

It is two document sets of one kind (reports), one search implementation, one quantisation and 2 seeds per agentic condition on the unknown reports (3 on Challenger). Absolute numbers will differ with a higher quant or another search; the comparison between the models carries further than those.

Model agents did the second review, not people: one reviewer per bundle of answers, 18 bundles, each blind to model and run. Each answer had only one reviewer, so I did not measure the spread between reviewers (appendix A.6).

I compared Qwen3.6-27B, not the newer dense Qwen3.8-27B, because Qwen3.6-27B is the same generation as the MoE Qwen3.6-35B-A3B. There is no Qwen3.8 MoE that fits in 24 GB: the official Qwen3.8 releases are a dense 27B and MoEs of 180B and more (as of 9 November 2026).

## Appendix D: Data

The unknown reports are 14 reports published between 2 October 2026 and 6 November 2026, with 39 questions and 233 facts (211 key facts, 22 in questions with a false premise); the Challenger set has 29 questions with 174 facts (141 key facts, 33 in questions with a false premise).

### D.1 Documents

No copies of the documents are included; the links point to the publisher. Text files used in the measurement were extracted from these originals (SHA256 of the text file given so that the extraction can be compared). Link check: every URL below was requested on 2026-11-09 and answered HTTP 200 (PDF for the 2026 reports, HTML for the Challenger pages), the Challenger pages on history.nasa.gov, the 2026 reports on the publishers' own domains.

#### Corpus 1 - Challenger (sample key `challenger`, 17 files)
Report of the Presidential Commission on the Space Shuttle Challenger Accident (Rogers Commission), report to the President dated 6 June 1986, Washington, D.C. Publisher of the original: the Presidential Commission on the Space Shuttle Challenger Accident; online edition: NASA History Office, entry page https://history.nasa.gov/rogersrep/genindex.htm. US government work, public domain. Not included: Volumes 3-5 (testimony), Appendix E and appendices from G on. Source quirk: the web text prints the altitude as `46,O00` (letter O).

| File | Part | Date | Original |
|---|---|---|---|
| rogers_v1pref.txt | Vol. 1, Preface | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1pref.htm |
| rogers_v1ch1.txt | Vol. 1, Ch. I Introduction | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch1.htm |
| rogers_v1ch2.txt | Vol. 1, Ch. II Events Leading Up to the Challenger Mission | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch2.htm |
| rogers_v1ch3.txt | Vol. 1, Ch. III The Accident | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch3.htm |
| rogers_v1ch4.txt | Vol. 1, Ch. IV The Cause of the Accident | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch4.htm |
| rogers_v1ch5.txt | Vol. 1, Ch. V The Contributing Cause of the Accident | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch5.htm |
| rogers_v1ch6.txt | Vol. 1, Ch. VI An Accident Rooted in History | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch6.htm |
| rogers_v1ch7.txt | Vol. 1, Ch. VII The Silent Safety Program | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch7.htm |
| rogers_v1ch8.txt | Vol. 1, Ch. VIII Pressures on the System | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch8.htm |
| rogers_v1ch9.txt | Vol. 1, Ch. IX Other Safety Considerations | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1ch9.htm |
| rogers_v1recomm.txt | Vol. 1, Recommendations | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1recomm.htm |
| rogers_v1comm.txt | Vol. 1, Commission and staff | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1comm.htm |
| rogers_v1appa.txt | Vol. 1, App. A Commission Activities | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1appa.htm |
| rogers_v1appb.txt | Vol. 1, App. B Documentation System | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1appb.htm |
| rogers_v1appc.txt | Vol. 1, App. C Processing and Assembly of Flight 51-L | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1appc.htm |
| rogers_v1appd.txt | Vol. 1, App. D Supporting Charts and Documents | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v1appd.htm |
| rogers_v2appf.txt | Vol. 2, App. F: Personal Observations on Reliability of Shuttle (R. P. Feynman) | 1986-06-06 (report date) | https://history.nasa.gov/rogersrep/v2appf.htm |

SHA256 of the extracted text files:

- rogers_v1pref.txt: 586acf51cccfd42637a42fe95d477d6c4e80036e2f12adc46b4ad1fa884db651
- rogers_v1ch1.txt: 16ce93c0f9089ae2e7aeee979b5f0e44bf9d9455a33f731fa944607d26165f2d
- rogers_v1ch2.txt: 09a5c8c2ec7d2c33d9dd9d8f6080b51a4010e601dbf7b79a756f23776183234f
- rogers_v1ch3.txt: 7ceecd921c2fcd63b8c7dbe3a6a6da0bb9dd090f673bef8b262e4ee9cbc78e7d
- rogers_v1ch4.txt: 2172bb383c0f05264650b72c7bebb787f1bad204c5ffb59321529c19a3a60621
- rogers_v1ch5.txt: 1b8ceebc8bb70dee89626ac78a867382eb502385a79f7b595c7f9741c821d7de
- rogers_v1ch6.txt: aba7c1dd13fa94ef1aef91413006888031727b45d10f70d48cf55e0098c80138
- rogers_v1ch7.txt: 6038a5aab076e32719ee6617e043008c30c2d9a67ace26ca482ee2e53bafc6b2
- rogers_v1ch8.txt: 329a1965f50a6781ee97f83beb5b94a8d5499d78e28b4b2f55b5fefb7ee2459c
- rogers_v1ch9.txt: fcf17495481a749962ee860ff05f576947c87c7a8516acba4e70abf65a8e1469
- rogers_v1recomm.txt: 3539671f0580df9ed3628ba02b44c3fc58f8e2e2189b6cbb094f349cde9791ab
- rogers_v1comm.txt: 75ff8134be121cac0774bb8ea003a8a6985addbc8e48943cde100359404fd331
- rogers_v1appa.txt: 82a73f9c9b2a0e28d0507d6bc2c77e3f4e4287978596b4c13a9aca92b4fe2b6a
- rogers_v1appb.txt: fc472081e273725c37002fa7685ebf513ac00a868c18363abd1d6712079c9914
- rogers_v1appc.txt: 08b6c6440132ac268837bfc47197742dad84bc4ebe4298e55852be70ed56aebe
- rogers_v1appd.txt: 504c2b776376f4ef96471299f4e6cd070f1b50a60e377b0fd307ba60a773527c
- rogers_v2appf.txt: 8afd94bb82daa3803fa455a790eb412943149124f7485b15ac06a480b955f9b6

#### Corpus 2 - Reports 2026 (sample key `berichte26`, 14 files)
Official reports, all first publications between 2 October and 6 November 2026, i.e. after the training cut-off of the compared models. Dates are the publication dates with the evidence given in the last column. Licences: RH free reuse (Impressum); EFK 'Abdruck: Gestattet (mit Quellenvermerk)'; ECA CC BY 4.0 (Decision 6/2019); NTSB US government work; MAIB/RAIB Crown copyright, Open Government Licence v3.0.

| File | Title | Publisher | Lang | Published | Original (PDF) | Date evidence |
|---|---|---|---|---|---|---|
| rh_2026_31.txt | RH Bund 2026/31 Ausgewählte Leistungen der Bundesministerien im Zusammenhang mit politischen Parteien | Rechnungshof Österreich (Austrian Court of Audit) | de | 2026-10-02 | https://www.rechnungshof.gv.at/rh/home/home/2026_31_Ausgewaehlte_Leistungen_Bundesministerien.pdf | RH list of reports 2026, "published on" (https://www.rechnungshof.gv.at/rh/home/home/home_3/Berichte-des-Rechnungshofes-im-Jahr-2026.html) |
| rh_2026_32.txt | RH Bund 2026/32 Ausgleichstaxfonds und Teilhabe von Menschen mit Behinderungen am Arbeitsmarkt | Rechnungshof Österreich (Austrian Court of Audit) | de | 2026-10-09 | https://www.rechnungshof.gv.at/rh/home/home/2026_32_Ausgleichstaxfonds.pdf | RH list of reports 2026, "published on" (https://www.rechnungshof.gv.at/rh/home/home/home_3/Berichte-des-Rechnungshofes-im-Jahr-2026.html) |
| rh_2026_33.txt | RH Bund 2026/33 Gratis-Impfprogramm Grippe, Gürtelrose und Pneumokokken | Rechnungshof Österreich (Austrian Court of Audit) | de | 2026-10-09 | https://www.rechnungshof.gv.at/rh/home/home/2026_33_Gratis-Impfprogramm.pdf | RH list of reports 2026, "published on" (https://www.rechnungshof.gv.at/rh/home/home/home_3/Berichte-des-Rechnungshofes-im-Jahr-2026.html) |
| rh_2026_34.txt | RH Bund 2026/34 Umsetzbarkeit des Aufbauplans 2032+ | Rechnungshof Österreich (Austrian Court of Audit) | de | 2026-10-23 | https://www.rechnungshof.gv.at/rh/home/home/2026_24_Aufbauplan-2032.pdf | RH list of reports 2026, "published on" (https://www.rechnungshof.gv.at/rh/home/home/home_3/Berichte-des-Rechnungshofes-im-Jahr-2026.html) |
| rh_2026_36.txt | RH Bund 2026/36 Neuausrichtung der Wiener Zeitung GmbH | Rechnungshof Österreich (Austrian Court of Audit) | de | 2026-11-06 | https://www.rechnungshof.gv.at/rh/home/home/2026_36_Neuausrichtung-der-Wiener-Zeitung-GmbH.pdf | RH list of reports 2026, "published on" (https://www.rechnungshof.gv.at/rh/home/home/home_3/Berichte-des-Rechnungshofes-im-Jahr-2026.html) |
| efk_25121.txt | EFK-25121 Prüfung der Sicherheit und Nutzbarkeit von Microsoft 365 | Eidgenössische Finanzkontrolle (Swiss Federal Audit Office) | de | 2026-10-22 | https://www.efk.admin.ch/wp-content/uploads/publikationen/berichte/wirtschaft_und_verwaltung/informatikprojekte/25121/25121be-bk-dti-microsoft-365.pdf | efk.admin.ch publication metadata (WordPress API) |
| efk_26272.txt | EFK-26272 Prüfung des Schlüsselprojektes Erneuerung Zentrales Migrationsinformationssystem | Eidgenössische Finanzkontrolle (Swiss Federal Audit Office) | de | 2026-10-27 | https://www.efk.admin.ch/wp-content/uploads/publikationen/berichte/wirtschaft_und_verwaltung/informatikprojekte/26272/26272be-prufung-des-schlusselprojektes-erneuerung-zemis.pdf | efk.admin.ch publication metadata (WordPress API) |
| eca_sr_2026_24.txt | ECA SR 24/2026 EU funding for innovation and competitiveness | European Court of Auditors | en | 2026-10-15 | https://www.eca.europa.eu/ECAPublications/SR-2026-24/SR-2026-24_EN.pdf | ECA publications list, publish date |
| eca_sr_2026_25.txt | ECA SR 25/2026 Marine protected areas – Designation alone is insufficient | European Court of Auditors | en | 2026-10-26 | https://www.eca.europa.eu/ECAPublications/SR-2026-25/SR-2026-25_EN.pdf | ECA publications list, publish date |
| eca_sr_2026_29.txt | ECA SR 29/2026 Use of RRF support in public administration | European Court of Auditors | en | 2026-10-20 | https://www.eca.europa.eu/ECAPublications/SR-2026-29/SR-2026-29_EN.pdf | ECA publications list, publish date |
| ntsb_mir2632.txt | NTSB MIR-26/32 Collision NOAA uncrewed surface vessel / Prestige 450, Lake Erie | National Transportation Safety Board (USA) | en | 2026-10-27 | https://www.ntsb.gov/investigations/AccidentReports/Reports/MIR2632.pdf | NTSB press release NR20261027; report dated 2026-10-07 |
| maib_2026_20.txt | MAIB 20/2026 Fatal accident to a crew member on board Arvia | Marine Accident Investigation Branch (UK) | en | 2026-10-08 | https://assets.publishing.service.gov.uk/media/6ac63dafb016250bca013977/2026-20-Arvia-Report.pdf | gov.uk public timestamp |
| maib_2026_21.txt | MAIB 21/2026 Partial collapse of an inflatable migrant boat | Marine Accident Investigation Branch (UK) | en | 2026-10-15 | https://assets.publishing.service.gov.uk/media/6acde8afb8542d3693fd4385/2026-21-InflatableMigrantBoat-Report.pdf | gov.uk public timestamp |
| raib_2026_11.txt | RAIB 11/2026 Unsafe movement of locomotives being coupled on the Bluebell Railway | Rail Accident Investigation Branch (UK) | en | 2026-10-08 | https://assets.publishing.service.gov.uk/media/6ac64ed1b016250bca01399b/R112026_261008_Sheffield_Park.pdf | gov.uk public timestamp |

SHA256 of the extracted text files (pdftotext, normalised as described by the fetch script):

- rh_2026_31.txt: 7ed35a49c99fe7210cb7eec0ebba8286e740c029ec613a4592e9d9000a9eb7b0
- rh_2026_32.txt: db7d75d08f850fc55da1089f37e1f8f5294f358ea687647e07599914f3109a4f
- rh_2026_33.txt: 6d5b9bada1b05c8c3073b3e312899aaf9460d6b823625d687191e62d14d30eea
- rh_2026_34.txt: 2d0dee96391751981c421d7f1f4861fa3397e7033562ee977f51077fecfbef17
- rh_2026_36.txt: a370860919f5ce0b01794aa8ea9305d88968e3cc029a74658e3156d3857ef219
- efk_25121.txt: 5eb4cd19a68f7c50a864a5868c049900e25d3766075e105c9ef4e8658a9047bc
- efk_26272.txt: fbacbab8dcb26f788ad79681f907c607713b1e129b77a408fa1e6a3230365d95
- eca_sr_2026_24.txt: 950b6dbeeacdbedbf9dcf1a331672b00ceeb31e50e6eaa3fd39295c5d0be9f78
- eca_sr_2026_25.txt: 3f1eb6d3292093f47ac37bf00a3225887a95f20be337ba2298453d5b5bc04bdc
- eca_sr_2026_29.txt: a5086c2877fbf3b103e5b823c3e9090b6b74703362c8c9a977b5094c0d6c53bd
- ntsb_mir2632.txt: 44e028f914f74b9cd05cae3c112f337da5724127c3c4a52b797167a93041fe7e
- maib_2026_20.txt: 8fa8f580de7ef2bea6f03a1ac54b90ff26bc42c0065e65eea7caaedfe5e62ca3
- maib_2026_21.txt: 6c6b6cc128a81b7693a34dba1378c6beb4950dd97d2c1c8847aec7909e677ba6
- raib_2026_11.txt: 301d48b03ef213f3cb5437a47fdc5bbeedb466c7a1765f190745f68bd339e997

Note: RH 2026/34 is stored on the server as `2026_24_Aufbauplan-2032.pdf`. Open links: none (all 31 URLs resolved).

### D.2 Questions

All questions with gold answer (or key facts), and where the answer is found. Key facts are the lexically scored facts; each fact has several accepted spellings, listed in full in [questions.json](/software-vs-model/questions.json) (scoring: lower-case, whitespace collapsed, substring match; key facts of the traps are listed where the right answer names the correct facts). Gold answers and locations are given in the language of the notes they come from (German notes for the German questions). Locations: page numbers are those of the original report, `line` is the line number in the extracted text file of that document (reports 2026: no page numbers are used). For publication, personal names were replaced by roles in 23 questions (except the author of Appendix F); the runs used the original wording, which scores the same facts.

#### Set R - Challenger, first set (20 questions)

**Purpose:** First, easier Challenger set (R1-R16 answerable from one or a few passages, R17-R20 traps: the answer is not in the documents and the right reply says so). Corpus: Rogers Commission report (17 files).

##### R1 (en, number)
**Question:** What was the air temperature at the launch of Challenger, and how much colder was that than at any previous launch?
**Gold:** 36 °F at launch; 15 °F colder than at any previous launch.
**Key facts (2):** 36 degrees | 15 degrees
**Location:** Ch. III, p. 19

##### R2 (en, number)
**Question:** How many seconds after liftoff did the flight end, and how many seconds after launch did the range safety officer destroy the boosters?
**Gold:** 73 seconds; the range safety officer destroyed the boosters at 110 seconds.
**Key facts (2):** 73 seconds | 110 seconds
**Location:** Ch. III, p. 19

##### R3 (en, number)
**Question:** At what point in the flight (in seconds) did the first flame appear on the right Solid Rocket Booster, and at about how many degrees around the booster circumference?
**Gold:** First flame on the right booster at 58.788 s, at about 305 degrees around.
**Key facts (2):** 58.788 | 305
**Location:** Ch. III, p. 20

##### R4 (de, number)
**Question:** Mit welcher Machzahl und in welcher Höhe flog die Challenger, als sie vom Feuerball eingehüllt wurde?
**Gold:** Mach 1.92 at about 46,000 ft (printed as 46,O00 in the source text).
**Key facts (2):** 1.92 | 46,000
**Location:** Ch. III, p. 21

##### R5 (en, multi)
**Question:** How many times was the launch of mission 51-L postponed and how many times was it scrubbed, counted from which planned launch date in January 1986?
**Gold:** Postponed three times and scrubbed once, counted from the planned date 22 January 1986.
**Key facts (3):** postponed three times | scrubbed once | january 22, 1986
**Location:** Ch. II, p. 17

##### R6 (en, multi)
**Question:** Who were the two payload specialists added to the 51-L crew (describe each by occupation), and which company did one of them represent?
**Gold:** A teacher (the Teacher in Space participant) and an employee of Hughes Aircraft; the Hughes employee represented that company.
**Key facts (2):** teacher | hughes
**Location:** Ch. II, p. 13

##### R7 (en, single)
**Question:** How many rubber O-rings seal each field joint, and what diameter do they have?
**Gold:** Two O-rings per field joint, diameter 0.280 inch.
**Key facts (2):** two rubber o-rings | 0.280
**Location:** Ch. IV, p. 57

##### R8 (en, multi)
**Question:** Below what O-ring temperature did Thiokol (its Vice President, Engineering) recommend not to fly STS 51-L, and how did that temperature compare with previous flights?
**Gold:** 53 °F: Thiokol (its Vice President, Engineering) advised against flying below it, lower than any earlier flight.
**Key facts (2):** 53 degrees | lowest
**Location:** Ch. V, p. 107 (timeline)

##### R9 (en, multi)
**Question:** Which Thiokol official was asked by Thiokol's Senior Vice President for Wasatch Operations to take off his engineering hat and put on his management hat during the Thiokol caucus? Give his position.
**Gold:** Thiokol's Vice President, Engineering.
**Key facts (1):** vice president, engineering
**Location:** Ch. V, p. 93

##### R10 (en, single)
**Question:** According to Feynman, which group gave the very low estimate of the Shuttle failure probability, about 1 in 100,000?
**Gold:** Management.
**Key facts (1):** management
**Location:** App. F, p. F1

##### R11 (en, number)
**Question:** If the failure probability were really 1 in 100,000, how long could one launch a Shuttle every day before expecting to lose one, according to Feynman?
**Gold:** About 300 years.
**Key facts (1):** 300 years
**Location:** App. F, p. F1

##### R12 (en, multi)
**Question:** Out of how many rocket flights did how many fail according to the range safety officer's study cited by Feynman, and which safety panel did that officer chair?
**Gold:** About 2,900 flights, 121 failures (1 in 25); the range safety officer chaired the launch abort safety panel (LASP).
**Key facts (3):** 2,900 | 121 | launch abort safety panel
**Location:** App. F, p. F1

##### R13 (de, multi)
**Question:** Wie viele Sekunden Betriebszeit hatten die Haupttriebwerke laut Feynman insgesamt, und wie oft sind sie in dieser Zeit ernsthaft ausgefallen?
**Gold:** About 250,000 seconds of operation, about 16 serious failures (13 of them in the first 125,000 seconds).
**Key facts (2):** 250,000 | 16 times
**Location:** App. F, pp. F2-F3

##### R14 (en, multi)
**Question:** What must take precedence over public relations according to the closing sentence of Feynman's appendix, and why?
**Gold:** Reality must take precedence over public relations, for nature cannot be fooled.
**Key facts (2):** reality | nature cannot be fooled
**Location:** App. F, p. F5

##### R15 (en, single)
**Question:** Which civilian crew member does Feynman name at the end of his appendix as a person of great courage? Give her role on the mission.
**Gold:** The teacher (the Teacher in Space participant, a payload specialist).
**Key facts (1):** teacher
**Location:** App. F, p. F4

##### R16 (en, number)
**Question:** By how many million dollars was the Orbiter logistics (spare parts) funding cut in 1985, and what was the funding requirement it was cut from?
**Gold:** Cut by $83.3 million, from a requirement of $285.3 million.
**Key facts (2):** 83.3 | 285.3
**Location:** Ch. VIII, p. 173

##### R17 (en, trap)
**Question:** How much did the Challenger orbiter cost to build?
**Gold:** Not in the documents (trap). Decoys: $6.2 billion development of 5 orbiters (Ch. I), an $800 million Thiokol contract (Ch. VI).
**Location:** none; checked by search over all 17 files

##### R18 (de, trap)
**Question:** Wie viele Menschen verfolgten den Start der Challenger im Fernsehen?
**Gold:** Not in the documents (trap). 'Television' appears only as onboard camera or monitoring.
**Location:** none; checked by search

##### R19 (en, trap)
**Question:** What did Feynman demonstrate with a piece of O-ring rubber and a glass of ice water at the hearing?
**Gold:** Not in the documents (trap). No 'ice water' demonstration in the files.
**Location:** none; checked by search

##### R20 (en, trap)
**Question:** What was the price of the TDRS-B satellite that was lost on Challenger?
**Gold:** Not in the documents (trap). Only the weight (5,000 lb, Ch. I) is given.
**Location:** none; checked by search

#### Set H - Challenger, hard set (29 questions)

**Purpose:** Hard Challenger set (H1-H29): numbers that must be combined or computed, comparisons across tables and documents, exceptions and negations, chronologies, answers joining three or more passages. H16-H19 and H28-H29 are false-premise traps: the right answer names the error and gives the correct facts. H20-H29 are a harder supplement.

##### H1 (en, number)
**Question:** In October 1985, what was the logistics funding requirement for the Orbiter program, by how much was it cut, and how much did that leave? And when the spare-parts stockage for 12 flights a year should have been complete, how many of the required items had actually been delivered?
**Gold:** The Orbiter logistics funding requirement set by Level III at Johnson in October 1985 was $285.3 million; it was reduced by $83.3 million, leaving $202.0 million. A year after spares deliveries began to lag (when stockage for 12 flights a year should have been complete), only 32,000 of the required 50,000 items (65 percent) had been delivered.
**Key facts (4):** 285.3 | 83.3 | 202.0 | 32,000
**Location:** Vol. 1, Ch. VIII (p. 173; line 576, 568)

##### H2 (en, number)
**Question:** Compare the service-life figures for the Space Shuttle Main Engine turbopumps given in Chapter IX of the Commission report with those in Feynman's Appendix F. Give the limits Chapter IX states for the low-pressure fuel and oxidizer pumps, the high-pressure oxidizer pump and the equivalent life of most engine components, and Feynman's replacement intervals for the two high-pressure turbopumps together with the original design lifetime he cites.
**Gold:** Chapter IX (fleet-leader tests): most engine components have an equivalent 40-flight service life; the low-pressure fuel turbopump is limited to the equivalent of 28 flights and the low-pressure oxidizer pump to 22 flights; the high-pressure fuel turbopump is limited to six flights before overhaul and the high-pressure oxidizer pump to less than six flights. Feynman (Appendix F): the high-pressure fuel turbopump had to be replaced every three or four mission equivalents and the high-pressure oxygen turbopump every five or six, against a design aim of 55 mission-equivalent firings (27,000 seconds), i.e. at most ten percent of the original specification.
**Key facts (7):** 28 flight | 22 flight | less than six | 40-flight | three or four | five or six | 55 mission
**Location:** Vol. 1, Ch. IX (p. 192; line 1079, 1081, 1075); Vol. 2, App. F (Feynman) (p. F2; line 236, 241, 243)

##### H3 (en, number)
**Question:** In the 1971 Rockwell data on ejection systems quoted in Chapter IX, which system was heavier than the open ejection seat but cheaper to develop? Give the weights and development costs of both, the weight of the separable crew compartment, and the more recent estimate of how much an escape module could add to the Orbiter's weight.
**Gold:** The B-70 encapsulated seat: 5,200 pounds and $7,000,000 development cost, versus 1,760 pounds and $10,000,000 for the open ejection seat. The separable crew compartment weighed 14,000 pounds ($292,000,000). Recent estimates say an escape module could add as much as 30,000 pounds to the Orbiter.
**Key facts (6):** b-70 | 5,200 | 7,000,000 | 1,760 | 14,000 | 30,000
**Location:** Vol. 1, Ch. IX (p. 182, 183; line 316, 321, 326, 388)

##### H4 (en, multi)
**Question:** Challenger flew nine missions before 51-L. According to the O-ring anomaly table in Chapter VI (Figure 2), how many and which of those nine Challenger flights showed no O-ring anomaly at all?
**Gold:** Challenger's nine earlier flights were STS-6, STS-7, STS-8, 41-B, 41-C, 41-G, 51-B, 51-F and 61-A. Figure 2 lists no anomaly (dashes) for three flights: STS-7, STS-8 and 41-G; all the others had nozzle or field joint erosion, blow-by or heat effects.
**Key facts (4):** STS-7 | STS-8 | 41-G | three flights
**Location:** Vol. 1, Ch. I (p. 6, 5; line 304, 218, 223, 253); Vol. 1, Ch. VI (p. 129-131; line 801, 892, 1140)

##### H5 (en, multi)
**Question:** According to the Chapter IX table of landing-site changes, which missions scheduled to land at Kennedy had to land at Edwards instead, how many wave-offs did each have, which mission in that table was not a Kennedy diversion and where did it land, and how many flights had been launched with plans to land in Florida?
**Gold:** STS-7 (2 wave-offs), STS 41-C (1) and STS 61-C (5) were scheduled for Kennedy and landed at Edwards because of rain/ceiling. STS-3 was the exception: scheduled for Edwards, it was moved to Northrup Strip, New Mexico (White Sands), because of flooding. Eight flights had been launched with plans to land in Florida; three were diverted to California.
**Key facts (5):** STS-7 | 41-C | 61-C | northrup | eight flights
**Location:** Vol. 1, Ch. IX (p. 191; line 953, 976); Vol. 1, Ch. I (p. 4; line 155)

##### H6 (en, multi)
**Question:** Appendix C lists the earlier field joints on which the circumferential alignment tool had been used before 51-L. How many and which of those joints did not experience O-ring damage?
**Gold:** The tool had been used five times before: 51-B left aft, 51-F left forward, 61-B left aft, and on 61-C both the left aft and the right aft joint. Only the 61-C left aft joint had erosion; four of the five joints had no O-ring damage: 51-B left aft, 51-F left forward, 61-B left aft and 61-C right aft.
**Key facts (5):** 51-B | 51-F | 61-B | right aft | four of the five
**Location:** Vol. 1, App. C (p. 222; line 263, 272, 286)

##### H7 (en, multi)
**Question:** In the Chapter VI table of O-ring anomalies (Figure 2), how many and which Shuttle flights launched with a joint temperature of 75°F or higher showed no O-ring anomaly, and for which flight in that temperature range can the table not say?
**Gold:** Two flights show no anomaly: STS-3 (80°F) and STS 51-J (79°F). STS-4 (80°F) is unknown because its hardware was lost at sea. All other flights at 75°F or above (51-B, 51-F, 51-I, 61-A, 61-B) had anomalies.
**Key facts (4):** STS-3 | 51-J | lost at sea | two flights
**Location:** Vol. 1, Ch. VI (p. 129-131; line 740, 1061, 1043, 1140)

##### H8 (en, multi)
**Question:** Put these events in chronological order and date each: the field joint's classification as Criticality 1R, the Thiokol engineer's 'simplex' retention rationale, the revised Critical Items List entry reclassifying the joint as Criticality 1, the Level I approval of the Criticality 1 waiver, and the launch of STS-6.
**Gold:** 1) Criticality 1R: November 24, 1980. 2) The Thiokol engineer's retention rationale for the simplex seal: December 1, 1982. 3) Reclassification to Criticality 1 at Marshall: December 17, 1982. 4) Waiver approved at Level I by the Associate Administrator for Space Flight (Technical): March 28, 1983. 5) STS-6 launched April 4, 1983 (less than a week after the waiver).
**Key facts (5):** november 24, 1980 | december 1, 1982 | december 17, 1982 | march 28, 1983 | april 4, 1983
**Location:** Vol. 1, Ch. VI (p. 125, 126, 128; line 363, 457, 422, 573, 579); Vol. 1, Ch. I (p. 5; line 213)

##### H9 (en, multi)
**Question:** Reconstruct the times (EST) of the evening of January 27, 1986: when did the first Thiokol/NASA teleconference begin, for when was the second one planned and when did it actually begin, when was it recessed for the Thiokol caucus and how long did the caucus last, when was the teleconference terminated, and when was the NASA Space Transportation System Program Manager at Johnson called?
**Gold:** First teleconference 5:45 p.m.; the second was set for 8:15 p.m. but began at 8:45 p.m.; it was recessed at about 10:30 p.m. for an off-net caucus requested as five minutes that lasted about 30 minutes; it resumed about 11 p.m. and was terminated at about 11:15 p.m.; at about 11:30 p.m. the Marshall resident manager at Kennedy set up the call with the Program Manager at Johnson (about recovery ship weather, not the O-rings).
**Key facts (7):** 5:45 | 8:15 | 8:45 | 10:30 | 30 minutes | 11:15 | 11:30
**Location:** Vol. 1, Ch. V (p. 87, 91, 92, 96, 97; line 323, 601, 654, 989, 1018, 1057)

##### H10 (en, multi)
**Question:** Three different 'margins' for O-ring erosion are quoted in the report: the one in Thiokol's final management agreement on the night of January 27, the one the Solid Rocket Booster project manager at Marshall gave the Commission based on STS-2, and the one the Commission's executive director derived from the Flight Readiness Review figures. Give each margin and the erosion depths it rests on.
**Gold:** Thiokol's final agreement: a margin to erode the primary O-ring by a factor of three times the previous worst case (Feynman criticises this 'safety factor of three', based on erosion of one-third of the ring's radius). The Marshall booster project manager: the joint had been shown to seal with 125 thousandths of an inch of erosion, the worst case-joint erosion was 53 thousandths on STS-2, so a factor of two and a half. The Commission's executive director: the FRRs argued a worst case of 90 thousandths against sealing at 95 thousandths, i.e. roughly a five percent (five and a half) margin.
**Key facts (6):** factor of three | two and a half | 53 thousandths | 125 thousandths | five percent | 95 thousandths
**Location:** Vol. 1, Ch. V (p. 108; line 1825); Vol. 1, Ch. VI (p. 145; line 2171, 2172, 2190, 2193); Vol. 2, App. F (Feynman) (p. F1; line 121)

##### H11 (en, multi)
**Question:** The report states the link between temperature and O-ring thermal distress twice, once in the Chapter IV findings and once in Chapter VI. Give both versions: which temperature is meant, the thresholds, and the counts of flights with and without distress.
**Gold:** Chapter IV (finding 12) uses ambient launch temperature: of 21 launches at 61°F or above, only four showed O-ring thermal distress, and every launch below 61°F had distress. Chapter VI uses O-ring (joint) temperature: only three of twenty flights at 66°F or above had distress, while all four flights at 63°F or below did; below 65°F distress becomes almost certain.
**Key facts (6):** 21 launches | 61° | ambient | twenty flights | 66° | 63°
**Location:** Vol. 1, Ch. IV (p. 71; line 1884, 1886); Vol. 1, Ch. VI (p. 145; line 2209)

##### H12 (en, number)
**Question:** How much rain fell on 51-L while it stood on the launch pad, and how much would have been normal? The report gives two different figures for how many days 51-L was exposed on the pad: give both. How much water had been found in an STS-9 clevis well after less rain?
**Gold:** About seven inches of rain, against 2.5 inches that would have been normal. Chapter V gives the exposure as 35 days, Chapter IV says 51-L was on the pad for 38 days - the report is inconsistent. On STS-9 about 0.5 inch of water was found in the clevis well during restacking, after less rain than 51-L had.
**Key facts (5):** seven inches | 2.5 inch | 35 days | 38 days | 0.5 inch
**Location:** Vol. 1, Ch. V (p. 85; line 210); Vol. 1, Ch. IV (p. 64; line 1474)

##### H13 (en, number)
**Question:** For the left nozzle joint of STS 51-B, how deep did the primary and the secondary O-ring erode, what maximum erosion had been predicted (for the primary in the former and the revised model, and for the secondary), and what erosion would a field joint have suffered at the same ratio of actual to projected erosion?
**Gold:** Primary .171 inch (it never sealed), secondary .032 inch. The former model predicted .090 inch maximum, revised to .070 inch for the primary; the secondary had been projected at .004 inch. At the same ratio a field joint would have eroded 0.225 inch.
**Key facts (6):** .171 | .032 | .090 | .070 | .004 | .225
**Location:** Vol. 1, Ch. VI (p. 137, 147; line 1528, 2322); Vol. 1, Ch. VII (p. 159; line 413, 415)

##### H14 (en, multi)
**Question:** What share of the External Tank, of the Orbiter and of the TDRS/IUS payload package was recovered after the accident, and in about how much water were the main engines and the crew module found?
**Gold:** About 20 percent of the External Tank structure, about 30 percent of the Orbiter and about five percent of the payload, IUS and support equipment package were recovered. The three main engines lay in about 85 feet of water (recovered February 23, 1986), the crew module wreckage in about 90 feet.
**Key facts (5):** 20 percent | 30 percent | five percent | 85 feet | 90 feet
**Location:** Vol. 1, Ch. IV (p. 41, 45, 48, 43; line 69, 315, 495, 196, 337)

##### H15 (en, multi)
**Question:** Two problems from mission 61-C did not reach the 51-L Flight Readiness Review. Give the dates of that review, of 61-C's landing (and where it landed), of the completion of the 61-C booster inspection, and of when the Johnson brake subsystem manager first received the brake information and when he learned its extent. At what brake energy did the 61-C damage occur, compared with the energy available before the first stator fails under normal braking?
**Gold:** The 51-L Level I Flight Readiness Review was on January 15, 1986. 61-C landed at Edwards Air Force Base on January 19, 1986, and the inspection of its booster segments was completed the same day - four days after the review. The brake subsystem manager received the information on January 27, 1986, the day before launch, and learned the extent on January 30, 1986. The 61-C brake damage occurred at 34 million foot-pounds, below the roughly 40 million foot-pounds normally available before the first stator fails.
**Key facts (7):** january 15 | january 19, | edwards | january 27 | january 30 | 34 million | 40 million
**Location:** Vol. 1, Ch. II (p. 15; line 234); Vol. 1, Ch. VIII (p. 175; line 681, 686, 689); Vol. 1, Ch. IX (p. 189; line 795, 793)

##### H16 (en, trap)
**Question:** Why did a Marshall engineer sign the January 1978 and January 1979 memoranda to his superior that called the Thiokol joint design unacceptable?
**Gold:** The premise is wrong: the engineer did not sign them. The memos of January 9, 1978 and January 19, 1979 were signed by the chief of Marshall's Solid Rocket Motor branch, who concurred in the objections; the Commission learned that the engineer actually authored them. They objected to joint rotation and called Thiokol's position completely unacceptable.
**Key facts (4):** branch chief | authored | january 9, 1978 | january 19, 1979
**Location:** Vol. 1, Ch. VI (p. 123; line 231, 242, 259)

##### H17 (en, trap)
**Question:** Thiokol's June 1985 O-ring resiliency bench test showed that at 50°F the O-ring lost contact with the metal for 2.4 seconds. What did the same test show at 75°F and at 100°F?
**Gold:** The premise mixes up the temperatures: the 2.4-second loss of contact occurred at 75°F. At 50°F the O-ring did not re-establish contact within ten minutes, when the test was terminated. At 100°F it maintained contact.
**Key facts (3):** ten minutes | maintained contact | 75°f the o-ring lost contact
**Location:** Vol. 1, Ch. VI (p. 137; line 1521)

##### H18 (en, trap)
**Question:** Why did the president of Rockwell's Space Transportation Systems Division tell the 9:00 a.m. Mission Management Team meeting at Kennedy on January 28 that Rockwell would not approve the launch?
**Gold:** The president was not at Kennedy: he had left on January 27 for Rockwell's facility in Downey, California, and from there told his program managers in Florida that Rockwell could not recommend launching because of the ice. At the 9:00 a.m. meeting Rockwell was represented by two vice presidents, the Orbiter project manager and the Shuttle Integration project manager; the Orbiter project manager said 'Rockwell cannot assure that it is safe to fly'. The Commission found Rockwell's position ambiguous, not a clear no-go.
**Key facts (4):** downey | orbiter project manager | cannot assure | ambiguous
**Location:** Vol. 1, Ch. V (p. 114, 115, 117; line 2156, 2149, 2221, 2410)

##### H19 (en, trap)
**Question:** After the cold-weather flight 51-C in January 1985, the Solid Rocket Booster project manager at Marshall placed a launch constraint on the Solid Rocket Booster. Which flights flew under waivers of that constraint before 51-L, and how many were there?
**Gold:** The premise is wrong: the launch constraint was not imposed after 51-C but in July 1985, after the left nozzle joint of 51-B (April 1985) showed a primary O-ring that never sealed and an eroded secondary. It applied to 51-F and all later flights and was waived six consecutive times before 51-L: 51-F, 51-I, 51-J, 61-A, 61-B and 61-C.
**Key facts (8):** 51-B | six consecutive | 51-F | 51-I | 51-J | 61-A | 61-B | 61-C
**Location:** Vol. 1, Ch. VI (p. 137, 148; line 1550, 1569, 1580, 2385); Vol. 1, Ch. V (p. 84; line 139); Vol. 1, Ch. I (p. 6; line 278, 294)

##### H20 (en, number)
**Question:** How many people in total took part in NASA's own investigation of the accident (NASA employees, other government agencies and contractors together), and how many pages of transcript did the Commission's work generate in total (interviews and panel sessions plus hearings)? What were the two computer data bases the Commission built and what did each contain, and what page counts do Appendices A and B give for the document collection?
**Gold:** Appendix A: NASA's own investigation involved more than 1,300 NASA employees, supported by more than 1,600 people from other government agencies and over 3,100 from contractor organizations, about 6,000 people in total. The Commission's interviews (more than 160 individuals) and more than 35 panel sessions generated almost 12,000 pages of transcript, which added to the 2,800 pages of hearing transcript: about 14,800 pages altogether. Appendix B names the two computer data bases: INQUIRE, the document data base indexing all microfilmed documents, 'representing more than 100,000 pages', and JURIS, the full-text data base of all hearing, interview and panel transcripts plus Commission reports, digests and affidavits. The page counts differ: Appendix B gives more than 100,000 pages for INQUIRE but more than 122,000 pages for the microfilmed material indexed on it, matching Appendix A's almost 6,300 documents totaling more than 122,000 pages.
**Key facts (6):** 6,000 | 14,800 | inquire | juris | 100,000 pages | 122,000
**Location:** Vol. 1, App. A (p. 208; line 189, 179, 184, 181); Vol. 1, App. B (p. 216; line 176, 180, 188)

##### H21 (en, number)
**Question:** Chapter III's narrative of the 51-L ascent mentions only part of the main-engine throttling. Give every main-engine throttle command with its mission elapsed time to the millisecond as listed in the Chapter III table of major events, compute how long the engines stayed throttled back from the first throttle-down command until they were commanded back up to their highest setting, and state the (different) times that Chapter II's flight timeline gives for the two throttle-down steps.
**Gold:** Chapter III's narrative names only 104 percent, the throttle-back to 94 percent and 'reduced thrust' around maximum dynamic pressure; the 65 percent step appears only in its table of major events. The table of major events lists four commands: SSME 104% at 4.339 s, 94% at 19.859 s, 65% at 35.379 s and 104% again at 51.860 s. The engines were therefore commanded below 104 percent from 19.859 s to 51.860 s, i.e. for 32.001 seconds. Chapter II's flight timeline gives rounder and later times: throttle down to 94% at +24 s, down to 65% at +42 s and up to 104% at +59 s.
**Key facts (8):** 4.339 | 19.859 | 35.379 | 65% | 51.86 | 32.001 | +24 | +42
**Location:** Vol. 1, Ch. III (p. 37 - 39, 20; line 312, 326, 78, 335, 344); Vol. 1, Ch. II (p. 18; line 425, 428)

##### H22 (en, multi)
**Question:** Which live television transmissions from orbit were planned for 51-L: how many, on which flight days and during which activities? How many of the teacher's lessons were to be telecast live, and which NASA scheduling practice contradicts the rumor of a planned live hookup with the crew during the President's State of the Union Message?
**Gold:** Three live telecasts were planned, none related to the State of the Union Message: during the teacher activities on flight day 4, during the phase partitioning experiment on flight day 5 and during the crew conference on flight day 6 (Chapter VIII). Chapter II's orbital activity schedule shows only part of this: on day four two lessons telecast live were to be conducted by the teacher, and on day six a crew news conference was scheduled 'if requested'. NASA does not schedule a communication with the crew for at least 48 hours after launch, and none was scheduled for 51-L.
**Key facts (6):** three live telecasts | day 4 | phase partitioning | day 6 | two lessons | 48 hours
**Location:** Vol. 1, Ch. VIII (p. 176; line 794, 797, 799, 801, 788); Vol. 1, Ch. II (p. 16; line 309)

##### H23 (en, multi)
**Question:** Which members of the 51-L crew had flown on the Space Shuttle before, and on which missions? How many were they, and which of them had already flown aboard the Orbiter Challenger itself?
**Gold:** Four of the seven had flown before: the commander as pilot of 41-C (April 1984), a mission specialist on 51-C (January 1985, Discovery), another mission specialist on 41-D (August 1984, Discovery's first flight) and a third mission specialist on 41-B (February 1984, Challenger). The pilot was on his first Shuttle flight; the two payload specialists were not career astronauts. The commander and the mission specialist of 41-B had already flown aboard Challenger: Chapter II says so for the 41-B mission specialist, while for the commander's 41-C only the Chapter I flight list shows that it was flown by Orbiter Challenger.
**Key facts (6):** 41-C | 51-C | 41-D | 41-B | four of the seven | the commander
**Location:** Vol. 1, Ch. II (p. 10, 12, 13; line 62, 83, 86, 99, 73, 101); Vol. 1, Ch. I (p. 5; line 238)

##### H24 (en, multi)
**Question:** The Hughes payload specialist joined the 51-L crew late. On what date, from which flight was he moved, and whose late addition to that flight made the move necessary? What did 51-L lose in exchange? One of 51-L's primary payloads and a satellite slot removed from 51-L were part of a single reshuffle caused by one customer: from which flight did that payload come, which satellite slot was removed, what had the customer asked for, and how many flights did the reshuffle affect?
**Gold:** The Hughes payload specialist was not added to the 51-L crew until October 25, 1985. He had been on 61-C, but a payload specialist (a Representative from Florida, listed as a late addition to 61-C) was added to that flight only two months before its lift off; with seven crew already assigned, one had to be removed, and the Hughes payload specialist was moved from 61-C to 51-L about three months before its launch. His experiments came with him, and two middeck experiments were deleted from 51-L. The Spartan-Halley satellite came from 61-D in a reshuffle triggered by a customer's request to delay the Westar satellite from 61-C (December 1985) to March 1986: Westar went to 61-E, the HS-376 satellite slot was deleted from 51-L and added to 61-C, and Spartan-Halley moved from 61-D to 51-L. Four flights had major payload changes from one customer's request.
**Key facts (8):** october 25 | 61-C | representative | two middeck | 61-D | hs-376 | westar | four flights
**Location:** Vol. 1, Ch. II (p. 13; line 166, 114); Vol. 1, Ch. VIII (p. 168, 167; line 256, 236, 261, 199, 195)

##### H25 (en, number)
**Question:** Several departures from maintenance requirements during Challenger's preparation for 51-L are documented in different parts of the report. How many required Orbiter structural inspections were waived and out of how many, how many of these were repeat waivers, and how many of the required inspections were not waived? How many parts were taken from other Orbiters for Challenger, out of roughly how many required? How many further requirements did the 51-L audit find unmet and not formally waived, how many 'designated verifiers' did the Shuttle Processing Contractor use, and which recommendation of the Commission (number and title) addresses both the waived inspections and the parts removal?
**Gold:** Waivers were granted on 60 of 146 required Orbiter structural inspections during 51-L processing; seven of them were second-time waivers, and 146 - 60 = 86 required inspections were not waived (Chapter IX). Forty-five out of approximately 300 required parts were cannibalized for Challenger before 51-L (Chapter VIII). The 51-L audit found six further requirements that were neither met nor formally waived (forward External Tank attach plate inspection, avionics bay closeout panel, crew hatch microswitch, hydraulic reservoir sampling, APU tank evacuation, landing gear voids). The Shuttle Processing Contractor used about 770 designated verifiers, nearly 15 percent of its work force. Recommendation IX (Maintenance Safeguards) asks NASA to perform structural inspections when scheduled and not to waive them, and to stop removing parts from one Orbiter to supply another.
**Key facts (8):** 60 of 146 | seven second | 86 of | forty-five | approximately 300 | six further | 770 | recommendation ix
**Location:** Vol. 1, Ch. IX (p. 193, 194; line 1135, 1167, 1170, 1172, 1176, 1180, 1184, 1190, 1203); Vol. 1, Ch. VIII (p. 174; line 607); Vol. 1, Recommendations (p. 201; line 176, 188)

##### H26 (en, multi)
**Question:** The report discusses NASA safety panels in Chapter VII and in its Recommendations. For the Aerospace Safety Advisory Panel: after which event (give its date) was it established, and how many members may it have, how many of them from NASA? For the Space Shuttle Crew Safety Panel: how many members did it have in total, how often did it meet, what happened to it when its original chairman retired, and when did it end (the report gives two different years)? And which new panel devoted to the operational safety of Shuttle flights does the Commission recommend, reporting to whom?
**Gold:** Aerospace Safety Advisory Panel: established in the aftermath of the Apollo spacecraft fire of January 27, 1967, by the NASA Authorization Act, 1968; by statute no more than nine members, of whom up to four may come from NASA. Space Shuttle Crew Safety Panel: established by Program Directive 4A of April 17, 1974; 10 representatives from Johnson plus one each from Dryden, Kennedy, Marshall and the Air Force, i.e. 14 members; it met 24 times from 1974 through 1978. The report gives two end dates: it 'went out of existence in 1981', when its original chairman retired and it was merged with a safety subpanel, but also 'effectively ceased to exist in 1980'. The Commission recommends an STS Safety Advisory Panel reporting to the STS Program Manager, with members from the safety organization, mission operations and the astronaut office.
**Key facts (9):** january 27, 1967 | nine members | four may come from nasa | 14 members | 24 times | merged | 1980 | 1981 | sts safety advisory panel
**Location:** Vol. 1, Ch. VII (p. 160, 161; line 472, 484, 522, 529, 538, 534, 515); Vol. 1, Recommendations (p. 199; line 83)

##### H27 (en, multi)
**Question:** On January 28, 1986, which sites did 51-L have for a transatlantic abort landing and for an abort once around? One transatlantic site was declared unavailable that morning: at what time and why, and why had the earlier afternoon launch window already ruled it out? Within what period after liftoff can a Shuttle that loses one main engine return to the launch site, what happens if two or three main engines fail early in ascent, and what concern had the Aerospace Safety Advisory Panel voiced about the primary transatlantic site?
**Gold:** On January 28 the primary transatlantic abort landing site was Dakar, Senegal, where the weather was acceptable; the abort-once-around site was Edwards Air Force Base, California. The alternate transatlantic site, Casablanca, was declared no-go at 07:30 a.m. because of forecast rain and low ceilings. Before that, the afternoon launch window chosen for Spartan's Halley observations would have meant a night landing after a transatlantic abort, and Casablanca was not equipped for a night landing, so the window was moved back to the morning. A Shuttle that loses a main engine during the first four minutes of flight can return to the launch site. If two or all three main engines fail within the first five to six minutes, it lands in water (contingency abort), which is not believed survivable. The Aerospace Safety Advisory Panel warned in 1982 that short runways with inadequate overruns are a concern, for instance a transatlantic abort to Dakar.
**Key facts (8):** dakar | edwards | 07:30 | low ceiling | night landing | four minutes | five to six minutes | overrun
**Location:** Vol. 1, Ch. II (p. 17, 15; line 384, 382, 251); Vol. 1, Ch. IX (p. 179, 180, 189; line 67, 93, 861)

##### H28 (en, trap)
**Question:** A Commission member who was an astronaut chaired the Rogers Commission's Accident Analysis Panel and had herself flown two Shuttle missions aboard Discovery. Which missions were they, which panel did she actually chair, and what were the Commission's other investigative panels?
**Gold:** The premise is wrong twice. The astronaut chaired the Mission Planning and Operations Panel; the Accident Analysis Panel was chaired by an Air Force major general. Her two Shuttle missions, STS-7 (launched June 18, 1983, as the first American woman in space) and 41-G (launched October 5, 1984), were both flown on Challenger, not Discovery, according to the Chapter I flight list. The other panels were the Development and Production Panel, the Pre-Launch Activities Panel and the Accident Analysis Panel.
**Key facts (7):** major general | mission planning | sts-7 | 41-G | development and production | pre-launch activities | not discovery
**Location:** Vol. 1, App. A (p. 207; line 100, 145, 122, 142); Vol. 1, Commission and staff (p. 203; line 58); Vol. 1, Ch. I (p. 5, 6; line 218, 253)

##### H29 (en, trap)
**Question:** The range safety officer who sent the destruct commands on January 28, 1986, had also supplied the historical estimate of solid-rocket reliability that Feynman cites in Appendix F. What did that estimate find, and what failure rates does Feynman consider reasonable or attainable for mature solid rockets, and what follows for the Shuttle's pair of boosters?
**Gold:** The premise is wrong: the estimate Feynman cites came from a different range safety officer, who also chaired the launch abort safety panel, not from the range safety officer for the 51-L flight, who sent ARM and, about 10 seconds later, FIRE at about 110 seconds. The other officer studied all previous rocket flights: out of nearly 2,900 flights, 121 failed (1 in 25), including early design errors. Feynman: a more reasonable figure for mature rockets might be 1 in 50; with special care below 1 in 100 might be achieved, but 1 in 1,000 is probably not attainable. Because the Shuttle has two boosters, these rates must be doubled to get the Shuttle failure rate from booster failure.
**Key facts (7):** launch abort safety panel | 121 failed | 2,900 | 1 in 25 | 1 in 50 | 1 in 1,000 | doubled
**Location:** Vol. 2, App. F (Feynman) (p. F1; line 31, 55, 58, 60, 62); Vol. 1, Ch. IX (p. 185; line 514)

#### Set F - Challenger, extra traps (10 questions)

**Purpose:** Ten additional trap questions for the Challenger corpus (F1-F10): plausible, but the asked value or name is not in the documents (checked by search over all 17 files); the right answer says so.

##### F1 (en, trap)
**Question:** What was the age of the teacher on the Challenger crew on the day of the Challenger accident?
**Gold:** Not in the documents. The teacher appears only with birthplace and career; no age of any crew member.
**Location:** none (trap: checked by search over all 17 files)

##### F2 (en, trap)
**Question:** How many reporters and journalists were accredited at the Kennedy Space Center for the STS-51-L launch?
**Gold:** Not in the documents. No count of accredited reporters (search: reporter, journalist, accredit, press corps).
**Location:** none (trap: checked by search over all 17 files)

##### F3 (en, trap)
**Question:** At what temperature does the Viton rubber used in the Shuttle's O-rings undergo its glass transition?
**Gold:** Not in the documents. The report gives only cold stiffness of the rubber, no glass transition temperature.
**Location:** none (trap: checked by search over all 17 files)

##### F4 (en, trap)
**Question:** What was the name of the NASA flight surgeon assigned to the STS-51-L crew?
**Gold:** Not in the documents. No flight surgeon is named (search: surgeon, physician, medical officer).
**Location:** none (trap: checked by search over all 17 files)

##### F5 (en, trap)
**Question:** Who was the NASA public affairs commentator who said 'obviously a major malfunction' after the explosion?
**Gold:** Not in the documents. The voice of the launch commentary is not named.
**Location:** none (trap: checked by search over all 17 files)

##### F6 (en, trap)
**Question:** What was the relative humidity at the launch pad at the time of the STS-51-L liftoff?
**Gold:** Not in the documents. Humidity appears only for test conditioning, not for the launch weather.
**Location:** none (trap: checked by search over all 17 files)

##### F7 (en, trap)
**Question:** How many square miles of ocean did the search for Challenger debris cover?
**Gold:** Not in the documents. Search maps exist, but no search area in square miles or kilometres.
**Location:** none (trap: checked by search over all 17 files)

##### F8 (en, trap)
**Question:** Which professional award did a Thiokol engineer who objected to the launch receive for his testimony to the Commission?
**Gold:** Not in the documents. No professional award is mentioned.
**Location:** none (trap: checked by search over all 17 files)

##### F9 (en, trap)
**Question:** Who was the backup candidate for the Teacher in Space program who trained alongside the teacher on the crew?
**Gold:** Not in the documents. No backup candidate of the Teacher in Space program is named.
**Location:** none (trap: checked by search over all 17 files)

##### F10 (en, trap)
**Question:** How many pounds did the Challenger crew compartment weigh?
**Gold:** Not in the documents. The crew compartment is mentioned without a mass.
**Location:** none (trap: checked by search over all 17 files)

#### Set N - Reports 2026 (39 questions)

**Purpose:** Hard set over the 14 official reports of October-November 2026 (published after the training cut-off of the compared models). N1-N29 first; N30-N39 appended later and harder (enumerations and sums over five to ten reports). Traps (N25–N29, N36, N39) are false-premise questions. German questions for German reports, English for English ones.

##### N1 (de, single)
**Question:** Wie lange werden gelöschte Objekte in Microsoft 365 der Bundesverwaltung im benutzerseitigen und im Administrator-Papierkorb vorgehalten, und wo wird die Administrationskonsole der Backup-Lösung gehostet?
**Gold:** Der benutzerseitige Papierkorb hält gelöschte Objekte 30 Tage vor, der nachgelagerte Administrator-Papierkorb weitere 60 Tage. Bei der Implementation der Backup-Lösung stellte sich heraus, dass deren Administrationskonsole in den USA gehostet wird.
**Key facts (3):** 30 tage | 60 tage | in den usa
**Location:** EFK-25121 (line 748, 753)

##### N2 (en, single)
**Question:** On what date and at about what time did the unintended locomotive movement at Sheffield Park on the Bluebell Railway occur, which two locomotives were involved, and how far did they move?
**Gold:** At around 15:00 on Saturday 9 August 2025, during coupling at Sheffield Park, locomotives No. 72 'Fenchurch' and No. 55 'Stepney' moved unexpectedly while the shunter was between them; they moved around 3 metres (10 feet) before being stopped.
**Key facts (5):** 9 august 2025 | 15:00 | fenchurch | stepney | 3 metres
**Location:** RAIB 11/2026 (line 185, 377, 367, 187)

##### N3 (de, single)
**Question:** Welche jährlichen Beiträge leistete der Bund der Wiener Zeitung GmbH laut WZEVI-Gesetz für ihre drei neuen gesetzlichen Aufgaben, und welche Summe ergab das?
**Gold:** Laut WZEVI-Gesetz (Tabelle 2) zahlte der Bund ab 1. Jänner 2023 jährlich 3,00 Mio. EUR für die elektronische Verlautbarungs- und Informationsplattform (EVI), 7,50 Mio. EUR für die Wiener Zeitung als Medium und 6,00 Mio. EUR für den Media Hub Austria, zusammen 16,50 Mio. EUR.
**Key facts (4):** 3,00 | 7,50 | 6,00 | 16,50
**Location:** RH 2026/36 (line 1376, 1380, 1384)

##### N4 (en, single)
**Question:** Under the InnovFin financial instruments of Horizon 2020, what share of final recipients were SMEs, what share of all InnovFin financing did they receive (also in absolute terms), and which design feature excluded many smaller firms?
**Gold:** SMEs accounted for nearly half (47 %) of final recipients but received only 14 % of all InnovFin financing: €1.42 billion out of €10.5 billion. Minimum loan thresholds, often €25 million, excluded many smaller firms.
**Key facts (5):** 47 % | 14 % | 1.42 billion | 10.5 billion | minimum loan
**Location:** ECA SR 24/2026 (line 971, 969)

##### N5 (en, single)
**Question:** What propulsion and fuel arrangement did migrant boat 512 have: engine power, size of the connected fuel tank, fuel consumption, and spare fuel carried?
**Gold:** Migrant boat 512 had a 9.9 hp four-stroke outboard engine connected to a 12-litre external fuel tank; the engine used about 3.5 litres of fuel per hour, and two additional 10-litre jerrycans were carried on board.
**Key facts (4):** 9.9 | 12-litre | 3.5 litres | 10-litre
**Location:** MAIB 21/2026 (line 818, 819, 820)

##### N6 (de, single)
**Question:** Wie viele Lehrstellen schrieb das Verteidigungsministerium in den Jahren 2020 bis 2025 aus, wie viele davon wurden besetzt, und welche Übernahmequote nach Abschluss der Lehre erreichten die überprüften Instandsetzungseinrichtungen im Vergleich zum Ziel?
**Gold:** Von 847 ausgeschriebenen Lehrstellen (2020–2025) konnten 570 (67 %) besetzt werden. Die Übernahmequote nach Lehrabschluss lag in den überprüften Instandsetzungseinrichtungen bei 87 %; das Ziel von 74 % war damit übererfüllt.
**Key facts (4):** 847 | 570 | 87 % | 74 %
**Location:** RH 2026/34 (line 2817, 2820, 2819)

##### N7 (de, number)
**Question:** Vergleiche für die Influenza-Saisonen 2023/24 und 2024/25 die Zahl der im Öffentlichen Impfprogramm gekauften und der ausgelieferten Impfdosen. In welcher Saison wurden mehr Dosen ausgeliefert als gekauft und warum, und worauf ging die Differenz in der anderen Saison zurück?
**Gold:** 2023/24 wurden 1.019.785 Dosen gekauft und 1.015.053 ausgeliefert; die Differenz (4.732) geht auf einen Verwurf von knapp 5.000 Impfdosen bei der Auslieferung an die Apotheken zurück. 2024/25 wurden 1.244.681 Dosen gekauft, aber 1.244.703 ausgeliefert, also 22 mehr, weil ein Impfstoffhersteller in Einzelfällen auf die nächstgrößere Packungsgröße zurückgreifen musste.
**Key facts (6):** 1.019.785 | 1.015.053 | 1.244.681 | 1.244.703 | packungsgröße | knapp 5.000
**Location:** RH 2026/33 (line 720, 728, 751, 749)

##### N8 (de, number)
**Question:** Wie hoch war die Überkompensation der beiden DAWI-Betrauungen der Wiener Zeitung GmbH (Medium und Media Hub) in den Jahren 2023 und 2024? Nenne für beide die Jahreswerte, die kumulierten Beträge mit ihrem Anteil an der Ausgleichsleistung und die Summe beider DAWI.
**Gold:** Medium: 2.060.744 EUR (2023) und 514.678 EUR (2024), kumuliert 2.575.422 EUR bzw. rd. 2,58 Mio. EUR = 17,2 % der Ausgleichsleistung. Media Hub: 622.827 EUR (2023) und 957.760 EUR (2024), kumuliert 1.580.587 EUR bzw. rd. 1,58 Mio. EUR = 13,2 %. Zusammen rd. 4,16 Mio. EUR (mehr als 4 Mio. EUR, rd. 15 % der kumulierten Ausgleichsleistung von 27 Mio. EUR).
**Key facts (7):** 2.060.744 | 514.678 | 622.827 | 957.760 | 17,2 % | 13,2 % | 4,16
**Location:** RH 2026/36 (line 4687, 4809, 4863, 4864)

##### N9 (de, number)
**Question:** Wie entwickelten sich die geplanten Investitionskosten des Aufbauplans 2032+ über die drei Kalkulationsstände, für welchen Zeitraum galt der jüngste Stand, und um wie viel Prozent stiegen sie laut RH? Wie viel des ersten Werts war als Reserve vorgesehen, und welche Summe ergeben die drei Kernbereiche dieses ersten Werts ohne Reserve?
**Gold:** Landesverteidigungsbericht 2022 (Zeitraum 2023–2032): 16,582 Mrd. EUR; Kalkulation 2024–2033: 20,966 Mrd. EUR; Stand September 2025 (Zeitraum 2025 bis 2036): 49,210 Mrd. EUR. Der RH nennt eine Steigerung um 197 % (von 16,582 auf 49,210 Mrd. EUR). Vom ersten Wert waren 247 Mio. EUR Reserve; die drei Kernbereiche (Mobilität 5,610, Schutz und Wirkung 7,865, Autarkie und Nachhaltigkeit 2,860 Mrd. EUR) ergeben zusammen 16,335 Mrd. EUR.
**Key facts (7):** 16,582 | 20,966 | 49,210 | 2025 bis 2036 | 197 % | 247 mio | 16,335
**Location:** RH 2026/34 (line 1899, 1790, 1097, 1081, 1082, 1084)

##### N10 (de, number)
**Question:** In welchen Jahren seit 2019 wies der Ausgleichstaxfonds laut Tabelle 6 einen negativen Saldo aus, in welcher Höhe jeweils? Auf welchen Wert würde sein Vermögen Ende 2025 sinken, und wie viel an Sonderdotierungen des Bundes plante das Sozialministerium für 2026 bis 2029 insgesamt?
**Gold:** Negative Salden gab es 2023 (−16,20 Mio. EUR) und 2024 (−16,14 Mio. EUR); für 2025 wurde ein Abgang von 100,03 Mio. EUR prognostiziert (2019 bis 2022 waren die Salden positiv). Das Vermögen (2024: 137,91 Mio. EUR) würde dadurch auf 37,88 Mio. EUR sinken. Die geplanten Sonderdotierungen betragen 65 + 45 + 25 + 15 = 150 Mio. EUR (2026–2029).
**Key facts (5):** 16,20 | 16,14 | 100,03 | 37,88 | 150 mio
**Location:** RH 2026/32 (line 2815, 2851, 2863, 2949)

##### N11 (de, number)
**Question:** In welchem Jahr war der Abstand zwischen der Beschäftigungsquote der begünstigten Behinderten und der Vergleichsgruppe am größten, und wie groß war er? In welchen Jahren lag die Arbeitslosenquote der begünstigten Behinderten unter jener der Vergleichsgruppe? Und wie viele arbeitslose begünstigte Behinderte zählten Statistik Austria und Arbeitsmarktservice im Jahr 2022? Um wie viel Prozent höher gibt der Bericht die eine Zahl an, und um wie viel Prozent liegt sie nach deiner eigenen Rechnung aus den beiden Zahlen darüber?
**Gold:** Am größten war der Abstand 2022: 73,3 % (Vergleichsgruppe) gegenüber 55,5 % = 17,8 Prozentpunkte (2010: 3,3; 2024: 15). Unter der Vergleichsgruppe lag die Arbeitslosenquote der begünstigten Behinderten 2020, 2021 und 2024. Statistik Austria zählte 2022 7.354 arbeitslose begünstigte Behinderte, das AMS 4.331; der Bericht gibt die Statistik-Austria-Zahl als „um 60 % höher“ an; nachgerechnet sind es rund 70 % mehr (7.354 / 4.331 = 1,698).
**Key facts (6):** 17,8 | 2020, 2021 und 2024 | 7.354 | 4.331 | 70 % | 60 %
**Location:** RH 2026/32 (line 1376, 1404, 1450, 1414, 1589, 1593, 1591)

##### N12 (de, multi)
**Question:** Wie viele Gebarungsfälle mit welchem Volumen überprüfte der RH in seiner risikoorientierten Auswahl, wie viele davon waren ausreichend dokumentiert, und wie teilen sich die übrigen mangelhaften Fälle auf (im Bericht detailliert dargestellt bzw. nur zusammengefasst, mit Volumen)?
**Gold:** Der RH überprüfte 43 Gebarungsfälle mit einem Volumen von 2,68 Mio. EUR (aus 5,11 Mio. EUR Gesamtvolumen). Lediglich elf waren ausreichend dokumentiert. 32 Fälle waren mangelhaft: 15 davon stellt der RH wegen der Schwere des Mangels in TZ 20 bis TZ 29 detailliert dar, die übrigen 17 mangelhaften Fälle hatten ein Volumen von rd. 730.000 EUR.
**Key facts (7):** 43 gebarungsfälle | 2,68 | elf gebarungsfälle | 32 mangelhaft | 15 der 32 | 17 der 32 | 730.000
**Location:** RH 2026/31 (line 434, 445, 5051, 5053)

##### N13 (de, multi)
**Question:** Ein ehemaliger Vorsitzender einer politischen Partei erbrachte Beratungsleistungen für Bundesministerien. Wie viel erhielt er insgesamt, auf welchen Betrag (inkl. USt) stiegen die Aufwendungen des Bildungsministeriums, welchen Tagsatz verrechnete er gegenüber dem Satz, den das Bildungsministerium selbst als üblich nannte, und was hatte eine parlamentarische Anfragebeantwortung zu Zahl und Volumen der Aufträge angegeben?
**Gold:** Insgesamt erhielt er von drei Bundesministerien 211.607 EUR. Die Aufwendungen des Bildungsministeriums stiegen auf 164.862 EUR inkl. USt (137.385 EUR exkl. USt). Er verrechnete einen Tagsatz von 5.280 EUR, während laut Bildungsministerium für Organisationsentwicklung üblicherweise 1.840 EUR (inkl. USt) anfielen. Die Anfragebeantwortung (6902/AB vom 16. August 2021) nannte zwei Aufträge mit insgesamt rd. 120.000 EUR; laut RH bestand allein die Projektbegleitung „Lehrpläne NEU“ aus drei Einzelaufträgen (164.862 EUR inkl. USt), dazu kamen zwei Vorträge.
**Key facts (6):** 211.607 | 164.862 | 5.280 | 1.840 | 120.000 | zwei aufträge
**Location:** RH 2026/31 (line 5080, 5180, 5236, 5173, 5077, 5076)

##### N14 (de, number)
**Question:** Wie hoch war der Verpflichtungskredit für das Programm Erneuerung ZEMIS, wie viel betrug die zweite Tranche und – rechnerisch – die erste? Um wie viel kürzte der Bundesrat die Mittel im Entwicklungsrahmen 2027–2028 und an welchem Tag? Wie hoch sind die Reserven in der Kostenplanung von 2024, und welcher Mehrbedarf eines einzelnen Projekts stand ihnen zum Prüfungszeitpunkt gegenüber?
**Gold:** Der Bundesrat bewilligte 2022 einen Verpflichtungskredit von 50,66 Mio. Franken; die zweite und letzte Tranche (Dezember 2024) betrug 28,66 Mio., die erste somit 22,00 Mio. Franken. Am 28. Januar 2026 (Entlastungspaket 2027) kürzte der Bundesrat die Zuweisung von 69,7 auf 51,8 Mio. Franken, also um 17,9 Mio. Die Gesamtkosten von 193 Mio. Franken enthalten Reserven von 15,5 Mio.; allein das Projekt Digital@AIG wies einen Mehrbedarf von 6,2 Mio. Franken aus.
**Key facts (8):** 50,66 | 28,66 | 22,00 | 17,9 | 28. januar 2026 | 15,5 | digital@aig | 6,2
**Location:** EFK-26272 (line 559, 561, 571, 642, 570, 563, 639)

##### N15 (de, multi)
**Question:** Vergleiche die beiden EFK-Prüfungen zu Microsoft 365 und zur Erneuerung ZEMIS: In welchem Zeitraum fand jeweils die Prüfung statt, wann die Schlussbesprechung, und wie viele neue Empfehlungen mit welcher Priorität sprach die EFK jeweils aus?
**Gold:** Microsoft 365: Prüfung vom 23. Februar bis 3. April 2026, Schlussbesprechung am 16. Juli 2026; fünf Empfehlungen, davon vier mit Priorität 1 (Empfehlungen 1–4) und eine mit Priorität 2 (Empfehlung 5). Erneuerung ZEMIS: Prüfung vom 3. März bis 9. April 2026, Schlussbesprechung am 10. Juni 2026; zwei neue Empfehlungen, beide mit Priorität 1 (dazu die Nachprüfung von zehn älteren Empfehlungen).
**Key facts (7):** 23. februar bis 3. april | 16. juli 2026 | 3. märz bis 9. april | 10. juni 2026 | fünf empfehlungen | vier mit priorität 1 | zwei neue
**Location:** EFK-25121 (line 557, 565, 636, 699, 731, 770, 898); EFK-26272 (line 601, 619, 705, 867)

##### N16 (de, number)
**Question:** Wie viele Schlussempfehlungen enthält jeder der fünf Berichte des Rechnungshofs Österreich im Bestand? Welcher Bericht enthält die meisten, welcher die wenigsten, und wie viele sind es zusammen?
**Gold:** Politische Parteien (2026/31): 41; Ausgleichstaxfonds (2026/32): 34; Gratis-Impfprogramm (2026/33): 10; Aufbauplan 2032+ (2026/34): 28; Neuausrichtung der Wiener Zeitung GmbH (2026/36): 45. Die meisten hat der Bericht zur Wiener Zeitung (45 Schlussempfehlungen), die wenigsten der zum Gratis-Impfprogramm (10 Schlussempfehlungen). Zusammen sind es 158.
**Key facts (6):** 45 schlussempfehlungen | 10 schlussempfehlungen | 41 schlussempfehlungen | 34 schlussempfehlungen | 28 schlussempfehlungen | 158
**Location:** RH 2026/36 (line 5462); RH 2026/33 (line 2851); RH 2026/31 (line 6614); RH 2026/32 (line 6025); RH 2026/34 (line 4479)

##### N17 (en, multi)
**Question:** For the three ECA special reports in the collection (24/2026 on innovation and competitiveness, 25/2026 on marine protected areas, 29/2026 on RRF support for public administration): on what date was each adopted, which chamber (give its number) adopted each, which two were adopted by the same chamber, and how many numbered recommendations do the three reports contain in total?
**Gold:** SR 24/2026 was adopted on 16 September 2026 by Chamber IV, headed by one of the Court's members; SR 25/2026 on 22 September 2026 by Chamber I, headed by another member; SR 29/2026 on 30 September 2026, again by Chamber IV. So 24/2026 and 29/2026 share Chamber IV. They contain 4 + 4 + 5 = 13 recommendations.
**Key facts (6):** 16 september 2026 | 22 september 2026 | 30 september 2026 | chamber iv | chamber i, | 13 recommendations
**Location:** ECA SR 24/2026 (line 2161, 417); ECA SR 25/2026 (line 1727, 303); ECA SR 29/2026 (line 2028, 492)

##### N18 (en, number)
**Question:** How many marine special areas of conservation (Habitats Directive) and special protection areas (Birds Directive) are there, with their areas, and by how many sites and how many km² does their simple sum exceed the number and area of the marine Natura 2000 network?
**Gold:** There are 2 875 special areas of conservation (415 932 km²) and 1 203 special protection areas (325 261 km²). Their sum, 4 078 sites and 741 193 km², exceeds the 3 648 marine Natura 2000 sites (525 853 km²) by 430 sites and 215 340 km², because many areas are designated under both directives.
**Key facts (6):** 2 875 | 415 932 | 1 203 | 325 261 | 430 sites | 215 340
**Location:** ECA SR 25/2026 (line 388, 393, 383)

##### N19 (en, number)
**Question:** Which four EU funding sources does the ECA identify as earmarked for marine biodiversity in the 2021-2027 period, with what amounts, and what is their exact sum (the report rounds it)? Within the EMFAF allocation for specific objective 1.6, how much goes to type 6 and type 1 interventions, and how much more has been allocated to type 6 under other objectives?
**Gold:** LIFE €150 million, Horizon €62.4 million, the European Maritime, Fisheries and Aquaculture Fund (EMFAF) €377 million and cohesion policy funds €18.2 million; exactly €607.6 million (the report says approximately €600 million). Of the EMFAF €377 million under SO 1.6, €108 million is for type 6 intervention (designation, maintenance and monitoring of MPAs) and €255 million for type 1 (biodiversity protection and restoration); an additional €10 million has been allocated to type 6 mainly under SO 2.1.
**Key facts (8):** €150 million | 62.4 | €377 | 18.2 | 607.6 | €108 | €255 | €10 million
**Location:** ECA SR 25/2026 (line 566, 568, 6457, 6462, 6466)

##### N20 (en, multi)
**Question:** How many of the 2019-2020 public administration sub-CSRs did the Commission consider addressed by RRF measures, and how did the ECA's own assessment differ: how many sub-CSRs did the ECA assess and why not all, how many did it find addressed and to what degree, and for which member state did it conclude, at member-state level, that the sub-CSRs were not addressed at all?
**Gold:** The Commission considered 36 of the 38 sub-CSRs (95 %) addressed; two were not addressed by RRF measures. The ECA assessed only 31 of the 38, excluding seven tagged to measures with sectoral objectives. Of these, 29 of these 31 are addressed by public administration measures: 18 of 31 (58 %) only marginally and 11 of 31 (35 %) largely; none is fully addressed. At member-state level, the sub-CSRs of Belgium are not addressed at all; for 8 of the 15 member states only marginally. (At sub-CSR level, two of the 31 are not addressed at all: Belgium's CSR 1.6 of 2019 and Italy's CSR 1.3 of 2020.)
**Key facts (8):** 36 of the 38 | 31 of the 38 | sectoral | 29 of these 31 | 18 of 31 | 11 out of 31 | none of the sub-csrs are fully | belgium
**Location:** ECA SR 29/2026 (line 846, 857, 900, 901, 903, 992)

##### N21 (en, number)
**Question:** In the NTSB report on the collision on Lake Erie, at what time did the collision occur, when did the USV pilot first learn of it and how many minutes later was that, when was sunset that day, and what were the damage estimates for each vessel and in total?
**Gold:** The collision occurred about 1912 local time. The USV pilot (GLERL lead engineer) learned of it about 1946, when Coast Guard Sector Detroit called him – 34 minutes later (the report: over 30 minutes). Sunset was at 2039. Damage: about $186,000 to the uncrewed surface vessel (constructive total loss) and $100,000 to the recreational vessel Prestige 450, $286,000 in total.
**Key facts (7):** 1912 | 1946 | 34 min | 2039 | 186,000 | 100,000 | 286,000
**Location:** NTSB MIR-26/32 (line 537, 588, 2231, 1361, 2574)

##### N22 (en, multi)
**Question:** On Arvia during the night of 25 to 26 October 2025: when was the second permit to work for troubleshooting lift PL14 authorised, when did the transport team start work, and how long was the gap? At what time did the lift begin to move with the electro-technician in the shaft, when was he pronounced deceased and how many minutes later was that? What change was made to ship's time that night, and at what time?
**Gold:** The new PTW was raised at 1850 and authorised by the 1ETO at 1855 on 25 October; the transport team started work at about 2220 – a gap of 3 hours 25 minutes. At 0552 the deck 11 doors closed and the lift began to move up; at 0607 the ET was pronounced deceased by the ship's doctor, 15 minutes later. At 0200 on 26 October the ship's clocks were retarded by one hour, from UTC+1 to UTC.
**Key facts (8):** 1855 | 2220 | 3 hours 25 | 0552 | 0607 | 15 min | retarded | 0200
**Location:** MAIB 20/2026 (line 574, 575, 627, 635, 582)

##### N23 (en, multi)
**Question:** Give the timeline of the recovery of the casualty from migrant boat 512: when the first line was passed to the boat, when the casualty was spotted face down in the boat, when the rescue helicopter and the inshore lifeboat arrived on scene, how long she had been submerged at each of those two arrivals, how long after submersion CPR began, and when life extinct was recognised.
**Gold:** BF Volunteer passed a line at 1108. At 1119 the deck team noticed a person face down and partially submerged (about 8 minutes after she became submerged, 11 minutes after the line). Helicopter R363 arrived at 1137 (submerged 26 minutes); Walmer ILB arrived at 1145 (35 minutes). CPR started 39 minutes after submersion, after she was recovered onto the ILB; she was winched onto R363 at 1201 and recognition of life extinct was declared at 1253.
**Key facts (8):** 1108 | 1119 | 1137 | 1145 | 26 min | 35 min | 39 min | 1253
**Location:** MAIB 21/2026 (line 652, 706, 723, 724, 1403, 1405, 733)

##### N24 (en, multi)
**Question:** Across the four accident investigation reports in the collection (the NTSB report on Lake Erie, the two MAIB reports and the RAIB report), how many new safety recommendations are made in total, and to which organisations are they addressed, with how many each?
**Gold:** Ten in total. NTSB: six – two to the US Coast Guard (M-26-03, M-26-04), three to NOAA (M-26-05 to M-26-07) and one to SeaTrac Systems, Inc. (M-26-08). MAIB 20/2026 (Arvia): one to Carnival UK Ltd (2026/159). MAIB 21/2026: two to Border Security Command (2026/160, 2026/161). RAIB 11/2026: one to the Bluebell Railway.
**Key facts (6):** 10 recommendations | coast guard | noaa | seatrac | carnival uk | border security command
**Location:** NTSB MIR-26/32 (line 2340, 2343, 2347, 2351, 2355, 2359, 2337, 2344, 2356); MAIB 20/2026 (line 1349); MAIB 21/2026 (line 1543, 1552); RAIB 11/2026 (line 204)

##### N25 (de, trap)
**Question:** Warum ordnete der Chef des Generalstabs den Aufbauplan 2032+ bereits im August 2021 an?
**Gold:** Die Voraussetzung stimmt nicht: Im August 2021 ordnete das Verteidigungsministerium das Streitkräfteprofil „Unser Heer“ an (auf Basis des „Risikobildes 2030“). Den Aufbauplan ordnete der Chef des Generalstabs erst mit Jänner 2023 an.
**Key facts (2):** jänner 2023 | unser heer
**Location:** RH 2026/34 (line 889, 883)

##### N26 (de, trap)
**Question:** Das Landwirtschaftsministerium ließ das Magazin „Landreport“ wie im Werkvertrag vorgesehen in acht Ausgaben mit je 20.000 Stück Auflage herstellen. Wie viel zahlte es dafür insgesamt?
**Gold:** Die Voraussetzung stimmt nicht: Statt acht erschienen neun Ausgaben (vier 2017, fünf weitere zwischen 2018 und 2021), und entgegen dem Werkvertrag (20.000 Stück) lag die Druckauflage der beiden letzten Ausgaben bei jeweils nur 1.000 Stück. Trotzdem zahlte das Ministerium das ursprünglich vereinbarte Entgelt von insgesamt 599.360 EUR; die letzte Zahlung erfolgte Ende 2020.
**Key facts (3):** neun ausgaben | 1.000 stück | 599.360
**Location:** RH 2026/31 (line 5648, 5606, 5639)

##### N27 (en, trap)
**Question:** Why did the third electro-technical officer hold the lift doors open on deck 11 while the electro-technician entered the lift shaft from deck 13?
**Gold:** The premise is wrong twice. It was the staff electro-technical officer (SETO) who remained in the lift car holding the doors open; the 3ETO and the AET had gone back to their workshop. And there was no deck 13 on Arvia: the ET went up the stairs to deck 12, could not open the deck 12 landing doors, and then went to deck 14, where he opened the landing doors with his release key.
**Key facts (3):** seto | no deck 13 | deck 14
**Location:** MAIB 20/2026 (line 611, 513, 621)

##### N28 (en, trap)
**Question:** Of the four member states the ECA visited on the spot for its special report on RRF support in public administration – Czechia, Germany, Greece and Italy – which achieved significant results for the largest share of its audited measures, and how many?
**Gold:** The premise is wrong: the fourth visited member state was Spain, not Italy (visits to Czechia, Germany, Greece and Spain). Spain had the best results: 3 of its 4 measures (75 %) achieved significant results. Germany and Greece had 1 of 3 each, Czechia none (3 limited, 1 without evidence). Overall, 5 of the 14 measures due by the end of 2025 achieved significant results (36 %).
**Key facts (3):** not italy | 3 of 4 | 5 of the 14
**Location:** ECA SR 29/2026 (line 235, 1512, 1443)

##### N29 (de, trap)
**Question:** Warum waren die Kontingente des Impfstoffs gegen Pneumokokken im Gratis-Impfprogramm bis Ende März 2026 jeweils innerhalb von ein bis elf Tagen ausgeschöpft?
**Gold:** Die Voraussetzung stimmt nicht: Das betraf den Impfstoff gegen Gürtelrose – dessen bis Ende März 2026 freigeschaltete Kontingente waren innerhalb einiger (ein bis elf) Tage ausgeschöpft. Der Impfstoff gegen Pneumokokken war dagegen seit Mitte Dezember 2025 (ab 12. Dezember 2025) durchgehend im e-Impfshop bestellbar.
**Key facts (3):** gürtelrose | durchgehend | mitte dezember
**Location:** RH 2026/33 (line 172, 463)

##### N30 (de, multi)
**Question:** Die EFK hat in ihrer Prüfung zur Erneuerung ZEMIS auch frühere Empfehlungen nachgeprüft. Wie viele waren es, wie viele davon beurteilte sie als umgesetzt (mit Nummer) und wie viele als noch nicht umgesetzt? Welches ist die späteste Frist oder Nachfrist unter den nachgeprüften Empfehlungen? In welcher früheren Empfehlung will das SEM laut seiner Stellungnahme die neue Empfehlung 2 bearbeiten, welche Nachfrist galt für diese, und wie beurteilte die EFK ihren Stand?
**Gold:** Die EFK hat zehn frühere Empfehlungen nachgeprüft (18483.001, 22207.001, 22207.003, 22207.005, 22207.006, 22207.007, 22207.008, 22207.010, 24253.001 und 24253.002). Davon beurteilte sie drei als umgesetzt: 22207.008 (die Fachbereiche des SEM steuern das Programm ERZ), 22207.010 (Human Ressources/Organisationsentwicklung und Rechtsdienst sind eingebunden) und 24253.001 (Grundlagen für die agile Zusammenarbeit zwischen den Ämtern, Frist 31.12.2025). Die übrigen sieben sind noch nicht umgesetzt, Arbeiten sind im Gang. Die späteste Frist ist der 31.12.2027: Nachfrist der ältesten Empfehlung 18483.001 (Roadmap für die IT-Applikationen) und Frist der Empfehlung 24253.002 (einheitliches Portfoliomanagement). Die neue Empfehlung 2 (Hauptmeilensteine mit messbaren Schlüsselresultaten) will das SEM laut Stellungnahme im Rahmen der Empfehlung 22207.001 (Roadmap mit allen Hauptmeilensteinen) bearbeiten. Deren Nachfrist war der 30.06.2026; die EFK beurteilte sie als noch nicht umgesetzt, Arbeiten sind im Gang (Grobplanung mit Hauptmeilensteinen bis Juli 2026).
**Key facts (9):** 10 nachgeprüft | drei umgesetzt | 22207.008 | 22207.010 | 24253.001 | sieben noch nicht | 31.12.2027 | 22207.001 | 30.06.2026
**Location:** EFK-26272 (line 890, 903, 922, 932, 952, 965, 973, 999, 1012, 1036, 990, 1005, 1019, 899, 891, 1038, 877, 904)

##### N31 (en, multi)
**Question:** For the three ECA special reports in the collection (24/2026, 25/2026 and 29/2026), what target implementation date did the ECA set for each recommendation? How many recommendations have their whole target date in 2027 (not counting split dates), which recommendation has a split target date and what are its parts, which date is the only one given to the quarter, and which recommendation has the latest target date and what does it ask the Commission to do?
**Gold:** Target implementation dates: SR 24/2026 – Recommendation 1 Q1 2028, Recommendations 2 and 3 2027, Recommendation 4 2031. SR 25/2026 – all four recommendations end of 2029. SR 29/2026 – Recommendation 1 by the end of 2027, Recommendation 2 2028, Recommendation 3 by the end of 2027, Recommendation 4 split: (a) and (b) in 2028, (c) by the end of 2027, Recommendation 5 2028. In total, four recommendations have a target date in 2027 (SR 24 Rec. 2 and 3, SR 29 Rec. 1 and 3). The only date given to the quarter is Q1 2028 (SR 24 Rec. 1). The latest date is 2031, for SR 24 Recommendation 4: for the current Horizon Europe programme the Commission should evaluate the impacts of EU research funding on participants' economic performance and innovation capacity by further developing its methods to assess the impact.
**Key facts (6):** four recommendations have a target date in 2027 | end of 2029 | 2031 | evaluate the impacts | (c) by the end of 2027 | q1 2028
**Location:** ECA SR 24/2026 (line 362, 372, 396, 403, 422, 417, 420, 344); ECA SR 29/2026 (line 313, 317, 409, 419, 486); ECA SR 25/2026 (line 214, 263, 291, 307)

##### N32 (de, number)
**Question:** Der RH gibt in jedem seiner fünf Berichte im Bestand an, von wann bis wann er die Gebarungsüberprüfung durchführte (gemeint ist nicht der überprüfte Zeitraum). Nenne diesen Zeitraum für jeden der fünf Berichte. Wie viele Monate dauerte die längste dieser Überprüfungen, und wie viele Monate ergeben alle fünf zusammen, wenn Anfangs- und Endmonat jeweils mitgezählt werden? Welche der Berichte nennen ausdrücklich ein Nachhaltigkeitsziel der Vereinten Nationen, und welches?
**Gold:** Durchführung der Gebarungsüberprüfungen: Leistungen der Bundesministerien im Zusammenhang mit politischen Parteien (2026/31) von Juni 2024 bis Juli 2025; Ausgleichstaxfonds (2026/32) von April bis Oktober 2025; Gratis-Impfprogramm (2026/33) von März bis Juni 2026; Aufbauplan 2032+ (2026/34) von April 2025 bis September 2025; Wiener Zeitung GmbH (2026/36) von Mai 2025 bis Jänner 2026. Mit Anfangs- und Endmonat sind das 14, 7, 4, 6 und 9 Monate; die längste Überprüfung war die zu den Parteien-Leistungen mit 14 Monaten, alle fünf zusammen ergeben 40 Monate. Ein Nachhaltigkeitsziel nennen drei Berichte: Ausgleichstaxfonds das Ziel 8 (menschenwürdige Arbeit und Wirtschaftswachstum), Gratis-Impfprogramm das Ziel 3 (Gesundheit und Wohlergehen), Aufbauplan das Ziel 16 (leistungsfähige Institutionen); die Berichte zu den Parteien und zur Wiener Zeitung nennen keines.
**Key facts (10):** juni 2024 bis juli 2025 | april bis oktober 2025 | märz bis juni 2026 | april 2025 bis september 2025 | mai 2025 bis jänner 2026 | 14 monate | 40 monate | ziel 8 | ziel 3 | ziel 16
**Location:** RH 2026/31 (line 758); RH 2026/32 (line 767, 477, 774); RH 2026/33 (line 527, 334, 571); RH 2026/34 (line 757, 433, 876); RH 2026/36 (line 675, 367)

##### N33 (de, number)
**Question:** Für die Jahre 2025 und 2026 wich die Finanzierung der Wiener Zeitung GmbH durch den Bund von den Beträgen des WZEVI-Gesetzes ab. Wie viel leistete der Bund in diesen beiden Jahren jährlich für das Medium Wiener Zeitung, für den Media Hub und für die elektronische Verlautbarungs- und Informationsplattform, welche Jahressumme ergibt das, und wie viel weniger erhält die Gesellschaft dadurch über beide Jahre zusammen? Woraus ist die Differenz auszugleichen, wie hoch waren die freien Gewinnrücklagen der Mediengruppe insgesamt, und welche Gesamtsumme der Bundesbeiträge hatte ein interner Gesetzesentwurf vom Sommer 2022 vorgesehen?
**Gold:** Laut WZEVI-Gesetz zahlte der Bund jährlich 3,00 Mio. EUR für die EVI, 7,50 Mio. EUR für das Medium und 6,00 Mio. EUR für den Media Hub (16,50 Mio. EUR). Für 2025 und 2026 kürzte das Budgetbegleitgesetz 2025 die Beiträge um jährlich 5 Mio. EUR: für die Wiener Zeitung (Medium) jährlich 5 Mio. EUR statt 7,50 Mio. EUR, für den Media Hub 3,50 Mio. EUR statt 6,00 Mio. EUR; die EVI blieb bei 3,00 Mio. EUR. Je Jahr sind das 11,50 Mio. EUR. Über beide Jahre erhält die Gesellschaft in Summe 10 Mio. EUR weniger; diese Differenz war laut Gesetzesmaterialien aus dem Gesellschaftsvermögen auszugleichen – der Eigentümer ermächtigte die Geschäftsführung im August 2025, bis zu 10 Mio. EUR der Gewinnrücklagen aufzulösen. Die freien Gewinnrücklagen der Mediengruppe betrugen insgesamt 28,86 Mio. EUR (22,38 Mio. EUR bei der Wiener Zeitung GmbH, 6,48 Mio. EUR bei der Tochtergesellschaft). Ein interner Entwurf vom Sommer 2022 hatte Bundesbeiträge von insgesamt 14,50 Mio. EUR vorgesehen.
**Key facts (8):** statt 7,50 | 3,50 mio | 3,00 mio | 11,50 | in summe 10 mio | gesellschaftsvermögen | 28,86 | 14,50
**Location:** RH 2026/36 (line 4088, 1376, 1384, 4101, 4090, 4092, 4086, 1401)

##### N34 (en, number)
**Question:** Across the three marine casualty reports in the collection (the NTSB report on the Lake Erie collision, the MAIB report on Arvia and the MAIB report on migrant boat 512), how many persons were on board each vessel involved in the casualty according to the reports' casualty data, with Arvia split into passengers and crew? What is the total? By how many passengers was Arvia below the number of passengers she was authorised to carry? How many fatalities and injuries do the three reports record altogether?
**Gold:** According to the casualty data, Arvia had 6,980 persons on board – 5,299 passengers and 1,681 crew – while she was authorised to carry 6,600 passengers, so she was 1,301 passengers below that number. Migrant boat 512 had 74 people on board. In the Lake Erie collision the USV was uncrewed (none on board) and the recreational vessel had 2 persons on board (the owner/operator and his nephew). In total that is 6,980 + 74 + 2 = 7,056 persons. The three reports record two fatalities in total (the electro-technician on Arvia and one occupant of migrant boat 512) and one minor injury (the recreational vessel's operator, foot).
**Key facts (10):** 6,980 | 5,299 | 1,681 | 74 people | 2 (recreational | 7,056 | 6,600 | 1,301 | two fatalities | one minor injury
**Location:** MAIB 20/2026 (line 455, 425, 411, 450); MAIB 21/2026 (line 538, 598, 518); NTSB MIR-26/32 (line 2581, 521, 2568, 266)

##### N35 (en, multi)
**Question:** Which earlier accidents do the MAIB report on Arvia, the MAIB report on migrant boat 512 and the RAIB report on Sheffield Park each describe in their sections on previous or similar accidents (vessel or location, and year)? How many such earlier accidents are described across the three reports in total, and how many people died in them altogether, taking 'at least' figures as given?
**Gold:** MAIB (Arvia) describes three similar lift accidents: British Mallard (27 January 2007, an electrical technician killed), MSC Colombia (8 August 2007, an electrical cadet killed) and Carnival Ecstasy (27 December 2015, the chief electrician killed). MAIB (migrant boat 512) describes two earlier migrant boat accidents in the Dover Strait: 24 November 2021, with at least 27 fatalities, and 14 December 2022, with at least eight fatalities. RAIB describes three previous occurrences: Loughborough Central in February 2006 (Great Central Railway, two staff with minor injuries, nobody died), Bronwydd Arms on the Gwili Railway in July 2006 (the guard later died) and Grosmont on the North Yorkshire Moors Railway in May 2012 (a guard fatally injured). That is eight earlier accidents in total, in which at least 40 people died (1 + 1 + 1 + 27 + 8 + 0 + 1 + 1).
**Key facts (10):** british mallard | msc colombia | carnival ecstasy | at least 27 | at least eight | loughborough | bronwydd | grosmont | eight earlier | at least 40
**Location:** MAIB 20/2026 (line 1030, 1041, 1047); MAIB 21/2026 (line 1107, 1141); RAIB 11/2026 (line 1213, 1221, 1229)

##### N36 (en, trap)
**Question:** Why did the MAIB address its safety recommendation on the Arvia accident to Carnival UK Ltd, a different company from Arvia's registered owner and manager, Carnival plc?
**Gold:** The premise is wrong: Carnival UK Ltd is not a different company. The vessel particulars list Carnival plc as Arvia's registered owner and manager, but a footnote states that Carnival plc changed its name to Carnival UK Ltd on 21 May 2026. The recommendation 2026/159 therefore goes to the same company under its new name; it asks it to review the use of self-resetting lift door interlocks as a safety barrier to prevent activation of lifts during maintenance or inspection.
**Key facts (3):** changed its name | 21 may 2026 | self-resetting
**Location:** MAIB 20/2026 (line 458, 1349, 1352)

##### N37 (de, number)
**Question:** Wie viele neue Empfehlungen sprechen die zehn Prüfberichte der drei Rechnungshöfe im Bestand aus – die fünf des österreichischen Rechnungshofs, die zwei der Eidgenössischen Finanzkontrolle und die drei Sonderberichte des Europäischen Rechnungshofs? Nenne die Zahl je Institution und die Gesamtzahl; bei der EFK zählen nur neue Empfehlungen, nicht nachgeprüfte frühere. Wie haben die geprüften Stellen in der Schweiz auf die neuen EFK-Empfehlungen reagiert?
**Gold:** Zusammen sprechen die zehn Berichte 178 neue Empfehlungen aus. RH: 158 Schlussempfehlungen (Parteien 41, Ausgleichstaxfonds 34, Gratis-Impfprogramm 10, Aufbauplan 2032+ 28, Wiener Zeitung 45). EFK: 7 neue Empfehlungen (Microsoft 365: 5, ZEMIS: 2; die zehn nachgeprüften früheren Empfehlungen bei ZEMIS zählen nicht). Europäischer Rechnungshof: 13 Empfehlungen (SR 24: 4, SR 25: 4, SR 29: 5). Die geprüften Stellen in der Schweiz (BK-DTI, BIT und SEM) haben alle sieben EFK-Empfehlungen akzeptiert („Die Empfehlung ist akzeptiert“).
**Key facts (5):** 158 | 7 neue | 13 empfehlungen | 178 | alle sieben
**Location:** RH 2026/31 (line 6614); RH 2026/32 (line 6025); RH 2026/33 (line 2851); RH 2026/34 (line 4479); RH 2026/36 (line 5462); EFK-25121 (line 636, 699, 731, 770, 898, 643, 705, 741, 781, 907); EFK-26272 (line 705, 867, 714, 875); ECA SR 24/2026 (line 417); ECA SR 25/2026 (line 303); ECA SR 29/2026 (line 492)

##### N38 (en, number)
**Question:** The three marine casualty reports state their times in different time standards. For the NTSB report on the Lake Erie collision, the MAIB report on Arvia and the MAIB report on migrant boat 512: which time standard does each report use, and what was the time of the casualty in UTC (for Arvia: when the lift began to move with the electro-technician in the shaft)? On Arvia, what was the authorisation time of the second permit to work on lift PL14 in UTC, and how much real time elapsed between that authorisation and the lift beginning to move?
**Gold:** NTSB (Lake Erie): all times are eastern daylight time, which the casualty summary gives as coordinated universal time –4 hours; the collision at about 1912 EDT on 10 August 2024 was therefore at about 2312 UTC. MAIB Arvia: times are ship's time, which was UTC+1 until 0200 on 26 October 2025, when ship's time was retarded to UTC; the lift began to move at 0552 ship's time, i.e. 0552 UTC. MAIB migrant boat 512: all times are UTC, so the casualty on 9 September 2025 at about 1110 was at 1110 UTC. On Arvia the second permit to work was authorised at 1855 ship's time on 25 October, still UTC+1, i.e. 1755 UTC. From 1755 UTC to 0552 UTC the next morning is 11 hours 57 minutes – one hour more than the 10 hours 57 minutes the ship's clock times suggest, because the clocks went back at 0200.
**Key facts (6):** 2312 utc | coordinated universal time –4 | 0552 utc | 1110 utc | 1755 utc | 11 hours 57
**Location:** NTSB MIR-26/32 (line 2566, 357); MAIB 20/2026 (line 345, 627, 573, 574, 582); MAIB 21/2026 (line 371, 504)

##### N39 (de, trap)
**Question:** Warum prüfte der Rechnungshof für seine Berichte zum Ausgleichstaxfonds und zum Gratis-Impfprogramm zwei verschiedene Bundesministerien, das Sozialministerium und das Gesundheitsministerium, und in welchem Monat nahm jedes der beiden Ministerien zum jeweiligen Prüfungsergebnis Stellung?
**Gold:** Die Voraussetzung stimmt nicht: Es handelt sich um dasselbe Ministerium. Beide Berichte prüften beim Bundesministerium für Arbeit, Soziales, Gesundheit, Pflege und Konsumentenschutz; der RH nennt es im Bericht zum Ausgleichstaxfonds „Sozialministerium“, im Bericht zum Gratis-Impfprogramm „Gesundheitsministerium“. Bis 31. März 2025 hieß es Bundesministerium für Soziales, Gesundheit, Pflege und Konsumentenschutz. Zum im Februar 2026 übermittelten Prüfungsergebnis zum Ausgleichstaxfonds nahm es im Mai 2026 Stellung, zum im Juli 2026 übermittelten Ergebnis zum Impfprogramm im September 2026.
**Key facts (5):** dasselbe ministerium | arbeit, soziales, gesundheit, pflege und konsumentenschutz | 31. märz 2025 | mai 2026 | september 2026
**Location:** RH 2026/32 (line 767, 784, 776); RH 2026/33 (line 334, 576)

#### Set D - Reports 2026, reasoning / fairness test (11 questions)

**Purpose:** Reasoning set over the same 14 reports, used as the fairness test for the claim that a dense model beats an MoE model where several reasoning steps are needed on easily found text. reason-1: one step; reason-2: two to three steps in one report; reason-3: many steps across several reports.

##### D1 (de, reason-1)
**Question:** Laut RH-Bericht zur Umsetzbarkeit des Aufbauplans 2032+ erlaubt das Wehrgesetz, Wehrpflichtige auch ohne freiwillige Meldung zu Milizübungen zu verpflichten. Angenommen, in einem Kalenderjahr hätten sich 10 von Hundert der Wehrpflichtigen, die den Grundwehrdienst geleistet haben, freiwillig zu Milizübungen gemeldet: Wie viele von Hundert dieses Jahrgangs dürfte das Verteidigungsministerium dann höchstens noch zusätzlich verpflichten, und warum? Nutzte das Ministerium diese Möglichkeit?
**Gold:** Höchstens 2 von Hundert. § 21 Abs. 3 Wehrgesetz: Verpflichtung höchstens 12 von Hundert, freiwillig Gemeldete anzurechnen → 12 − 10 = 2. Das Ministerium machte keinen Gebrauch.
**Key facts (3):** 12 von hundert | höchstens 2 % | keinen gebrauch
**Location:** RH 2026/34 line 2056 (Fußnote 37, Gesetzestext), line 2104

##### D2 (de, reason-1)
**Question:** Nach dem RH-Bericht zur Neuausrichtung der Wiener Zeitung GmbH hätte deren Tochtergesellschaft Aufträge nur dann vergaberechtsfrei als Inhouse-Vergabe erhalten können, wenn sie das Wesentlichkeitskriterium erfüllt. Welche Schwelle gilt dafür? In welchem Jahr von 2020 bis 2024 kam die Tochtergesellschaft dieser Schwelle mit ihrem Umsatzanteil aus Leistungen für die Wiener Zeitung GmbH am nächsten, mit welchem Anteil, und um wie viele Prozentpunkte lag sie selbst dann darunter?
**Gold:** Mehr als 80 % der Tätigkeit für die Wiener Zeitung GmbH. Anteile 2020–2024: 64,2 / 66,1 / 66,5 / 69,4 / 69,3 %; am nächsten 2023 mit 69,4 %; 80 − 69,4 = 10,6 Prozentpunkte darunter, in keinem Jahr erfüllt.
**Key facts (3):** 80 % | 69,4 | 10,6
**Location:** line 5185 (Regel), line 3922 und 3951 (Tabelle 9)

##### D3 (en, reason-1)
**Question:** Rule 33 of the Inland Navigation Rules exempts some vessels from carrying a whistle. In the NTSB report on the Lake Erie collision, did that exemption apply to the GLERL uncrewed surface vessel, judging by its overall length in metres? What did Rule 33 require of it instead, and did it comply? Would the Prestige 450 Flybridge have fallen under the same exemption?
**Gold:** Ausnahme gilt (USV 15.9 ft = 4.8 m < 12 m); stattdessen „some other means of making an efficient sound“; das USV hatte kein anderes Schallsignalmittel, also nicht erfüllt; Prestige 450 mit 13.7 m nicht befreit.
**Key facts (5):** 4.8 m | 13.7 m | other means | did not have any other | longer than 12
**Location:** NTSB MIR-26/32 line 916, 918 (Tabelle 2), line 2053 (Fußnote Rule 33), line 2021

##### D4 (en, reason-1)
**Question:** In the RAIB report on Sheffield Park, the Bluebell Railway's October 2022 risk assessment for operating Fenchurch scored the hazard of staff being crushed or scalded. What score did it give before controls, and from which likelihood and severity scores? Under the railway's instruction GI028, did that score call for additional measures if it remained after existing controls, and by how many points did it exceed the relevant threshold? What residual risk did the assessment record after its control measure?
**Gold:** 12 = Wahrscheinlichkeit 3 × Schwere 4; GI028 verlangt Zusatzmaßnahmen, wenn der Score über 6 bleibt; 12 liegt 6 Punkte darüber (doppelt); Restrisiko nicht festgehalten.
**Key facts (4):** as 12 | above 6 | by 6 | not recorded
**Location:** RAIB 11/2026 line 949, 1032, 1077

##### D5 (en, reason-2)
**Question:** After the Arvia accident, Carnival UK introduced an interim requirement on lift safety training for personnel involved in lift maintenance. Measured on the day of the accident, which members of Arvia's electro-technical team named in the MAIB report would demonstrably have met it, judging by the training dates the report gives? How many days old was the relevant training of the AET and of the ET (the electro-technician who died), and how old was the SETO's? What about the 3ETO?
**Gold:** Interimsregel: Grundschulung durch OEM oder Drittanbieter innerhalb der letzten 6 Monate. Am 26.10.2025 erfüllt nur der AET (3.8.2025 → 84 Tage); ET 12.4.2025 → 197 Tage (6 Monate 14 Tage); SETO 22.10.2023 → 735 Tage; 3ETO ohne Schulung; 1ETO ohne Datum.
**Key facts (5):** only the aet | 84 days | 197 days | 2 years | had not completed any
**Location:** MAIB 20/2026 line 445, 697, 700, 705, 712, 1337

##### D6 (de, reason-2)
**Question:** Im RH-Bericht zur Umsetzbarkeit des Aufbauplans 2032+ ermittelte die Direktion 4 Logistik zusätzlichen Lagerraumbedarf an Palettenplätzen. Wie viele Palettenplätze Zusatzbedarf ergeben ihre beiden Angaben zusammen, wie viele davon blieben selbst nach Inbetriebnahme des Lagerprojekts mit dem frühesten geplanten Fertigstellungstermin offen, und wie viele Palettenplätze fehlten danach noch bis zu der Gesamtkapazität, die die Direktion 4 Logistik für die Verdoppelung der Lagerkapazität nannte? Wann sollten laut dem Zeitplan vom Jänner 2023 die Einlagerungen beginnen, und wann war die Inbetriebnahme dieses Projekts vorgesehen?
**Gold:** 24.000 + 16.500 = 40.500; Wels 26.000 (Inbetriebnahme 2027) → 14.500 offen; 220.000 − (111.687 + 26.000) = 82.313; Zeitplan Jänner 2023: Einlagerung ab zweitem Halbjahr 2026, Wels mindestens ein halbes Jahr später.
**Key facts (5):** 40.500 | 14.500 | 82.313 | zweites halbjahr 2026 | inbetriebnahme 2027
**Location:** RH 2026/34 line 3813–3817, 3833, 3851

##### D7 (de, reason-2)
**Question:** Der RH schreibt, die Leitung des Projekts „Jailshop“ des Justizministeriums habe ein Mitglied des Bundesrats (DIE GRÜNEN) innegehabt; das Justizministerium hält in seiner Stellungnahme entgegen, zum Zeitpunkt der Beauftragung sei der Projektleiter kein Mitglied des Bundesrates gewesen. Wie lassen sich beide Aussagen vereinbaren? Wann endete sein Bundesratsmandat vor der Beauftragung, seit welchem Tag war er wieder Mitglied des Bundesrats, und seit welchem Tag war er Projektleiter und zugleich Bundesrat für DIE GRÜNEN?
**Gold:** Beides stimmt: Mandat endete 23.11.2015, Beauftragung Ende 2017 fiel in die Lücke; ab 23.10.2019 wieder Bundesrat (ohne Fraktion), ab 20.12.2019 für DIE GRÜNEN, bis zum Ende der Projektleitung im April 2024 gleichzeitig.
**Key facts (3):** 23. oktober 2019 | 20. dezember 2019 | 23. november 2015
**Location:** RH 2026/31 line 5379 (RH), line 5508 (Stellungnahme)

##### D8 (de, reason-2)
**Question:** Laut RH-Bericht zum Ausgleichstaxfonds legte das Sozialministerium die Höhe des jährlichen Mobilitätszuschusses für Menschen mit Behinderungen jedes Jahr neu fest. Wie hoch war der Zuschuss im Jahr 2022, rechnerisch aus den Angaben des Berichts hergeleitet? Um wie viel EUR und um wie viel Prozent wurde er im Juli 2025 gegenüber 2024 gekürzt, und um wie viel EUR lag er danach unter dem Betrag von 2022?
**Gold:** 638 / 1,10 = 580 EUR (2022); Kürzung 697 → 335 = 362 EUR = 51,9 %; 580 − 335 = 245 EUR unter 2022.
**Key facts (4):** 580 eur | 362 eur | 51,9 | 245 eur
**Location:** RH 2026/32 line 5266 (eine Stelle, mehrere Rechenschritte)

##### D9 (en, reason-3)
**Question:** Of the four accident investigation reports in the collection (the NTSB report on the Lake Erie collision, the two MAIB reports and the RAIB report on Sheffield Park), which accidents resulted in a death? For each person who died, give their role or circumstances (not the name) and their age. How many days lay between the two fatal accidents, and how many days between the two accidents without a fatality?
**Gold:** tödlich: boat 512 (9.9.2025, a migrant, 36) und Arvia (26.10.2025, the electro-technician ET, 35); ohne Tote: Lake Erie (10.8.2024, eine leichte Verletzung) und Sheffield Park (9.8.2025, unverletzt). 21 + 26 = 47 Tage; 10.8.2024 → 9.8.2025 = 364 Tage.
**Key facts (4):** 47 days | 364 days | 35-year-old | 36-year-old
**Location:** MAIB 21/2026 line 374; MAIB 20/2026 line 445, 709; NTSB MIR-26/32 line 261, 631; RAIB 11/2026 line 185, 188

##### D10 (en, reason-3)
**Question:** In which member states did the ECA carry out visits or close examinations for each of its three special reports in the collection (24/2026 on innovation and competitiveness, 25/2026 on marine protected areas, 29/2026 on RRF support for public administration)? Which member state appears for more than one of these reports, how many member-state visits are there in total, and how many different member states were visited?
**Gold:** SR 24 Finnland, Ungarn, Italien, Niederlande, Spanien; SR 25 Irland, Frankreich, Schweden; SR 29 Tschechien, Deutschland, Griechenland, Spanien. Nur Spanien doppelt; 5 + 3 + 4 = 12 Besuche, 11 verschiedene Staaten.
**Key facts (3):** 12 visits | 11 different | spain was visited for both
**Location:** ECA SR 24/2026 line 2499; ECA SR 25/2026 line 1947, 573; ECA SR 29/2026 line 1873 (Zählung als `items`)

##### D11 (en, reason-3)
**Question:** Which of the four accident investigation reports in the collection (the NTSB report on the Lake Erie collision, the MAIB report on Arvia, the MAIB report on migrant boat 512 and the RAIB report on Sheffield Park) state the air temperature at the time of the accident? Converted to degrees Celsius, which accident had the warmest air, and by how much was it warmer than the second warmest? How many degrees Celsius separate the warmest and the coolest of the stated air temperatures?
**Gold:** Lake Erie 72 °F = (72 − 32) × 5/9 ≈ 22,2 °C; Sheffield Park ≈ 22 °C; Boot 512 15 °C; Arvia keine Lufttemperatur. Wärmste Luft Lake Erie, ≈ 0,2 °C über Sheffield Park; Spanne 22,2 − 15 ≈ 7,2 °C.
**Key facts (4):** 22.2 °c | 0.2 °c | 7.2 °c | no air temperature
**Location:** NTSB MIR-26/32 line 1361; RAIB 11/2026 line 443; MAIB 21/2026 line 743; MAIB 20/2026 line 454 (Wetter ohne Temperatur, kein °C/°F im Bericht)

## Appendix E: Downloads

All files are under `/software-vs-model/`. The CSV files have one row per question with the facts found (automatic and from the second review), searches, `top_k` per search, the largest prompt, time, stop reason and context.

| File | Content | Traces |
|---|---|---|
| [questions.json](/software-vs-model/questions.json) | all 109 questions (sets R, H, F, N and D) with gold facts and all accepted spellings (minus those that contained personal names); personal names replaced by roles | – |
| [berichte26.csv](/software-vs-model/berichte26.csv), [challenger.csv](/software-vs-model/challenger.csv) | documents: title, publisher, date, original URL, licence, SHA256 of the text | – |
| [runs7_A-moe-N-ag-s1337.csv](/software-vs-model/runs7_A-moe-N-ag-s1337.csv), [runs7_A-moe-N-ag-s2.csv](/software-vs-model/runs7_A-moe-N-ag-s2.csv) | unknown reports, agentic, MoE, per seed | on request |
| [runs7_A-d27-N-ag-s1337.csv](/software-vs-model/runs7_A-d27-N-ag-s1337.csv), [runs7_A-d27-N-ag-s2.csv](/software-vs-model/runs7_A-d27-N-ag-s2.csv) | unknown reports, agentic, 27B, per seed | on request |
| [runs8_A-d9-N-ag-s1337.csv](/software-vs-model/runs8_A-d9-N-ag-s1337.csv) | unknown reports, agentic, 9B | on request |
| [runs7_B-moe-N-noret-s1337.csv](/software-vs-model/runs7_B-moe-N-noret-s1337.csv), [runs7_B-d27-N-noret-s1337.csv](/software-vs-model/runs7_B-d27-N-noret-s1337.csv) | unknown reports, without search, MoE and 27B | – |
| [runs7_K-moe-N-classic-rr-s1337.csv](/software-vs-model/runs7_K-moe-N-classic-rr-s1337.csv), [runs7_K-d9-N-classic-rr-s1337.csv](/software-vs-model/runs7_K-d9-N-classic-rr-s1337.csv), [runs7_K-d4-N-classic-rr-s1337.csv](/software-vs-model/runs7_K-d4-N-classic-rr-s1337.csv) | unknown reports, one search up front, MoE, 9B, 4B | – |
| [hosted_berichte26_direct.csv](/software-vs-model/hosted_berichte26_direct.csv), [hosted_berichte26_N30-direct.csv](/software-vs-model/hosted_berichte26_N30-direct.csv), [hosted_berichte26_tools.csv](/software-vs-model/hosted_berichte26_tools.csv), [hosted_berichte26_N30-tools.csv](/software-vs-model/hosted_berichte26_N30-tools.csv) | unknown reports, Claude Opus 5.5, without search and agentic (N1–N29 and N30–N39) | [N30–N39](/software-vs-model/hosted_berichte26_N30-tools.jsonl) |
| [runs9_A-moe-N-ag-s1337.csv](/software-vs-model/runs9_A-moe-N-ag-s1337.csv), [runs9_A-d27-N-ag-s1337.csv](/software-vs-model/runs9_A-d27-N-ag-s1337.csv) | re-run after the fix, MoE and 27B | on request |
| [runs10_K-moe-Nodd-top10-s1337.csv](/software-vs-model/runs10_K-moe-Nodd-top10-s1337.csv), [runs10_K-d27-Nodd-top10-s1337.csv](/software-vs-model/runs10_K-d27-Nodd-top10-s1337.csv) | control run, exactly 10 hits, 20 questions | on request |
| [runs10_M-moe-N-mac-s1337.csv](/software-vs-model/runs10_M-moe-N-mac-s1337.csv), [runs10_M-moe-H-mac-s1337.csv](/software-vs-model/runs10_M-moe-H-mac-s1337.csv), [runs10_M-d27-N-mac-s1337.csv](/software-vs-model/runs10_M-d27-N-mac-s1337.csv), [runs10_M-d27-H-mac-s1337.csv](/software-vs-model/runs10_M-d27-H-mac-s1337.csv) | Mac windows replayed on the PC, 15 questions | on request |
| [runs8_A-moe-D-ag-s1337.csv](/software-vs-model/runs8_A-moe-D-ag-s1337.csv), [runs8_A-moe-D-ag-s2.csv](/software-vs-model/runs8_A-moe-D-ag-s2.csv), [runs8_A-d27-D-ag-s1337.csv](/software-vs-model/runs8_A-d27-D-ag-s1337.csv), [runs8_A-d27-D-ag-s2.csv](/software-vs-model/runs8_A-d27-D-ag-s2.csv) | reasoning questions, per model and seed | on request |
| [runs6_A-moe-H-ag-s1337.csv](/software-vs-model/runs6_A-moe-H-ag-s1337.csv), [runs6_A-moe-H-ag-s2.csv](/software-vs-model/runs6_A-moe-H-ag-s2.csv), [runs6_A-moe-H-ag-s3.csv](/software-vs-model/runs6_A-moe-H-ag-s3.csv), [runs6_A-d27-H-ag-s1337.csv](/software-vs-model/runs6_A-d27-H-ag-s1337.csv), [runs6_A-d27-H-ag-s2.csv](/software-vs-model/runs6_A-d27-H-ag-s2.csv), [runs6_A-d27-H-ag-s3.csv](/software-vs-model/runs6_A-d27-H-ag-s3.csv), [runs8_A-d9-H-ag-s1337.csv](/software-vs-model/runs8_A-d9-H-ag-s1337.csv) | Challenger, agentic, per model and seed | on request |
| [per-run-csv.zip](/software-vs-model/per-run-csv.zip) | 17 further per-run CSVs: sets R and F (MoE and 27B), the Challenger runs with traps and other Claude Opus 5.5 variants, the runs with the context window chosen by the app (`auto`; answers byte-identical to the fixed-context run with the same seed), one search up front on set R | – |
| [hosted_berichte26_N30-direct.jsonl](/software-vs-model/hosted_berichte26_N30-direct.jsonl), [runs7_G-moe-N-ag-auto-s1337.jsonl](/software-vs-model/runs7_G-moe-N-ag-auto-s1337.jsonl) | traces: Claude Opus 5.5 without search (N30–N39), MoE with the context window chosen by the app | – |
| [runs7_K-moe-H-classic-rr-s1337.csv](/software-vs-model/runs7_K-moe-H-classic-rr-s1337.csv), [runs7_K-d9-H-classic-rr-s1337.csv](/software-vs-model/runs7_K-d9-H-classic-rr-s1337.csv), [runs7_K-d4-H-classic-rr-s1337.csv](/software-vs-model/runs7_K-d4-H-classic-rr-s1337.csv) | Challenger, one search up front, MoE, 9B, 4B | – |
| [runs6_B-moe-H-noret-s1337.csv](/software-vs-model/runs6_B-moe-H-noret-s1337.csv), [runs6_B-moe-H-noret-s2.csv](/software-vs-model/runs6_B-moe-H-noret-s2.csv), [runs6_B-moe-H-noret-s3.csv](/software-vs-model/runs6_B-moe-H-noret-s3.csv), [runs6_B-d27-H-noret-s1337.csv](/software-vs-model/runs6_B-d27-H-noret-s1337.csv), [runs6_B-d27-H-noret-s2.csv](/software-vs-model/runs6_B-d27-H-noret-s2.csv), [runs6_B-d27-H-noret-s3.csv](/software-vs-model/runs6_B-d27-H-noret-s3.csv), [runs6_E-d9-H-noret-s1337.csv](/software-vs-model/runs6_E-d9-H-noret-s1337.csv), [runs6_E-d4-H-noret-s1337.csv](/software-vs-model/runs6_E-d4-H-noret-s1337.csv) | Challenger, without search, per model | – |
| [hosted_challenger_H-direct.csv](/software-vs-model/hosted_challenger_H-direct.csv), [hosted_challenger_H20-direct-v3.csv](/software-vs-model/hosted_challenger_H20-direct-v3.csv), [hosted_challenger_H-tools.csv](/software-vs-model/hosted_challenger_H-tools.csv), [hosted_challenger_H20-tools-v3.csv](/software-vs-model/hosted_challenger_H20-tools-v3.csv) | Challenger, Claude Opus 5.5, without search and agentic (H1–H19 and H20–H29) | on request |

Traces for the remaining runs contain personal names quoted from the source documents and are available on request. The trace files that are published (one line per question, same name as the run) hold the search record described in A.5: rounds, tool calls with their arguments, the returned section ids with their headings, and the answer.[^traces]

[^traces]: The traces carry no whole sections, only section ids, the first line of each hit and the heading path, plus the answers, which partly quote the reports. Licence and attribution per document: [LICENSE.md](/software-vs-model/LICENSE.md).

## Appendix F: Sources

- Rule of thumb √(total × active): first seen in a r/LocalLLaMA post from 28 March 2024, [Geometric Mean Prediction of MoE performance seems to hold up consistently](https://www.reddit.com/r/LocalLLaMA/comments/1bqa96t/geometric_mean_prediction_of_moe_performance/).
- Qwen's benchmark comparison of Qwen3.6-35B-A3B with the dense Qwen3.5-27B: [model card](https://huggingface.co/Qwen/Qwen3.6-35B-A3B).
- Downloads of 20–40B models, last 30 days, queried through the Hugging Face API on 9 November 2026: the most downloaded model is a dense 27B (Qwen3.8); across GGUF builds dense and MoE are roughly level.
- The view that the dense 27B is better and the 35B-A3B faster: e.g. the discussion on [Qwen 3.6 27B is the sweet spot for local development](https://news.ycombinator.com/item?id=48721903).

Default number of hits in other frameworks, read from the source code on 9 November 2026:
- LangChain: `similarity_search(query, k=4)`, and `create_retriever_tool` only offers the query to the model ([vectorstores/base.py](https://github.com/langchain-ai/langchain/blob/a063ec26dd21678069d3b3d44770dffcff2b60f0/libs/core/langchain_core/vectorstores/base.py#L362), [tools/retriever.py](https://github.com/langchain-ai/langchain/blob/master/libs/core/langchain_core/tools/retriever.py#L25)).
- LlamaIndex: `DEFAULT_SIMILARITY_TOP_K = 2`, and `QueryEngineTool` takes a single input string ([constants.py](https://github.com/run-llama/llama_index/blob/b517486f24c2d9a23a62d53a6c33e8888db0a37b/llama-index-core/llama_index/core/constants.py#L12), [tools/types.py](https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/tools/types.py#L17)).
- Haystack: `top_k=10` in the in-memory embedding retriever; `run()` accepts `top_k`, but I did not check whether a tool built from it passes that on to the model ([embedding_retriever.py](https://github.com/deepset-ai/haystack/blob/b3d1fbdca2a0bc849271ed1104b543c511472eb9/haystack/components/retrievers/in_memory/embedding_retriever.py#L55)).
- Open WebUI: `RAG_TOP_K` 10; the built-in tool `query_knowledge_files(query, knowledge_ids=None, count=5)` lets the model set `count`, capped by that setting ([config.py](https://github.com/open-webui/open-webui/blob/97ca2144be4ff5509e9f985a39fbccdf7319bf35/backend/open_webui/config.py#L957), [tools/builtin.py](https://github.com/open-webui/open-webui/blob/main/backend/open_webui/tools/builtin.py#L3346)).
