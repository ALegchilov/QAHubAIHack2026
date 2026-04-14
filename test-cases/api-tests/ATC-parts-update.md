# Parts Update — API Test Cases

> API Spec: InvenTree OpenAPI v477
> Generated: 2026-04-13
> Target: https://demo.inventree.org/api/

## Summary

| ID | Title | Priority | Type |
|----|-------|----------|------|
| ATC-UPDATE-001 | Full replacement update (PUT) with all writable fields | High | Positive |
| ATC-UPDATE-002 | PATCH — partial update of name field | High | Positive |
| ATC-UPDATE-003 | PATCH — partial update of description field | High | Positive |
| ATC-UPDATE-004 | PATCH — partial update of category field | High | Positive |
| ATC-UPDATE-005 | PATCH — set active=false (deactivate part) | High | Positive |
| ATC-UPDATE-006 | PATCH — set active=true (reactivate part) | High | Positive |
| ATC-UPDATE-007 | PATCH — set assembly=true | Medium | Positive |
| ATC-UPDATE-008 | PATCH — set component=false | Medium | Positive |
| ATC-UPDATE-009 | PATCH — set is_template=true | Medium | Positive |
| ATC-UPDATE-010 | PATCH — set purchaseable=false | Medium | Positive |
| ATC-UPDATE-011 | PATCH — set salable=true | Medium | Positive |
| ATC-UPDATE-012 | PATCH — set trackable=true | Medium | Positive |
| ATC-UPDATE-013 | PATCH — set virtual=true | Medium | Positive |
| ATC-UPDATE-014 | PATCH — set testable=true | Medium | Positive |
| ATC-UPDATE-015 | PATCH — update IPN field | Medium | Positive |
| ATC-UPDATE-016 | PATCH — update units field | Medium | Positive |
| ATC-UPDATE-017 | PATCH — update notes field | Medium | Positive |
| ATC-UPDATE-018 | PATCH — update link field with valid URI | Medium | Positive |
| ATC-UPDATE-019 | PATCH — update keywords field | Medium | Positive |
| ATC-UPDATE-020 | PATCH — update minimum_stock | Medium | Positive |
| ATC-UPDATE-021 | PATCH — update default_expiry | Medium | Positive |
| ATC-UPDATE-022 | PATCH — update default_location | Medium | Positive |
| ATC-UPDATE-023 | PATCH — set locked=true | High | Positive |
| ATC-UPDATE-024 | PATCH — update part to same value (idempotent) | Low | Positive |
| ATC-UPDATE-025 | PATCH — attempt to update readOnly field pk (ignored) | Medium | Edge Case |
| ATC-UPDATE-026 | PATCH — attempt to update readOnly field barcode_hash (ignored) | Medium | Edge Case |
| ATC-UPDATE-027 | PATCH — attempt to update readOnly field full_name (ignored) | Medium | Edge Case |
| ATC-UPDATE-028 | PATCH — attempt to update readOnly field in_stock (ignored) | Medium | Edge Case |
| ATC-UPDATE-029 | PATCH — attempt to update readOnly field creation_date (ignored) | Medium | Edge Case |
| ATC-UPDATE-030 | PATCH — attempt to update readOnly field starred (ignored) | Medium | Edge Case |
| ATC-UPDATE-031 | PATCH — update name to empty string (should fail) | High | Negative |
| ATC-UPDATE-032 | PATCH — update name exceeding maxLength=100 | High | Negative |
| ATC-UPDATE-033 | PATCH — update with invalid category (non-existent ID) | High | Negative |
| ATC-UPDATE-034 | PATCH — update with non-integer category value | High | Negative |
| ATC-UPDATE-035 | PATCH/PUT — update a locked part (should fail) | High | Negative |
| ATC-UPDATE-036 | PUT — missing required name field | High | Negative |
| ATC-UPDATE-037 | PATCH/PUT — update non-existent part (404) | High | Negative |
| ATC-UPDATE-038 | PATCH — as reader account (403) | High | Negative |
| ATC-UPDATE-039 | Bulk PATCH on /api/part/ — update multiple parts | Medium | Positive |
| ATC-UPDATE-040 | Bulk PUT on /api/part/ — replace multiple parts | Medium | Positive |

---

## ATC-UPDATE-001: Full replacement update (PUT) with all writable fields

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user via `POST /api/user/token/`
- A part exists with a known `pk` (e.g., `pk=1`). If not, create one via `POST /api/part/` first.

