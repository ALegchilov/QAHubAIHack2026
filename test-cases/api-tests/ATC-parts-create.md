# Parts: Create — API Test Cases

> API Spec: InvenTree OpenAPI v477
> Generated: 2026-04-13
> Target: https://demo.inventree.org/api/

## Summary

| ID | Title | Priority | Type |
|----|-------|----------|------|
| ATC-CREATE-001 | Create part with minimum required fields | High | Positive |
| ATC-CREATE-002 | Create part with all fields populated | High | Positive |
| ATC-CREATE-003 | Create part with initial_stock quantity and location | High | Positive |
| ATC-CREATE-004 | Create part with initial_stock quantity only (no location) | Medium | Positive |
| ATC-CREATE-005 | Create part with initial_supplier (supplier + SKU) | High | Positive |
| ATC-CREATE-006 | Create part with initial_supplier (manufacturer + MPN) | Medium | Positive |
| ATC-CREATE-007 | Duplicate part with copy_bom=true | High | Positive |
| ATC-CREATE-008 | Duplicate part with copy_parameters=true | Medium | Positive |
| ATC-CREATE-009 | Duplicate part with copy_notes=true (default) | Medium | Positive |
| ATC-CREATE-010 | Duplicate part with copy_image=true | Low | Positive |
| ATC-CREATE-011 | Create part with copy_category_parameters=true (default) | Medium | Positive |
| ATC-CREATE-012 | Create part with copy_category_parameters=false | Medium | Positive |
| ATC-CREATE-013 | Create part without name field — expect 400 | High | Negative |
| ATC-CREATE-014 | Create part with name exceeding maxLength (101 chars) | High | Negative |
| ATC-CREATE-015 | Create part with non-existent category ID | High | Negative |
| ATC-CREATE-016 | Create part with duplicate field in initial_stock (quantity=0) | Medium | Boundary |
| ATC-CREATE-017 | Create part with all boolean flags set to true | Medium | Positive |
| ATC-CREATE-018 | Create part as a variant of a template part | High | Positive |
| ATC-CREATE-019 | Create part as a revision of another part | High | Positive |
| ATC-CREATE-020 | Create part with tags | Low | Positive |

---

## ATC-CREATE-001: Create part with minimum required fields

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user via `POST /api/user/token/`
- At least one PartCategory exists (note the pk, e.g., category pk=1)

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 10k Ohm",
  "description": "General purpose resistor",
  "category": 1
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/` with credentials `{"username": "allaccess", "password": "nolimits"}`. Extract the `token` field from the response.
2. Send `POST /api/part/` with the request body above.
3. Record the `pk` from the response for cleanup reference.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "pk": "<integer>",
  "name": "Resistor 10k Ohm",
  "description": "General purpose resistor",
  "category": 1,
  "active": true,
  "IPN": "",
  "minimum_stock": 0.0,
  "copy_category_parameters": true
}
```

**Validation Points:**
- Status code is 201.
- `pk` is a positive integer.
- `name` matches the submitted value exactly.
- `description` matches the submitted value.
- `category` matches the submitted integer.
- `active` defaults to `true`.
- `IPN` defaults to `""` (empty string).
- `minimum_stock` defaults to `0.0`.
- `full_name` is a non-empty readOnly string (auto-computed).
- `thumbnail` is a readOnly string (may be empty or a URL).
- `creation_date` is a readOnly date string in ISO 8601 format.
- `starred` is a readOnly boolean.
- `in_stock` is a readOnly number (0 or null since no stock was added).

---

