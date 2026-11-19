import "dotenv/config";
import { ensureCosmeticsSeeded } from "../src/lib/db/seed-cosmetics";
import { ensureForumAndMaterialsSeeded } from "../src/lib/db/seed-forum";
import { ensureClassesAndClassmatesSeeded } from "../src/lib/db/seed-classes";

async function main() {
  console.log("Seeding initial data to Neon PostgreSQL...");
  await ensureCosmeticsSeeded();
  await ensureClassesAndClassmatesSeeded();
  await ensureForumAndMaterialsSeeded();
  console.log("Seeding completed successfully!");
}

main().catch((e) => {
  console.error("Error during seed:", e);
  process.exit(1);
});

