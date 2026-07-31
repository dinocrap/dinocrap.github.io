import type { Plugin, PluginExecutionContext, PluginRenderElement } from '../types';

export const habitTrackerPlugin: Plugin = {
  id: 'habit-tracker',
  name: 'Habit Tracker',
  author: 'Remainders Team',
  version: '1.0.0',
  description: 'Track daily habits with visual indicators on your wallpaper',
  configSchema: {
    habits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', label: 'Habit Name' },
          color: { type: 'string', default: '#4CAF50', label: 'Color' },
          icon: { type: 'string', default: '✓', label: 'Icon' },
        },
      },
      default: [
        { name: 'Exercise', color: '#4CAF50', icon: '💪' },
        { name: 'Read', color: '#2196F3', icon: '📚' },
        { name: 'Meditate', color: '#9C27B0', icon: '🧘' },
      ],
      label: 'Habits to Track',
    },
    position: {
      type: 'string',
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      default: 'top-right',
      label: 'Position',
    },
    showLabels: {
      type: 'boolean',
      default: true,
      label: 'Show habit labels',
    },
  },
  execute: (ctx: PluginExecutionContext): PluginRenderElement[] => {
    const { config, width, height, colors, typography } = ctx;
    const habits = config.habits || [
      { name: 'Exercise', color: '#4CAF50', icon: '💪' },
      { name: 'Read', color: '#2196F3', icon: '📚' },
      { name: 'Meditate', color: '#9C27B0', icon: '🧘' },
    ];
    const position = config.position || 'top-right';
    const showLabels = config.showLabels ?? true;
    const baseFontSize = (typography?.fontSize || 0.035) * height;

    // Calculate position based on config
    let x = 0, y = 0;
    const padding = width * 0.05;
    const spacing = height * 0.04;

    if (position === 'top-left') {
      x = padding;
      y = padding;
    } else if (position === 'top-right') {
      x = width - padding;
      y = padding;
    } else if (position === 'bottom-left') {
      x = padding;
      y = height - padding - (habits.length * spacing);
    } else {
      x = width - padding;
      y = height - padding - (habits.length * spacing);
    }

    const elements: PluginRenderElement[] = [];

    habits.forEach((habit: any, index: number) => {
      const yPos = y + (index * spacing);

      // Icon
      elements.push({
        type: 'text',
        content: habit.icon,
        x: x,
        y: yPos,
        fontSize: baseFontSize * 0.4,
        color: habit.color,
        fontFamily: 'monospace',
        align: position.includes('right') ? 'right' : 'left',
      });

      // Label (if enabled)
      if (showLabels) {
        const labelOffset = baseFontSize * 0.5;
        elements.push({
          type: 'text',
          content: habit.name,
          x: position.includes('right') ? x - labelOffset : x + labelOffset,
          y: yPos,
          fontSize: baseFontSize * 0.3,
          color: colors?.text || '#FFFFFF',
          fontFamily: 'monospace',
          align: position.includes('right') ? 'right' : 'left',
        });
      }
    });

    return elements;
  },
};