**Endpoint:** `PUT /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 10k Ohm Updated",
  "description": "Updated description for 10k resistor",
  "category": 1,
  "IPN": "IPN-RES-10K-V2",
  "revision": "B",
  "keywords": "resistor, 10k, smd",
  "link": "https://example.com/datasheet-v2.pdf",
  "units": "Ohm",
  "notes": "Updated notes for the resistor",
  "minimum_stock": 20.0,
  "default_expiry": 0,
  "active": true,
  "assembly": false,
  "component": true,
  "is_template": false,
  "purchaseable": true,
  "salable": false,
  "trackable": false,
  "virtual": false,
  "testable": false,
  "locked": false
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/` with `username=allaccess`, `password=nolimits`.
2. Identify an existing part `pk` (e.g., from `GET /api/part/?limit=1` or by prior creation).
3. Send `PUT /api/part/{id}/` with the full payload above.
4. Send `GET /api/part/{id}/` to verify all fields were persisted.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "pk": 1,
  "name": "Resistor 10k Ohm Updated",
  "description": "Updated description for 10k resistor",
  "IPN": "IPN-RES-10K-V2",
  "revision": "B",
  "active": true,
  "component": true,
  "purchaseable": true
}
```

**Validation Points:**
- Status code is 200 (not 201).
- All writable fields sent in the PUT are reflected back in the response.
- ReadOnly fields (`pk`, `barcode_hash`, `full_name`, `creation_date`, `in_stock`) are present in the response but retain their server-set values.
- Follow-up `GET /api/part/{id}/` confirms all changes persisted.

---

## ATC-UPDATE-002: PATCH — partial update of name field

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `name="Resistor 10k Ohm"`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 10k Ohm SMD"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with only the `name` field.
3. Send `GET /api/part/1/` to confirm the name was updated.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "pk": 1,
  "name": "Resistor 10k Ohm SMD"
}
```

**Validation Points:**
- Status code is 200.
- Response body contains `"name": "Resistor 10k Ohm SMD"`.
- All other fields remain unchanged (verified via follow-up GET).
- ReadOnly computed fields are still present with their original values.

---

## ATC-UPDATE-003: PATCH — partial update of description field

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "SMD resistor, 10kOhm, 0402 package, 1% tolerance"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with only the `description` field.
3. Verify response contains updated description.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "description": "SMD resistor, 10kOhm, 0402 package, 1% tolerance"
}
```

**Validation Points:**
- Status code is 200.
- `description` field matches the submitted value (250 char max respected).
- Other fields are not altered.

---

## ATC-UPDATE-004: PATCH — partial update of category field

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` assigned to category `pk=1`.
- A second, non-structural category exists with `pk=2`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": 2
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` setting `category=2`.
3. Send `GET /api/part/1/` to verify `category` changed to 2.
4. Verify `category_detail.pk` also equals 2 in the response.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "category": 2,
  "category_detail": {
    "pk": 2
  }
}
```

**Validation Points:**
- Status code is 200.
- `category` field in response is 2.
- `category_detail.pk` equals 2.
- `category_name` matches the name of category 2.

---

## ATC-UPDATE-005: PATCH — set active=false (deactivate part)

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- An active part exists with `pk=1` (`active=true`).

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "active": false
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `active=false`.
3. Verify response shows `active=false`.
4. Confirm `GET /api/part/?active=false` includes this part.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "active": false
}
```

**Validation Points:**
- Status code is 200.
- `active` is `false` in the response.
- Follow-up filter `GET /api/part/?active=false` returns this part.
- Part does not appear in `GET /api/part/?active=true`.

---

## ATC-UPDATE-006: PATCH — set active=true (reactivate part)

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- An inactive part exists with `pk=1` (`active=false`).

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "active": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `active=true`.
3. Verify response shows `active=true`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "active": true
}
```

**Validation Points:**
- Status code is 200.
- `active` is `true` in the response.

---

## ATC-UPDATE-007: PATCH — set assembly=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `assembly=false`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assembly": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `assembly=true`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "assembly": true
}
```

**Validation Points:**
- Status code is 200.
- `assembly` is `true` in the response.
- Part can now have BOM items created against it (tested separately).

---

## ATC-UPDATE-008: PATCH — set component=false

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `component=true`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "component": false
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `component=false`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "component": false
}
```

**Validation Points:**
- Status code is 200.
- `component` is `false` in the response.

---

## ATC-UPDATE-009: PATCH — set is_template=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`, `is_template=false`, and no existing variants.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_template": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `is_template=true`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "is_template": true
}
```

**Validation Points:**
- Status code is 200.
- `is_template` is `true` in the response.
- The part can now be used as a `variant_of` target for other parts.

---

## ATC-UPDATE-010: PATCH — set purchaseable=false

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `purchaseable=true`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "purchaseable": false
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `purchaseable=false`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "purchaseable": false
}
```

