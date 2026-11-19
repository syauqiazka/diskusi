import { prisma } from "./index";

async function main() {
  console.log("Migrating PlatformRole enum...");

  // 1. Add SUPERADMIN and USER enum values to PlatformRole in PostgreSQL
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "PlatformRole" ADD VALUE IF NOT EXISTS 'SUPERADMIN'`);
    console.log("Added SUPERADMIN to PlatformRole");
  } catch (e) {
    console.log("SUPERADMIN already exists or error:", (e as Error).message);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "PlatformRole" ADD VALUE IF NOT EXISTS 'USER'`);
    console.log("Added USER to PlatformRole");
  } catch (e) {
    console.log("USER already exists or error:", (e as Error).message);
  }

  // 2. Update default on user table
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER'::"PlatformRole"`);
    console.log("Set default role to USER");
  } catch (e) {
    console.log("Error updating default role:", (e as Error).message);
  }

  // 3. Migrate existing MEMBER to USER
  const updatedMembers = await prisma.$executeRawUnsafe(
    `UPDATE "user" SET "role" = 'USER'::"PlatformRole" WHERE "role"::text = 'MEMBER' OR "role"::text = 'MODERATOR'`
  );
  console.log(`Updated ${updatedMembers} users with MEMBER/MODERATOR to USER`);

  // 4. Update Pak Budi Santoso (Teacher) to ADMIN
  const updatedTeacher = await prisma.$executeRawUnsafe(
    `UPDATE "user" SET "role" = 'ADMIN'::"PlatformRole" WHERE "email" = 'guru.budi@smkbazma.sch.id'`
  );
  console.log(`Updated teacher Pak Budi to ADMIN: ${updatedTeacher}`);

  // 5. Update syauqi or admin to SUPERADMIN
  const updatedSuperadmin = await prisma.$executeRawUnsafe(
    `UPDATE "user" SET "role" = 'SUPERADMIN'::"PlatformRole" WHERE "email" = 'admin@smkbazma.sch.id' OR "email" = 'muhammad.syauqi1869@smk.belajar.id'`
  );
  console.log(`Updated superadmin users: ${updatedSuperadmin}`);

  console.log("Role migration completed successfully!");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
