// Single source for the CV page — both "run" mode and "recruiter mode" render from this.
// Facts come from Matthias' own CV (2026). Employer-internal figures (headcounts, internal
// activity counts) are deliberately left out — docs/decisions/0006-confidentiality.md.

export type Fight = { boss: string; hp?: number; result: string; line: string; gold?: boolean };
export type Segment = {
  id: string;
  org: string;
  role: string;
  from: number;
  to: number | null;
  place: string;
  fights: Fight[];
};

export const PERSON = {
  name: 'Matthias Nordwig',
  role: 'Technical lead · AI systems in regulated finance',
  email: 'matthias.nordwig@programmiere.de',
  linkedin: 'https://www.linkedin.com/in/matthias-nordwig-989269191/',
  location: 'Frankfurt Rhine-Main, Germany',
  summary:
    'Technical lead with 15+ years in financial services, combining regulated enterprise architecture (SEPA, data warehousing, EBA/Basel) with hands-on building of modern AI systems: audit-ready RAG platforms, agentic workflows and on-device AI in Rust. Turns complex requirements into production systems — and stakeholder gridlock into delivery.',
};

export const RUN: Segment[] = [
  {
    id: 'entory', org: 'entory AG', role: 'Consultant', from: 2006, to: 2007, place: 'Germany',
    fights: [
      { boss: 'Critically escalated data-warehouse project', hp: 2000, result: 'Stepped up as technical lead, restored client trust, delivered.', line: 'Stepped up as technical lead to rescue a critically escalated data-warehouse project (2,000 person-days) and secured delivery.' },
      { boss: 'IFRS KPIs that kept changing', result: 'Self-service ETL so business units model KPIs without blocking engineering.', line: 'Engineered a self-service ETL architecture so business units could model shifting IFRS KPIs without blocking engineering.' },
    ],
  },
  {
    id: 'bearingpoint', org: 'BearingPoint', role: 'Consultant → Manager', from: 2007, to: 2012, place: 'Frankfurt',
    fights: [
      { boss: 'Credit early-warning system', hp: 6000, result: 'Designed and delivered; scaled from HVB to the wider UniCredit group.', line: 'Directed design and implementation of a credit early-warning system (6,000 person-days), scaled from HVB to the wider UniCredit group.' },
      { boss: 'SEPA Direct Debit rollout at a Landesbank', hp: 1500, result: 'Led data architecture and integration.', line: 'Led data architecture and integration for a SEPA Direct Debit rollout at a major Landesbank (1,500 person-days).' },
      { boss: 'FSA liquidity architecture after 6 months of gridlock', result: 'Shipped in 3 months by reverse-engineering a proprietary data mart.', line: 'Resolved six months of stakeholder gridlock and delivered an FSA liquidity architecture in three months by reverse-engineering a proprietary data mart.', gold: true },
      { boss: 'An empty practice', result: 'Built the Risk Management & Early Warning practice from scratch.', line: 'Built the Risk Management & Early Warning consulting practice from scratch.' },
    ],
  },
  {
    id: 'kfw-consulting', org: 'KfW', role: 'Project Manager, Inhouse Consulting', from: 2012, to: 2014, place: 'Frankfurt',
    fights: [
      { boss: 'Getting a compliance transformation approved', result: 'Project and financial steering framework that won executive approval.', line: 'Designed a project and financial steering framework that secured executive approval for a major compliance transformation.' },
      { boss: 'Reputational risk & KYC', result: 'Target operating models for the C-level.', line: 'Delivered C-level target operating models for reputational risk and KYC.' },
    ],
  },
  {
    id: 'kfw-compliance', org: 'KfW', role: 'Senior Manager, Compliance', from: 2014, to: 2018, place: 'Frankfurt',
    fights: [
      { boss: 'Horizon scanning meets impact assessment', hp: 5000, result: 'Automated workflow system connecting both.', line: 'Engineered automated workflows integrating regulatory horizon scanning with internal impact assessments (5,000 person-days).' },
      { boss: 'One compliance process, 100+ international offices', result: 'Designed the global process.', line: 'Designed global compliance processes across 100+ international offices.' },
      { boss: 'EBA, Basel, FSB', result: 'Analytical frameworks for regulatory impact assessments.', line: 'Delivered analytical frameworks for regulatory impact assessments (EBA, Basel, FSB).' },
    ],
  },
  {
    id: 'kfw-ai', org: 'KfW', role: 'Senior Manager (Technical Lead), Data Analytics & AI', from: 2018, to: null, place: 'Frankfurt',
    fights: [
      { boss: 'No GenAI capability yet', result: 'Bootstrapped an internal GenAI R&D function and took prototypes to production.', line: 'Bootstrapped an internal GenAI R&D function and scaled adoption through enablement and production transition of prototypes.' },
      { boss: 'Regulatory content nobody can search', result: 'Architected and built an audit-ready RAG platform — design, backend, compliance documentation.', line: 'Architected and implemented an audit-ready RAG platform for semantic search across regulatory content, from system design to compliance documentation.' },
      { boss: 'Complex data integrations', result: 'Prototyped an autonomous SQL IDE; a typical integration down to 2 days.', line: 'Prototyped an autonomous SQL IDE (Codex/DuckDB) that cut complex FSI data integrations to two days.', gold: true },
      { boss: 'Enterprise delivery', hp: 6000, result: 'Led end-to-end delivery at up to 6,000 person-days of scope.', line: 'Led end-to-end delivery of enterprise systems with scopes up to 6,000 person-days.' },
    ],
  },
];

