import type { RunwayConfig } from '~/composables/useAirTraffic';

/**
 * Generates an array of Runway configurations based on canvas dimensions.
 * This layout recreates the original hardcoded setup.
 * @param width The width of the canvas.
 * @param height The height of the canvas.
 * @returns An array of RunwayConfig objects.
 */
export function getRunwayConfigs(
  width: number,
  height: number
): RunwayConfig[] {
  return [
    // Horizontal runway at the bottom-left, traffic flows East (right)
    {
      id: 'RWY09R',
      centerX: 250,
      centerY: height - 100,
      direction: 0, // 0 radians = East
      length: 200,
    },
    // Vertical runway at the top-right, traffic flows South (down)
    {
      id: 'RWY18L',
      centerX: width - 150,
      centerY: 200,
      direction: Math.PI / 2, // PI/2 radians = South
      length: 200,
    },
    // Diagonal runway in the center, traffic flows South-East
    {
      id: 'RWY13',
      centerX: width / 2,
      centerY: height / 2,
      direction: Math.PI / 4, // PI/4 radians = South-East
      length: 250,
      width: 15,
    },
    // Horizontal runway at the top-left, traffic flows West (left)
    {
      id: 'RWY27L',
      centerX: 250,
      centerY: 300,
      direction: Math.PI, // PI radians = West
      length: 200,
    },
  ];
}
