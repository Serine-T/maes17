import type { LucideIcon } from 'lucide-react';
import { Building2, Crosshair, FileCheck2, Landmark, Map, Mountain, Ruler, Waypoints } from 'lucide-react';
import type { ImageName } from './images';

/**
 * Service catalogue. Text lives in locales/<lang>/services.json under items.<slug>;
 * this module controls which services exist, their order, imagery and cross-links.
 * Remove an entry here (and its translation block) to unpublish a service.
 */
export interface ServiceDefinition {
  slug: ServiceSlug;
  image: ImageName;
  icon: LucideIcon;
  related: ServiceSlug[];
}

export const serviceSlugs = [
  'geodetic-control-networks',
  'land-surveying',
  'topographic-surveying',
  'cadastral-surveying',
  'construction-surveying',
  'land-management',
  'as-built-surveys',
  'engineering-surveying',
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];

export const services: ServiceDefinition[] = [
  { slug: 'geodetic-control-networks', image: 'art-control-network', icon: Crosshair, related: ['topographic-surveying', 'construction-surveying'] },
  { slug: 'land-surveying', image: 'art-survey-plan', icon: Ruler, related: ['cadastral-surveying', 'topographic-surveying'] },
  { slug: 'topographic-surveying', image: 'contour-relief', icon: Mountain, related: ['engineering-surveying', 'geodetic-control-networks'] },
  { slug: 'cadastral-surveying', image: 'art-cadastre', icon: Map, related: ['land-management', 'land-surveying'] },
  { slug: 'construction-surveying', image: 'art-setting-out', icon: Building2, related: ['as-built-surveys', 'geodetic-control-networks'] },
  { slug: 'land-management', image: 'art-land-division', icon: Landmark, related: ['cadastral-surveying', 'land-surveying'] },
  { slug: 'as-built-surveys', image: 'art-as-built', icon: FileCheck2, related: ['construction-surveying', 'land-surveying'] },
  { slug: 'engineering-surveying', image: 'art-profile', icon: Waypoints, related: ['topographic-surveying', 'construction-surveying'] },
];

export function getService(slug: string | undefined): ServiceDefinition | undefined {
  return services.find((s) => s.slug === slug);
}

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
