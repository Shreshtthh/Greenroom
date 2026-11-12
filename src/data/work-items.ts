import type { WorkItem, BryntumDep } from '../lib/types';

// Helpers for Nov 14-15, 2026
const d1 = (h: number, m = 0) =>
  `2026-11-14T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
const d2 = (h: number, m = 0) =>
  `2026-11-15T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

function item(partial: Omit<WorkItem, 'paypalId' | 'paypalStatus' | 'payeeEmail' | 'payerEmail' | 'status'> & Partial<WorkItem>): WorkItem {
  return {
    paypalId: null,
    paypalStatus: null,
    payeeEmail: null,
    payerEmail: null,
    status: 'scheduled',
    ...partial,
  };
}

export const initialWorkItems: WorkItem[] = [
  // ===================== DAY 1 — Nov 14 =====================

  item({ id: 'av-setup-1',        title: 'AV Setup Day 1',           type: 'vendor',  resourceId: 'av-team',   startDate: d1(7,0),  endDate: d1(8,0),   duration: 1,   rateType: 'hourly', rate: 85,   totalCost: 85,    budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#f59e0b' }),
  item({ id: 'registration',      title: 'Registration & Check-in',  type: 'staff',   resourceId: 'main-stage',startDate: d1(8,0),  endDate: d1(8,30),  duration: 0.5, rateType: 'fixed',  rate: 0,    totalCost: 0,     budgetCategory: 'Operations',      payDirection: 'none',     paypalType: null,     eventColor: '#64748b' }),
  item({ id: 'keynote',           title: 'Keynote: AI Frontiers',    type: 'session', resourceId: 'main-stage',startDate: d1(8,30), endDate: d1(9,30),  duration: 1,   rateType: 'hourly', rate: 350,  totalCost: 350,   budgetCategory: 'Speakers',        payDirection: 'outbound', paypalType: 'payout', payeeEmail: 'sarah.chen@personal.example.com', eventColor: '#3b82f6' }),
  item({ id: 'catering-1',        title: 'Morning Coffee Service',   type: 'vendor',  resourceId: 'catering',  startDate: d1(9,0),  endDate: d1(9,30),  duration: 0.5, rateType: 'fixed',  rate: 450,  totalCost: 450,   budgetCategory: 'Catering',        payDirection: 'outbound', paypalType: 'payout', eventColor: '#ef4444' }),
  item({ id: 'photo-morning',     title: 'Photography: Morning',     type: 'vendor',  resourceId: 'photo',     startDate: d1(8,30), endDate: d1(12,0),  duration: 3.5, rateType: 'hourly', rate: 200,  totalCost: 700,   budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#ec4899' }),
  item({ id: 'mcp-workshop',      title: 'MCP Workshop',             type: 'session', resourceId: 'room-a',    startDate: d1(10,0), endDate: d1(12,0),  duration: 2,   rateType: 'hourly', rate: 250,  totalCost: 500,   budgetCategory: 'Speakers',        payDirection: 'outbound', paypalType: 'payout', payeeEmail: 'priya.sharma@personal.example.com', eventColor: '#8b5cf6' }),
  item({ id: 'devops-dive',       title: 'DevOps Deep Dive',         type: 'session', resourceId: 'room-b',    startDate: d1(10,0), endDate: d1(11,30), duration: 1.5, rateType: 'hourly', rate: 200,  totalCost: 300,   budgetCategory: 'Speakers',        payDirection: 'outbound', paypalType: 'payout', payeeEmail: 'marcus.rivera@personal.example.com', eventColor: '#6366f1' }),
  item({ id: 'av-morning',        title: 'AV Support: Morning',      type: 'vendor',  resourceId: 'av-team',   startDate: d1(8,0),  endDate: d1(12,0),  duration: 4,   rateType: 'hourly', rate: 85,   totalCost: 340,   budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#f59e0b' }),
  item({ id: 'lunch-1',           title: 'Lunch Service',            type: 'vendor',  resourceId: 'catering',  startDate: d1(12,0), endDate: d1(13,0),  duration: 1,   rateType: 'fixed',  rate: 950,  totalCost: 950,   budgetCategory: 'Catering',        payDirection: 'outbound', paypalType: 'payout', eventColor: '#ef4444' }),
  item({ id: 'oss-panel',         title: 'Open Source Panel',        type: 'session', resourceId: 'main-stage',startDate: d1(13,0), endDate: d1(14,30), duration: 1.5, rateType: 'hourly', rate: 180,  totalCost: 270,   budgetCategory: 'Speakers',        payDirection: 'outbound', paypalType: 'payout', payeeEmail: 'james.okafor@personal.example.com', eventColor: '#3b82f6' }),
  item({ id: 'security-ws',       title: 'Security Workshop',        type: 'session', resourceId: 'room-a',    startDate: d1(13,0), endDate: d1(14,30), duration: 1.5, rateType: 'hourly', rate: 300,  totalCost: 450,   budgetCategory: 'Speakers',        payDirection: 'outbound', paypalType: 'payout', payeeEmail: 'yuki.tanaka@personal.example.com', eventColor: '#8b5cf6' }),
  item({ id: 'photo-afternoon',   title: 'Photography: Afternoon',   type: 'vendor',  resourceId: 'photo',     startDate: d1(13,0), endDate: d1(17,0),  duration: 4,   rateType: 'hourly', rate: 200,  totalCost: 800,   budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#ec4899' }),
  item({ id: 'snack-drop',        title: 'Afternoon Snacks',         type: 'vendor',  resourceId: 'catering',  startDate: d1(14,30),endDate: d1(15,0),  duration: 0.5, rateType: 'fixed',  rate: 380,  totalCost: 380,   budgetCategory: 'Catering',        payDirection: 'outbound', paypalType: 'payout', eventColor: '#ef4444' }),
  item({ id: 'swag-delivery',     title: 'Swag Bag Delivery',        type: 'vendor',  resourceId: 'swag',      startDate: d1(14,0), endDate: d1(15,0),  duration: 1,   rateType: 'fixed',  rate: 1200, totalCost: 1200,  budgetCategory: 'Swag & Merch',    payDirection: 'outbound', paypalType: 'payout', eventColor: '#14b8a6' }),
  item({ id: 'hackathon-kickoff', title: 'Hackathon Kickoff',        type: 'session', resourceId: 'main-stage',startDate: d1(15,0), endDate: d1(16,0),  duration: 1,   rateType: 'fixed',  rate: 0,    totalCost: 0,     budgetCategory: 'Operations',      payDirection: 'none',     paypalType: null,     eventColor: '#3b82f6' }),
  item({ id: 'av-afternoon',      title: 'AV Support: Afternoon',    type: 'vendor',  resourceId: 'av-team',   startDate: d1(13,0), endDate: d1(19,0),  duration: 6,   rateType: 'hourly', rate: 85,   totalCost: 510,   budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#f59e0b' }),
  item({ id: 'dinner',            title: 'Dinner Service',           type: 'vendor',  resourceId: 'catering',  startDate: d1(17,0), endDate: d1(18,30), duration: 1.5, rateType: 'fixed',  rate: 1020, totalCost: 1020,  budgetCategory: 'Catering',        payDirection: 'outbound', paypalType: 'payout', eventColor: '#ef4444' }),

  // ===================== DAY 2 — Nov 15 =====================

  item({ id: 'av-setup-2',        title: 'AV Setup Day 2',           type: 'vendor',  resourceId: 'av-team',   startDate: d2(7,30), endDate: d2(8,30),  duration: 1,   rateType: 'hourly', rate: 85,   totalCost: 85,    budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#f59e0b' }),
  item({ id: 'breakfast',         title: 'Breakfast Service',        type: 'vendor',  resourceId: 'catering',  startDate: d2(8,0),  endDate: d2(9,0),   duration: 1,   rateType: 'fixed',  rate: 580,  totalCost: 580,   budgetCategory: 'Catering',        payDirection: 'outbound', paypalType: 'payout', eventColor: '#ef4444' }),
  item({ id: 'hacking',           title: 'Hacking Sprint',           type: 'staff',   resourceId: 'main-stage',startDate: d2(9,0),  endDate: d2(14,0),  duration: 5,   rateType: 'fixed',  rate: 0,    totalCost: 0,     budgetCategory: 'Operations',      payDirection: 'none',     paypalType: null,     eventColor: '#64748b' }),
  item({ id: 'photo-day2',        title: 'Photography: Day 2',       type: 'vendor',  resourceId: 'photo',     startDate: d2(9,0),  endDate: d2(17,0),  duration: 8,   rateType: 'hourly', rate: 200,  totalCost: 1600,  budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#ec4899' }),
  item({ id: 'lunch-2',           title: 'Lunch Day 2',              type: 'vendor',  resourceId: 'catering',  startDate: d2(12,0), endDate: d2(13,0),  duration: 1,   rateType: 'fixed',  rate: 950,  totalCost: 950,   budgetCategory: 'Catering',        payDirection: 'outbound', paypalType: 'payout', eventColor: '#ef4444' }),
  item({ id: 'demos',             title: 'Demo Presentations',       type: 'session', resourceId: 'main-stage',startDate: d2(14,0), endDate: d2(16,0),  duration: 2,   rateType: 'fixed',  rate: 0,    totalCost: 0,     budgetCategory: 'Operations',      payDirection: 'none',     paypalType: null,     eventColor: '#3b82f6' }),
  item({ id: 'av-demos',          title: 'AV: Demo Support',         type: 'vendor',  resourceId: 'av-team',   startDate: d2(13,30),endDate: d2(18,0),  duration: 4.5, rateType: 'hourly', rate: 85,   totalCost: 382.5, budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#f59e0b' }),
  item({ id: 'judging',           title: 'Judging Deliberation',     type: 'staff',   resourceId: 'room-a',    startDate: d2(16,0), endDate: d2(17,0),  duration: 1,   rateType: 'fixed',  rate: 0,    totalCost: 0,     budgetCategory: 'Operations',      payDirection: 'none',     paypalType: null,     eventColor: '#64748b' }),
  item({ id: 'awards',            title: 'Awards Ceremony',          type: 'session', resourceId: 'main-stage',startDate: d2(17,0), endDate: d2(18,0),  duration: 1,   rateType: 'fixed',  rate: 0,    totalCost: 0,     budgetCategory: 'Operations',      payDirection: 'none',     paypalType: null,     eventColor: '#3b82f6' }),
  item({ id: 'prize-1st',         title: '1st Place Prize',          type: 'prize',   resourceId: 'main-stage',startDate: d2(17,30),endDate: d2(17,45), duration: 0.25,rateType: 'fixed',  rate: 1000, totalCost: 1000,  budgetCategory: 'Prizes',          payDirection: 'outbound', paypalType: 'payout', payeeEmail: 'winner1@personal.example.com', eventColor: '#fbbf24' }),
  item({ id: 'prize-2nd',         title: '2nd Place Prize',          type: 'prize',   resourceId: 'main-stage',startDate: d2(17,30),endDate: d2(17,45), duration: 0.25,rateType: 'fixed',  rate: 500,  totalCost: 500,   budgetCategory: 'Prizes',          payDirection: 'outbound', paypalType: 'payout', payeeEmail: 'winner2@personal.example.com', eventColor: '#9ca3af' }),
  item({ id: 'prize-3rd',         title: '3rd Place Prize',          type: 'prize',   resourceId: 'main-stage',startDate: d2(17,30),endDate: d2(17,45), duration: 0.25,rateType: 'fixed',  rate: 250,  totalCost: 250,   budgetCategory: 'Prizes',          payDirection: 'outbound', paypalType: 'payout', payeeEmail: 'winner3@personal.example.com', eventColor: '#cd7f32' }),
  item({ id: 'teardown',          title: 'Teardown & Packout',       type: 'vendor',  resourceId: 'av-team',   startDate: d2(18,0), endDate: d2(20,0),  duration: 2,   rateType: 'hourly', rate: 85,   totalCost: 170,   budgetCategory: 'AV & Production', payDirection: 'outbound', paypalType: 'payout', eventColor: '#f59e0b' }),

  // ===================== SPONSOR PACKAGES (inbound) =====================

  item({ id: 'spon-acme-pkg',     title: 'Gold Sponsorship Package', type: 'sponsor', resourceId: 'spon-acme', startDate: d1(8,0),  endDate: d2(18,0),  duration: 34,  rateType: 'fixed',  rate: 5000, totalCost: 5000,  budgetCategory: 'Sponsorship',     payDirection: 'inbound',  paypalType: 'invoice', paypalStatus: 'sent',  payerEmail: 'acme-billing@business.example.com', eventColor: '#fbbf24' }),
  item({ id: 'spon-byte-pkg',     title: 'Silver Sponsorship Package',type: 'sponsor',resourceId: 'spon-byte', startDate: d1(8,0),  endDate: d2(18,0),  duration: 34,  rateType: 'fixed',  rate: 2500, totalCost: 2500,  budgetCategory: 'Sponsorship',     payDirection: 'inbound',  paypalType: 'invoice', paypalStatus: 'paid',  payerEmail: 'byte-finance@business.example.com', eventColor: '#9ca3af' }),
  item({ id: 'spon-neural-pkg',   title: 'Bronze Sponsorship Package',type: 'sponsor',resourceId: 'spon-neural',startDate: d1(8,0), endDate: d2(18,0),  duration: 34,  rateType: 'fixed',  rate: 1000, totalCost: 1000,  budgetCategory: 'Sponsorship',     payDirection: 'inbound',  paypalType: 'invoice', paypalStatus: 'draft', payerEmail: 'neural-ops@business.example.com', eventColor: '#cd7f32' }),
];

// Dependencies — Bryntum uses { id, from, to } where type 2 = finish-to-start (default)
export const initialDependencies: BryntumDep[] = [
  { id: 1,  from: 'registration',     to: 'keynote' },
  { id: 2,  from: 'av-setup-1',       to: 'keynote' },
  { id: 3,  from: 'keynote',          to: 'mcp-workshop' },
  { id: 4,  from: 'keynote',          to: 'devops-dive' },
  { id: 5,  from: 'mcp-workshop',     to: 'lunch-1' },
  { id: 6,  from: 'devops-dive',      to: 'lunch-1' },
  { id: 7,  from: 'lunch-1',          to: 'oss-panel' },
  { id: 8,  from: 'lunch-1',          to: 'security-ws' },
  { id: 9,  from: 'oss-panel',        to: 'hackathon-kickoff' },
  { id: 10, from: 'security-ws',      to: 'snack-drop' },
  { id: 11, from: 'hacking',          to: 'demos' },
  { id: 12, from: 'demos',            to: 'judging' },
  { id: 13, from: 'judging',          to: 'awards' },
  { id: 14, from: 'awards',           to: 'prize-1st' },
  { id: 15, from: 'awards',           to: 'prize-2nd' },
  { id: 16, from: 'awards',           to: 'prize-3rd' },
  { id: 17, from: 'awards',           to: 'teardown' },
];