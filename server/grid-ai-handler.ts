import { generateText } from 'ai';
import { getModel } from './llm.js';

const SYSTEM = `You are an AG Grid AI state generator. Convert the user's natural language request into an AG Grid state JSON object to be applied via gridApi.setState().

Available column colId values:
- budgetCategory (text, default row group)
- title (text)
- type (text: session, vendor, sponsor, prize, staff)
- resourceName (text)
- duration (number, hours)
- rate (number, USD)
- totalCost (number, USD)
- payDirection (text: inbound, outbound, none)
- paypalStatus (text: draft, sent, paid, pending, completed)
- status (text: scheduled, in_progress, completed, cancelled)

Valid AG Grid state structure:
{
  "filter": {
    "filterModel": {
      "<colId>": { "filterType": "text", "type": "equals"|"contains", "filter": "<val>" }
      // or for numbers: { "filterType": "number", "type": "greaterThan"|"lessThan"|"equals", "filter": 500 }
    }
  },
  "sort": {
    "sortModel": [{ "colId": "<colId>", "sort": "asc"|"desc" }]
  },
  "rowGroup": {
    "groupColIds": ["<colId>"]
  },
  "columnVisibility": {
    "hiddenColIds": ["<colId>"]
  }
}

Respond ONLY with a valid JSON object matching the structure above. Do not include markdown fences or extra text.`;

export async function handleGridAI(body: { prompt: string; currentState?: any; schema?: any }) {
  const { prompt } = body;

  const { text } = await generateText({
    model: getModel(),
    system: SYSTEM,
    maxRetries: 1,
    prompt: `User request: "${prompt}"\nReturn ONLY the JSON object:`,
  });

  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  const gridState = match ? JSON.parse(match[0]) : {};

  return {
    gridState,
    explanation: `Applied: ${prompt}`,
  };
}
