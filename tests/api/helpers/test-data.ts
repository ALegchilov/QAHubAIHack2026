/**
 * Factory functions for generating realistic test data.
 *
 * Each factory produces deterministic-looking data with a unique
 * suffix so concurrent test workers don't collide.
 */

let _counter = 0;
function uid(): string {
  return `${Date.now()}-${++_counter}`;
}

// ---- Part payloads ----

export function minimalPart(overrides: Record<string, unknown> = {}) {
  return {
    name: `Test Part ${uid()}`,
    description: 'Auto-generated test part',
    category: 1,
    ...overrides,
  };
}

export function fullPart(overrides: Record<string, unknown> = {}) {
  return {
    name: `Full Part ${uid()}`,
    description: 'Fully populated test part for validation',
    category: 1,
    IPN: `IPN-TEST-${uid()}`,
    keywords: 'test automated playwright',
    link: 'https://example.com/datasheet.pdf',
    units: 'pcs',
    notes: 'Created by automated API test suite.',
    active: true,
    assembly: false,
    component: true,
    is_template: false,
    purchaseable: true,
    salable: false,
    trackable: false,
    virtual: false,
    testable: false,
    locked: false,
    minimum_stock: 5.0,
    default_expiry: 365,
    ...overrides,
  };
}

export function partWithStock(overrides: Record<string, unknown> = {}) {
  return {
    ...minimalPart(),
    initial_stock: {
      quantity: '100',
      location: 1,
    },
    ...overrides,
  };
}

export function partWithSupplier(
  supplierPk: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    ...minimalPart(),
    initial_supplier: {
      supplier: supplierPk,
      sku: `SKU-${uid()}`,
    },
    ...overrides,
  };
}

export function duplicatePart(
  sourcePk: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    name: `Duplicate Part ${uid()}`,
    description: 'Duplicated from source part',
    category: 1,
    duplicate: {
      part: sourcePk,
      copy_bom: true,
      copy_parameters: true,
      copy_notes: true,
      copy_image: false,
      copy_tests: false,
    },
    ...overrides,
  };
}

// ---- Category payloads ----

export function minimalCategory(overrides: Record<string, unknown> = {}) {
  return {
    name: `Test Category ${uid()}`,
    ...overrides,
  };
}

export function fullCategory(overrides: Record<string, unknown> = {}) {
  return {
    name: `Full Category ${uid()}`,
    description: 'Auto-generated test category',
    structural: false,
    ...overrides,
  };
}

export function nestedCategory(
  parentPk: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    name: `Child Category ${uid()}`,
    parent: parentPk,
    ...overrides,
  };
}

// ---- Response normalization helpers ----

/**
 * Normalize API response to extract results array.
 * InvenTree returns a flat array without `limit` param,
 * or a paginated envelope `{ count, results }` with `limit`.
 */
export function getResults(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object' && 'results' in body)
    return (body as Record<string, unknown>).results as unknown[] ?? [];
  return [];
}

/**
 * Normalize API response to extract total count.
 */
export function getCount(body: unknown): number {
  if (Array.isArray(body)) return body.length;
  if (body && typeof body === 'object' && 'count' in body)
    return (body as Record<string, unknown>).count as number ?? 0;
  return 0;
}

// ---- Boundary / edge-case data ----

export const BOUNDARY = {
  /** Exactly 100 characters (max allowed for part name) */
  maxLengthName: 'A'.repeat(100),

  /** 101 characters — should fail validation */
  overMaxLengthName: 'A'.repeat(101),

  /** Exactly 250 characters (max allowed for description) */
  maxLengthDescription: 'D'.repeat(250),

  /** 251 characters — should fail */
  overMaxLengthDescription: 'D'.repeat(251),

  /** Max IPN length (100) */
  maxLengthIPN: 'I'.repeat(100),
  overMaxLengthIPN: 'I'.repeat(101),

  /** Empty / whitespace strings */
  emptyString: '',
  whitespaceOnly: '   ',

  /** Special characters */
  unicodeName: 'Widerstand 10kΩ ±5% 电阻器',
  emojiName: 'Resistor 🔧 10k',
  sqlInjection: "'; DROP TABLE part; --",
  htmlXss: '<script>alert("xss")</script>',

  /** Large notes (near 50,000 char limit) */
  largeNotes: 'N'.repeat(50_000),
  overLargeNotes: 'N'.repeat(50_001),

  /** Numeric bounds */
  maxDefaultExpiry: 9223372036854775807,
  negativeMinimumStock: -1,
  zeroMinimumStock: 0,

  /** Non-existent foreign keys */
  nonExistentPk: 999999,
} as const;