export const SIDE_QUESTS = [
  {
    name: 'Matrix',
    pb: '2 weeks',
    what: 'Production-grade offline RAG app — pure-Rust core, Tauri, runs on macOS and iPhone. On-device ONNX and GGUF inference, layout-aware PDF chunking, GraphRAG ontology extraction.',
    note: 'Scaled from a 48-hour proof of concept.',
    href: '/projects/matrix/',
  },
  {
    name: 'GDPR Compliant ReCaptcha',
    pb: '~4,000 installs',
    what: 'WordPress spam protection without Google: proof of work in the browser instead of tracking.',
    note: 'Maintained by an autonomous loop with a deterministic approval gate.',
    href: '/projects/maintainer-loop/',
  },
  {
    name: 'Whistle-Blower.net',
    pb: 'Founder',
    what: 'Privacy-preserving B2B compliance SaaS with a zero-dependency architecture and password-less flows.',
    note: 'No third-party services — full data control by design.',
    href: null,
  },
];

export const LOADOUT = [
  { slot: 'AI & GenAI', items: ['RAG pipelines', 'embeddings & semantic search', 'agentic workflows', 'on-device AI (ONNX, GGUF)', 'human-in-the-loop systems'] },
  { slot: 'Engineering', items: ['Rust', 'Python', 'TypeScript', 'LangChain / LangGraph', 'MLflow', 'PGVector, FAISS, DuckDB', 'SQL & data modeling'] },
  { slot: 'Architecture', items: ['hybrid & offline-first systems', 'cross-platform builds', 'containerized deployment', 'legacy modernization'] },
  { slot: 'Governance', items: ['EU AI Act', 'auditability & explainability', 'data residency', 'privacy architecture', 'EBA / Basel / FSB'] },
  { slot: 'Delivery', items: ['end-to-end ownership', 'PRDs & user journeys', 'prototype → production', 'stakeholder alignment'] },
];

export const EXTRAS = {
  education: ['M.Sc. Information Systems — Europa-Universität Viadrina', 'B.Sc. Information Systems — BA Weserbergland'],
  publications: ['Optimized Early Warning Processes (2012)', 'Modern Credit Risk Management (2011, German)'],
  languages: ['German (native)', 'English (fluent)', 'French (basic)'],
  origin: 'Writing code since age eight — C, C++, Delphi.',
};
