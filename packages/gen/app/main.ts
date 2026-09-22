/* eslint-disable no-console */
import { outro } from "@clack/prompts";
import { styleText } from "node:util";

export async function main(rawArguments: string[]): Promise<void> {
  console.log(rawArguments);
  outro(styleText(["cyan", "bold"], `\n☕ We will be with you shortly`));
}
