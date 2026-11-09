# Data files for "A 9B with an agentic search loop beat a 35B MoE with one-shot retrieval"

Contents of this folder:

- `questions.json`: the questions with gold facts and accepted spellings. The questions are cleaned: personal names are replaced by roles.
- `berichte26.csv`, `challenger.csv`: the source documents (title, publisher, date, original URL, licence, SHA256 of the text).
- `*.csv`: one file per run, one row per question (facts found, searches, hits per search, largest prompt, time, stop reason). `per-run-csv.zip` bundles further per-run CSVs.
- `*.jsonl`: example traces (one line per question: search rounds, tool calls with arguments, returned section ids with their headings, and the answer).
- Column values in the CSVs: `mode` is `no_search`, `one_shot` (one search up front) or `agentic` (the model searches in a loop); `trap_automatic` is `refused` or `not_refused` (did the answer say the information is not in the documents), `trap_cross_checked` is `correct` or `incorrect` (second check of the same trap answer).
- Questions D7 and N13 are removed from all downloads (`questions.json`, all CSVs, traces), because their details point to identifiable persons. The numbers in the article include them, so sums over the published CSVs are slightly smaller.

Traces: only traces that contain no personal names are published. The other traces quote names of private persons, victims or named officials from the reports and are available on request.

The traces contain no whole sections, only section ids, the first line of each hit, the heading path and the model answers, which partly quote the reports. These excerpts come from official reports (Rogers Commission report on the Challenger accident, 1986; 14 audit and accident reports from October/November 2026 by the Austrian Rechnungshof, the Swiss EFK, the European Court of Auditors, NTSB, MAIB and RAIB). The originals and their licences are listed with URL in `berichte26.csv` and `challenger.csv`; please cite the original publisher when reusing excerpts. Model answers and scores are measurement data produced for this article.
