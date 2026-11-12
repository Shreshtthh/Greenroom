import { Client, Environment, OAuthAuthorizationController } from '@paypal/paypal-server-sdk';

// --- PayPal Server SDK client (APIMatic-generated) ---
export function getPayPalClient() {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    environment: process.env.PAYPAL_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox,
  });
}

// --- Get OAuth token (via APIMatic-generated OAuthAuthorizationController) ---
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const basicAuth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  const client = getPayPalClient();
  const auth = new OAuthAuthorizationController(client);
  const resp = await auth.requestToken({ authorization: basicAuth });
  return resp.result.accessToken!;
}

// --- Payouts: custom fetch wrapper (SDK does not cover this) ---
const SANDBOX_BASE = 'https://api-m.sandbox.paypal.com';
const LIVE_BASE    = 'https://api-m.paypal.com';

function baseUrl() {
  return process.env.PAYPAL_ENVIRONMENT === 'production' ? LIVE_BASE : SANDBOX_BASE;
}

export async function createAndSendInvoice(opts: {
  recipientEmail: string;
  recipientName?: string;
  itemName: string;
  amount: number | string;
  note?: string;
}) {
  const token = await getAccessToken();
  const url = baseUrl();

  // 1. Create draft invoice
  const invoicePayload = {
    detail: {
      currency_code: 'USD',
      note: opts.note || 'DevConnect 2026 Sponsorship Invoice',
    },
    invoicer: {
      name: { full_name: 'DevConnect 2026 Team' },
    },
    primary_recipients: [
      {
        billing_info: {
          name: { full_name: opts.recipientName || opts.recipientEmail.split('@')[0] },
          email_address: opts.recipientEmail,
        },
      },
    ],
    items: [
      {
        name: opts.itemName || 'Sponsorship Package',
        quantity: '1',
        unit_amount: {
          currency_code: 'USD',
          value: String(opts.amount),
        },
      },
    ],
  };

  const createRes = await fetch(`${url}/v2/invoicing/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(invoicePayload),
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Failed to create invoice (${createRes.status}): ${JSON.stringify(createData)}`);
  }

  // Invoice ID is in the response or in the 'self' / 'send' link
  const invoiceId = createData.id || createData.rel || (createData.href && createData.href.split('/').pop());
  const sendLink = (createData.links || []).find((l: any) => l.rel === 'send')?.href || `${url}/v2/invoicing/invoices/${invoiceId}/send`;

  // 2. Send the invoice
  let sendStatus = 'sent';
  try {
    const sendRes = await fetch(sendLink, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ send_to_recipient: true }),
    });
    if (!sendRes.ok) {
      sendStatus = 'draft_created';
    }
  } catch {
    sendStatus = 'draft_created';
  }

  return {
    status: sendStatus,
    invoiceId,
    amount: opts.amount,
    recipientEmail: opts.recipientEmail,
    itemName: opts.itemName,
  };
}

export async function sendPayout(opts: {
  recipientEmail: string;
  amount: string;
  currency?: string;
  note?: string;
}) {
  const token = await getAccessToken();
  const body = {
    sender_batch_header: {
      sender_batch_id: `greenroom-${Date.now()}`,
      email_subject: 'You have a payment from DevConnect 2026',
      email_message: opts.note ?? 'Thank you for your contribution!',
    },
    items: [{
      recipient_type: 'EMAIL',
      amount: { value: opts.amount, currency: opts.currency ?? 'USD' },
      receiver: opts.recipientEmail,
      note: opts.note ?? 'DevConnect 2026 payment',
    }],
  };

  const res = await fetch(`${baseUrl()}/v1/payments/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Payout failed (${res.status}): ${err}`);
  }
  return res.json();
}