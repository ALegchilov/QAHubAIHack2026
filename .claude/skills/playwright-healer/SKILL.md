---
name: playwright-healer
description: Diagnoses and auto-fixes failing Playwright API and UI tests. Invoke when tests fail — it investigates actual API responses via curl, compares with test expectations, patches the test code, and re-runs until green. Escalates after 5 failed attempts per test.
allowed-tools: Bash(curl:*) Bash(npx:*) Bash(python3:*) Bash(cat:*) Bash(TOKEN*) Read Write Edit Grep Glob
---

# Playwright Healer

Automatically diagnose and fix failing Playwright tests by investigating real API behavior and patching test code.

## When to Use

Invoke this skill after running Playwright tests when failures occur. Trigger phrases:
- "heal the tests"
- "fix failing tests"
- "auto-fix test failures"
- Any time test output shows failures that need investigation

## Retry Limit & Escalation

**Each individual test gets a maximum of 5 fix attempts.** Track attempts per test using the test ID (e.g., `ATC-CREATE-003`).

- After each fix attempt, re-run ONLY the specific test to check if it passes.
- If a test still fails after 5 attempts, **stop trying to fix it** and **escalate** it.
- Escalated tests must be added to the escalation report (see Step 7).
- Continue healing other tests — one test hitting the limit does not block the others.

### How to Track Attempts

Maintain a mental ledger during the session:

```
ATC-CREATE-002: attempt 1 → FAIL, attempt 2 → PASS ✓
ATC-CREATE-003: attempt 1 → FAIL, attempt 2 → FAIL, attempt 3 → PASS ✓
ATC-CREATE-016: attempt 1 → FAIL, ... attempt 5 → FAIL → ESCALATE ✗
```

### What Counts as an Attempt

Each time you:
1. Edit the test code (or a helper it depends on), AND
2. Re-run the test to verify

…that is **one attempt** for that test. Investigating via curl alone (without editing + re-running) does not count.

## Workflow

### Step 1 — Obtain Auth Token

```bash
TOKEN=$(curl -s -u "allaccess:nolimits" "https://demo.inventree.org/api/user/token/" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

### Step 2 — Parse Failures

Read the Playwright test output (provided by the caller or from the last run). For each failing test extract:
- **Test name** and **file:line**
- **Error type**: assertion mismatch, TypeError, timeout, HTTP status
- **Expected vs Received** values
- **The failing line** of test code

### Step 3 — Investigate Each Failure

For every failure, `curl` the actual endpoint to see its real response shape:

```bash
# Example: check if endpoint returns paginated envelope or flat array
curl -s -H "Authorization: Token $TOKEN" "https://demo.inventree.org/api/stock/?part=1&limit=5" | python3 -m json.tool | head -20

# Example: check field names and types
curl -s -H "Authorization: Token $TOKEN" "https://demo.inventree.org/api/part/1/" | python3 -m json.tool

# Example: check company/part field names
curl -s -H "Authorization: Token $TOKEN" "https://demo.inventree.org/api/company/part/?limit=2" | python3 -m json.tool | head -30
```

**Batch investigations.** Before making any edits, investigate ALL failures first. Many failures share the same root cause (e.g., flat array vs paginated envelope). Grouping them avoids redundant curl calls and lets you apply a single systemic fix.

Categorize each failure:

| Pattern | Root Cause | Fix Strategy |
|---------|-----------|--------------|
| `Cannot read properties of undefined (reading 'length')` | Response is flat array, not `{results:[]}` | Use `Array.isArray()` guard or add `limit` param |
| `expected X, received null/undefined` | Field missing or named differently | Check actual field name via curl |
| `expected X, received Y` | Wrong default assumption | Update expected value |
| `toBe(N)` on `.count` → `undefined` | No pagination envelope | Use array `.length` instead |
| `401/403` on request | Auth issue | Check token, endpoint path |
| `API endpoint not found` | Wrong endpoint path | Search for correct path via API root |

### Step 4 — Apply Fixes

Read the test file and helpers. Apply targeted fixes:

1. **Response structure mismatches** — If systemic (multiple endpoints), add a helper:
   ```typescript
   // In api-client.ts or test-data.ts
   function getResults(body: any): any[] {
     return Array.isArray(body) ? body : body.results ?? [];
   }
   function getCount(body: any): number {
     return typeof body.count === 'number' ? body.count : (Array.isArray(body) ? body.length : (body.results?.length ?? 0));
   }
   ```

2. **Field name fixes** — Update to match actual API response (e.g., `SKU` → `SKU` or `sku`)

3. **Missing fields** — Some fields only on detail endpoint, not list. Switch to detail GET.

4. **Value type mismatches** — API returns string `"100.0"` but test expects number `100`. Use `Number()`.

5. **Data-dependent tests** — Add `test.skip()` when demo data may not exist.

6. **Wrong endpoint paths** — If an endpoint returns 404 / "API endpoint not found", search for the correct path:
   ```bash
   curl -s -H "Authorization: Token $TOKEN" "https://demo.inventree.org/api/" | python3 -c "import sys,json; [print(k) for k in sorted(json.load(sys.stdin).keys())]"
   ```

### Step 5 — Re-run and Iterate

After applying fixes, re-run tests:

```bash
# Run a single test by name to verify a specific fix
PLAYWRIGHT_HTML_OPEN=never npx playwright test <file-path> --grep "ATC-CREATE-003" 2>&1

