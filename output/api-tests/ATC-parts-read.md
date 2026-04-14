# Parts: Read — API Test Cases

> API Spec: InvenTree OpenAPI v477
> Generated: 2026-04-13
> Target: https://demo.inventree.org/api/

## Summary

| ID | Title | Priority | Type |
|----|-------|----------|------|
| ATC-READ-001 | List parts with limit and offset (paginated envelope) | High | Positive |
| ATC-READ-002 | List parts without limit parameter (flat array response) | High | Positive |
| ATC-READ-003 | Verify paginated response envelope structure | High | Positive |
| ATC-READ-004 | Pagination: limit=1, offset=0 — single result | Medium | Positive |
| ATC-READ-005 | Pagination: offset beyond total count — empty results | Medium | Boundary |
| ATC-READ-006 | Pagination: limit=0 — edge case | Low | Edge Case |
| ATC-READ-007 | Verify list result object contains all expected fields | High | Positive |
| ATC-READ-008 | Retrieve a single part by pk | High | Positive |
| ATC-READ-009 | Verify all readOnly computed fields on part detail | High | Positive |
| ATC-READ-010 | Verify field types on part detail response | High | Positive |
| ATC-READ-011 | Filter parts: active=true | Medium | Positive |
| ATC-READ-012 | Filter parts: active=false | Medium | Positive |
| ATC-READ-013 | Filter parts: assembly=true | Medium | Positive |
| ATC-READ-014 | Filter parts: component=true | Medium | Positive |
| ATC-READ-015 | Filter parts: is_template=true | Medium | Positive |
| ATC-READ-016 | Filter parts: purchaseable=true | Medium | Positive |
| ATC-READ-017 | Filter parts: salable=true | Medium | Positive |
| ATC-READ-018 | Filter parts: trackable=true | Medium | Positive |
| ATC-READ-019 | Filter parts: virtual=true | Medium | Positive |
| ATC-READ-020 | Filter parts by category (direct children only) | High | Positive |
| ATC-READ-021 | Filter parts by category with cascade=true (includes subcategories) | High | Positive |
| ATC-READ-022 | Search: exact name match | High | Positive |
| ATC-READ-023 | Search: partial name match | High | Positive |
| ATC-READ-024 | Search: no results for unmatched term | Medium | Negative |
| ATC-READ-025 | Filter by IPN exact match | Medium | Positive |
| ATC-READ-026 | Filter: has_ipn=true | Medium | Positive |
| ATC-READ-027 | Filter: has_ipn=false | Medium | Positive |
| ATC-READ-028 | Filter: has_stock=true | Medium | Positive |
| ATC-READ-029 | Filter: has_stock=false | Medium | Positive |
| ATC-READ-030 | Ordering: ascending by name | Medium | Positive |
| ATC-READ-031 | Ordering: descending by name | Medium | Positive |
| ATC-READ-032 | Ordering: by creation_date ascending | Low | Positive |
| ATC-READ-033 | Ordering: by in_stock descending | Low | Positive |
| ATC-READ-034 | Combined filters: active=true, category, search | Medium | Positive |
| ATC-READ-035 | category_detail=true on list endpoint | Medium | Positive |
| ATC-READ-036 | parameters=true on list endpoint | Medium | Positive |
| ATC-READ-037 | Part detail vs list endpoint field set comparison | Low | Positive |
| ATC-READ-038 | GET non-existent part pk — expect 404 | High | Negative |
| ATC-READ-039 | GET with invalid pk format (string) — expect 404 | High | Negative |
| ATC-READ-040 | GET without authentication — expect 401 | High | Negative |
| ATC-READ-041 | GET with reader account (read-only) — expect 200 | High | Positive |
| ATC-READ-042 | Verify response field types on part with stock | High | Positive |
| ATC-READ-043 | Filter parts: locked=true | Medium | Positive |
| ATC-READ-044 | Filter parts: is_variant=true | Medium | Positive |
| ATC-READ-045 | Filter parts: is_revision=true | Medium | Positive |
| ATC-READ-046 | Filter by name_regex | Medium | Positive |
| ATC-READ-047 | Filter by IPN_regex | Medium | Positive |
| ATC-READ-048 | Pagination: large offset with limit — empty results | Medium | Boundary |
| ATC-READ-049 | category_detail and parameters combined on detail endpoint | Low | Positive |
| ATC-READ-050 | List parts with invalid boolean filter value | Low | Negative |

