# Part Creation — UI Test Cases

> Module: Parts
> Area: Part Creation
> Generated: 2026-04-14
> Target: https://demo.inventree.org

## Research Notes

The "Add Part" dialog is accessed via:
**Parts page** → "Parts" tab → "+" (action-menu-add-parts) button → "Create Part" menu item.

### Form Fields (as observed in the live UI)

| Field | Type | Required | Notes |
|---|---|---|---|
| Category | Combobox (search) | No | Searchable dropdown |
| Name | Text | **Yes** (`*` marker) | Max 100 chars; HTML tags rejected |
| IPN | Text | No | Internal Part Number; duplicates allowed by default |
| Description | Text | No | Explicitly labeled "(optional)" |
| Revision | Text | No | Version string e.g. "v1.0" |
| Revision Of | Combobox (search) | No | Links this part as a revision of another |
| Variant Of | Combobox (search) | No | Links this part as a variant of a template |
| Keywords | Text | No | Space-separated keywords |
| Units | Text | No | Unit of measure string |
| Link | Text | No | External URL |
| Default Location | Combobox (search) | No | Stock location |
| Default Expiry | Number | No | Days; default 0 |
| Minimum Stock | Number | No | Default 0 |
| Responsible | Combobox (search) | No | User or group |
| Component (toggle) | Boolean | No | Default ON |
| Assembly (toggle) | Boolean | No | Default OFF |
| Is Template (toggle) | Boolean | No | Default OFF |
| Testable (toggle) | Boolean | No | Default OFF |
| Trackable (toggle) | Boolean | No | Default OFF |
| Purchaseable (toggle) | Boolean | No | Default ON |
| Salable (toggle) | Boolean | No | Default OFF |
| Virtual (toggle) | Boolean | No | Default OFF |
| Locked (toggle) | Boolean | No | Default OFF |
| Active (toggle) | Boolean | No | Default ON |
| Copy Category Parameters (toggle) | Boolean | No | Default ON |
| Initial Stock Quantity | Number | No | Section at bottom; default 0 (no stock added) |
| Initial Stock Location | Combobox (search) | No | Required only if initial stock > 0 |
| Keep form open (toggle) | Boolean | No | Keeps dialog open after submit for bulk entry |

### Observed Behaviors

- **Success:** Dialog closes; browser navigates to new part detail page at `/web/part/{id}/details`. Page title shows `Part: {name}`.
- **Validation — missing name:** Form stays open; error text "This field is required." appears below the Name field.
- **Validation — name > 100 chars:** Form stays open; error text "Ensure this field has no more than 100 characters." appears below the Name field.
- **Validation — HTML tags in name:** Form stays open; error "Remove HTML tags from this value." appears below the Name field.
- **Duplicate IPN:** Accepted by default on this demo (IPN uniqueness enforcement is a configurable setting).
- **Unicode / special chars (no angle brackets):** Accepted (verified with `Resistor 10kΩ ±5% #test @special`).
- **Image upload:** Not part of the Create dialog. Images are uploaded from the part detail page after creation.
- **Variant creation from template:** When creating a part from the Variants tab of a template part, the "Variant Of" field is pre-populated and the Name field is pre-filled with the template's name.

---

## Summary

| ID | Title | Priority | Type |
|----|-------|----------|------|
| TC-CREATE-001 | Create a part with only the required Name field | High | Positive |
| TC-CREATE-002 | Create a part with all optional text fields populated | High | Positive |
| TC-CREATE-003 | Create a part assigned to a specific category | High | Positive |
| TC-CREATE-004 | Create a part with all boolean flags toggled to ON | Medium | Positive |
| TC-CREATE-005 | Create a part as a variant of an existing template part (using Variant Of field) | High | Positive |
| TC-CREATE-006 | Create a variant part from the Variants tab of a template part | Medium | Positive |
| TC-CREATE-007 | Create a part as a revision of another part (using Revision Of field) | High | Positive |
| TC-CREATE-008 | Create a part with image uploaded after creation | Medium | Positive |
| TC-CREATE-009 | Create a part with initial stock quantity | Medium | Positive |
| TC-CREATE-010 | Attempt to create a part without a name — expect validation error | High | Negative |
| TC-CREATE-011 | Attempt to create a part with a name exceeding 100 characters | High | Negative |
| TC-CREATE-012 | Attempt to create a part with HTML tags in the name field | Medium | Negative |
| TC-CREATE-013 | Create a part with a duplicate IPN (enforcement OFF) — expect success | Medium | Negative |
| TC-CREATE-014 | Create a part with the maximum-length name (exactly 100 characters) | High | Boundary |
| TC-CREATE-015 | Create a part with special characters and Unicode in the name | Medium | Boundary |
| TC-CREATE-016 | Create a part with all optional fields left empty | Medium | Boundary |
| TC-CREATE-017 | Cancel the Create Part dialog without saving | Low | Edge Case |
| TC-CREATE-018 | Create a part using "Keep form open" to create multiple parts in sequence | Low | Edge Case |
| TC-CREATE-019 | Create a part with a name of exactly 1 character | Low | Boundary |

