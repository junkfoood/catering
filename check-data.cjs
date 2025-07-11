const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function checkData() {
  try {
    console.log("🔍 Checking restricted area assignments...\n");

    const menus = await db.catererMenu.findMany({
      include: {
        restrictedAreas: true,
        caterer: true
      }
    });

    console.log("📋 Current Menu Restricted Areas:");
    menus.forEach(menu => {
      console.log(`\n${menu.code} (${menu.caterer.name}):`);
      if (menu.restrictedAreas.length === 0) {
        console.log("  ✅ No restrictions (can deliver anywhere)");
      } else {
        menu.restrictedAreas.forEach(area => {
          console.log(`  ❌ Restricted: ${area.name}`);
        });
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.$disconnect();
  }
}

checkData(); 