---

## ATC-READ-001: List parts with limit and offset (paginated envelope)

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user via `GET /api/user/token/`
- At least 10 parts exist in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?limit=10&offset=0
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth (username: `allaccess`, password: `nolimits`)
2. Send `GET /api/part/?limit=10&offset=0` with the Authorization header

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<integer greater than 0>",
  "next": "<URL string or null>",
  "previous": null,
  "results": [
    {
      "pk": "<integer>",
      "name": "<string>",
      "active": "<boolean>"
    }
  ]
}
```

**Validation Points:**
- Status code is 200
- Response body is a JSON object (NOT an array)
- `count` field is present and is an integer >= 0
- `next` field is present (string URI or null)
- `previous` field is present and is null (since offset=0)
- `results` field is present and is an array
- `results` array has exactly 10 items (or fewer if total count < 10)
- Each item in `results` has at minimum: `pk`, `name`, `active`

---

## ATC-READ-002: List parts without limit parameter (flat array response)

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:** (none)

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/` with no query parameters

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
[
  {
    "pk": 1,
    "name": "Resistor 10k Ohm",
    "active": true
  }
]
```

**Validation Points:**
- Status code is 200
- Response body is a JSON **array** (NOT an object with `count`/`results`)
- Array contains part objects, each with `pk`, `name`, `active` fields
- No pagination envelope (`count`, `next`, `previous` keys must NOT be present at top level)
- Array may contain all parts in the database (not limited)

---

## ATC-READ-003: Verify paginated response envelope structure

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least 2 parts exist in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?limit=1&offset=0
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?limit=1&offset=0`
3. Verify the response structure contains all required envelope fields
4. Follow the `next` URL from the response and verify it returns the next page

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": 150,
  "next": "https://demo.inventree.org/api/part/?limit=1&offset=1",
  "previous": null,
  "results": [
    {
      "pk": 1,
      "name": "Resistor 10k Ohm"
    }
  ]
}
```

**Validation Points:**
- `count` is an integer representing total number of parts (not just on this page)
- `next` is a non-null string URI (because total count > 1 and offset=0)
- `previous` is null (because this is the first page, offset=0)
- `results` is an array with exactly 1 element
- Following `next` URL returns another page with `previous` pointing back

---

## ATC-READ-004: Pagination: limit=1, offset=0 — single result

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one part exists in the database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?limit=1&offset=0
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?limit=1&offset=0`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<total_parts_integer>",
  "next": "<next_page_url_or_null>",
  "previous": null,
  "results": [
    {"pk": "<integer>", "name": "<string>"}
  ]
}
```

**Validation Points:**
- Status code is 200
- `results` array contains exactly 1 item
- `count` reflects total number of parts in database
- `previous` is null
- If `count > 1`, `next` is a non-null string URL

---

## ATC-READ-005: Pagination: offset beyond total count — empty results

**Priority:** Medium
**Type:** Boundary

**Preconditions:**
- Valid API token obtained for `allaccess` user
- Total number of parts in database is known (< 999999)

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?limit=10&offset=999999
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?limit=10&offset=999999`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<actual_total>",
  "next": null,
  "previous": "<previous_page_url>",
  "results": []
}
```

**Validation Points:**
- Status code is 200 (not 404)
- `results` is an empty array `[]`
- `count` still reflects the actual total number of parts
- `next` is null (no more pages)
- `previous` may be non-null (pointing to a valid previous page)

---

## ATC-READ-006: Pagination: limit=0 — edge case

**Priority:** Low
**Type:** Edge Case

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?limit=0
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?limit=0`