---

## TC-CREATE-001: Create a part with only the required Name field

**Priority:** High
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button in the table toolbar.
3. In the dropdown, click "Create Part".
4. In the "Add Part" dialog, leave the "Category" field empty.
5. In the "Name" field, enter `MinimalPart-TC001`.
6. Leave all other fields at their default values.
7. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page (URL pattern: `/web/part/{id}/details`).
- The page title contains `Part: MinimalPart-TC001`.
- The "No Stock" indicator is shown, reflecting zero initial stock.
- The "Component" and "Purchaseable" flags show as enabled (their defaults).

---

## TC-CREATE-002: Create a part with all optional text fields populated

**Priority:** High
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.
- A part category named `Electronics` exists in the system.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button in the table toolbar.
3. In the dropdown, click "Create Part".
4. In the "Category" field, type `Electronics` and select `Electronics` from the search results.
5. In the "Name" field, enter `FullFieldPart-TC002`.
6. In the "IPN" field, enter `IPN-TC002`.
7. In the "Description" field, enter `A part created with all optional text fields for testing`.
8. In the "Revision" field, enter `A`.
9. In the "Keywords" field, enter `test electronics resistor`.
10. In the "Units" field, enter `pcs`.
11. In the "Link" field, enter `https://example.com/datasheet-tc002`.
12. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The page title contains `IPN-TC002 | FullFieldPart-TC002 | A`.
- The Part Details table shows: Name = `FullFieldPart-TC002`, IPN = `IPN-TC002`, Description = `A part created with all optional text fields for testing`, Category = `Electronics`, Revision = `A`.
- Keywords and Link fields are displayed with the entered values on the Part Details tab.

---

## TC-CREATE-003: Create a part assigned to a specific category

**Priority:** High
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.
- A part category named `Fasteners` exists in the system.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Category" field, type `Fast` and wait for the dropdown to show `Fasteners`.
5. Select `Fasteners` from the dropdown.
6. In the "Name" field, enter `CategoryPart-TC003`.
7. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The Part Details tab shows the "Category" row with the value `Fasteners` (with a link to the category page).
- Navigating to the `Fasteners` category's "Parts" tab shows `CategoryPart-TC003` in the parts list.

---

## TC-CREATE-004: Create a part with all boolean flags toggled to ON

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter `AllFlagsPart-TC004`.
5. Scroll down to the boolean flag section.
6. Toggle "Assembly" to ON (it is OFF by default).
7. Toggle "Is Template" to ON.
8. Toggle "Testable" to ON.
9. Toggle "Trackable" to ON.
10. Toggle "Salable" to ON.
11. Toggle "Virtual" to ON.
12. Toggle "Locked" to ON.
13. Verify "Component", "Purchaseable", and "Active" are already ON (defaults).
14. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The Part Details tab shows all toggled flags as enabled:
  - Component: enabled
  - Assembly: enabled
  - Is Template: enabled
  - Testable: enabled
  - Trackable: enabled
  - Purchaseable: enabled
  - Salable: enabled
  - Virtual: enabled
  - Locked: enabled
  - Active: enabled
- The part appears in the parts list with the correct attributes.

---

## TC-CREATE-005: Create a part as a variant of an existing template part (using Variant Of field)

**Priority:** High
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- A template part named `AUTO_QA_TEMPLATE_PART` (pk: 1216) exists with `Is Template` = ON.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter `VariantPart-TC005`.
5. In the "Variant Of" field, type `AUTO_QA_TEMPLATE_PART` and select it from the search results.
6. In the "Description" field, enter `Variant part for TC-005`.
7. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The Part Details tab shows the "Variant Of" row with a link to `AUTO_QA_TEMPLATE_PART`.
- Navigating to `AUTO_QA_TEMPLATE_PART`'s Variants tab shows `VariantPart-TC005` in the variants list.

