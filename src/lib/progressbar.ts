import chalk from 'chalk';
import bar from 'cli-progress';

export const progressBar = new bar.SingleBar(
  {
    format: `${chalk.cyanBright.bold(
      '{type} {bar}',
    )} {percentage}% | {value}/{total} {title} `,
    stopOnComplete: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: false,
  },
  bar.Presets.shades_classic,
);
