// Test-Script für Deployment-Simulation
// Simuliert die Produktionsumgebung lokal

import { checkAllItems } from "./backend/checkAllItems.ts";

console.log("🧪 Testing Deployment Build...");
console.log("Environment:", process.env.NODE_ENV || "development");

// Setze Produktionsumgebung
process.env.NODE_ENV = "production";

// Starte Test
async function testDeployment() {
  try {
    console.log("🚀 Starte Deployment-Test...");

    // Zeitmessung
    const startTime = Date.now();

    await checkAllItems();

    const endTime = Date.now();
    console.log(`✅ Test abgeschlossen in ${endTime - startTime}ms`);
  } catch (error) {
    console.error("❌ Deployment-Test fehlgeschlagen:", error);
    process.exit(1);
  }
}

testDeployment();