---

## TC-CREATE-006: Create a variant part from the Variants tab of a template part

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- A template part named `AUTO_QA_TEMPLATE_PART` (pk: 1216) exists.
- User navigates to the template part's detail page.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/1216/variants`.
2. In the Variants panel, click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. Verify the "Variant Of" field is pre-populated with `AUTO_QA_TEMPLATE_PART`.
5. Clear the "Name" field and enter `VariantFromTab-TC006`.
6. In the "Description" field, enter `Variant created from template Variants tab`.
7. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The Part Details tab shows "Variant Of" = `AUTO_QA_TEMPLATE_PART`.
- Navigating back to `AUTO_QA_TEMPLATE_PART`'s Variants tab shows `VariantFromTab-TC006` in the list.

---

## TC-CREATE-007: Create a part as a revision of another part (using Revision Of field)

**Priority:** High
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- An existing part named `1551ABK` (pk: 82) exists in the system.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter `RevisionPart-TC007`.
5. In the "Revision" field, enter `B`.
6. In the "Revision Of" field, type `1551ABK` and select it from the search results.
7. In the "Description" field, enter `Revised version B of 1551ABK`.
8. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The Part Details tab shows the "Revision" row with value `B`.
- The Part Details tab shows the "Revision Of" row with a link to `1551ABK`.
- The page title contains `RevisionPart-TC007 | B`.

---

## TC-CREATE-008: Upload an image for a part after creation

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- A part named `MinimalPart-TC001` was created (or any existing part without an image, e.g., pk: 1575).
- A valid image file (PNG or JPG) is available locally for upload.

**Steps:**
1. Navigate to the part's detail page (e.g., `https://demo.inventree.org/web/part/1575/details`).
2. On the "Part Details" tab, locate the part image thumbnail (blank/placeholder image) in the top-left of the detail panel.
3. Click the part image thumbnail.
4. In the image dialog that opens, look for an upload or change image option.
5. Upload a valid PNG image file.
6. Confirm the upload.

**Expected Results:**
- The image dialog closes.
- The part's image thumbnail updates to display the uploaded image.
- The image is visible when clicking the thumbnail again.

---

## TC-CREATE-009: Create a part with initial stock quantity

**Priority:** Medium
**Type:** Positive

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- A stock location exists in the system (e.g., "Home").
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter `StockPart-TC009`.
5. Scroll down to the "Initial Stock" section (it is expanded by default).
6. In the "Initial Stock Quantity" field, enter `50`.
7. In the "Initial Stock Location" field, type `Home` and select a location from the search results.
8. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The part header shows the stock quantity (e.g., "50") instead of "No Stock".
- Navigating to the "Stock" tab of the part shows 1 stock item with quantity 50 at the selected location.

---

## TC-CREATE-010: Attempt to create a part without a name — expect validation error

**Priority:** High
**Type:** Negative

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. Leave the "Name" field completely empty.
5. In the "Description" field, enter `No name test`.
6. Click the "Submit" button.

**Expected Results:**
- The dialog does NOT close.
- The browser URL remains unchanged at the Parts list page.
- A validation error message "This field is required." is displayed directly below the "Name" field.
- No new part is created in the database.

---

## TC-CREATE-011: Attempt to create a part with a name exceeding 100 characters

**Priority:** High
**Type:** Negative

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter a string of exactly 101 characters: `AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEEFFFFFFFFFFFGGGGGGGGGGHHHHHHHHHHIIIIIIIIIIJJJJJJJJJJK` (101 chars).
5. Click the "Submit" button.

**Expected Results:**
- The dialog does NOT close.
- A validation error message "Ensure this field has no more than 100 characters." is displayed below the "Name" field.
- No new part is created.

---

## TC-CREATE-012: Attempt to create a part with HTML tags in the name field

**Priority:** Medium
**Type:** Negative

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter `<script>alert('xss')</script>`.
5. Click the "Submit" button.

**Expected Results:**
- The dialog does NOT close.
- A validation error message "Remove HTML tags from this value" is displayed below the "Name" field.
- No new part is created.

---

## TC-CREATE-013: Create a part with a duplicate IPN when uniqueness enforcement is OFF

**Priority:** Medium
**Type:** Negative

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- A part with IPN `IPN-TC002` already exists (created in TC-CREATE-002 or similar).
- IPN uniqueness enforcement is OFF (the demo default).
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter `DuplicateIPN-TC013`.
5. In the "IPN" field, enter `IPN-TC002` (an IPN that already exists).
6. Click the "Submit" button.

