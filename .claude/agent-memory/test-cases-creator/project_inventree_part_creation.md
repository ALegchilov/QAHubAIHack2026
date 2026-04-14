---
name: InvenTree Part Creation UI Research
description: Key findings from live browser exploration of the Part Creation form in InvenTree demo
type: project
---

The "Add Part" dialog is reached via: Parts page > Parts tab > "+" (action-menu-add-parts) button > "Create Part" menu item.

Only the Name field is required (marked with *). Description is explicitly labeled "(optional)". Category is not required.

Name field validation:
- Empty name: "This field is required."
- Name > 100 chars: "Ensure this field has no more than 100 characters."
- Name with HTML angle-bracket tags: "Remove HTML tags from this value"
- Unicode, symbols (#, @, ±, Ω, accents) without angle brackets: accepted

On success the dialog closes and the browser navigates to /web/part/{id}/details.

IPN duplicates are allowed by default on the demo (no uniqueness enforcement).

Boolean defaults: Component=ON, Purchaseable=ON, Active=ON, Copy Category Parameters=ON. All others OFF.

Image upload is NOT in the Create dialog — it is done post-creation from the part detail page (clicking the thumbnail).

Variant creation from a template's Variants tab pre-populates "Variant Of" and pre-fills Name with the template name.

**Why:** Captured to avoid re-researching during future test automation or expansion work.
**How to apply:** Use these field details when generating Playwright specs or additional test cases for Part Creation.
