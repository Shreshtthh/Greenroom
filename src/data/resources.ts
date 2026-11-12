import type { Resource } from '../lib/types';

export const resources: Resource[] = [
  // Stages
  { id: 'main-stage', name: 'Main Stage',       type: 'stage',   color: '#3b82f6' },
  { id: 'room-a',     name: 'Workshop Room A',  type: 'stage',   color: '#8b5cf6' },
  { id: 'room-b',     name: 'Workshop Room B',  type: 'stage',   color: '#6366f1' },
  // Crew & Vendors
  { id: 'av-team',    name: 'AV Team',              type: 'crew',    hourlyRate: 85,  color: '#f59e0b' },
  { id: 'catering',   name: 'Stellar Catering',     type: 'vendor',                   color: '#ef4444' },
  { id: 'photo',      name: 'CloudLens Photography',type: 'vendor',  hourlyRate: 200, color: '#ec4899' },
  { id: 'swag',       name: 'PrintHub Swag',        type: 'vendor',                   color: '#14b8a6' },
  // Speakers
  { id: 'sp-chen',    name: 'Dr. Sarah Chen',   type: 'speaker', hourlyRate: 350, color: '#22c55e' },
  { id: 'sp-rivera',  name: 'Marcus Rivera',    type: 'speaker', hourlyRate: 200, color: '#16a34a' },
  { id: 'sp-sharma',  name: 'Priya Sharma',     type: 'speaker', hourlyRate: 250, color: '#15803d' },
  { id: 'sp-okafor',  name: 'James Okafor',     type: 'speaker', hourlyRate: 180, color: '#166534' },
  { id: 'sp-tanaka',  name: 'Yuki Tanaka',      type: 'speaker', hourlyRate: 300, color: '#14532d' },
  // Sponsors (shown as resources so invoices appear on the timeline)
  { id: 'spon-acme',  name: 'Acme Corp (Gold)',     type: 'sponsor', color: '#fbbf24' },
  { id: 'spon-byte',  name: 'ByteWorks (Silver)',   type: 'sponsor', color: '#9ca3af' },
  { id: 'spon-neural',name: 'NeuralDev (Bronze)',   type: 'sponsor', color: '#cd7f32' },
];

export function getResourceName(id: string): string {
  return resources.find(r => r.id === id)?.name ?? id;
}