# Agentic QA Automation Framework

---

## 1. The Problem

QA teams write test cases manually, hand-code automation, then maintain it as APIs change. Every step is a bottleneck.

We collapsed this into one pipeline: describe what to test in plain English — the framework generates test cases, writes Playwright specs, runs them live, and self-heals failures.

---

## 2. Why Claude Code?

We evaluated Copilot, Cursor, and GPT agents. Claude Code won on three capabilities:

- **Multi-agent delegation** — four agents, no external framework, just markdown definitions and Claude Code's native runtime
- **PostToolUse hooks** — shell hooks that fire after tool calls, creating a reactive automation pipeline
- **Skills** — domain-specific tools loaded at agent init: an OpenAPI parser, browser control, and a healing protocol

---

## 3. What We Built

**Four agents working together:**

- **Orchestrator** (Opus) — routes requests, triggers automation, coordinates healing
- **Test Cases Creator** (Sonnet) — generates UI test cases from documentation
- **API Test Cases Creator** (Sonnet) — generates API test cases from OpenAPI specs
- **Playwright Healer** (Sonnet) — diagnoses and fixes failing tests, up to 5 attempts per test

**Three skills:**

- **API Schema Reader** — queries a 41,000-line OpenAPI spec so agents get 20 lines of context instead of 200
- **Playwright CLI** — browser automation with snapshot references, session management, and network mocking
- **Playwright Healer** — structured retry protocol with mandatory escalation reports

**One hook** that closes the loop — when a test case file is written, the hook automatically triggers spec generation, execution, and healing.

---

## 4. Live Demo

Prompt: *"Generate full end-to-end tests for the Parts create API endpoint."*

**What happens:**

1. Orchestrator classifies the request and delegates to the API Test Cases Creator
2. The agent queries the OpenAPI spec via the Schema Reader skill — gets field definitions, constraints, types
3. Twenty test cases are generated in structured markdown
4. The hook fires — maps test cases to a Playwright spec
5. The orchestrator generates the spec and runs it
6. Twenty tests pass against the live InvenTree API

**One prompt in. Twenty passing tests out.**

---

## 5. Results

- 141 test cases generated
- 39 automated Playwright specs
- 4 coordinated agents
- 1 hook closing the loop
- 0 lines of test code written by a human

The architecture is target-agnostic — swap the API spec and context, and it works for any REST API.

---

*AsynAwaitAdventurers — Built with Claude Code, 2026 AI Hackathon*
