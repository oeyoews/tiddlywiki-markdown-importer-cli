import chalk from 'chalk';

export const log = (type: string, text: string) => {
  // @ts-ignore
  return console.log(chalk?.[type]?.bold(text));
};