**Validation Points:**
- Status code is 200.
- `purchaseable` is `false` in the response.

---

## ATC-UPDATE-011: PATCH — set salable=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `salable=false`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "salable": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `salable=true`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "salable": true
}
```

**Validation Points:**
- Status code is 200.
- `salable` is `true` in the response.

---

## ATC-UPDATE-012: PATCH — set trackable=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `trackable=false`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "trackable": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `trackable=true`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "trackable": true
}
```

**Validation Points:**
- Status code is 200.
- `trackable` is `true` in the response.
- Enabling trackable means stock items for this part will require serial numbers (verified separately).

---

## ATC-UPDATE-013: PATCH — set virtual=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `virtual=false`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "virtual": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `virtual=true`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "virtual": true
}
```

**Validation Points:**
- Status code is 200.
- `virtual` is `true` in the response.

---

## ATC-UPDATE-014: PATCH — set testable=true

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `testable=false`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "testable": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `testable=true`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "testable": true
}
```

**Validation Points:**
- Status code is 200.
- `testable` is `true` in the response.

---

## ATC-UPDATE-015: PATCH — update IPN field

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "IPN": "IPN-RES-10K-B"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with updated `IPN`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "IPN": "IPN-RES-10K-B"
}
```

**Validation Points:**
- Status code is 200.
- `IPN` in response equals `"IPN-RES-10K-B"`.
- IPN is within the 100-character maximum.

---

## ATC-UPDATE-016: PATCH — update units field

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "units": "pcs"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with updated `units`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "units": "pcs"
}
```

**Validation Points:**
- Status code is 200.
- `units` in response equals `"pcs"`.
- Value is within the 20-character maximum.

---

## ATC-UPDATE-017: PATCH — update notes field

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "These are updated notes for the 10k resistor. Handle with care during reflow soldering."
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with updated `notes`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "notes": "These are updated notes for the 10k resistor. Handle with care during reflow soldering."
}
```

**Validation Points:**
- Status code is 200.
- `notes` reflects the updated text.
- Notes field accepts up to 50000 characters.

---

## ATC-UPDATE-018: PATCH — update link field with valid URI

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "link": "https://www.yageo.com/en/product/RC0402FR-0710KL"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with updated `link`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "link": "https://www.yageo.com/en/product/RC0402FR-0710KL"
}
```

**Validation Points:**
- Status code is 200.
- `link` in response equals the submitted URI.
- Field accepts up to 2000 characters.

---

## ATC-UPDATE-019: PATCH — update keywords field

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "keywords": "resistor, 10k, smd, 0402, 1%"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with updated `keywords`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "keywords": "resistor, 10k, smd, 0402, 1%"
}
```

**Validation Points:**
- Status code is 200.
- `keywords` reflects the updated value.
- Within 250-character maximum.

---

## ATC-UPDATE-020: PATCH — update minimum_stock

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "minimum_stock": 50.0
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with updated `minimum_stock`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "minimum_stock": 50.0
}
```

**Validation Points:**
- Status code is 200.
- `minimum_stock` in response is `50.0`.
- Accepts decimal/float values.

---

## ATC-UPDATE-021: PATCH — update default_expiry

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "default_expiry": 365
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `default_expiry=365`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "default_expiry": 365
}
```

**Validation Points:**
- Status code is 200.
- `default_expiry` in response is `365`.
- Valid range: 0 to 9223372036854775807 (int64 max).

---

## ATC-UPDATE-022: PATCH — update default_location

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.
- A stock location exists with a known `pk` (e.g., `pk=5`). Verify via `GET /api/stock/location/?limit=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "default_location": 5
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Confirm stock location `pk=5` exists via `GET /api/stock/location/5/`.
3. Send `PATCH /api/part/1/` with `default_location=5`.
4. Verify `GET /api/part/1/` shows `default_location=5`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "default_location": 5,
  "default_location_detail": {
    "pk": 5
  }
}
```

**Validation Points:**
- Status code is 200.
- `default_location` in response equals 5.
- `default_location_detail.pk` equals 5.

---

## ATC-UPDATE-023: PATCH — set locked=true

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `locked=false`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "locked": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `locked=true`.
3. Verify the response shows `locked=true`.
4. Attempt `PATCH /api/part/1/` with `{"name": "New Name"}` — expect failure (tested in ATC-UPDATE-035).

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "locked": true
}
```

**Validation Points:**
- Status code is 200.
- `locked` in response is `true`.
- Subsequent PATCH operations on this part should be rejected.