## ATC-CREATE-002: Create part with all fields populated

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A valid PartCategory pk exists (e.g., pk=1).
- A valid StockLocation pk exists (e.g., pk=1).

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Capacitor 100uF Electrolytic",
  "description": "Electrolytic capacitor, 100uF, 25V, radial",
  "category": 1,
  "IPN": "IPN-CAP-100UF-25V",
  "keywords": "capacitor electrolytic radial 100uF",
  "link": "https://example.com/datasheet/cap100uf.pdf",
  "units": "pcs",
  "notes": "Standard electrolytic capacitor for power supply filtering.",
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
  "minimum_stock": 10.0,
  "default_expiry": 730,
  "default_location": 1,
  "revision": "A"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/` with credentials `{"username": "allaccess", "password": "nolimits"}`.
2. Send `POST /api/part/` with the request body above.
3. Perform a follow-up `GET /api/part/{pk}/` using the returned `pk` to verify all fields were persisted.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "name": "Capacitor 100uF Electrolytic",
  "IPN": "IPN-CAP-100UF-25V",
  "keywords": "capacitor electrolytic radial 100uF",
  "units": "pcs",
  "minimum_stock": 10.0,
  "default_expiry": 730,
  "default_location": 1,
  "revision": "A",
  "active": true,
  "assembly": false,
  "component": true
}
```

**Validation Points:**
- Status code is 201.
- All submitted writable fields are returned with the submitted values.
- `link` is stored and returned as a valid URI string.
- `notes` is stored and returned exactly as submitted.
- `revision` is `"A"`.
- `full_name` includes the revision (e.g., `"Capacitor 100uF Electrolytic | A"`).
- `default_location_detail` is an object with `pk`, `name`, and `pathstring` fields.
- ReadOnly fields (`pk`, `barcode_hash`, `creation_date`, `starred`, `thumbnail`, `category_name`, `full_name`, `in_stock`) are present and non-null where expected.

---

## ATC-CREATE-003: Create part with initial_stock quantity and location

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A valid PartCategory pk exists (e.g., pk=1).
- A valid StockLocation pk exists (e.g., pk=1).

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "LED 5mm Red",
  "description": "Standard 5mm red LED, 20mA",
  "category": 1,
  "initial_stock": {
    "quantity": "100",
    "location": 1
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with the request body above.
3. Note the returned `pk`.
4. Send `GET /api/stock/?part={pk}` to verify a stock item was created.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "pk": "<integer>",
  "name": "LED 5mm Red",
  "in_stock": 100.0
}
```

**Validation Points:**
- Status code is 201.
- `in_stock` in the part response equals `100.0` (or the quantity specified).
- Follow-up `GET /api/stock/?part={pk}` returns at least one stock item with `quantity=100.0` and `location=1`.
- `stock_item_count` in part response is `1`.

---

## ATC-CREATE-004: Create part with initial_stock quantity only (no location)

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A valid PartCategory pk exists.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 1k Ohm",
  "description": "1k resistor 1/4W",
  "category": 1,
  "initial_stock": {
    "quantity": "50"
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with the request body.
3. Verify the response `pk`.
4. Send `GET /api/stock/?part={pk}` to inspect the created stock item.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "pk": "<integer>",
  "in_stock": 50.0
}
```

**Validation Points:**
- Status code is 201.
- `in_stock` equals `50.0`.
- The stock item is created with `location=null` (no location specified).

---

