import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@ekkowood.com";
  const adminPassword = "EkkoAdmin123!";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
    },
  });

  const merchantEmail = "contact@le-bistrot-du-coin.fr";
  const merchantPassword = "Bistrot123!";
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const sampleConfig = {
    banner: null,
    buttons: [
      {
        id: "btn-google",
        type: "google_reviews",
        label: "Laisser un avis Google",
        url: "https://g.page/r/exemple/review",
        order: 0,
      },
      {
        id: "btn-instagram",
        type: "instagram",
        label: "Instagram",
        url: "https://instagram.com/lebistrotducoin",
        order: 1,
      },
      {
        id: "btn-website",
        type: "website",
        label: "Notre site",
        url: "https://le-bistrot-du-coin.fr",
        order: 2,
      },
    ],
  };

  await prisma.merchant.upsert({
    where: { slug: "le-bistrot-du-coin" },
    update: {},
    create: {
      slug: "le-bistrot-du-coin",
      email: merchantEmail,
      passwordHash: await hashPassword(merchantPassword),
      businessName: "Le Bistrot du Coin",
      status: "ACTIVE",
      accessExpiresAt: oneYearFromNow,
      draftConfig: sampleConfig,
      publishedConfig: sampleConfig,
    },
  });

  console.log("Seed terminé.");
  console.log(`Admin  -> ${adminEmail} / ${adminPassword}`);
  console.log(`Commerçant -> ${merchantEmail} / ${merchantPassword} (slug: le-bistrot-du-coin)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
