/**
 * Crée (ou met à jour le mot de passe d')un compte admin Ekko Wood.
 * Usage : ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx prisma/create-admin.ts
 * (avec DATABASE_URL pointant vers la base voulue, ex. celle de production)
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Merci de fournir ADMIN_EMAIL et ADMIN_PASSWORD en variables d'environnement."
    );
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("Le mot de passe doit contenir au moins 8 caractères.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Compte admin prêt : ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
