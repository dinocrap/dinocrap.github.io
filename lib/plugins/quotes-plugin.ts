import type { Plugin, PluginExecutionContext, PluginRenderElement } from '../types';

const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Life is what happens when you're busy making other plans. - John Lennon",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Don't let yesterday take up too much of today. - Will Rogers",
  "You learn more from failure than from success. - Unknown",
  "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
  "If you are working on something that you really care about, you don't have to be pushed. - Steve Jobs",
  "People who are crazy enough to think they can change the world, are the ones who do. - Rob Siltanen",
];

export const quotesPlugin: Plugin = {
  id: 'quotes-plugin',
  name: 'Daily Quotes',
  author: 'Remainders Team',
  version: '1.0.0',
  description: 'Display daily inspirational quotes on your wallpaper',
  configSchema: {
    position: {
      type: 'string',
      enum: ['top', 'bottom', 'center'],
      default: 'bottom',
      label: 'Position',
    },
    opacity: {
      type: 'number',
      default: 0.7,
      min: 0.1,
      max: 1.0,
      step: 0.1,
      label: 'Opacity',
    },
  },
  execute: (ctx: PluginExecutionContext): PluginRenderElement[] => {
    const { config, width, height, typography } = ctx;
    const position = config.position || 'bottom';
    const opacity = config.opacity || 0.7;
    const baseFontSize = (typography?.fontSize || 0.035) * height;

    // Get quote based on day of year (consistent per day)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const quote = quotes[dayOfYear % quotes.length];

    let top = 0;
    if (position === 'top') {
      top = height * 0.05;
    } else if (position === 'center') {
      top = height * 0.5;
    } else {
      top = height * 0.9;
    }

    return [{
      type: 'text',
      content: quote,
      x: width * 0.5,
      y: top,
      fontSize: baseFontSize * 0.5,
      color: `rgba(255, 255, 255, ${opacity})`,
      align: 'center',
      maxWidth: width * 0.8,
      fontFamily: 'monospace',
    }];
  },
};
