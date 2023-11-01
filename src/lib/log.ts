import chalk from 'chalk';

export const log = (text: string, type: string = 'green') => {
  // @ts-ignore
  return console.log(chalk?.[type]?.bold(text));
};
