// Neon's free-tier compute suspends after 5 minutes of inactivity and can
// take longer than Prisma's fixed 10s advisory-lock timeout to wake back up,
// which surfaces as a confusing P1002 error during `prisma migrate deploy`.
// Pinging the database first, with retries, gives it time to wake up before
// migrations run.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain CJS build script
const { Client } = require("pg");

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
const MAX_ATTEMPTS = 10;
const DELAY_MS = 3000;

async function main() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      console.log(`Database reachable after ${attempt} attempt(s).`);
      return;
    } catch (err) {
      await client.end().catch(() => {});
      console.log(
        `Database not ready yet (attempt ${attempt}/${MAX_ATTEMPTS}): ${err.message}`
      );
      if (attempt === MAX_ATTEMPTS) {
        console.error("Database did not become reachable in time.");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }
}

main();