**Expected Response:**
- **Status Code:** 200 or 400
- **Key Response Fields (if 200):**
```json
{
  "count": "<integer>",
  "next": null,
  "previous": null,
  "results": []
}
```

**Validation Points:**
- If status 200: `results` array is empty and `count` reflects total parts
- If status 400: response contains an error explaining why limit=0 is invalid
- Assumption: Django REST Framework typically returns 200 with empty results for limit=0, but this may vary. Record actual behavior.

---

## ATC-READ-007: Verify list result object contains all expected fields

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one part exists in the database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?limit=1
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?limit=1`
3. Inspect the first object in `results`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": 1,
  "results": [
    {
      "pk": 1,
      "name": "Resistor 10k Ohm",
      "IPN": "",
      "description": "Standard 10k resistor",
      "category": 5,
      "active": true,
      "assembly": false,
      "component": true,
      "is_template": false,
      "purchaseable": true,
      "salable": false,
      "trackable": false,
      "virtual": false,
      "testable": false,
      "locked": false,
      "revision": "",
      "full_name": "Resistor 10k Ohm",
      "thumbnail": "<string>",
      "barcode_hash": "<string>",
      "starred": false,
      "in_stock": 0.0,
      "category_name": "Resistors"
    }
  ]
}
```

**Validation Points:**
- `pk` is a positive integer
- `name` is a non-empty string
- `IPN` is a string (may be empty)
- `description` is a string (may be empty)
- `category` is an integer or null
- `active`, `assembly`, `component`, `is_template`, `purchaseable`, `salable`, `trackable`, `virtual`, `testable`, `locked` are all booleans
- `revision` is a string or null
- `full_name` is a non-empty string
- `thumbnail` is a string (readOnly)
- `barcode_hash` is a string (readOnly)
- `starred` is a boolean (readOnly)
- `in_stock` is a number or null (readOnly)
- `category_name` is a string (readOnly)

---

## ATC-READ-008: Retrieve a single part by pk

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A part exists in the database (use pk=1 or a known pk from the demo dataset)

**Endpoint:** `GET /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. (Optional) List parts via `GET /api/part/?limit=1` to find a valid pk
3. Send `GET /api/part/1/` (substituting a known valid pk)

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "pk": 1,
  "name": "Resistor 10k Ohm",
  "description": "Standard through-hole resistor",
  "category": 5,
  "active": true,
  "full_name": "Resistor 10k Ohm",
  "barcode_hash": "<non-empty string>",
  "thumbnail": "<string>",
  "starred": false
}
```

**Validation Points:**
- Status code is 200
- Response is a JSON object (not an array)
- `pk` matches the requested ID
- All fields from the Part schema are present in the response
- readOnly fields (`full_name`, `barcode_hash`, `thumbnail`, `starred`, `creation_date`, `category_name`) are present
- Response does NOT include `count`, `next`, `previous` (those are list-only envelope fields)

---

## ATC-READ-009: Verify all readOnly computed fields on part detail

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A part exists with at least one stock item (to produce non-null `in_stock`)

**Endpoint:** `GET /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Find a part pk that has stock items (check via `GET /api/part/?limit=10&has_stock=true`)
3. Send `GET /api/part/<pk>/`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "pk": 42,
  "full_name": "Resistor 10k Ohm",
  "barcode_hash": "a1b2c3d4e5f6",
  "thumbnail": "/media/part_images/thumbnails/part_42.png",
  "creation_date": "2024-01-15",
  "starred": false,
  "in_stock": 250.0,
  "total_in_stock": 250.0,
  "unallocated_stock": 240.0,
  "stock_item_count": 3,
  "category_name": "Resistors",
  "pricing_min": "0.010000",
  "pricing_max": "0.050000",
  "revision_count": 0,
  "allocated_to_build_orders": 10.0,
  "allocated_to_sales_orders": 0.0,
  "building": 0.0,
  "ordering": 0.0
}
```

