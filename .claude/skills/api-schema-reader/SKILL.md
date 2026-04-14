---
name: api-schema-reader
description: Read and query the InvenTree OpenAPI specification efficiently. Use this skill to extract endpoint details, schema definitions, field constraints, and query parameters for specific API paths instead of loading the full 41K-line YAML spec.
allowed-tools: Bash(python3:*)
---

# API Schema Reader

A Python CLI tool that downloads the InvenTree OpenAPI spec (v477) once, caches it locally, and lets you query specific endpoints and schemas on demand.

**Why use this instead of reading the raw YAML?** The full spec is 41,000+ lines with 297 paths and 461 schemas. This tool extracts only what you need, resolves `$ref` references, and provides field summaries with constraints (type, required, maxLength, nullable, readOnly, defaults).

## Script Location

```
.claude/skills/api-schema-reader/schema_reader.py
```

## Commands

### 1. `list-paths` — Discover available endpoints

```bash
# List all API paths
python3 .claude/skills/api-schema-reader/schema_reader.py list-paths

# Filter to a specific area (e.g., parts, stock, bom)
python3 .claude/skills/api-schema-reader/schema_reader.py list-paths --filter /api/part/
python3 .claude/skills/api-schema-reader/schema_reader.py list-paths --filter /api/stock/
python3 .claude/skills/api-schema-reader/schema_reader.py list-paths --filter /api/bom/
```

Output: `path: METHOD1, METHOD2 [tags]` for each matching path.

### 2. `summary` — Quick overview of an endpoint

```bash
python3 .claude/skills/api-schema-reader/schema_reader.py summary /api/part/
python3 .claude/skills/api-schema-reader/schema_reader.py summary /api/part/{id}/ --method get
```

Output: operationId, description, tags, query param names, request body schema ref, response codes. Best for getting a quick lay of the land before diving deeper.

### 3. `endpoint` — Endpoint details with resolved schemas (depth=2)

```bash
# All methods for a path
python3 .claude/skills/api-schema-reader/schema_reader.py endpoint /api/part/

# Specific method
python3 .claude/skills/api-schema-reader/schema_reader.py endpoint /api/part/ --method post
python3 .claude/skills/api-schema-reader/schema_reader.py endpoint /api/part/{id}/ --method patch
python3 .claude/skills/api-schema-reader/schema_reader.py endpoint /api/part/category/ --method get
```

Output (JSON): path, method, operationId, description, tags, parameters (with types/enums), requestBody (resolved schema), responses (with schemas).

### 4. `endpoint-full` — Deep schema resolution (depth=3) with field summaries

```bash
python3 .claude/skills/api-schema-reader/schema_reader.py endpoint-full /api/part/ --method post
python3 .claude/skills/api-schema-reader/schema_reader.py endpoint-full /api/part/category/{id}/ --method patch
```

Output (JSON): Same as `endpoint` but with deeper $ref resolution and a `_field_summary` section listing each field with its type and constraints in one line. **Use this when writing test cases** — the field summary gives you everything needed for validation tests.

### 5. `schema` — View a specific schema definition

```bash
python3 .claude/skills/api-schema-reader/schema_reader.py schema Part
python3 .claude/skills/api-schema-reader/schema_reader.py schema PartCategory
python3 .claude/skills/api-schema-reader/schema_reader.py schema PatchedPart
python3 .claude/skills/api-schema-reader/schema_reader.py schema DuplicatePart
```

Output (JSON): Full schema with resolved properties and a `_field_summary` mapping each field name to a one-line type+constraints string. If the schema name is not found, suggests similar names.

### 6. `search` — Find paths and schemas by keyword

```bash
python3 .claude/skills/api-schema-reader/schema_reader.py search category
python3 .claude/skills/api-schema-reader/schema_reader.py search bom
python3 .claude/skills/api-schema-reader/schema_reader.py search stock
```

Output: Matching paths (with methods), matching schemas (with property count), and matching operation descriptions.

## Recommended Workflow for Test Case Creation

1. **Start with `list-paths --filter`** to identify all endpoints in scope.
2. **Use `summary`** on each endpoint to understand methods, param counts, and schema refs.
3. **Use `endpoint-full --method`** to get the detailed request/response schema for the specific method you're writing test cases for.
4. **Use `schema`** when you need to inspect a referenced schema in detail (e.g., `DuplicatePart`, `PartCategory`).
5. **Use `search`** when you need to find related endpoints or schemas you might have missed.

## Caching

The spec is downloaded once and cached at:
- `/tmp/inventree-api-477.yaml` (raw YAML)
- `/tmp/inventree-api-477.json` (parsed JSON, faster to load on subsequent calls)

Delete these files to force a re-download.
