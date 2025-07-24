import { getLogoFilename } from '../components/WordCloud';

describe('Logo filename generator', () => {
  test('Handles standard apps', () => {
    expect(getLogoFilename("Deliveroo")).toBe("/delivery-logos/deliveroo.png");
    expect(getLogoFilename("Uber Eats")).toBe("/delivery-logos/ubereats.png");
  });

  test('Handles special characters', () => {
    expect(getLogoFilename("Snappy's Shopper")).toBe("/delivery-logos/snappysshopper.png");
  });

  test('Defaults to lowercase filename', () => {
    expect(getLogoFilename("UnknownApp")).toBe("/delivery-logos/unknownapp.png");
  });
});