# Or run the full file after all fixes
PLAYWRIGHT_HTML_OPEN=never npx playwright test <file-path> 2>&1
```

If failures remain, **increment the attempt counter** for each still-failing test and repeat Steps 3–4. Continue until:
- The test passes, OR
- The test hits **5 failed attempts** → escalate (Step 7)

### Step 6 — Final Report

Output a summary table for ALL tests (passed, fixed, skipped, and escalated):

```
## Healer Results

| Test | Attempts | Root Cause | Fix Applied | Final Status |
|------|----------|-----------|-------------|--------------|
| ATC-CREATE-002 | 1 | notes not set via POST | Verify notes via PATCH then GET | PASS |
| ATC-CREATE-003 | 2 | stock/ returns flat array | Added getResults() helper | PASS |
| ATC-CREATE-016 | 5 | endpoint returns unexpected shape | See escalation report | ESCALATED |
```

### Step 7 — Escalation Report (for tests that hit the 5-attempt limit)

For every escalated test, write a detailed escalation block:

```
## Escalated: ATC-CREATE-016

**Test:** ATC-CREATE-016: Create part with initial_stock quantity=0 (no stock added)
**File:** automation/api/parts/parts-create.spec.ts:666
**Attempts:** 5

### Timeline of Attempts

**Attempt 1** — Changed `stockBody.count` → `stockBody.length` (flat array)
  → Result: FAIL — `stockBody` is not an array either, got `{detail: "..."}`

**Attempt 2** — Endpoint path wrong, tried `/api/stock/?part=X&limit=1`
  → Result: FAIL — Returns paginated but `count=1` (stock WAS created for qty=0)

**Attempt 3** — Changed assertion to check quantity=0 in the stock item
  → Result: FAIL — API rejects initial_stock with quantity=0 (returns 400)

**Attempt 4** — Wrapped in try/catch, check for 400 as valid behavior
  → Result: FAIL — Status is 201 but stock item has quantity=0.0

**Attempt 5** — Asserted stock item exists with qty=0 instead of no stock
  → Result: FAIL — Stock item not created at all, empty results

### Root Cause Analysis
The API behavior for `initial_stock.quantity=0` is inconsistent:
- Sometimes returns 201 with no stock item
- The response structure varies based on server state

### Recommendation
- **Option A:** Skip this test with `test.skip('API behavior for zero-quantity initial_stock is undefined')`
- **Option B:** File a bug against InvenTree — zero-quantity stock behavior should be documented
- **Option C:** Remove this boundary test case if zero-quantity is not a supported scenario
```

**The escalation report is mandatory for every test that hits the limit.** It must include:
1. Full attempt timeline with what was tried and what happened
2. Root cause analysis
3. Actionable recommendation (skip / bug report / remove / manual investigation)

## Fix Rules

1. **Never change test intent.** If a test checks "create returns 201", keep that. Only fix *how* the assertion accesses the data.
2. **Never hard-code PKs.** Keep dynamic lookups.
3. **Always verify via curl first.** Don't guess — confirm actual behavior.
4. **Preserve cleanup logic.** Never remove `createdPartPks.push()` or teardown.
5. **Prefer helper fixes over per-test patches.** If 5 tests fail for the same reason, fix the helper once.
6. **Mark data-dependent skips.** If demo data doesn't exist, use `test.skip()` with a clear message.
7. **Use resilient assertions.** Prefer `toHaveProperty()`, optional chaining (`?.`), and type coercion where API may return mixed types.
8. **Re-run after every edit.** Never assume a fix works — always verify by running the test.
9. **Stop at 5.** Do not attempt a 6th fix for any single test. Escalate immediately.

## Example Healing Session

**Input failure:**
```
ATC-CREATE-003: TypeError: Cannot read properties of undefined (reading 'length')
  at expect(stockBody.results.length) line 127
```

**Investigation:**
```bash
curl -s -H "Authorization: Token $TOKEN" "https://demo.inventree.org/api/stock/?part=1&limit=5" | python3 -m json.tool | head -5
# Output: { "count": 7, "results": [...] }  ← paginated with limit!

curl -s -H "Authorization: Token $TOKEN" "https://demo.inventree.org/api/stock/?part=1" | python3 -c "..."
# Output: array len=7  ← flat array without limit!
```

**Diagnosis:** `/api/stock/` returns a flat array without `limit` param, paginated envelope with `limit`. The test calls without `limit`.

**Fix (attempt 1):** Add helper function + use it in test:
```typescript
// helper
export function getResults(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object' && 'results' in body) return (body as any).results ?? [];
  return [];
}

// test
const stockBody = await stockRes.json();
const stockItems = getResults(stockBody);
expect(stockItems.length).toBeGreaterThanOrEqual(1);
```

**Re-run:** `PLAYWRIGHT_HTML_OPEN=never npx playwright test --grep "ATC-CREATE-003"` → PASS ✓ (attempt 1)
