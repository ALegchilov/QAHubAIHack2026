# Parts Delete — API Test Cases

> API Spec: InvenTree OpenAPI v477
> Generated: 2026-04-13
> Target: https://demo.inventree.org/api/

## Summary

| ID | Title | Priority | Type |
|----|-------|----------|------|
| ATC-DELETE-001 | Simple delete — verify 204 response | High | Positive |
| ATC-DELETE-002 | Verify subsequent GET returns 404 after delete | High | Positive |
| ATC-DELETE-003 | Delete part with existing stock items | High | Negative |
| ATC-DELETE-004 | Delete part that is used as BOM sub_part | High | Negative |
| ATC-DELETE-005 | Delete part that has BOM items (is assembly) | Medium | Negative |
| ATC-DELETE-006 | Delete non-existent part — expect 404 | High | Negative |
| ATC-DELETE-007 | Delete as reader account — expect 403 | High | Negative |
| ATC-DELETE-008 | Delete a locked part — expect error | High | Negative |
| ATC-DELETE-009 | Delete an inactive part | Medium | Positive |
| ATC-DELETE-010 | Delete part with variant parts | Medium | Negative |
| ATC-DELETE-011 | Delete a template part that has variants | Medium | Negative |
| ATC-DELETE-012 | Delete using invalid (non-integer) ID | Medium | Negative |

---

## ATC-DELETE-001: Simple delete — verify 204 response

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for allaccess user via POST /api/user/token/.
- A part with no stock items, no BOM references, and no dependent relationships exists. Create one if needed via POST /api/part/ with name="Part To Delete", description="Disposable test part". Record the returned pk (e.g., pk=500).

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/ with username=allaccess, password=nolimits.
2. Create a part via POST /api/part/ and note its pk.
3. Send DELETE /api/part/{pk}/.

**Expected Response:**
- **Status Code:** 204
- **Body:** Empty (no response body)

**Validation Points:**
- Status code is exactly 204 (No Content).
- Response body is empty.
- No Content-Type header with a JSON body is returned.

---

## ATC-DELETE-002: Verify subsequent GET returns 404 after delete

**Priority:** High
**Type:** Positive

**Preconditions:**
- Valid API token obtained for allaccess user.
- A part has been successfully deleted. Record the deleted part's pk (e.g., pk=500).

**Endpoint:** GET /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Create a part via POST /api/part/ and note its pk.
3. Delete the part via DELETE /api/part/{pk}/ — expect 204.
4. Send GET /api/part/{pk}/ for the deleted part.

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
- Response body contains a detail field with a not-found message.
- The part is no longer accessible via GET /api/part/?search=<name> either.

---

## ATC-DELETE-003: Delete part with existing stock items

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for allaccess user.
- A part exists with at least one associated stock item. Verify via GET /api/stock/?part={pk}&limit=1.

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Identify a part with stock items via GET /api/part/?has_stock=true&limit=1.
3. Record the part pk (e.g., pk=10).
4. Send DELETE /api/part/10/.

**Expected Response:**
- **Status Code:** 400
- **Key Response Fields:**
```json
{
  "detail": "Part cannot be deleted as it has stock items."
}
```

**Assumption:** InvenTree prevents deletion of parts with associated stock items and returns 400. Exact error format may differ.

**Validation Points:**
- Status code is 400 (or non-204 error code).
- Response body contains an explanatory error message.
- Part still exists — verify via GET /api/part/{pk}/ returning 200.

---

## ATC-DELETE-004: Delete part that is used as BOM sub_part

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for allaccess user.
- A part exists that is referenced as a sub_part in at least one BOM item. Verify via GET /api/bom/?sub_part={pk}&limit=1.

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Find a part used as a BOM component: GET /api/bom/?limit=1 and note sub_part.
3. Record that part's pk (e.g., pk=20).
4. Send DELETE /api/part/20/.

**Expected Response:**
- **Status Code:** 400

**Assumption:** InvenTree prevents deletion of parts referenced in BOM items. Marked as assumption-based.

**Validation Points:**
- Status code is non-204.
- Part still exists after the failed delete.
- BOM item referencing this part is intact.

---

## ATC-DELETE-005: Delete part that has BOM items (is assembly)

**Priority:** Medium
**Type:** Negative