**Validation Points:**
- `full_name` is a non-empty string (readOnly, computed from name/IPN/revision format)
- `barcode_hash` is a non-empty string (readOnly)
- `thumbnail` is a string (readOnly; may be empty string or path)
- `creation_date` is a date string in `YYYY-MM-DD` format or null (readOnly)
- `starred` is a boolean (readOnly, user-specific)
- `in_stock` is a float or null (readOnly)
- `total_in_stock` is a float or null (readOnly)
- `unallocated_stock` is a float or null (readOnly)
- `stock_item_count` is an integer or null (readOnly)
- `category_name` is a string (readOnly)
- `pricing_min` is a decimal string matching `^-?\d{0,13}(?:\.\d{0,6})?$` or null (readOnly)
- `pricing_max` is a decimal string or null (readOnly)
- `revision_count` is an integer or null (readOnly)
- `allocated_to_build_orders` is a float or null (readOnly)
- `allocated_to_sales_orders` is a float or null (readOnly)
- `building` is a float or null (readOnly)
- `ordering` is a float or null (readOnly)
- None of these fields can be written via POST/PATCH (they are readOnly)

---

## ATC-READ-010: Verify field types on part detail response

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A part exists with known values

**Endpoint:** `GET /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/<known_pk>/`
3. Parse and type-check each field in the response

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- `pk` is of type integer (not string)
- `name` is of type string
- `active` is of type boolean (`true` or `false`, not `"true"` string)
- `assembly`, `component`, `is_template`, `purchaseable`, `salable`, `trackable`, `virtual`, `testable`, `locked` are all booleans
- `category` is an integer or `null`
- `default_location` is an integer or `null`
- `variant_of` is an integer or `null`
- `revision_of` is an integer or `null`
- `default_expiry` is an integer (>= 0)
- `minimum_stock` is a number (float/double)
- `in_stock` is a number or `null`
- `total_in_stock` is a number or `null`
- `creation_date` is a string in ISO date format (`YYYY-MM-DD`) or `null`
- `pricing_min` is a string (decimal format) or `null`
- `pricing_max` is a string (decimal format) or `null`
- `pricing_updated` is a string in ISO datetime format or `null`
- `IPN` is a string (never null — defaults to `""`)
- `revision` is a string or `null`
- `tags` is an array

---

