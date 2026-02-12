import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications } from '../../services/dataService';
import { Application } from '../../types';
import { Eye, Clock, Search, Filter } from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const navigate = useNavigate();

  useEffect(() => {
    const loadApps = async () => {
      const data = await getApplications();
      setApplications(data);
    };
    loadApps();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const filteredApps = applications.filter(app => {
      const matchesSearch = (() => {
        const fullName = `${app.firstName} ${app.surname}`.toLowerCase();
        const parent = (app.fatherName || app.motherName || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || parent.includes(term) || app.grade.toLowerCase().includes(term);
      })();

      const matchesStatus = app.status === statusFilter;

      return matchesSearch && matchesStatus;
  });

  const TabButton: React.FC<{ label: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; count: number }> = ({ label, status, count }) => (
      <button 
        onClick={() => setStatusFilter(status)}
        className={`px-6 py-3 font-bold text-sm uppercase tracking-wider border-b-4 transition-colors flex items-center gap-2 ${
            statusFilter === status 
            ? 'border-coha-900 text-coha-900 bg-white' 
            : 'border-transparent text-gray-500 hover:text-coha-700 hover:bg-gray-50'
        }`}
      >
        {label}
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusFilter === status ? 'bg-coha-100 text-coha-800' : 'bg-gray-200 text-gray-600'}`}>
            {count}
        </span>
      </button>
  );

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-coha-900">Student Applications</h2>
        <p className="text-gray-600">Review and manage incoming admission requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white shadow-sm overflow-x-auto">
        <TabButton label="Pending" status="PENDING" count={pendingCount} />
        <TabButton label="Approved" status="APPROVED" count={approvedCount} />
        <TabButton label="Rejected" status="REJECTED" count={rejectedCount} />
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-coha-500 outline-none rounded-none"
              placeholder={`Search ${statusFilter.toLowerCase()} applications...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applicant Name</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Parent Info</th>
                <th className="px-6 py-4">Submission Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-coha-900">
                    {app.surname}, {app.firstName}
                    {app.isSpecialNeeds && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-none">Special Needs</span>}
                  </td>
                  <td className="px-6 py-4">{app.grade}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-bold">{app.fatherName || app.motherName}</p>
                      <p className="text-gray-500">{app.fatherPhone || app.motherPhone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {app.submissionDate?.toDate().toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/admin/applications/${app.id}`)}
                      className="text-coha-500 hover:text-coha-700 font-bold text-sm flex items-center gap-1"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                          <Filter size={48} className="text-gray-200 mb-2"/>
                          <p>No {statusFilter.toLowerCase()} applications found.</p>
                      </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};