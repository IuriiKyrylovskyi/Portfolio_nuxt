import type { Waypoint } from '~/composables/useAirTraffic';

/**
 * Generates an array of Waypoint configurations based on canvas dimensions.
 * @param width The width of the canvas.
 * @param height The height of the canvas.
 * @returns An array of Waypoint objects.
 */
export function getWaypointConfigs(width: number, height: number): Waypoint[] {
  return [
    {
      name: 'JANJO',
      x: width - 80, // Positioned near the right edge
      y: height / 2, // Positioned vertically centered
      description: 'traffic queue to Europe ➜',
    },
    {
      name: 'BIMBO',
      x: 100, // Positioned near the left edge
      y: 100, // Positioned near the top
      description: 'arrivals from North ➜',
    },
  ];
}
