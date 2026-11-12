import { useRef, useMemo } from 'react';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import type { WorkItem, Resource as GR, BryntumDep } from '../lib/types';

interface Props {
  resources: GR[];
  workItems: WorkItem[];
  dependencies: BryntumDep[];
  onEventChange: (updated: Partial<WorkItem> & { id: string }) => void;
}

export function SchedulerPanel({ resources, workItems, dependencies, onEventChange }: Props) {
  const ref = useRef<typeof BryntumSchedulerPro>(null);

  const events = useMemo(() =>
    workItems.map(w => ({
      id: w.id,
      resourceId: w.resourceId,
      name: w.title,
      startDate: w.startDate,
      endDate: w.endDate,
      eventColor: w.status === 'completed' ? '#22c55e' : (w.eventColor || '#3b82f6'),
      totalCost: w.totalCost,
      paypalStatus: w.paypalStatus,
      type: w.type,
    })), [workItems]);

  const bryntumResources = useMemo(() =>
    resources.map(r => ({ id: r.id, name: r.name, eventColor: r.color })),
  [resources]);

  return (
    <BryntumSchedulerPro
      ref={ref}
      resources={bryntumResources}
      events={events}
      dependencies={dependencies}
      columns={[{ text: 'Resource', field: 'name', width: 180 }]}
      startDate={new Date(2026, 10, 14, 6, 0)}
      endDate={new Date(2026, 10, 15, 22, 0)}
      viewPreset="hourAndDay"
      rowHeight={50}
      barMargin={4}
      eventStyle="rounded"
      features={{
        dependencies: true,
        dependencyEdit: true,
        eventResize: { showTooltip: true },
        eventDrag: { showTooltip: true },
      }}
      onEventResizeEnd={({ eventRecord }: any) => {
        if (!eventRecord) return;
        const ms = eventRecord.endDate.getTime() - eventRecord.startDate.getTime();
        onEventChange({
          id: eventRecord.id,
          startDate: eventRecord.startDate.toISOString(),
          endDate: eventRecord.endDate.toISOString(),
          duration: ms / 3_600_000,
        });
      }}
      onEventDrop={({ eventRecords }: any) => {
        for (const rec of eventRecords ?? []) {
          const ms = rec.endDate.getTime() - rec.startDate.getTime();
          onEventChange({
            id: rec.id,
            resourceId: rec.resourceId,
            startDate: rec.startDate.toISOString(),
            endDate: rec.endDate.toISOString(),
            duration: ms / 3_600_000,
          });
        }
      }}
    />
  );
}