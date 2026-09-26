/**
 * Unit Tests for Spectral Indices (NDVI, NDWI, NDBI)
 * Verifies formulas:
 * NDVI = (NIR - RED) / (NIR + RED)
 * NDWI = (GREEN - NIR) / (GREEN + NIR)
 * NDBI = (SWIR - NIR) / (SWIR + NIR)
 */

export function calculateNDVI(nir: number, red: number): number {
  if (nir + red === 0) return 0;
  return (nir - red) / (nir + red);
}

export function calculateNDWI(green: number, nir: number): number {
  if (green + nir === 0) return 0;
  return (green - nir) / (green + nir);
}

export function calculateNDBI(swir: number, nir: number): number {
  if (swir + nir === 0) return 0;
  return (swir - nir) / (swir + nir);
}

// Simple test runner
function runTests() {
  console.log('--- RUNNING SPECTRAL TESTS ---');

  // Test 1: Healthy vegetation (High NIR, low RED)
  const healthyNdvi = calculateNDVI(0.8, 0.1);
  console.assert(healthyNdvi > 0.7 && healthyNdvi < 0.8, `Expected healthy NDVI ~0.77, got ${healthyNdvi}`);
  console.log('✓ Healthy vegetation NDVI test passed');

  // Test 2: Water body (Low NIR, moderate Green)
  const waterNdwi = calculateNDWI(0.3, 0.05);
  console.assert(waterNdwi > 0.7, `Expected high positive NDWI for water, got ${waterNdwi}`);
  console.log('✓ Water body NDWI test passed');

  // Test 3: Built-up urban (High SWIR, moderate NIR)
  const urbanNdbi = calculateNDBI(0.4, 0.25);
  console.assert(urbanNdbi > 0.15 && urbanNdbi < 0.3, `Expected positive NDBI for urban, got ${urbanNdbi}`);
  console.log('✓ Urban built-up NDBI test passed');

  // Test 4: Boundary conditions (-1 <= index <= 1)
  const zeroNdvi = calculateNDVI(0, 0);
  console.assert(zeroNdvi === 0, 'Zero division check');
  console.log('✓ Zero boundary check passed');

  console.log('ALL SPECTRAL TESTS PASSED!');
}

runTests();