## ATC-READ-011: Filter parts: active=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- Both active and inactive parts exist in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?active=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?active=true&limit=50`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<integer>",
  "results": [
    {"pk": 1, "name": "Resistor 10k Ohm", "active": true}
  ]
}
```

**Validation Points:**
- Status code is 200
- Every part in `results` has `active: true`
- No part in `results` has `active: false`
- `count` reflects the number of active parts (should be less than total part count if inactive parts exist)

---

## ATC-READ-012: Filter parts: active=false

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one inactive part exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?active=false&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?active=false&limit=50`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<integer>",
  "results": [
    {"pk": 99, "name": "Obsolete Part XYZ", "active": false}
  ]
}
```

**Validation Points:**
- Status code is 200
- Every part in `results` has `active: false`
- `count` is less than total part count

---

## ATC-READ-013: Filter parts: assembly=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one assembly part exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?assembly=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?assembly=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `assembly: true`
- No part in `results` has `assembly: false`

---

## ATC-READ-014: Filter parts: component=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?component=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?component=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `component: true`

---

## ATC-READ-015: Filter parts: is_template=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one template part exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?is_template=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?is_template=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `is_template: true`
- Result count is typically smaller than total part count (templates are a subset)

---

## ATC-READ-016: Filter parts: purchaseable=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?purchaseable=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?purchaseable=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `purchaseable: true`

---

## ATC-READ-017: Filter parts: salable=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?salable=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?salable=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `salable: true`

---

## ATC-READ-018: Filter parts: trackable=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?trackable=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?trackable=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `trackable: true`
- These parts require serial number tracking

---

## ATC-READ-019: Filter parts: virtual=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one virtual part exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?virtual=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?virtual=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `virtual: true`
- Virtual parts represent software, licenses, or other non-physical items

---

## ATC-READ-020: Filter parts by category (direct children only)

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A category with known pk exists and has parts assigned directly to it (not just subcategories)
- Use category pk from demo (e.g., find one via `GET /api/part/category/?limit=10`)

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?category=<category_pk>&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/category/?limit=10` to find a category with parts
3. Note the category pk and send `GET /api/part/?category=<pk>&limit=50`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<integer>",
  "results": [
    {"pk": 1, "name": "Resistor 10k Ohm", "category": 5}
  ]
}
```

**Validation Points:**
- Status code is 200
- Every part in `results` has `category` equal to the filtered category pk
- Parts from subcategories of this category are NOT included (unless cascade=true)
- Result count may differ from `GET /api/part/?category=<pk>&cascade=true`

---

## ATC-READ-021: Filter parts by category with cascade=true (includes subcategories)

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A parent category exists that has at least one subcategory, and each has parts

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?category=<parent_category_pk>&cascade=true&limit=100
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Find a parent category with subcategories (via `GET /api/part/category/tree/`)
3. Note the parent category pk
4. Send `GET /api/part/?category=<pk>&limit=100` (without cascade) — record result count
5. Send `GET /api/part/?category=<pk>&cascade=true&limit=100` — record result count

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- `count` with `cascade=true` is greater than or equal to `count` without cascade
- Parts from child categories appear in results when `cascade=true`
- Parts from other unrelated categories do NOT appear in results

---

## ATC-READ-022: Search: exact name match

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A part with a known exact name exists in the database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?search=Resistor&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?search=Resistor&limit=50`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<integer>",
  "results": [
    {"pk": 1, "name": "Resistor 10k Ohm"}
  ]
}
```

**Validation Points:**
- Status code is 200
- Search matches against: IPN, category name, description, keywords, manufacturer part number (MPN), name, revision, supplier part SKU, tag names/slugs (per spec)
- Results include parts whose `name` contains "Resistor"
- `count` reflects total matching results

---

## ATC-READ-023: Search: partial name match

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- Parts with names containing a common substring (e.g., "cap") exist

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?search=cap&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?search=cap&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Results include parts where `name`, `description`, `keywords`, or other searched fields contain "cap" (case-insensitive)
- Partial matches are returned (e.g., "Capacitor 100uF" would be included)

---

## ATC-READ-024: Search: no results for unmatched term

**Priority:** Medium
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user
- No part in the database has "xyzqwerty123" in any searchable field

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?search=xyzqwerty123&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?search=xyzqwerty123&limit=50`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

**Validation Points:**
- Status code is 200 (not 404)
- `count` is 0
- `results` is an empty array `[]`
- `next` and `previous` are null

---

## ATC-READ-025: Filter by IPN exact match

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A part with a known IPN exists (e.g., IPN = "IPN-RES-10K")

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?IPN=IPN-RES-10K&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Find a part with a known non-empty IPN (via `GET /api/part/?has_ipn=true&limit=5`)
3. Note the IPN value
4. Send `GET /api/part/?IPN=<exact_ipn_value>&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- All parts in `results` have `IPN` exactly matching the filter value
- Parts with similar but not identical IPN values are not included
- This filter is case-sensitive per spec description ("exact IPN")

---

## ATC-READ-026: Filter: has_ipn=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- Both parts with IPNs and parts without IPNs exist in the database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?has_ipn=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?has_ipn=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has a non-empty `IPN` field
- No part in `results` has `IPN: ""`

---

## ATC-READ-027: Filter: has_ipn=false

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?has_ipn=false&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?has_ipn=false&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has an empty or null `IPN` field (`IPN: ""` or `IPN: null`)
- Result count should equal total parts minus parts with IPN

---

## ATC-READ-028: Filter: has_stock=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one part with non-zero stock exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?has_stock=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?has_stock=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `in_stock` > 0 (or total_in_stock > 0)
- No parts with zero stock appear in results

---

## ATC-READ-029: Filter: has_stock=false

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?has_stock=false&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?has_stock=false&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `in_stock` of 0 or null (no stock on hand)

---

## ATC-READ-030: Ordering: ascending by name

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- Multiple parts exist with different names

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?ordering=name&limit=20
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?ordering=name&limit=20`
3. Extract the `name` field from each result in order

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- The `name` values of parts in `results` are in ascending alphabetical order
- `results[0].name` <= `results[1].name` <= `results[2].name` (lexicographic order)

