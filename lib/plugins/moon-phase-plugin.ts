import type { Plugin, PluginExecutionContext, PluginRenderElement } from '../types';

// Calculate moon phase (0 = New Moon, 0.5 = Full Moon)
function getMoonPhase(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month < 3) {
    const year2 = year - 1;
    const month2 = month + 12;
  }

  const a = Math.floor(year / 100);
  const b = Math.floor(a / 4);
  const c = 2 - a + b;
  const e = Math.floor(365.25 * (year + 4716));
  const f = Math.floor(30.6001 * (month + 1));
  const jd = c + day + e + f - 1524.5;

  const daysSinceNew = jd - 2451549.5;
  const newMoons = daysSinceNew / 29.53;
  const phase = newMoons - Math.floor(newMoons);

  return phase;
}

function getMoonEmoji(phase: number): string {
  if (phase < 0.0625) return '🌑'; // New Moon
  if (phase < 0.1875) return '🌒'; // Waxing Crescent
  if (phase < 0.3125) return '🌓'; // First Quarter
  if (phase < 0.4375) return '🌔'; // Waxing Gibbous
  if (phase < 0.5625) return '🌕'; // Full Moon
  if (phase < 0.6875) return '🌖'; // Waning Gibbous
  if (phase < 0.8125) return '🌗'; // Last Quarter
  if (phase < 0.9375) return '🌘'; // Waning Crescent
  return '🌑'; // New Moon
}

function getMoonPhaseName(phase: number): string {
  if (phase < 0.0625) return 'New Moon';
  if (phase < 0.1875) return 'Waxing Crescent';
  if (phase < 0.3125) return 'First Quarter';
  if (phase < 0.4375) return 'Waxing Gibbous';
  if (phase < 0.5625) return 'Full Moon';
  if (phase < 0.6875) return 'Waning Gibbous';
  if (phase < 0.8125) return 'Last Quarter';
  if (phase < 0.9375) return 'Waning Crescent';
  return 'New Moon';
}

export const moonPhasePlugin: Plugin = {
  id: 'moon-phase',
  name: 'Moon Phase',
  author: 'Remainders Team',
  version: '1.0.0',
  description: 'Display the current moon phase on your wallpaper',
  configSchema: {
    position: {
      type: 'string',
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      default: 'top-left',
      label: 'Position',
    },
    showName: {
      type: 'boolean',
      default: true,
      label: 'Show phase name',
    },
    showPercentage: {
      type: 'boolean',
      default: true,
      label: 'Show illumination percentage',
    },
  },
  execute: (ctx: PluginExecutionContext): PluginRenderElement[] => {
    const { config, width, height, colors, typography } = ctx;
    const position = config.position || 'top-left';
    const showName = config.showName ?? true;
    const showPercentage = config.showPercentage ?? true;
    const baseFontSize = (typography?.fontSize || 0.035) * height;

    const now = new Date();
    const phase = getMoonPhase(now);
    const emoji = getMoonEmoji(phase);
    const phaseName = getMoonPhaseName(phase);
    const illumination = Math.round(
      phase < 0.5 ? phase * 200 : (1 - phase) * 200
    );

    // Calculate position
    let x = 0, y = 0;
    const padding = width * 0.05;

    if (position === 'top-left') {
      x = padding;
      y = padding;
    } else if (position === 'top-right') {
      x = width - padding;
      y = padding;
    } else if (position === 'bottom-left') {
      x = padding;
      y = height - padding - (baseFontSize * 2);
    } else {
      x = width - padding;
      y = height - padding - (baseFontSize * 2);
    }

    const elements: PluginRenderElement[] = [];
    const align = position.includes('right') ? 'right' : 'left';

    // Moon emoji
    elements.push({
      type: 'text',
      content: emoji,
      x: x,
      y: y,
      fontSize: baseFontSize * 0.6,
      color: colors?.text || '#FFFFFF',
      fontFamily: 'monospace',
      align: align,
    });

    let offsetY = y + (baseFontSize * 0.8);

    // Phase name
    if (showName) {
      elements.push({
        type: 'text',
        content: phaseName,
        x: x,
        y: offsetY,
        fontSize: baseFontSize * 0.35,
        color: colors?.text || '#FFFFFF',
        fontFamily: 'monospace',
        align: align,
      });
      offsetY += baseFontSize * 0.5;
    }

    // Illumination percentage
    if (showPercentage) {
      elements.push({
        type: 'text',
        content: `${illumination}% illuminated`,
        x: x,
        y: offsetY,
        fontSize: baseFontSize * 0.3,
        color: colors?.text || '#AAAAAA',
        fontFamily: 'monospace',
        align: align,
      });
    }

    return elements;
  },
};