---

## ATC-UPDATE-024: PATCH — update part to same value (idempotent)

**Priority:** Low
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `name="Resistor 10k Ohm"`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Resistor 10k Ohm"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with the same name that already exists.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "name": "Resistor 10k Ohm"
}
```

**Validation Points:**
- Status code is 200.
- No error is returned for sending the same value.
- Response fields are unchanged.

---

## ATC-UPDATE-025: PATCH — attempt to update readOnly field pk (ignored)

**Priority:** Medium
**Type:** Edge Case

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pk": 9999,
  "name": "Resistor 10k Ohm"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` including `pk=9999` alongside a valid `name`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:**
```json
{
  "pk": 1,
  "name": "Resistor 10k Ohm"
}
```

**Validation Points:**
- Status code is 200 (the request succeeds because name is valid).
- `pk` in the response is still `1` (server-assigned); the submitted value of 9999 was silently ignored.
- Sending a readOnly field does not cause a 400 error.

---

## ATC-UPDATE-026: PATCH — attempt to update readOnly field barcode_hash (ignored)

**Priority:** Medium
**Type:** Edge Case

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "barcode_hash": "fakehash123",
  "name": "Resistor 10k Ohm"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Note the current `barcode_hash` via `GET /api/part/1/`.
3. Send `PATCH /api/part/1/` including `barcode_hash` with a bogus value.
4. Verify the `barcode_hash` in the response is unchanged.

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200.
- `barcode_hash` in the response retains its original server-assigned value.
- The submitted `barcode_hash` value was silently ignored.

---

## ATC-UPDATE-027: PATCH — attempt to update readOnly field full_name (ignored)

**Priority:** Medium
**Type:** Edge Case

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "FAKE FULL NAME",
  "name": "Resistor 10k Ohm"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Note the current `full_name` via `GET /api/part/1/`.
3. Send `PATCH /api/part/1/` with `full_name` set to a fake value.
4. Verify `full_name` in response is server-computed.

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200.
- `full_name` reflects the server-computed value (typically the part name + revision, not the submitted string).
- ReadOnly enforcement is silent (no 400 error for the ignored field).

---

## ATC-UPDATE-028: PATCH — attempt to update readOnly field in_stock (ignored)

**Priority:** Medium
**Type:** Edge Case

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "in_stock": 9999.0,
  "name": "Resistor 10k Ohm"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Note the current `in_stock` via `GET /api/part/1/`.
3. Send `PATCH /api/part/1/` with `in_stock=9999.0`.
4. Verify `in_stock` in response is unchanged.

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200.
- `in_stock` in response retains the actual inventory count, not 9999.
- ReadOnly enforcement is silent.

---

## ATC-UPDATE-029: PATCH — attempt to update readOnly field creation_date (ignored)

**Priority:** Medium
**Type:** Edge Case

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "creation_date": "2000-01-01",
  "name": "Resistor 10k Ohm"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Note the current `creation_date` via `GET /api/part/1/`.
3. Send `PATCH /api/part/1/` with `creation_date="2000-01-01"`.
4. Verify `creation_date` is unchanged.

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200.
- `creation_date` retains its original value, not `"2000-01-01"`.

---

## ATC-UPDATE-030: PATCH — attempt to update readOnly field starred (ignored)

**Priority:** Medium
**Type:** Edge Case

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` where `starred=false`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "starred": true,
  "name": "Resistor 10k Ohm"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `starred=true`.
3. Verify `starred` value is unchanged in the response.

**Expected Response:**
- **Status Code:** 200

**Validation Points:**
- Status code is 200.
- `starred` is unchanged from its original value (readOnly).
- No error is returned.

---

## ATC-UPDATE-031: PATCH — update name to empty string (should fail)

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": ""
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with `name=""`.
3. Expect a validation error response.

**Expected Response:**
- **Status Code:** 400
- **Key Response Fields:**
```json
{
  "name": ["This field may not be blank."]
}
```

**Validation Points:**
- Status code is 400.
- Response body contains an error under the `name` key.
- Part is not modified (verify with follow-up GET).

---

## ATC-UPDATE-032: PATCH — update name exceeding maxLength=100

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
}
```

(Note: The above string is 103 characters, exceeding the 100-character maximum.)

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with a 103-character name.

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
- Error message references the 100-character limit.
- Part is not modified.

---

## ATC-UPDATE-033: PATCH — update with invalid category (non-existent ID)

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.
- Category `pk=999999` does not exist.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": 999999
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with a non-existent category ID.

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
- Error references the invalid category ID.
- Part category is unchanged.

---

