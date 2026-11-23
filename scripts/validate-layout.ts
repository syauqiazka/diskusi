/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Script Validasi Tata Letak Kampus (Quality Gate)
 * Menjalankan validator resmi scripts/validate-layout.mjs terhadap src/data/campus.json
 */

import { execSync } from "child_process";
import path from "path";

try {
  const jsonPath = path.resolve(process.cwd(), "src/data/campus.json");
  const scriptPath = path.resolve(process.cwd(), "scripts/validate-layout.mjs");
  const output = execSync(`node "${scriptPath}" "${jsonPath}"`, { encoding: "utf8" });
  console.log(output);
  process.exit(0);
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string };
  if (err.stdout) console.log(err.stdout);
  if (err.stderr) console.error(err.stderr);
  process.exit(1);
}
