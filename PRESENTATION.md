# Dark Factory — Agentic QA Automation Framework

---

## Slide 1 — WHO

**Team AsynAwaitAdventurers**

- Kiryl Bahdanets
- Dzmitry Shaplyka
- Alexandr Legchilov

QA engineers who believe testing should be driven by intent, not boilerplate.

---

## Slide 2 — WHAT: The Problem and Our Solution

QA teams hit the same three-stage bottleneck: writing test cases manually, hand-coding automation, and maintaining it all as APIs change.

We built Dark Factory — a framework that collapses this into one prompt. Describe what to test in plain English — the framework generates test cases, writes Playwright specs, runs them against a live environment, and self-heals failures.

**Tech stack:** Claude Code, Playwright, Playwright CLI

**Why Claude Code?** Three native capabilities no other tool offered:

- **Multi-agent delegation** — four agents defined in markdown, no external framework
- **PostToolUse hooks** — reactive automation triggered by file writes
- **Skills** — domain-specific tools scoped to each agent

---

## Slide 3 — WHAT: Architecture and Live Demo

**Four agents:** Orchestrator (Opus) delegates to three Sonnet specialists — Test Cases Creator for UI, API Test Cases Creator for endpoints, and Playwright Healer for self-fixing failures.

**Three skills:** API Schema Reader queries a 41,000-line OpenAPI spec so agents get 20 lines of context instead of 200. Playwright CLI drives browser automation. Playwright Healer enforces a 5-attempt fix cycle with mandatory escalation.

**One hook** closes the loop — writing a test case automatically triggers spec generation, execution, and healing. No manual steps.

**The flow:** Classify the request, extract the schema, generate test cases, implement the spec, heal failures.

**Demo prompt:** *"Generate full end-to-end tests for the Parts create API endpoint."*

One prompt in. Twenty passing tests out.

---

## Slide 4 — WHY: Results and Benefits

**141** test cases | **39** automated specs | **4** agents | **1** hook | **0** lines written by a human

- **Speed** — days of QA work done in minutes
- **Accuracy** — test cases generated from the actual API spec, not outdated docs
- **Self-healing** — broken tests get fixed automatically, or escalated with full context
- **Target-agnostic** — swap the API spec and context, test any REST API
- **Zero overhead** — no LangChain, no glue code, just markdown definitions and Claude Code's runtime

QA has always been a downstream bottleneck. Dark Factory turns it into a prompt.

---

*AsynAwaitAdventurers — Built with Claude Code, 2026 AI Hackathon*
