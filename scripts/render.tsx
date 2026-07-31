/**
 * Renders the wallpaper PNG(s) into the repository root.
 *
 * This repo is a GitHub *user* Pages site (dinocrap.github.io), which serves
 * files straight from the root of `main`. So the output lands next to
 * index.html and is reachable at https://dinocrap.github.io/wallpaper.png
 *
 *   npm run generate
 */

import { ImageResponse } from '@vercel/og';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import YearView from '../views/year-view.js';
import LifeView from '../views/life-view.js';

import { quotesPlugin } from '../lib/plugins/quotes-plugin.js';
import { habitTrackerPlugin } from '../lib/plugins/habit-tracker-plugin.js';
import { moonPhasePlugin } from '../lib/plugins/moon-phase-plugin.js';
import type { Plugin } from '../lib/types.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');

const BUILTIN_PLUGINS = new Map<string, Plugin>([
  [quotesPlugin.id, quotesPlugin],
  [habitTrackerPlugin.id, habitTrackerPlugin],
  [moonPhasePlugin.id, moonPhasePlugin],
]);

const DEFAULTS = {
  viewMode: 'year' as 'year' | 'life',
  birthDate: '1990-01-01',
  timezone: 'Europe/Vilnius',
  isMondayFirst: true,
  yearViewLayout: 'months' as 'months' | 'days',
  daysLayoutMode: 'continuous' as 'continuous' | 'calendar',
  device: { width: 1206, height: 2622 },
  colors: {
    background: '#0d0d0d',
    past: '#FFFFFF',
    current: '#E89EB8',
    future: '#333333',
    text: '#888888',
  },
  typography: { fontFamily: 'monospace', fontSize: 0.035, statsVisible: true },
  layout: { topPadding: 0.25, bottomPadding: 0.15, sidePadding: 0.18, dotSpacing: 0.7 },
  textElements: [] as unknown[],
  plugins: [] as { pluginId: string; enabled: boolean; config?: unknown }[],
  backgroundImage: undefined as { url: string; opacity: number } | undefined,
  renderBothViews: true,
};

async function loadConfig() {
  const raw = await readFile(path.join(ROOT, 'wallpaper.config.json'), 'utf-8');
  const user = JSON.parse(raw);
  return {
    ...DEFAULTS,
    ...user,
    device: { ...DEFAULTS.device, ...(user.device || {}) },
    colors: { ...DEFAULTS.colors, ...(user.colors || {}) },
    typography: { ...DEFAULTS.typography, ...(user.typography || {}) },
    layout: { ...DEFAULTS.layout, ...(user.layout || {}) },
  };
}

/** Current wall-clock date in a given IANA timezone. */
function getDateInTimezone(timezone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const p: Record<string, string> = {};
  parts.forEach(({ type, value }) => { p[type] = value; });
  return new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runPlugins(config: any, viewMode: string, currentDate: Date) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elements: any[] = [];
  for (const pc of config.plugins || []) {
    if (!pc?.enabled) continue;
    const plugin = BUILTIN_PLUGINS.get(pc.pluginId);
    if (!plugin?.execute) {
      console.warn(`  ! unknown plugin "${pc.pluginId}" — skipped`);
      continue;
    }
    try {
      const els = plugin.execute({
        config: pc.config || {},
        width: config.device.width,
        height: config.device.height,
        colors: config.colors,
        typography: config.typography,
        birthDate: config.birthDate,
        viewMode,
        timezone: config.timezone,
        currentDate,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (Array.isArray(els)) elements.push(...els);
    } catch (err) {
      console.error(`  ! plugin "${pc.pluginId}" threw:`, err);
    }
  }
  return elements;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderView(config: any, viewMode: 'year' | 'life', filename: string) {
  const currentDate = getDateInTimezone(config.timezone);
  const { width, height } = config.device;

  const shared = {
    width,
    height,
    colors: config.colors,
    typography: config.typography,
    layout: config.layout,
    textElements: config.textElements,
    pluginElements: runPlugins(config, viewMode, currentDate),
    currentDate,
    backgroundImage: config.backgroundImage,
  };

  const view =
    viewMode === 'life'
      ? LifeView({ ...shared, birthDate: config.birthDate })
      : YearView({
          ...shared,
          isMondayFirst: config.isMondayFirst,
          yearViewLayout: config.yearViewLayout,
          daysLayoutMode: config.daysLayoutMode,
          timezone: config.timezone,
        });

  const buffer = Buffer.from(
    await new ImageResponse(view, { width, height }).arrayBuffer()
  );

  await writeFile(path.join(ROOT, filename), buffer);
  console.log(`  ✓ ${filename}  ${width}×${height}  ${(buffer.length / 1024).toFixed(0)} KB`);
}

async function main() {
  const config = await loadConfig();
  const stamp = getDateInTimezone(config.timezone).toISOString().slice(0, 10);
  console.log(`Rendering for ${stamp} (${config.timezone})`);

  await renderView(config, config.viewMode, 'wallpaper.png');

  if (config.renderBothViews) {
    const other = config.viewMode === 'life' ? 'year' : 'life';
    await renderView(config, other as 'year' | 'life', `${other}.png`);
  }

  await writeFile(path.join(ROOT, 'last-updated.txt'), `${stamp}\n`);
  console.log('Done.');
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});
