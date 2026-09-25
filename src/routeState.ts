export type RouteScreen = 'main' | 'history' | 'gameplay' | 'interfaces' | 'technology' | 'authors' | 'socials';
export type InterfaceRouteSection = 'character' | 'vehicle' | 'inventory';

export interface HashRoute {
  screen: RouteScreen;
  section?: InterfaceRouteSection;
  params: URLSearchParams;
}

const ROUTE_SCREENS: RouteScreen[] = ['main', 'history', 'gameplay', 'interfaces', 'technology', 'authors', 'socials'];
const INTERFACE_SECTIONS: InterfaceRouteSection[] = ['character', 'vehicle', 'inventory'];

export function isRouteScreen(value: string | undefined): value is RouteScreen {
  return Boolean(value && ROUTE_SCREENS.includes(value as RouteScreen));
}

export function isInterfaceRouteSection(value: string | undefined): value is InterfaceRouteSection {
  return Boolean(value && INTERFACE_SECTIONS.includes(value as InterfaceRouteSection));
}

export function parseHashRoute(): HashRoute {
  if (typeof window === 'undefined') {
    return { screen: 'main', params: new URLSearchParams() };
  }

  const raw = window.location.hash.replace(/^#/, '');
  const [rawPath = '', rawQuery = ''] = raw.split('?');
  const segments = rawPath.replace(/^\/+/, '').split('/').filter(Boolean);
  const screen = isRouteScreen(segments[0]) ? segments[0] : 'main';
  const section = screen === 'interfaces' && isInterfaceRouteSection(segments[1])
    ? segments[1]
    : screen === 'interfaces'
      ? 'character'
      : undefined;

  return {
    screen,
    section,
    params: new URLSearchParams(rawQuery),
  };
}

export function buildHashRoute(
  screen: RouteScreen,
  section?: InterfaceRouteSection,
  params?: URLSearchParams,
) {
  const path = screen === 'interfaces'
    ? `/interfaces/${section ?? 'character'}`
    : `/${screen}`;

  const query = params?.toString();
  return `#${path}${query ? `?${query}` : ''}`;
}

function writeHashRoute(
  screen: RouteScreen,
  section: InterfaceRouteSection | undefined,
  params: URLSearchParams,
  replace: boolean,
) {
  const next = `${window.location.pathname}${window.location.search}${buildHashRoute(screen, section, params)}`;
  if (replace) {
    window.history.replaceState({ screen, section }, '', next);
  } else {
    window.history.pushState({ screen, section }, '', next);
  }
}

export function pushHashRoute(
  screen: RouteScreen,
  section?: InterfaceRouteSection,
  params = new URLSearchParams(),
) {
  writeHashRoute(screen, section, params, false);
}

export function replaceHashRoute(
  screen: RouteScreen,
  section?: InterfaceRouteSection,
  params = new URLSearchParams(),
) {
  writeHashRoute(screen, section, params, true);
}

export type HashParamValue = string | number | boolean | null | undefined;

export function replaceHashParams(updates: Record<string, HashParamValue>) {
  const route = parseHashRoute();
  const params = new URLSearchParams(route.params);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else if (typeof value === 'boolean') {
      params.set(key, value ? '1' : '0');
    } else {
      params.set(key, String(value));
    }
  });

  writeHashRoute(route.screen, route.section, params, true);
}

export function getHashParam(key: string) {
  return parseHashRoute().params.get(key);
}

export function getHashNumber(
  key: string,
  fallback: number,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
) {
  const raw = getHashParam(key);
  if (raw === null || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function getHashBoolean(key: string, fallback: boolean) {
  const raw = getHashParam(key);
  if (raw === null) return fallback;
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return fallback;
}

export function getHashEnum<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const raw = getHashParam(key);
  return raw && allowed.includes(raw as T) ? raw as T : fallback;
}
