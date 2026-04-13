# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repository is an **agentic QA automation framework** built on Claude Code's multi-agent architecture. It targets **InvenTree** — an open-source inventory management system (Python/Django) — with exclusive focus on the **Parts module**, the core domain entity covering part creation, categorisation, parameters, templates/variants, revisions, stock tracking, BOM management, and related API endpoints.

## Architecture

### Agent Hierarchy

The framework uses an **orchestrator → sub-agent** delegation pattern defined in `.claude/agents/`:

```
orchestrator (entry point — set as default agent in settings.json)
├── test-cases-creator      — Manual/functional test cases from requirements or user stories
├── api-test-cases-creator  — API-specific test cases from OpenAPI/Swagger specs or endpoint descriptions
├── ui-automator            — Converts UI test cases → executable Playwright test scripts
└── api-automator           — Converts API test cases → executable API test scripts
```

**Orchestrator workflow:** Receive request → classify → delegate to one or more sub-agents (in parallel when independent) → collect results → present unified summary. The orchestrator uses Claude Code's `Agent` tool with `subagent_type` matching the agent names above.

### Playwright CLI Skill

The `ui-automator` agent leverages the **playwright-cli** skill (`.claude/skills/playwright-cli/`) for browser automation. Key details:

- **Element targeting** uses snapshot refs (`e15`), CSS selectors, or Playwright locators (`getByRole`, `getByTestId`)
- **Sessions** support concurrent named browsers (`-s=mysession`)
- **Network mocking** via `playwright-cli route` for API stubbing during UI tests
- **Storage management** for auth state persistence (`state-save`/`state-load`)
- Reference docs for advanced topics live in `.claude/skills/playwright-cli/references/`

### Configuration

`.claude/settings.json` sets `orchestrator` as the default agent and runs with `bypassPermissions` mode. The `skill-creator` plugin is enabled.

## InvenTree Demo Instance

The target application is the **InvenTree public demo** at **https://demo.inventree.org** (login page: `https://demo.inventree.org/web/login`). Login credentials and account details are maintained in [`context/inventree-demo.md`](context/inventree-demo.md). The demo database resets daily, so test data should not be assumed to persist across days.

## InvenTree Parts Module — Domain Context

When creating or automating tests, the following InvenTree Parts module areas are in scope:

| Area | Key Concepts |
|------|-------------|
| **Part CRUD** | Create, read, update, delete parts; required fields (name, description, category); active/inactive status |
| **Categories** | Hierarchical part categories; parent-child relationships; structural categories |
| **Parameters** | Part parameter templates; parameter values with units; template-level constraints |
| **Templates & Variants** | Template parts that define variant families; variant parts inheriting from templates |
| **Revisions** | Part revision tracking; revision codes; revision relationships |
| **Stock Tracking** | Stock items linked to parts; stock locations; quantity tracking |
| **BOM (Bill of Materials)** | BOM line items; sub-assembly references; quantity per assembly; substitutes |
| **API Endpoints** | REST API under `/api/part/`, `/api/part/category/`, `/api/part/parameter/`, `/api/bom/`, `/api/stock/` |

### InvenTree API Conventions

- Base URL: `https://demo.inventree.org/api/` (see [`context/inventree-demo.md`](context/inventree-demo.md) for credentials)
- Authentication: Token-based (`Authorization: Token <key>`) or session-based
- Responses are JSON; list endpoints support pagination (`?limit=`, `?offset=`)
- Filtering via query parameters (e.g., `?category=5`, `?active=true`, `?search=`)
- Standard HTTP methods: GET (list/detail), POST (create), PATCH/PUT (update), DELETE

## Commands

### Playwright (UI testing)

```bash
# Check playwright-cli availability
npx --no-install playwright-cli --version

# Install if needed
npm install -g @playwright/cli@latest

# Run Playwright test suite
npx playwright test

# Run a single test file
npx playwright test tests/parts/part-creation.spec.ts

# Run tests with CLI debugging
npx playwright test --debug=cli

# Suppress HTML report auto-open
PLAYWRIGHT_HTML_OPEN=never npx playwright test
```

### Browser Automation (via playwright-cli)

```bash
# Open browser and navigate
playwright-cli open http://localhost:8000
playwright-cli goto http://localhost:8000/part/

# Interact with elements using snapshot refs
playwright-cli snapshot
playwright-cli click e15
playwright-cli fill e5 "New Part Name" --submit

# Save/load auth state
playwright-cli state-save auth.json
playwright-cli state-load auth.json

# Mock API responses during UI tests
playwright-cli route "http://localhost:8000/api/part/**" --body='{"results":[]}'
```

## Test Output Conventions

- **Test case documents** (from test-cases-creator / api-test-cases-creator): Each test case includes ID, title, preconditions, steps, and expected results. Cover positive, negative, boundary, and edge cases.
- **API test cases** additionally include: endpoint, HTTP method, headers, request body, expected status code, and expected response body.
- **Automated scripts** (from ui-automator / api-automator): Follow existing framework patterns; include proper waits, assertions, and error handling.

## Key Decisions

- The default agent is `orchestrator` — all user requests route through it first.
- Sub-agents are stateless; the orchestrator must pass all necessary context in each delegation prompt.
- UI automation uses Playwright via the playwright-cli skill; API automation is framework-agnostic (the api-automator agent selects tooling based on project conventions).
- Agent definitions in `.claude/agents/` with `<!-- TODO -->` comments are intentionally minimal — they are designed to be extended as the framework matures.
