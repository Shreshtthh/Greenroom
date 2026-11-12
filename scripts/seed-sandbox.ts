/**
 * Seed PayPal Sandbox with realistic DevConnect 2026 data.
 * Run: npx tsx scripts/seed-sandbox.ts
 *
 * Prerequisites:
 *   - PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env
 *   - Payouts and Transaction Search enabled in your sandbox app
 */
import 'dotenv/config';

async function main() {
  console.log('Seeding PayPal sandbox for Greenroom...');
  console.log('Client ID:', process.env.PAYPAL_CLIENT_ID?.slice(0, 8) + '...');

  // TODO Phase 4: Create sponsor invoices via Agent Toolkit
  // TODO Phase 4: Create test orders via Server SDK
  // TODO Phase 4: Send test payouts via custom fetch

  console.log('Seed complete. Re-run the app to see data in the ledger.');
}

main().catch(console.error);