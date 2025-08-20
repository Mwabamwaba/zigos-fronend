import React from 'react';
import { Project, Risk } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { AlertTriangle, Plus, Edit2, Trash2 } from 'lucide-react';

interface RiskMatrixProps {
  project: Project;
}

export default function RiskMatrix({ project }: RiskMatrixProps) {
  const { addRisk, updateRisk, removeRisk } = useProjectStore();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingRisk, setEditingRisk] = React.useState<Risk | null>(null);

  const getRiskScore = (risk: Risk) => risk.impact * risk.probability;

  const getRiskColor = (score: number) => {
    if (score >= 20) return 'bg-red-100 text-red-800';
    if (score >= 12) return 'bg-orange-100 text-orange-800';
    if (score >= 8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const sortedRisks = [...project.risks].sort((a, b) => 
    getRiskScore(b) - getRiskScore(a)
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Risk Matrix</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Risk</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {sortedRisks.map((risk) => {
            const score = getRiskScore(risk);
            return (
              <div
                key={risk.id}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`w-5 h-5 ${
                        score >= 20 ? 'text-red-500' :
                        score >= 12 ? 'text-orange-500' :
                        score >= 8 ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(score)}`}>
                        Risk Score: {score}
                      </span>
                      <span className="text-sm text-gray-500">
                        {risk.category.charAt(0).toUpperCase() + risk.category.slice(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-900">{risk.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Impact: {risk.impact}/5 | Probability: {risk.probability}/5</p>
                      <p className="mt-1">Mitigation: {risk.mitigation}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingRisk(risk)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeRisk(project.id, risk.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Risk Modal */}
      {(showAddModal || editingRisk) && (
        <RiskModal
          risk={editingRisk}
          onSave={(risk) => {
            if (editingRisk) {
              updateRisk(project.id, risk.id, risk);
            } else {
              addRisk(project.id, risk);
            }
            setShowAddModal(false);
            setEditingRisk(null);
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingRisk(null);
          }}
          team={project.team}
        />
      )}
    </div>
  );
}

interface RiskModalProps {
  risk?: Risk | null;
  onSave: (risk: Risk) => void;
  onClose: () => void;
  team: Project['team'];
}

function RiskModal({ risk, onSave, onClose, team }: RiskModalProps) {
  const [formData, setFormData] = React.useState<Risk>({
    id: risk?.id || Date.now().toString(),
    category: risk?.category || 'personnel',
    description: risk?.description || '',
    impact: risk?.impact || 3,
    probability: risk?.probability || 3,
    mitigation: risk?.mitigation || '',
    owner: risk?.owner || team[0]?.id || '',
    status: risk?.status || 'identified',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {risk ? 'Edit Risk' : 'Add Risk'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Risk['category'] })}
            >
              <option value="personnel">Personnel Dependency</option>
              <option value="requirements">Requirements Uncertainty</option>
              <option value="technical">Technical Dependencies</option>
              <option value="stakeholder">Stakeholder Availability</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Impact (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: Number(e.target.value) as Risk['impact'] })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Probability (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) as Risk['probability'] })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mitigation Strategy</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.mitigation}
              onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Risk Owner</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            >
              {team.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Risk['status'] })}
            >
              <option value="identified">Identified</option>
              <option value="mitigated">Mitigated</option>
              <option value="accepted">Accepted</option>
            </select>
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
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {risk ? 'Update' : 'Add'} Risk
          </button>
        </div>
      </div>
    </div>
  );
}