## ATC-CREATE-005: Create part with initial_supplier (supplier + SKU)

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A valid PartCategory pk exists.
- A valid Company (supplier) pk exists (e.g., pk=1 — verify via `GET /api/company/?is_supplier=true`).

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Transistor BC547",
  "description": "NPN transistor BC547",
  "category": 1,
  "initial_supplier": {
    "supplier": 1,
    "sku": "BC547-DIP"
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Verify a supplier company exists: `GET /api/company/?is_supplier=true&limit=1`. Note the `pk`.
3. Send `POST /api/part/` with the request body, updating `supplier` to the valid pk.
4. Note the returned part `pk`.
5. Send `GET /api/company/part/?part={pk}` to verify the supplier part was created.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "pk": "<integer>",
  "name": "Transistor BC547"
}
```

**Validation Points:**
- Status code is 201.
- Follow-up `GET /api/company/part/?part={pk}` returns a supplier part with `SKU="BC547-DIP"` and `supplier=1`.
- No errors in the response body.

---

## ATC-CREATE-006: Create part with initial_supplier (manufacturer + MPN)

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A valid PartCategory pk exists.
- A valid Company (manufacturer) pk exists (verify via `GET /api/company/?is_manufacturer=true`).

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Op-Amp LM741",
  "description": "General purpose operational amplifier",
  "category": 1,
  "initial_supplier": {
    "manufacturer": 1,
    "mpn": "LM741CN"
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Verify a manufacturer company exists: `GET /api/company/?is_manufacturer=true&limit=1`.
3. Send `POST /api/part/` with the request body.
4. Verify `GET /api/company/part/manufacturer/?part={pk}` returns a manufacturer part with `MPN="LM741CN"`.

**Expected Response:**
- **Status Code:** 201

**Validation Points:**
- Status code is 201.
- Manufacturer part entry is created with `MPN="LM741CN"`.

---

## ATC-CREATE-007: Duplicate part with copy_bom=true

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A source part exists with at least one BOM item. Note its `pk` (e.g., pk=100).
- A valid PartCategory pk exists.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Assembly Widget v2",
  "description": "Duplicated assembly with BOM",
  "category": 1,
  "duplicate": {
    "part": 100,
    "copy_bom": true,
    "copy_parameters": false,
    "copy_notes": true,
    "copy_image": false,
    "copy_tests": false
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Identify a source part with BOM items: `GET /api/part/?assembly=true&limit=1`. Note the `pk`.
3. Verify source BOM: `GET /api/bom/?part={source_pk}`.
4. Send `POST /api/part/` with the `duplicate` block referencing the source `pk`.
5. Note the new part `pk` from the response.
6. Send `GET /api/bom/?part={new_pk}` to verify BOM items were copied.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "pk": "<integer>",
  "name": "Assembly Widget v2"
}
```

**Validation Points:**
- Status code is 201.
- `GET /api/bom/?part={new_pk}` returns the same number of BOM items as the source.
- BOM items reference the same sub-parts and quantities as the source.
- `notes` is copied (since `copy_notes=true`).
- Image is NOT copied (since `copy_image=false`).

---