---

## ATC-READ-031: Ordering: descending by name

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- Multiple parts exist with different names

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?ordering=-name&limit=20
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?ordering=-name&limit=20`
3. Extract the `name` field from each result in order

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- The `name` values of parts in `results` are in descending alphabetical order
- `results[0].name` >= `results[1].name` >= `results[2].name`
- Order should be opposite of `?ordering=name`

---

## ATC-READ-032: Ordering: by creation_date ascending

**Priority:** Low
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?ordering=creation_date&limit=20
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?ordering=creation_date&limit=20`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Parts are sorted by `creation_date` ascending (oldest first)
- Parts with null `creation_date` are sorted consistently (typically null-first or null-last)

---

## ATC-READ-033: Ordering: by in_stock descending

**Priority:** Low
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?ordering=-in_stock&limit=20
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?ordering=-in_stock&limit=20`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Parts are sorted by `in_stock` descending (highest stock count first)
- `results[0].in_stock` >= `results[1].in_stock`

---

## ATC-READ-034: Combined filters: active=true, category, and search

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A category with known pk exists containing active parts with "resistor" in name/description

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?active=true&category=<category_pk>&search=resistor&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Find a suitable category pk via `GET /api/part/category/?limit=10`
3. Send `GET /api/part/?active=true&category=<pk>&search=resistor&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` satisfies ALL of the following:
  - `active: true`
  - `category` matches the specified category pk
  - Name or another searchable field contains "resistor" (case-insensitive)
- Result count is <= what each individual filter would return

---

## ATC-READ-035: category_detail=true on list endpoint

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one part with a category exists

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?category_detail=true&limit=5
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?category_detail=true&limit=5`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "results": [
    {
      "pk": 1,
      "category": 5,
      "category_detail": {
        "pk": 5,
        "name": "Resistors",
        "description": "Electronic resistors",
        "pathstring": "Electronic Components / Resistors"
      }
    }
  ]
}
```

**Validation Points:**
- Status code is 200
- Each part object that has a non-null `category` also has a non-null `category_detail` object
- `category_detail` is a nested object with at minimum `pk`, `name`, `pathstring` fields
- Parts with `category: null` have `category_detail: null`
- Without `category_detail=true`, `category_detail` would not be expanded (may be absent or null)

---

## ATC-READ-036: parameters=true on list endpoint

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one part with parameters exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?parameters=true&limit=5
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?parameters=true&limit=5`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "results": [
    {
      "pk": 1,
      "name": "Resistor 10k Ohm",
      "parameters": [
        {
          "pk": 10,
          "template": 1,
          "template_detail": {"name": "Resistance", "units": "ohm"},
          "data": "10000",
          "data_numeric": 10000.0
        }
      ]
    }
  ]
}
```

**Validation Points:**
- Status code is 200
- Each part object has a `parameters` field that is an array
- Parts without parameters have `parameters: []` (empty array) or `parameters: null`
- Parts with parameters have `parameters` as a non-empty array of parameter objects
- Each parameter object contains `pk`, `template`, `data` fields
- Without `parameters=true`, the `parameters` field would be absent or null

---

## ATC-READ-037: Part detail endpoint returns full field set vs list endpoint

**Priority:** Low
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A part with known pk exists

**Endpoint:** `GET /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?limit=1` — record field names in the first result
3. Send `GET /api/part/<pk>/` — record field names in the response
4. Compare the two field sets

**Expected Response:**
- **Status Code:** 200 for both requests

**Validation Points:**
- `GET /api/part/{id}/` response includes additional computed fields not in list response: `allocated_to_build_orders`, `allocated_to_sales_orders`, `building`, `scheduled_to_build`, `ordering`, `required_for_build_orders`, `required_for_sales_orders`, `external_stock`, `variant_stock`, `price_breaks`
- Both responses include the core Part fields
- The detail endpoint uses the `Part` schema; the list endpoint uses `Part` items within a `PaginatedPartList`

---

## ATC-READ-038: GET non-existent part pk — expect 404

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user
- pk=999999 does not exist in the database

**Endpoint:** `GET /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/999999/`

**Expected Response:**
- **Status Code:** 404
- **Key Response Fields:**
```json
{
  "detail": "No Part matches the given query."
}
```

**Validation Points:**
- Status code is exactly 404
- Response body contains an error message (either `detail` field or similar)
- Response is a JSON object, not an empty body
- No part data is leaked in the error response

---

## ATC-READ-039: GET with invalid pk format (string) — expect 404

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/abc/`

