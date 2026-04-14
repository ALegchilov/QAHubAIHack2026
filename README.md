# Agentic QA Automation Framework

An AI-powered QA automation framework built on [Claude Code](https://claude.ai/code)'s multi-agent architecture. Point it at a feature scope, and it generates test cases, writes Playwright test scripts, runs them, and auto-fixes failures — all without manual intervention.

The target application is **InvenTree** (open-source inventory management), currently focused on the **Parts module**.

## How It Works

The framework follows a simple pipeline: **describe what to test** and the agents take it from there.

```
You: "Generate tests for the Parts API"
         |
         v
   Orchestrator (the brain)
         |
    +----+----+
    |         |
    v         v
 UI Test    API Test        <-- Stage 1: AI agents write detailed
 Cases      Cases               test cases in markdown
    |         |
    v         v
 [Hook fires automatically] <-- Stage 2: A hook detects new test
    |         |                  case files and triggers auto-
    v         v                  implementation
 Playwright  Playwright     <-- Stage 3: Orchestrator generates
 UI Specs    API Specs           executable test scripts
    |         |
    v         v
 Run tests, heal failures   <-- Stage 4: Tests run, and failing
                                 tests are auto-diagnosed & fixed
```

### The Agents

| Agent | Job |
|-------|-----|
| **Orchestrator** | The coordinator. Receives your request, delegates to the right agents, implements test specs when the hook fires, runs tests, and heals failures. |
| **test-cases-creator** | Reads requirements/user stories and produces detailed manual UI test cases (positive, negative, boundary, edge cases). |
| **api-test-cases-creator** | Reads OpenAPI specs and produces detailed API test cases covering CRUD, filtering, validation, and error handling. |
| **playwright-healer** | Diagnoses why a Playwright test is failing (inspects actual API responses, compares with expectations) and patches the test code. |

### The Hook (the magic glue)

The key innovation is a **PostToolUse hook** (`.claude/hooks/on-test-case-written.sh`). Every time a test case markdown file is written or edited, this hook fires and tells the orchestrator:

> "Hey, a test case file just changed. Here's the file and where its corresponding spec should live. Go implement it."

The orchestrator then:
1. Reads the test case
2. Generates (or updates) a Playwright spec
3. Runs the spec
4. If tests fail, hands them to the `playwright-healer` to fix

This means **writing a test case automatically produces a working automated test** — no manual "now automate this" step needed.

## Project Structure

```
.
├── .claude/
│   ├── agents/                  # Agent definitions
│   │   ├── orchestrator.md      # Main coordinator
│   │   ├── test-cases-creator.md
│   │   ├── api-test-cases-creator.md
│   │   └── playwright-healer.md
│   ├── hooks/
│   │   └── on-test-case-written.sh  # Auto-implementation trigger
│   ├── skills/                  # Reusable skills
│   │   ├── playwright-cli/      # Browser automation
│   │   ├── playwright-healer/   # Test failure diagnosis
│   │   └── api-schema-reader/   # OpenAPI spec reader
│   └── settings.json            # Framework config
├── context/                     # Test scope & app config
│   ├── inventree-demo.md        # Target app credentials
│   └── parts-test-scope.md      # What to test
├── output/                      # Generated test cases (markdown)
│   ├── TC-*.md                  # UI test cases
│   └── api-tests/ATC-*.md      # API test cases
├── tests/                       # Generated Playwright specs
│   └── api/
│       ├── fixtures/            # Shared test fixtures
│       ├── helpers/             # Auth, API client, test data utils
│       └── parts/               # Part-related test specs
├── playwright.config.ts
└── CLAUDE.md                    # Instructions for Claude Code
```

## Getting Started

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- Node.js (for Playwright)

### Setup

```bash
npm install
```

### Usage

Start Claude Code in the project directory — the orchestrator agent loads automatically.

**Generate API test cases:**
```
> Generate API test cases for the Parts endpoints
```

**Generate UI test cases:**
```
> Generate UI test cases for part creation and categories
```

**Run the full pipeline:**
```
> Run the full pipeline for the Parts module
```

The agents will generate test cases, the hook will trigger auto-implementation, tests will run, and failures will be auto-healed. You get a summary at the end.

## Target Application

The framework targets the [InvenTree demo instance](https://demo.inventree.org) — an open-source inventory management system. The demo database resets daily, so tests use unique data to avoid collisions.

Currently scoped to the **Parts module**: part CRUD, categories, parameters, templates/variants, revisions, stock tracking, and BOM management.

## How to Extend

1. **New test scope** — Add a context file in `context/` describing what to test, then ask the orchestrator to generate tests for it.
2. **New API area** — The `api-test-cases-creator` can read any OpenAPI spec. Point it at new endpoints.
3. **New agents** — Add agent definitions in `.claude/agents/` and register them in the orchestrator's tools list.
