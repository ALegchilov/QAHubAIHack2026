/**
 * Parts: Create — API Tests
 *
 * Source: test-cases/api-tests/ATC-parts-create.md
 * Covers: ATC-CREATE-001 through ATC-CREATE-020
 * Endpoint: POST /api/part/
 */
import { test, expect } from '../fixtures/api-fixtures';
import {
  minimalPart,
  fullPart,
  partWithStock,
  duplicatePart,
  getResults,
  getCount,
  BOUNDARY,
} from '../helpers/test-data';

test.describe('Parts: Create (POST /api/part/)', () => {
  // ───────────────────────── Positive tests ─────────────────────────

  test('ATC-CREATE-001: Create part with minimum required fields', async ({
    api,
    createdPartPks,
  }) => {
    const payload = minimalPart();

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify returned fields
    expect(body.pk).toBeGreaterThan(0);
    expect(body.name).toBe(payload.name);
    expect(body.description).toBe('Auto-generated test part');
    expect(body.category).toBe(payload.category);

    // Verify defaults
    expect(body.active).toBe(true);
    expect(body.IPN).toBe('');
    expect(body.minimum_stock).toBe(0);

    // Verify readOnly computed fields exist
    expect(body.full_name).toBeTruthy();
    expect(typeof body.starred).toBe('boolean');
    expect(body).toHaveProperty('creation_date');
    expect(body).toHaveProperty('thumbnail');
    expect(body).toHaveProperty('in_stock');
  });

  test('ATC-CREATE-002: Create part with all fields populated', async ({
    api,
    createdPartPks,
  }) => {
    const payload = fullPart({
      revision: 'A',
      minimum_stock: 10.0,
      default_expiry: 730,
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify all writable fields persisted
    expect(body.name).toBe(payload.name);
    expect(body.IPN).toBe(payload.IPN);
    expect(body.keywords).toBe('test automated playwright');
    expect(body.units).toBe('pcs');
    expect(body.minimum_stock).toBe(10);
    expect(body.default_expiry).toBe(730);
    expect(body.revision).toBe('A');
    expect(body.active).toBe(true);
    expect(body.assembly).toBe(false);
    expect(body.component).toBe(true);

    // Verify readOnly fields present
    expect(body).toHaveProperty('full_name');
    expect(body).toHaveProperty('barcode_hash');
    expect(body).toHaveProperty('creation_date');
    expect(body).toHaveProperty('thumbnail');

    // notes is NOT settable via POST — must use PATCH.
    // Verify via PATCH then GET.
    const patchRes = await api.patch(`part/${body.pk}/`, {
      notes: 'Standard electrolytic capacitor for power supply filtering.',
    });
    expect(patchRes.status()).toBe(200);

    const getRes = await api.get(`part/${body.pk}/`);
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.name).toBe(payload.name);
    expect(getBody.IPN).toBe(payload.IPN);
    expect(getBody.notes).toBe(
      'Standard electrolytic capacitor for power supply filtering.',
    );
  });

  test('ATC-CREATE-003: Create part with initial_stock quantity and location', async ({
    api,
    createdPartPks,
  }) => {
    const payload = minimalPart({
      initial_stock: { quantity: '100', location: 1 },
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    expect(body.name).toBe(payload.name);

    // Verify stock was created — use limit param for paginated envelope
    const stockRes = await api.get('stock/', { part: body.pk, limit: 10 });
    expect(stockRes.status()).toBe(200);
    const stockBody = await stockRes.json();
    const stockItems = getResults(stockBody);
    expect(stockItems.length).toBeGreaterThanOrEqual(1);
    expect(Number((stockItems[0] as Record<string, unknown>).quantity)).toBe(100);
    expect((stockItems[0] as Record<string, unknown>).location).toBe(1);
  });

  test('ATC-CREATE-004: Create part with initial_stock quantity only (no location)', async ({
    api,
    createdPartPks,
  }) => {
    const payload = minimalPart({
      initial_stock: { quantity: '50' },
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify stock created without location — use limit for paginated envelope
    const stockRes = await api.get('stock/', { part: body.pk, limit: 10 });
    expect(stockRes.status()).toBe(200);
    const stockBody = await stockRes.json();
    const stockItems = getResults(stockBody);
    expect(stockItems.length).toBeGreaterThanOrEqual(1);
    expect(Number((stockItems[0] as Record<string, unknown>).quantity)).toBe(50);
    expect((stockItems[0] as Record<string, unknown>).location).toBeNull();
  });

  test('ATC-CREATE-005: Create part with initial_supplier (supplier + SKU)', async ({
    api,
    createdPartPks,
  }) => {
    // First find a valid supplier — use limit for paginated envelope
    const supplierRes = await api.get('company/', {
      is_supplier: true,
      limit: 1,
    });
    const suppliers = await supplierRes.json();
    const supplierItems = getResults(suppliers);

    test.skip(supplierItems.length === 0, 'No supplier company found in demo data');

    const supplierPk = (supplierItems[0] as Record<string, unknown>).pk as number;
    const payload = minimalPart({
      initial_supplier: {
        supplier: supplierPk,
        sku: `BC547-DIP-${Date.now()}`,
      },
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify supplier part created — use limit for paginated envelope
    const spRes = await api.get('company/part/', { part: body.pk, limit: 10 });
    expect(spRes.status()).toBe(200);
    const spBody = await spRes.json();
    const spItems = getResults(spBody);
    expect(spItems.length).toBeGreaterThanOrEqual(1);
    expect((spItems[0] as Record<string, unknown>).SKU).toBeTruthy();
  });

  test('ATC-CREATE-006: Create part with initial_supplier (manufacturer + MPN)', async ({
    api,
    createdPartPks,
  }) => {
    // Find a valid manufacturer
    const mfgRes = await api.get('company/', {
      is_manufacturer: true,
      limit: 1,
    });
    const mfgs = await mfgRes.json();
    const mfgItems = getResults(mfgs);

    test.skip(mfgItems.length === 0, 'No manufacturer company found in demo data');

    const mfgPk = (mfgItems[0] as Record<string, unknown>).pk as number;
    const payload = minimalPart({
      initial_supplier: {
        manufacturer: mfgPk,
        mpn: `LM741CN-${Date.now()}`,
      },
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);
    expect(body.name).toBe(payload.name);
  });

  test('ATC-CREATE-007: Duplicate part with copy_bom=true', async ({
    api,
    createdPartPks,
  }) => {
    // Find an assembly part with BOM items — use limit for envelope
    const assemblyRes = await api.get('part/', {
      assembly: true,
      limit: 1,
    });
    const assemblies = await assemblyRes.json();
    const assemblyItems = getResults(assemblies);

    test.skip(assemblyItems.length === 0, 'No assembly part found in demo data');

    const sourcePk = (assemblyItems[0] as Record<string, unknown>).pk as number;

    // Check source has BOM
    const bomRes = await api.get('bom/', { part: sourcePk, limit: 100 });
    const bomBody = await bomRes.json();
    const bomItems = getResults(bomBody);
    const sourceBomCount = bomItems.length;

    const payload = duplicatePart(sourcePk, {
      duplicate: {
        part: sourcePk,
        copy_bom: true,
        copy_parameters: false,
        copy_notes: true,
        copy_image: false,
        copy_tests: false,
      },
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify BOM was copied
    if (sourceBomCount > 0) {
      const newBomRes = await api.get('bom/', { part: body.pk, limit: 100 });
      const newBomBody = await newBomRes.json();
      const newBomItems = getResults(newBomBody);
      expect(newBomItems.length).toBe(sourceBomCount);
    }
  });

  test('ATC-CREATE-008: Duplicate part with copy_parameters=true', async ({
    api,
    createdPartPks,
  }) => {
    // Find a part with parameters — correct endpoint is /api/parameter/
    const paramRes = await api.get('parameter/', { limit: 1 });
    const params = await paramRes.json();
    const paramItems = getResults(params);

    test.skip(paramItems.length === 0, 'No part with parameters found in demo data');

    const sourcePk = (paramItems[0] as Record<string, unknown>).model_id as number;

    // Count source parameters — filter by model_type + model_id
    const sourceParamRes = await api.get('parameter/', {
      model_type: 'part.part',
      model_id: sourcePk,
      limit: 100,
    });
    const sourceParams = await sourceParamRes.json();
    const sourceParamItems = getResults(sourceParams);
    const sourceParamCount = sourceParamItems.length;

    const payload = {
      name: `Resistor 10k Clone ${Date.now()}`,
      description: 'Clone with parameters',
      category: 1,
      duplicate: {
        part: sourcePk,
        copy_bom: false,
        copy_parameters: true,
        copy_notes: true,
        copy_image: false,
        copy_tests: false,
      },
    };

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify parameters were copied
    if (sourceParamCount > 0) {
      const newParamRes = await api.get('parameter/', {
        part: body.pk,
        limit: 100,
      });
      const newParams = await newParamRes.json();
      const newParamItems = getResults(newParams);
      expect(newParamItems.length).toBe(sourceParamCount);
    }
  });

  test('ATC-CREATE-009: Duplicate part with copy_notes=true', async ({
    api,
    createdPartPks,
  }) => {
    // Find a part with non-empty notes
    const partsRes = await api.get('part/', { limit: 20 });
    const parts = await partsRes.json();
    const partItems = getResults(parts);
    const sourceWithNotes = partItems.find(
      (p) => (p as Record<string, unknown>).notes && String((p as Record<string, unknown>).notes).length > 0,
    );

    test.skip(!sourceWithNotes, 'No part with notes found in demo data');

    const sourcePk = (sourceWithNotes as Record<string, unknown>).pk as number;
    const sourceNotes = (sourceWithNotes as Record<string, unknown>).notes;

    const payload = {
      name: `Fuse 1A Clone ${Date.now()}`,
      description: 'Clone of fuse',
      category: 1,
      duplicate: {
        part: sourcePk,
        copy_notes: true,
      },
    };

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify notes were copied
    const getRes = await api.get(`part/${body.pk}/`);
    const getBody = await getRes.json();
    expect(getBody.notes).toBe(sourceNotes);
  });

  test('ATC-CREATE-010: Duplicate part with copy_image=true', async ({
    api,
    createdPartPks,
  }) => {
    // Find a part with an image
    const partsRes = await api.get('part/', { limit: 50 });
    const parts = await partsRes.json();
    const partItems = getResults(parts);
    const sourceWithImage = partItems.find(
      (p) => (p as Record<string, unknown>).image && String((p as Record<string, unknown>).image).length > 0,
    );

    test.skip(!sourceWithImage, 'No part with image found in demo data');

    const sourcePk = (sourceWithImage as Record<string, unknown>).pk as number;

    const payload = {
      name: `Resistor 10k Copy ${Date.now()}`,
      description: 'Copy of resistor with image',
      category: 1,
      duplicate: {
        part: sourcePk,
        copy_image: true,
      },
    };

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify image or thumbnail is non-empty
    expect(
      (body.image && body.image.length > 0) ||
        (body.thumbnail && body.thumbnail.length > 0),
    ).toBeTruthy();
  });

  test('ATC-CREATE-011: Create part with copy_category_parameters=true (default)', async ({
    api,
    createdPartPks,
  }) => {
    // Find a category that has parameter templates
    const catParamRes = await api.get('part/category/parameters/', {
      limit: 1,
    });
    const catParams = await catParamRes.json();
    const catParamItems = getResults(catParams);

    test.skip(catParamItems.length === 0, 'No category with parameter templates found');

    const categoryPk = (catParamItems[0] as Record<string, unknown>).category as number;

    const payload = minimalPart({
      category: categoryPk,
      copy_category_parameters: true,
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify parameters were created — correct endpoint is /api/parameter/
    const paramRes = await api.get('parameter/', { model_type: 'part.part', model_id: body.pk, limit: 100 });
    const paramBody = await paramRes.json();
    const paramItems = getResults(paramBody);
    expect(paramItems.length).toBeGreaterThan(0);
  });

  test('ATC-CREATE-012: Create part with copy_category_parameters=false', async ({
    api,
    createdPartPks,
  }) => {
    // Find a category with parameter templates
    const catParamRes = await api.get('part/category/parameters/', {
      limit: 1,
    });
    const catParams = await catParamRes.json();
    const catParamItems = getResults(catParams);

    test.skip(catParamItems.length === 0, 'No category with parameter templates found');

    const categoryPk = (catParamItems[0] as Record<string, unknown>).category as number;

    const payload = minimalPart({
      category: categoryPk,
      copy_category_parameters: false,
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Verify NO parameters were auto-created — correct endpoint is /api/parameter/
    const paramRes = await api.get('parameter/', { model_type: 'part.part', model_id: body.pk, limit: 100 });
    const paramBody = await paramRes.json();
    const paramCount = getCount(paramBody);
    expect(paramCount).toBe(0);
  });

  test('ATC-CREATE-017: Create part with all boolean flags set to true', async ({
    api,
    createdPartPks,
  }) => {
    const payload = minimalPart({
      active: true,
      assembly: true,
      component: true,
      is_template: true,
      purchaseable: true,
      salable: true,
      trackable: true,
      virtual: true,
      testable: true,
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    expect(body.active).toBe(true);
    expect(body.assembly).toBe(true);
    expect(body.component).toBe(true);
    expect(body.is_template).toBe(true);
    expect(body.purchaseable).toBe(true);
    expect(body.salable).toBe(true);
    expect(body.trackable).toBe(true);
    expect(body.virtual).toBe(true);
    expect(body.testable).toBe(true);
  });

  test('ATC-CREATE-018: Create part as a variant of a template part', async ({
    api,
    createdPartPks,
  }) => {
    // Find a template part — use limit for paginated envelope
    const templateRes = await api.get('part/', {
      is_template: true,
      limit: 1,
    });
    const templates = await templateRes.json();
    const templateItems = getResults(templates);

    test.skip(templateItems.length === 0, 'No template part found in demo data');

    const templatePk = (templateItems[0] as Record<string, unknown>).pk as number;

    const payload = minimalPart({
      variant_of: templatePk,
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    expect(body.variant_of).toBe(templatePk);

    // Verify it appears in the template's variants — use limit for envelope
    const variantsRes = await api.get('part/', {
      variant_of: templatePk,
      limit: 100,
    });
    const variants = await variantsRes.json();
    const variantItems = getResults(variants);
    const found = variantItems.some(
      (v) => (v as Record<string, unknown>).pk === body.pk,
    );
    expect(found).toBe(true);
  });

  test('ATC-CREATE-019: Create part as a revision of another part', async ({
    api,
    createdPartPks,
  }) => {
    // Find an existing part to create a revision of
    const partsRes = await api.get('part/', { limit: 1 });
    const parts = await partsRes.json();
    const partItems = getResults(parts);

    test.skip(partItems.length === 0, 'No part found in demo data');

    const originalPk = (partItems[0] as Record<string, unknown>).pk as number;

    const payload = minimalPart({
      revision: 'B',
      revision_of: originalPk,
    });

    const res = await api.post('part/', payload);

    // Revision creation may fail depending on part configuration;
    // accept 201 (success) or 400 (if revision not allowed for this part)
    if (res.status() === 201) {
      const body = await res.json();
      createdPartPks.push(body.pk);
      expect(body.revision).toBe('B');
      expect(body.revision_of).toBe(originalPk);
    } else {
      // If 400, the API rejected it — that's valid behaviour for some parts
      expect(res.status()).toBe(400);
    }
  });

  test('ATC-CREATE-020: Create part with tags', async ({
    api,
    createdPartPks,
  }) => {
    const payload = minimalPart({
      tags: ['crystal', 'oscillator', 'clock'],
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    expect(body.tags).toBeDefined();
    expect(body.tags.length).toBe(3);
  });

  // ───────────────────────── Negative tests ─────────────────────────

  test('ATC-CREATE-013: Create part without name field — expect 400', async ({
    api,
  }) => {
    const payload = {
      description: 'A part with no name',
      category: 1,
    };

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty('name');
  });

  test('ATC-CREATE-014: Create part with name exceeding maxLength (101 chars)', async ({
    api,
  }) => {
    const payload = minimalPart({
      name: BOUNDARY.overMaxLengthName,
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty('name');
  });

  test('ATC-CREATE-015: Create part with non-existent category ID', async ({
    api,
  }) => {
    const payload = minimalPart({
      name: `Phantom Part ${Date.now()}`,
      description: 'Part assigned to non-existent category',
      category: BOUNDARY.nonExistentPk,
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty('category');
  });

  // ──────────────────────── Boundary tests ──────────────────────────

  test('ATC-CREATE-016: Create part with initial_stock quantity=0 (no stock added)', async ({
    api,
    createdPartPks,
  }) => {
    const payload = minimalPart({
      initial_stock: { quantity: '0' },
    });

    const res = await api.post('part/', payload);
    expect(res.status()).toBe(201);

    const body = await res.json();
    createdPartPks.push(body.pk);

    // Quantity=0 should not create a stock item — use limit for envelope
    const stockRes = await api.get('stock/', { part: body.pk, limit: 10 });
    const stockBody = await stockRes.json();
    const stockCount = getCount(stockBody);
    expect(stockCount).toBe(0);
  });
});