**Expected Results:**
- The dialog closes without validation error (IPN uniqueness is not enforced by default).
- The browser navigates to the new part's detail page.
- The new part is created with IPN `IPN-TC002`.
- **Note:** If IPN uniqueness enforcement IS enabled, the form should remain open with an error stating the IPN already exists.

---

## TC-CREATE-014: Create a part with a name of exactly 100 characters (maximum allowed)

**Priority:** High
**Type:** Boundary

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter exactly 100 characters: `AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEEFFFFFFFFFFFGGGGGGGGGGHHHHHHHHHHIIIIIIIIIIJJ` (pad to 100).
   - Exact 100-char string: `AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEEFFFFFFFFFFGGGGGGGGGGHHHHHHHHHHIIIIIIIIIIJJJJ`
   - Verify the string length is exactly 100 before pasting.
5. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- No validation error is shown.
- The Part Details tab shows the full 100-character name.

---

## TC-CREATE-015: Create a part with special characters and Unicode in the name

**Priority:** Medium
**Type:** Boundary

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter `Résistor 10kΩ ±5% #A1 @test`.
5. In the "Description" field, enter `Part with Unicode and special characters`.
6. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The page title displays the name with all Unicode and special characters intact: `Résistor 10kΩ ±5% #A1 @test`.
- The Part Details tab shows the full name with all special characters preserved.

---

## TC-CREATE-016: Create a part with all optional fields left empty

**Priority:** Medium
**Type:** Boundary

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter `EmptyOptionalsPart-TC016`.
5. Leave all other fields at their default values (Category empty, Description empty, IPN empty, Revision empty, Keywords empty, Units empty, Link empty, all numeric fields at 0, all boolean fields at defaults).
6. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The Part Details tab shows the part name.
- Empty optional fields (Description, IPN, etc.) either show empty or are not displayed.
- No errors are shown for blank optional fields.

---

## TC-CREATE-017: Cancel the Create Part dialog without saving

**Priority:** Low
**Type:** Edge Case

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Note the current total count of parts shown in the table pagination (e.g., "1 - 25 / 837").
3. Click the "+" (Add Parts) action menu button.
4. Click "Create Part".
5. In the "Name" field, enter `CancelledPart-TC017`.
6. In the "Description" field, enter `This part should not be saved`.
7. Click the "Cancel" button.

**Expected Results:**
- The dialog closes immediately.
- The browser URL remains unchanged at the Parts list page.
- The parts table total count is unchanged (no new part was added).
- No part named `CancelledPart-TC017` appears in the parts list.

---

## TC-CREATE-018: Create multiple parts in sequence using "Keep form open"

**Priority:** Low
**Type:** Edge Case

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. Toggle the "Keep form open" switch to ON (it is near the bottom of the dialog).
5. In the "Name" field, enter `BulkPart-TC018-A`.
6. Click the "Submit" button.
7. After submission, verify the dialog remains open.
8. Clear the "Name" field and enter `BulkPart-TC018-B`.
9. Click the "Submit" button again.
10. Toggle "Keep form open" to OFF.
11. In the "Name" field, enter `BulkPart-TC018-C`.
12. Click the "Submit" button.

**Expected Results:**
- After step 6: The dialog stays open; the Name field is ready for the next entry.
- After step 9: The dialog stays open again.
- After step 12: The dialog closes and the browser navigates to the last part's detail page.
- All three parts (`BulkPart-TC018-A`, `BulkPart-TC018-B`, `BulkPart-TC018-C`) are found in the parts list.

---

## TC-CREATE-019: Create a part with a name of exactly 1 character (minimum boundary)

**Priority:** Low
**Type:** Boundary

**Preconditions:**
- User is logged in as `allaccess` / `nolimits`.
- User is on the Parts list page at `https://demo.inventree.org/web/part/category/index/parts`.

**Steps:**
1. Navigate to `https://demo.inventree.org/web/part/category/index/parts`.
2. Click the "+" (Add Parts) action menu button.
3. Click "Create Part".
4. In the "Name" field, enter a single character: `X`.
5. Click the "Submit" button.

**Expected Results:**
- The dialog closes without error.
- The browser navigates to the new part's detail page.
- The page title contains `Part: X`.
- The Part Details tab shows Name = `X`.