## ATC-UPDATE-034: PATCH — update with non-integer category value

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": "electronics"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/1/` with a string value for `category`.

**Expected Response:**
- **Status Code:** 400
- **Key Response Fields:**
```json
{
  "category": ["A valid integer is required."]
}
```

**Validation Points:**
- Status code is 400.
- Error indicates a valid integer is required for the `category` field.

---

## ATC-UPDATE-035: PATCH/PUT — update a locked part (should fail)

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1` and `locked=true`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Attempting to modify locked part"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Ensure part `pk=1` has `locked=true` (set via ATC-UPDATE-023 or directly).
3. Send `PATCH /api/part/1/` with a name change.
4. Expect an error response indicating the part is locked.

**Expected Response:**
- **Status Code:** 400
- **Key Response Fields:**
```json
{
  "locked": ["Locked parts cannot be edited."]
}
```

**Assumption:** InvenTree returns 400 when attempting to update a locked part. The exact error field and message may differ; this is marked as assumption-based.

**Validation Points:**
- Status code is 400 (or 403, if enforced as a permission error).
- Response contains an error indicating the part cannot be modified.
- Part `name` is unchanged after the failed PATCH.

---

## ATC-UPDATE-036: PUT — missing required name field

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- A part exists with `pk=1`.

**Endpoint:** `PUT /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "A part without a name",
  "active": true
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PUT /api/part/1/` without the required `name` field.

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
- Error specifically references the missing `name` field.
- Part is not modified.

---

## ATC-UPDATE-037: PATCH/PUT — update non-existent part (404)

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- Part `pk=999999` does not exist.

**Endpoint:** `PATCH /api/part/999999/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Ghost Part"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/999999/` targeting a non-existent part ID.

**Expected Response:**
- **Status Code:** 404
- **Key Response Fields:**
```json
{
  "detail": "No Part matches the given query."
}
```

**Validation Points:**
- Status code is 404.
- Response body contains a `detail` error message.

---

## ATC-UPDATE-038: PATCH — as reader account (403)

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for `reader` user (password: `readonly`).
- A part exists with `pk=1`.

**Endpoint:** `PATCH /api/part/{id}/`

**Headers:**
```
Authorization: Token <obtained-for-reader-user>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Reader Trying to Update"
}
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/` with `username=reader`, `password=readonly`.
2. Send `PATCH /api/part/1/` using the reader token.

**Expected Response:**
- **Status Code:** 403
- **Key Response Fields:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Validation Points:**
- Status code is 403.
- Part is not modified.
- The `reader` account cannot perform write operations.

---

## ATC-UPDATE-039: Bulk PATCH on /api/part/ — update multiple parts

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- At least two parts exist with known PKs (e.g., `pk=1` and `pk=2`).

**Endpoint:** `PATCH /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "pk": 1,
    "minimum_stock": 10.0
  },
  {
    "pk": 2,
    "minimum_stock": 25.0
  }
]
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PATCH /api/part/` with an array of objects, each containing `pk` and the field(s) to update.
3. Verify `GET /api/part/1/` shows `minimum_stock=10.0`.
4. Verify `GET /api/part/2/` shows `minimum_stock=25.0`.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:** Array of updated part objects.

**Assumption:** Bulk PATCH on the list endpoint accepts an array of `{pk, fields}` objects. The exact accepted format may vary; if not supported, expect 405 Method Not Allowed.

**Validation Points:**
- Status code is 200.
- Both parts are updated as specified.
- Parts not included in the payload are not affected.

---

## ATC-UPDATE-040: Bulk PUT on /api/part/ — replace multiple parts

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for `allaccess` user.
- At least two parts exist with known PKs (e.g., `pk=1` and `pk=2`).

**Endpoint:** `PUT /api/part/`

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "pk": 1,
    "name": "Resistor 10k Ohm",
    "description": "SMD resistor 0402",
    "active": true
  },
  {
    "pk": 2,
    "name": "Capacitor 100nF",
    "description": "SMD capacitor 0402",
    "active": true
  }
]
```

**Steps:**
1. Obtain authentication token via `POST /api/user/token/`.
2. Send `PUT /api/part/` with an array of complete part replacement objects.
3. Verify individual GETs for both parts confirm the updated values.

**Expected Response:**
- **Status Code:** 200
- **Key Response Fields:** Array of fully updated part objects.

**Assumption:** Bulk PUT on the list endpoint accepts an array of complete objects. If not supported, expect 405 Method Not Allowed.

**Validation Points:**
- Status code is 200 if bulk operations are supported.
- Both parts reflect the submitted data.
- Other parts are not affected.

---
