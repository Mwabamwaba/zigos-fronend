'use client';

import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Project, Milestone, TeamMember } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { ArrowUpDown, Plus, Edit2, Trash2 } from 'lucide-react';

interface WorkBreakdownStructureProps {
  project: Project;
}

interface WorkBreakdownRow {
  id: string;
  milestone: string;
  assignee: string;
  role: string;
  allocated: number;
  used: number;
  remaining: number;
  progress: number;
}

function WorkBreakdownStructure({ project }: WorkBreakdownStructureProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<WorkBreakdownRow | null>(null);

  const columnHelper = createColumnHelper<WorkBreakdownRow>();

  const data = React.useMemo(() => {
    return project.milestones.flatMap(milestone => 
      milestone.assignedTeam.map(assigneeId => {
        const member = project.team.find(m => m.id === assigneeId);
        return {
          id: `${milestone.id}-${assigneeId}`,
          milestone: milestone.title,
          assignee: member?.name || 'Unassigned',
          role: member?.role || 'N/A',
          allocated: milestone.estimatedHours,
          used: milestone.actualHours,
          remaining: milestone.estimatedHours - milestone.actualHours,
          progress: (milestone.actualHours / milestone.estimatedHours) * 100,
        };
      })
    );
  }, [project]);

  const columns = [
    columnHelper.accessor('milestone', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1"
          onClick={() => column.toggleSorting()}
        >
          <span>Milestone</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('assignee', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1"
          onClick={() => column.toggleSorting()}
        >
          <span>Assignee</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
    }),
    columnHelper.accessor('role', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1"
          onClick={() => column.toggleSorting()}
        >
          <span>Role</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
    }),
    columnHelper.accessor('allocated', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1"
          onClick={() => column.toggleSorting()}
        >
          <span>Hours Allocated</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: info => `${info.getValue()}h`,
    }),
    columnHelper.accessor('used', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1"
          onClick={() => column.toggleSorting()}
        >
          <span>Hours Used</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: info => `${info.getValue()}h`,
    }),
    columnHelper.accessor('remaining', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1"
          onClick={() => column.toggleSorting()}
        >
          <span>Hours Remaining</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: info => `${info.getValue()}h`,
    }),
    columnHelper.accessor('progress', {
      header: 'Progress',
      cell: info => (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 rounded-full h-2"
            style={{ width: `${info.getValue()}%` }}
          />
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              setSelectedRow(info.row.original);
              setShowEditModal(true);
            }}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              // Handle delete
            }}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Work Breakdown Structure</h2>
          <button
            onClick={() => {
              setSelectedRow(null);
              setShowEditModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Allocation</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Total Hours Allocated</span>
            <p className="text-lg font-semibold text-gray-900">
              {data.reduce((sum, row) => sum + row.allocated, 0)}h
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Total Hours Used</span>
            <p className="text-lg font-semibold text-gray-900">
              {data.reduce((sum, row) => sum + row.used, 0)}h
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Overall Progress</span>
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(
                (data.reduce((sum, row) => sum + row.used, 0) /
                  data.reduce((sum, row) => sum + row.allocated, 0)) *
                  100
              )}%
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <AllocationModal
          project={project}
          allocation={selectedRow}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRow(null);
          }}
        />
      )}
    </div>
  );
}

interface AllocationModalProps {
  project: Project;
  allocation: WorkBreakdownRow | null;
  onClose: () => void;
}

function AllocationModal({ project, allocation, onClose }: AllocationModalProps) {
  const [formData, setFormData] = React.useState({
    milestoneId: allocation?.milestone || '',
    assigneeId: '',
    hours: allocation?.allocated || 0,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {allocation ? 'Edit Allocation' : 'Add Allocation'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Milestone</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.milestoneId}
              onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
            >
              <option value="">Select a milestone...</option>
              {project.milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Team Member</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
            >
              <option value="">Select a team member...</option>
              {project.team.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hours Allocated</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Handle save
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {allocation ? 'Update' : 'Add'} Allocation
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkBreakdownStructure;