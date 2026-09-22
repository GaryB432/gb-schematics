import { outro } from '@clack/prompts';

export async function main(rawArguments: string[]): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(rawArguments);
  outro('coming soon!!');
}
