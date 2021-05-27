import { readFileSync } from "fs";

import ITBOT from ".";

if (process.argv.length < 4)
  throw new Error("npm run ts <output_path> <path_steps>");

const session = process.argv[2];
const script = process.argv[3];

(async () => {
  const bot = new ITBOT();

  let content = "";
  if (script) content = readFileSync(script).toString("utf-8");
  else content = process.stdin.read().toString();

  await bot.runStep({ step: content, outputPath: session });
  process.exit(0);
})();
