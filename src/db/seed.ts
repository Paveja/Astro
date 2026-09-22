import 'dotenv/config';

async function main() {
  console.log('Seeding complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
