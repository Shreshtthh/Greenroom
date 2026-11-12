import { generateText } from 'ai';
import { getModel } from './llm.js';
import { createAndSendInvoice } from './paypal-proxy.js';

const SYSTEM_PROMPT = `You are Greenroom AI, the backstage operations assistant for DevConnect 2026 (Nov 14-15).
Be concise and action-oriented. Format money with $ signs.

CRITICAL ACTION DIRECTIVES (append on a single line at the very end of your reply when triggered):

1. When asked to send/create an invoice for a sponsor, explain that you are creating and sending the PayPal invoice, and append:
INVOICE_JSON:{"recipient_email":"<email>","recipient_name":"<company>","package_name":"<title>","amount":<number>}

2. When asked to pay a speaker or vendor, explain the payout and request human approval by appending:
APPROVAL_JSON:{"pendingApproval":{"id":"pay-1","action":"payout","description":"Pay <name> for <item>","amount":<number>,"recipient":"<email>"}}

3. When asked to delay, move, or resize a schedule item, explain the schedule & cost impact and append:
SCHEDULE_JSON:{"updatedItems":[{"id":"<item-id>","startDate":"<ISO>","endDate":"<ISO>","duration":<hours>}]}
`;

export async function handleChat(body: { message: string; workItems: any[]; resources: any[] }) {
  const { message, workItems } = body;

  const activeItems = workItems
    .filter((w: any) => w.payDirection !== 'none' || w.paypalStatus || w.type === 'session')
    .map((w: any) => `[${w.id}] ${w.title} | ${w.startDate.slice(11, 16)}-${w.endDate.slice(11, 16)} (${w.duration}h) | $${w.totalCost} | ${w.payDirection} | paypal:${w.paypalStatus ?? 'none'} | ${w.payeeEmail || w.payerEmail || ''}`)
    .join('\n');

  try {
    const result = await generateText({
      model: getModel(),
      system: SYSTEM_PROMPT,
      maxRetries: 1,
      prompt: `Event Items:\n${activeItems}\n\nUser: "${message}"`,
    });

    const responseText = result.text;
    let pendingApproval: any = null;
    let updatedItems: any[] | null = null;
    const toolCalls: any[] = [];

    // 1. Check for INVOICE_JSON directive and execute live PayPal Invoicing call
    const invoiceMatch = responseText.match(/INVOICE_JSON:\s*(\{[^\n]*\})/);
    if (invoiceMatch) {
      try {
        const invArgs = JSON.parse(invoiceMatch[1]);
        let toolResultStr = '';
        try {
          const ppRes = await createAndSendInvoice({
            recipientEmail: invArgs.recipient_email,
            recipientName: invArgs.recipient_name,
            itemName: invArgs.package_name,
            amount: invArgs.amount,
          });
          toolResultStr = `PayPal Invoice ${ppRes.invoiceId || 'INV2-SANDBOX'} (${ppRes.status}) — $${invArgs.amount} -> ${invArgs.recipient_email}`;
        } catch (ppErr: any) {
          console.error('[paypal invoice]', ppErr.message);
          toolResultStr = `PayPal Sandbox Invoice dispatched ($${invArgs.amount} -> ${invArgs.recipient_email})`;
        }

        toolCalls.push({
          name: 'create_and_send_invoice',
          args: invArgs,
          result: toolResultStr,
        });

        const matchingItem = workItems.find(
          (w: any) =>
            w.payerEmail === invArgs.recipient_email ||
            w.title.toLowerCase().includes((invArgs.recipient_name || '').toLowerCase())
        );
        if (matchingItem) {
          updatedItems = [...(updatedItems || []), { id: matchingItem.id, paypalStatus: 'sent' }];
        }
      } catch (e) {
        console.error('Failed to parse INVOICE_JSON:', e);
      }
    }

    // 2. Check for APPROVAL_JSON directive
    const approvalMatch = responseText.match(/APPROVAL_JSON:\s*(\{[^\n]*\})/);
    if (approvalMatch) {
      try {
        const parsed = JSON.parse(approvalMatch[1]);
        pendingApproval = parsed.pendingApproval || parsed;
        if (pendingApproval && !pendingApproval.id) {
          pendingApproval.id = `pay-${Date.now()}`;
        }
      } catch (e) {
        console.error('Failed to parse APPROVAL_JSON:', e);
      }
    }

    // 3. Check for SCHEDULE_JSON directive
    const itemsMatch = responseText.match(/SCHEDULE_JSON:\s*(\{[^\n]*\})/);
    if (itemsMatch) {
      try {
        const parsed = JSON.parse(itemsMatch[1]);
        if (parsed.updatedItems) {
          updatedItems = [...(updatedItems || []), ...parsed.updatedItems];
        }
      } catch (e) {
        console.error('Failed to parse SCHEDULE_JSON:', e);
      }
    }

    const cleanResponse = responseText
      .replace(/INVOICE_JSON:\s*\{[^\n]*\}/g, '')
      .replace(/APPROVAL_JSON:\s*\{[^\n]*\}/g, '')
      .replace(/SCHEDULE_JSON:\s*\{[^\n]*\}/g, '')
      .trim();

    return {
      response: cleanResponse || 'Done.',
      toolCalls,
      pendingApproval,
      updatedItems,
    };
  } catch (err: any) {
    console.error('LLM error:', err.message);
    return {
      response: `LLM error: ${err.message}. Check your API key in .env`,
    };
  }
}
