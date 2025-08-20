import React from 'react';
import { Project, Milestone } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';

interface ProjectCalendarProps {
  project: Project;
}

export default function ProjectCalendar({ project }: ProjectCalendarProps) {
  const { updateMilestone } = useProjectStore();
  const [selectedEvent, setSelectedEvent] = React.useState<Milestone | null>(null);

  const events = React.useMemo(() => {
    return project.milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      start: milestone.startDate,
      end: milestone.endDate,
      backgroundColor: 
        milestone.status === 'completed' ? '#10B981' :
        milestone.status === 'in_progress' ? '#3B82F6' :
        '#6B7280',
      extendedProps: milestone,
    }));
  }, [project.milestones]);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const handleEventDrop = (info: any) => {
    const milestone = info.event.extendedProps;
    updateMilestone(project.id, milestone.id, {
      startDate: format(info.event.start, "yyyy-MM-dd'T'HH:mm:ss"),
      endDate: format(info.event.end || info.event.start, "yyyy-MM-dd'T'HH:mm:ss"),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Project Calendar</h2>
      </div>

      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          editable={true}
          droppable={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="auto"
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                selectedEvent.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedEvent.status.replace('_', ' ').charAt(0).toUpperCase() + 
                 selectedEvent.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Description</h4>
                <p className="mt-1 text-sm text-gray-600">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Start Date:</span>
                  <p className="text-gray-600">
                    {format(new Date(selectedEvent.startDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">End Date:</span>
                  <p className="text-gray-600">
                    {format(new Date(selectedEvent.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Hours:</span>
                  <p className="text-gray-600">
                    {selectedEvent.hoursLogged} / {selectedEvent.hoursAllocated}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Assignees:</span>
                  <p className="text-gray-600">{selectedEvent.assignees.length} team members</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}