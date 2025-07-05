import { seedInitData } from "./seeddata";

async function main() {
  await seedInitData();
}

main()
  .catch((e) => console.error(e))
  .finally(() => {
    process.exit(0);
  });
