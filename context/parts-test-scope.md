# InvenTree Parts Module — Test Scope

## Target Application

- **URL:** https://demo.inventree.org
- **Login credentials:** See `context/inventree-demo.md`

## Documentation URLs

Visit and extract knowledge from ALL of the following pages. Do not skip any:

| # | Page | URL |
|---|------|-----|
| 1 | Parts overview (attributes, categories, UoM, images, import) | `https://docs.inventree.org/en/stable/part/` |
| 2 | Creating Parts | `https://docs.inventree.org/en/stable/part/create/` |
| 3 | Virtual Parts | `https://docs.inventree.org/en/stable/part/virtual/` |
| 4 | Part Views (detail tabs, parameters, stock, BOM, etc.) | `https://docs.inventree.org/en/stable/part/views/` |
| 5 | Part Tracking (serial numbers, batch codes) | `https://docs.inventree.org/en/stable/part/trackable/` |
| 6 | Part Revisions | `https://docs.inventree.org/en/stable/part/revision/` |
| 7 | Part Templates (variants) | `https://docs.inventree.org/en/stable/part/template/` |
| 8 | Part Tests (test templates) | `https://docs.inventree.org/en/stable/part/test/` |
| 9 | Part Pricing | `https://docs.inventree.org/en/stable/part/pricing/` |
| 10 | Part Stocktake | `https://docs.inventree.org/en/stable/part/stocktake/` |
| 11 | Part Notifications | `https://docs.inventree.org/en/stable/part/notification/` |
| 12 | Bill of Materials (BOM) | `https://docs.inventree.org/en/stable/manufacturing/bom/` |

If you discover additional sub-pages during crawling, visit those too.

## Required Test Coverage

The generated test cases MUST cover the following areas at minimum. Each area must have positive, negative, and boundary/edge-case scenarios.

### 1. Part Creation

- Manual part creation with all required fields
- Manual part creation with all optional fields populated
- Part import flows (if supported via UI)
- Validation of required fields (name, description, category)
- Duplicate IPN (Internal Part Number) handling
- Creating parts in different categories

### 2. Part Detail View — All Tabs

Generate test cases for navigating to and interacting with EACH of these tabs on a part detail page:

- **Stock** tab — viewing stock items, stock levels
- **BOM** tab — viewing and managing bill of materials
- **Allocated** tab — viewing allocated stock
- **Build Orders** tab — viewing associated build orders
- **Parameters** tab — viewing and managing part parameters
- **Variants** tab — viewing part variants (for template parts)
- **Revisions** tab — viewing part revision history
- **Attachments** tab — uploading and managing attachments
- **Related Parts** tab — viewing and adding related parts
- **Test Templates** tab — viewing and managing test templates (for trackable parts)

### 3. Part Categories

- Category hierarchy (parent-child relationships)
- Filtering parts by category
- Parametric tables within categories
- Structural categories vs. regular categories
- Creating, editing, deleting categories

### 4. Part Attributes (Boolean Flags)

Each of these attributes must have dedicated test cases exploring their behavior:

- **Virtual** — part with no physical stock
- **Template** — part that serves as a template for variants
- **Assembly** — part that can be assembled from a BOM
- **Component** — part that can be used as a BOM component
- **Trackable** — part requiring serial number tracking
- **Purchaseable** — part that can be purchased from suppliers
- **Salable** — part that can be sold to customers
- **Active / Inactive** — status toggling and restrictions on inactive parts

### 5. Units of Measure

- Configuring units of measure for a part
- Unit conversion behavior
- Parts with and without units

### 6. Part Revisions

- Creating a new revision of a part
- Revision code uniqueness constraints
- Circular reference prevention (a revision cannot reference itself or create loops)
- Template restriction rules for revisions
- Revision-of-revision prevention (if applicable)
- Viewing revision history

### 7. Negative & Boundary Scenarios (cross-cutting)

- Duplicate IPN enforcement
- Inactive part restrictions (e.g., cannot add stock to inactive part)
- Maximum field length inputs
- Special characters in part names, descriptions, IPN
- Empty/whitespace-only inputs for required fields
- Creating a part with no category
- Deleting a part that has stock, BOM references, or build orders

## Output File Structure

Create one `.md` file per functional area in `test-cases/`:

```
test-cases/
├── TC-part-creation.md          — Part creation (manual entry and import flows)
├── TC-part-detail-views.md      — Part detail view: all tabs listed above
├── TC-categories.md             — Part categories: hierarchy, filtering, parametric tables
├── TC-part-attributes.md        — Part attributes: all boolean flags listed above
├── TC-units-of-measure.md       — Units of measure configuration and behavior
├── TC-parameters.md             — Part parameters and parameter templates
├── TC-templates-variants.md     — Template parts and variant management
├── TC-revisions.md              — Part revisions: creation, constraints, circular refs
├── TC-bom.md                    — Bill of Materials management
├── TC-stock-tracking.md         — Stock items linked to parts
├── TC-negative-boundary.md      — Cross-cutting negative and boundary scenarios
└── TC-<additional-area>.md      — Any additional areas discovered during research
```