**Expected Response:**
- **Status Code:** 404
- **Key Response Fields:**
```json
{
  "detail": "No Part matches the given query."
}
```

**Validation Points:**
- Status code is 404 (Django URL routing does not match non-integer pk for `{id}` path parameter)
- Response is JSON with an error message
- No server error (500) is returned for a malformed but syntactically valid URL path

---

## ATC-READ-040: GET without authentication — expect 401

**Priority:** High
**Type:** Negative

**Preconditions:**
- No authentication token is provided

**Endpoint:** `GET /api/part/`

**Headers:** (none — no Authorization header)

**Steps:**
1. Send `GET /api/part/` without any Authorization header

**Expected Response:**
- **Status Code:** 401 or 403
- **Key Response Fields:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Validation Points:**
- Status code is 401 or 403 (InvenTree may return either depending on configuration)
- Response body contains an authentication error message
- No part data is returned
- Response includes appropriate `WWW-Authenticate` header if 401

---

## ATC-READ-041: GET with reader account (read-only) — expect 200

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `reader` user (username: `reader`, password: `readonly`)
- Parts exist in the database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <reader-account-token>
```

**Query Parameters:**
```
?limit=10
```

**Steps:**
1. Obtain authentication token for `reader` account: `GET /api/user/token/` with HTTP Basic Auth (username: `reader`, password: `readonly`)
2. Send `GET /api/part/?limit=10` with the reader token

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<integer>",
  "results": [...]
}
```

**Validation Points:**
- Status code is 200 (read-only account CAN read parts)
- Response body is the standard paginated list of parts
- No permission error is returned
- Data returned is identical to what `allaccess` would see

---

## ATC-READ-042: Verify response field types on part with stock

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A part with active stock exists (use `GET /api/part/?has_stock=true&limit=1` to find one)

**Endpoint:** `GET /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?has_stock=true&limit=1` to find a part with stock
3. Note the `pk` from the response
4. Send `GET /api/part/<pk>/`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "pk": 42,
  "name": "Capacitor 100uF 25V",
  "active": true,
  "in_stock": 500.0,
  "creation_date": "2024-03-10",
  "pricing_min": "0.050000",
  "pricing_max": null
}
```

**Validation Points:**
- `pk` is a JSON integer (not a string)
- `name` is a JSON string
- `active` is a JSON boolean (not 0/1 integer)
- `in_stock` is a JSON number (float), greater than 0
- `creation_date` is a JSON string in `YYYY-MM-DD` format (e.g., `"2024-03-10"`) or null
- `pricing_min` is a JSON string in decimal format (e.g., `"0.050000"`) or null — NOT a float
- `pricing_max` is a JSON string in decimal format or null
- `minimum_stock` is a JSON number (float)
- `default_expiry` is a JSON integer (>= 0)

---

## ATC-READ-043: Filter parts: locked=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one locked part exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?locked=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?locked=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has `locked: true`
- Locked parts cannot be edited — this filter is useful for auditing locked inventory

---

## ATC-READ-044: Filter parts: is_variant=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one variant part (with `variant_of` set) exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?is_variant=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?is_variant=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has a non-null `variant_of` field (they are variants of another part)

---

## ATC-READ-045: Filter parts: is_revision=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- At least one revision part (with `revision_of` set) exists in the demo database

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?is_revision=true&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?is_revision=true&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has a non-null `revision_of` field

---

## ATC-READ-046: Filter by name_regex

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?name_regex=^Resistor.*&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?name_regex=^Resistor.*&limit=50`

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has a `name` that starts with "Resistor" (matches the regex `^Resistor.*`)
- Regex is applied to the `name` field specifically (not other fields)
- Results may include parts like "Resistor 10k Ohm", "Resistor 1k Ohm", "Resistor Array", etc.

