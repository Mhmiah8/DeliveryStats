import { normalizeAppName } from '../utils/normalize';

test('normalizeAppName converts spaces to hyphens', () => {
  expect(normalizeAppName("Uber Eats")).toBe("uber-eats");
});