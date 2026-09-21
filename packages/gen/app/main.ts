import { outro } from '@clack/prompts';

export async function main(rawArguments: string[]): Promise<void> {
  console.log(rawArguments);
  outro('coming soon!');
}
