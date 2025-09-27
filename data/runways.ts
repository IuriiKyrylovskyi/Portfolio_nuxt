import type { RunwayConfig } from '~/composables/useAirTraffic';

/**
 * Generates an array of Runway configurations based on canvas dimensions.
 * This layout recreates the original hardcoded setup.
 * @param width The width of the canvas.
 * @param height The height of the canvas.
 * @returns An array of RunwayConfig objects.
 */

// IMPORTANT: This must be a function that returns an array.
export function getRunwayConfigs(
  width: number,
  height: number
): RunwayConfig[] {
  console.log(height);

  return [
    {
      id: 'RWY09R',
      centerX: 350,
      centerY: height - 100,
      direction: 0,
      length: 200,
    },
    {
      id: 'RWY18L',
      centerX: width - 150,
      centerY: 200,
      direction: Math.PI / 2,
      length: 100,
    },
    {
      id: 'RWY13',
      centerX: width / 2,
      centerY: height / 2,
      direction: Math.PI / 4,
      length: 250,
    },
    {
      id: 'RWY27L',
      centerX: 250,
      centerY: 300,
      direction: Math.PI,
      length: 200,
    },
  ];
}
