import type { WorkItem } from './types';

export function recalculateCost(item: WorkItem): WorkItem {
  if (item.rateType === 'hourly') {
    return { ...item, totalCost: Math.round(item.rate * item.duration * 100) / 100 };
  }
  return item;
}

export function computeKPIs(items: WorkItem[]) {
  let totalOutbound = 0, totalInbound = 0, paidOut = 0, invoiced = 0, invoicesPaid = 0, overdue = 0;
  for (const i of items) {
    if (i.payDirection === 'outbound') totalOutbound += i.totalCost;
    if (i.payDirection === 'inbound')  totalInbound  += i.totalCost;
    if (i.payDirection === 'outbound' && i.paypalStatus === 'completed') paidOut += i.totalCost;
    if (i.payDirection === 'inbound' && (i.paypalStatus === 'sent' || i.paypalStatus === 'paid')) invoiced += i.totalCost;
    if (i.payDirection === 'inbound' && i.paypalStatus === 'paid') invoicesPaid += i.totalCost;
    if (i.payDirection === 'inbound' && i.paypalStatus === 'sent') overdue++;
  }
  return { totalOutbound, totalInbound, paidOut, invoiced, invoicesPaid, overdue, net: totalInbound - totalOutbound };
}