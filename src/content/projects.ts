import type { ImageName } from './images';
import type { ServiceSlug } from './services';

/**
 * Portfolio entries. All current entries are DEMONSTRATION content (`demo: true`) and are
 * labelled as such in the UI. Replace them with verified projects and set `demo: false`.
 * Text lives in locales/<lang>/home.json under projects.items[index].
 */
export interface ProjectDefinition {
  id: string;
  image: ImageName;
  service: ServiceSlug;
  demo: boolean;
}

export const projects: ProjectDefinition[] = [
  { id: 'hillside-topography', image: 'art-project-hillside', service: 'topographic-surveying', demo: true },
  { id: 'lakeside-plots', image: 'art-project-lakeside', service: 'cadastral-surveying', demo: true },
  { id: 'hillside-plot-division', image: 'art-project-plots', service: 'land-management', demo: true },
  { id: 'slope-terrain-model', image: 'art-project-slope', service: 'engineering-surveying', demo: true },
];