---

## ATC-READ-047: Filter by IPN_regex

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- Parts with IPNs matching a known pattern exist (e.g., IPNs starting with "RES-")

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?IPN_regex=^RES-.*&limit=50
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Find a common IPN prefix via `GET /api/part/?has_ipn=true&limit=10`
3. Note a pattern and send `GET /api/part/?IPN_regex=^RES-.*&limit=50` (adjust pattern as needed)

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200
- Every part in `results` has an `IPN` field that matches the provided regex pattern
- Parts with non-matching or empty IPN are excluded

---

## ATC-READ-048: Pagination: large offset with limit — empty results

**Priority:** Medium
**Type:** Boundary

**Preconditions:**
- Valid API token obtained for `allaccess` user
- Total part count is known to be much less than 10000

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?limit=10&offset=10000
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?limit=10&offset=10000`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "count": "<actual total>",
  "next": null,
  "previous": "<previous page URL>",
  "results": []
}
```

**Validation Points:**
- Status code is 200 (not 404 or 400)
- `results` is an empty array
- `count` still reflects actual total count
- `next` is null (no more results after this point)
- Response is valid even though the offset is absurdly large

---

## ATC-READ-049: category_detail and parameters combined on detail endpoint

**Priority:** Low
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user
- A part exists with both a category and at least one parameter

**Endpoint:** `GET /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?category_detail=true&parameters=true
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Find a part with category and parameters: `GET /api/part/?has_ipn=true&limit=5`
3. Send `GET /api/part/<pk>/?category_detail=true&parameters=true`

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "pk": 42,
  "category": 5,
  "category_detail": {
    "pk": 5,
    "name": "Resistors",
    "pathstring": "Electronic Components / Resistors"
  },
  "parameters": [
    {
      "pk": 10,
      "template": 1,
      "data": "10000"
    }
  ]
}
```

**Validation Points:**
- Status code is 200
- `category_detail` is a non-null object with `pk`, `name`, and `pathstring` fields
- `parameters` is a non-empty array of parameter objects
- Both expansions work simultaneously in the same request
- No performance error or 500 occurs from requesting multiple expansions

---

## ATC-READ-050: List parts with invalid boolean filter value

**Priority:** Low
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user

**Endpoint:** `GET /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Query Parameters:**
```
?active=maybe&limit=10
```

**Steps:**
1. Obtain authentication token via `GET /api/user/token/` with HTTP Basic Auth
2. Send `GET /api/part/?active=maybe&limit=10`

**Expected Response:**
- **Status Code:** 400 or 200
- **If 400:**
```json
{
  "active": ["Enter a valid boolean value."]
}
```
- **If 200:** Results are returned (filter ignored or coerced)

**Validation Points:**
- Assumption: DRF BooleanFilter typically returns 400 with a validation error for non-boolean strings. Record actual behavior.
- If 400: error message references the `active` field and explains the valid values
- If 200: document that invalid boolean values are silently ignored by this endpoint
- Do NOT expect server error (500) for this input