**Preconditions:**
- Valid API token obtained for allaccess user.
- A part with assembly=true exists that has BOM items defined.

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Find an assembly part with BOM items via GET /api/part/?assembly=true&limit=1.
3. Confirm it has BOM items: GET /api/bom/?part={pk}&limit=1.
4. Send DELETE /api/part/{pk}/.

**Expected Response:**
- **Status Code:** 400

**Assumption:** An assembly part with BOM items cannot be deleted without first removing BOM items. Marked as assumption-based.

**Validation Points:**
- Status code is non-204.
- Error message references the BOM dependency.
- Part is still accessible via GET.

---

## ATC-DELETE-006: Delete non-existent part — expect 404

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for allaccess user.
- Part with pk=999999 does not exist.

**Endpoint:** DELETE /api/part/999999/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Send DELETE /api/part/999999/.

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
- Response body contains a detail field with a not-found message.

---

## ATC-DELETE-007: Delete as reader account — expect 403

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for reader user (password: readonly).
- A part exists with pk=1 (or any valid pk).

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-for-reader-user>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/ with username=reader, password=readonly.
2. Send DELETE /api/part/1/ using the reader token.

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
- Part is not deleted — verify via GET /api/part/1/ returning 200.

---

## ATC-DELETE-008: Delete a locked part — expect error

**Priority:** High
**Type:** Negative

**Preconditions:**
- Valid API token obtained for allaccess user.
- A part exists with pk=1 and locked=true. Set locked=true via PATCH /api/part/1/ with {"locked": true} if needed.

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Ensure part pk=1 has locked=true (via PATCH if needed).
3. Send DELETE /api/part/1/.

**Expected Response:**
- **Status Code:** 400

**Assumption:** InvenTree returns 400 when attempting to delete a locked part. Exact error may differ; marked as assumption-based.

**Validation Points:**
- Status code is non-204.
- Part still exists after the failed delete.
- locked field remains true.

---

## ATC-DELETE-009: Delete an inactive part

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- Valid API token obtained for allaccess user.
- An inactive part with no stock items and no BOM references exists with active=false. Create via POST /api/part/ with name="Inactive Part To Delete", description="Inactive test", active=false. Record the returned pk.

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Create an inactive part and note its pk.
3. Send DELETE /api/part/{pk}/.
4. Verify GET /api/part/{pk}/ returns 404.

**Expected Response:**
- **Status Code:** 204

**Validation Points:**
- Status code is 204.
- Inactive parts can be deleted without restriction (assuming no dependencies).
- Follow-up GET returns 404.

---

## ATC-DELETE-010: Delete part with variant parts

**Priority:** Medium
**Type:** Negative

**Preconditions:**
- Valid API token obtained for allaccess user.
- A template part exists with at least one variant part referencing it via variant_of.

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Find a template part: GET /api/part/?is_template=true&limit=1 and note its pk.
3. Confirm it has variants: GET /api/part/?variant_of={pk}&limit=1.
4. Attempt to delete the template: DELETE /api/part/{pk}/.

**Expected Response:**
- **Status Code:** 400

**Assumption:** Deleting a template part that has variant parts is prevented. Marked as assumption-based.

**Validation Points:**
- Status code is non-204.
- Error message references variant dependencies.
- Template part still exists.

---

## ATC-DELETE-011: Delete a template part that has variants

**Priority:** Medium
**Type:** Negative

**Preconditions:**
- Valid API token obtained for allaccess user.
- A template part (is_template=true) exists with variant parts (variant_of={template_pk}).

**Endpoint:** DELETE /api/part/{id}/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Identify a template part with variants (same setup as ATC-DELETE-010).
3. Send DELETE /api/part/{template_pk}/.

**Expected Response:**
- **Status Code:** 400

**Validation Points:**
- Status code is non-204.
- Template part is not deleted.
- Variant parts still reference the template via variant_of.

---

## ATC-DELETE-012: Delete using invalid (non-integer) ID

**Priority:** Medium
**Type:** Negative

**Preconditions:**
- Valid API token obtained for allaccess user.

**Endpoint:** DELETE /api/part/abc/

**Headers:**
```
Authorization: Token <obtained-via-api-token-endpoint>
```

**Steps:**
1. Obtain authentication token via POST /api/user/token/.
2. Send DELETE /api/part/abc/ using a non-integer ID in the path.

**Expected Response:**
- **Status Code:** 404

**Validation Points:**
- Status code is 404 (URL routing does not match the {id} integer pattern).
- No data is affected.

---