## ATC-CREATE-008: Duplicate part with copy_parameters=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A source part exists with at least one parameter value. Note its `pk`.
- A valid PartCategory pk exists.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 10k Clone",
  "description": "Clone of 10k resistor with parameters",
  "category": 1,
  "duplicate": {
    "part": 100,
    "copy_bom": false,
    "copy_parameters": true,
    "copy_notes": true,
    "copy_image": false,
    "copy_tests": false
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Find a source part with parameters: `GET /api/part/parameter/?part={source_pk}`. Verify at least 1 parameter.
3. Send `POST /api/part/` with the duplicate block.
4. Note the new `pk`.
5. Send `GET /api/part/parameter/?part={new_pk}` to verify parameters were copied.

**Expected Response:**
- **Status Code:** 201

**Validation Points:**
- Status code is 201.
- `GET /api/part/parameter/?part={new_pk}` returns the same number of parameters as the source.
- Parameter template IDs and values match those of the source.

---

## ATC-CREATE-009: Duplicate part with copy_notes=true (default behavior)

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A source part exists with non-empty `notes`. Note its `pk` and `notes` value.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Fuse 1A Clone",
  "description": "Clone of 1A fuse",
  "category": 1,
  "duplicate": {
    "part": 100,
    "copy_notes": true
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Get source part notes: `GET /api/part/{source_pk}/`. Record `notes`.
3. Send `POST /api/part/` with the duplicate block (only `copy_notes=true` specified; other fields default to false).
4. Send `GET /api/part/{new_pk}/` and verify `notes` matches the source.

**Expected Response:**
- **Status Code:** 201

**Validation Points:**
- Status code is 201.
- `notes` in the new part matches the source part's `notes` exactly.
- BOM items are NOT copied (copy_bom defaults to false).
- Parameters are NOT copied (copy_parameters defaults to false).

---

## ATC-CREATE-010: Duplicate part with copy_image=true

**Priority:** Low
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A source part exists with a non-null `image` field. Note its `pk` and `image` value.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 10k Copy",
  "description": "Copy of resistor with image",
  "category": 1,
  "duplicate": {
    "part": 100,
    "copy_image": true
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Find a source part with an image: `GET /api/part/?limit=50` and look for non-null `image`.
3. Send `POST /api/part/` with the duplicate block.
4. Verify `image` field in the response is non-null (or `thumbnail` is non-empty).

**Expected Response:**
- **Status Code:** 201

**Validation Points:**
- Status code is 201.
- `image` or `thumbnail` in the new part response is non-null/non-empty.

---

## ATC-CREATE-011: Create part with copy_category_parameters=true (default)

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A PartCategory exists with at least one category-level parameter template. Note its `pk`.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Diode 1N4148",
  "description": "Small signal switching diode",
  "category": 5,
  "copy_category_parameters": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Find a category with parameter templates: `GET /api/part/category/parameters/?category={category_pk}`.
3. Send `POST /api/part/` with `copy_category_parameters=true` (or omit, since true is default).
4. Note the new part `pk`.
5. Send `GET /api/part/parameter/?part={new_pk}` to verify parameters were created from category templates.

**Expected Response:**
- **Status Code:** 201

**Validation Points:**
- Status code is 201.
- `GET /api/part/parameter/?part={new_pk}` returns parameter entries corresponding to the category's parameter templates.
- `copy_category_parameters` is returned as `true` in the response.

---

## ATC-CREATE-012: Create part with copy_category_parameters=false

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A PartCategory exists with category-level parameter templates. Note its `pk`.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Diode 1N4007",
  "description": "General purpose rectifier diode",
  "category": 5,
  "copy_category_parameters": false
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with `copy_category_parameters=false`.
3. Note the new part `pk`.
4. Send `GET /api/part/parameter/?part={new_pk}` to verify no parameters were auto-created.

**Expected Response:**
- **Status Code:** 201

**Validation Points:**
- Status code is 201.
- `GET /api/part/parameter/?part={new_pk}` returns an empty list (`count=0`).
- Category parameter templates were not applied.

---

## ATC-CREATE-013: Create part without name field — expect 400

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token for `allaccess` user.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "A part with no name",
  "category": 1
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with the request body above (no `name` field).

**Expected Response:**
- **Status Code:** 400
- **Key Response Fields:**
```json
{
  "name": ["This field is required."]
}
```

**Validation Points:**
- Status code is 400.
- Response body contains a `name` key with an error message about the field being required.
- No part is created (verified by checking that no new pk is returned).

---

## ATC-CREATE-014: Create part with name exceeding maxLength (101 chars)

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token for `allaccess` user.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEEAAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEEF",
  "description": "Part with 101 character name",
  "category": 1
}
```

Note: The name above is exactly 101 characters.

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with the 101-character name.

**Expected Response:**
- **Status Code:** 400
- **Key Response Fields:**
```json
{
  "name": ["Ensure this field has no more than 100 characters."]
}
```

**Validation Points:**
- Status code is 400.
- Error message references the `name` field and the 100 character limit.
- No part is created.

---

## ATC-CREATE-015: Create part with non-existent category ID

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token for `allaccess` user.
- Category ID 999999 does not exist.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Phantom Part",
  "description": "Part assigned to non-existent category",
  "category": 999999
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with `category=999999`.

**Expected Response:**
- **Status Code:** 400
- **Key Response Fields:**
```json
{
  "category": ["Invalid pk \"999999\" - object does not exist."]
}
```

**Validation Points:**
- Status code is 400.
- Error references the `category` field and invalid pk.
- No part is created.

---

## ATC-CREATE-016: Create part with initial_stock quantity=0 (boundary — no stock added)

**Priority:** Medium
**Type:** Boundary

**Preconditions:**
- Valid API token for `allaccess` user.
- A valid PartCategory pk exists.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 470 Ohm",
  "description": "470 ohm resistor 1/4W",
  "category": 1,
  "initial_stock": {
    "quantity": "0"
  }
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with `initial_stock.quantity=0`.
3. Verify via `GET /api/stock/?part={pk}` whether a stock item was created.

**Expected Response:**
- **Status Code:** 201

**Validation Points:**
- Status code is 201.
- Per spec: "If quantity is zero, no stock is added." So `GET /api/stock/?part={pk}` should return `count=0`.
- `in_stock` in the part response is `0.0` or `null`.

---

## ATC-CREATE-017: Create part with all boolean flags set to true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A valid PartCategory pk exists.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Multi-Flag Test Part",
  "description": "Part with all boolean flags enabled",
  "category": 1,
  "active": true,
  "assembly": true,
  "component": true,
  "is_template": true,
  "purchaseable": true,
  "salable": true,
  "trackable": true,
  "virtual": true,
  "testable": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with all boolean flags set to true.
3. Verify the response contains each flag as `true`.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "active": true,
  "assembly": true,
  "component": true,
  "is_template": true,
  "purchaseable": true,
  "salable": true,
  "trackable": true,
  "virtual": true,
  "testable": true
}
```

**Validation Points:**
- Status code is 201.
- All nine boolean flags in the response are `true`.

---

## ATC-CREATE-018: Create part as a variant of a template part

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A template part exists with `is_template=true`. Note its `pk` (e.g., template_pk=200).
- A valid PartCategory pk exists.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 10k Ohm (0402)",
  "description": "10k resistor in 0402 package",
  "category": 1,
  "variant_of": 200
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Find a template part: `GET /api/part/?is_template=true&limit=1`. Note the `pk`.
3. Send `POST /api/part/` with `variant_of` set to the template `pk`.
4. Verify the response `variant_of` field equals the template `pk`.
5. Verify `GET /api/part/?variant_of={template_pk}` includes the new part.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "pk": "<integer>",
  "name": "Resistor 10k Ohm (0402)",
  "variant_of": 200
}
```

**Validation Points:**
- Status code is 201.
- `variant_of` in the response equals the template part pk.
- `GET /api/part/?variant_of={template_pk}` returns the new part in results.

---

## ATC-CREATE-019: Create part as a revision of another part

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- An original part exists (e.g., pk=300). Note its `pk`.
- A valid PartCategory pk exists.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Relay SPDT",
  "description": "Single pole double throw relay, revision B",
  "category": 1,
  "revision": "B",
  "revision_of": 300
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Find an existing part: `GET /api/part/?limit=1`. Note its `pk`.
3. Send `POST /api/part/` with `revision_of` set to the existing part's `pk` and `revision="B"`.
4. Verify `revision_of` in the response.
5. Verify `GET /api/part/{original_pk}/` shows `revision_count` incremented.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "pk": "<integer>",
  "revision": "B",
  "revision_of": 300
}
```

**Validation Points:**
- Status code is 201.
- `revision` is `"B"`.
- `revision_of` equals the original part pk.

---

## ATC-CREATE-020: Create part with tags

**Priority:** Low
**Type:** Positive

**Preconditions:**
- Valid API token for `allaccess` user.
- A valid PartCategory pk exists.

**Endpoint:** `POST /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Crystal Oscillator 16MHz",
  "description": "16MHz crystal for microcontroller clock",
  "category": 1,
  "tags": ["crystal", "oscillator", "clock"]
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `POST /api/part/` with the `tags` array.
3. Verify the response contains a `tags` field.
4. Send `GET /api/part/?tags_name=crystal` to verify the tag filter works.

**Expected Response:**
- **Status Code:** 201
- **Key Response Fields:**
```json
{
  "pk": "<integer>",
  "tags": ["crystal", "oscillator", "clock"]
}
```

**Validation Points:**
- Status code is 201.
- `tags` in the response contains the submitted tag names.
- `GET /api/part/?tags_name=crystal` returns the new part in results.
