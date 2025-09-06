import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../services/api';
import {
  PlusIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const PriorAuth = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('submit');
  const [authList, setAuthList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAuth, setSelectedAuth] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    procedure_code: '',
    procedure_name: '',
    diagnosis: '',
    provider: '',
    facility: '',
    estimated_cost: ''
  });

  useEffect(() => {
    if (activeTab === 'list') {
      fetchAuthList();
    }
  }, [activeTab]);

  const fetchAuthList = async () => {
    setLoading(true);
    try {
      const response = await apiEndpoints.getPriorAuthList();
      setAuthList(response.data.authorizations);
    } catch (error) {
      setError('Failed to load authorizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiEndpoints.submitPriorAuth(formData);
      setSelectedAuth({
        ...formData,
        id: response.data.authorization_id,
        ai_analysis: response.data.ai_analysis,
        status: 'pending',
        submitted_date: new Date().toISOString().split('T')[0]
      });
      setActiveTab('result');
      
      // Reset form
      setFormData({
        patient_id: '',
        patient_name: '',
        procedure_code: '',
        procedure_name: '',
        diagnosis: '',
        provider: '',
        facility: '',
        estimated_cost: ''
      });
    } catch (error) {
      setError('Failed to submit prior authorization');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50';
      case 'denied':
        return 'text-red-700 bg-red-50';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const tabs = [
    { id: 'submit', name: 'Submit Request', icon: PlusIcon },
    { id: 'list', name: 'My Requests', icon: DocumentArrowUpIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Submit Request Tab */}
      {activeTab === 'submit' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Submit Prior Authorization Request
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    name="patient_id"
                    id="patient_id"
                    value={formData.patient_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="P001"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="patient_name"
                    id="patient_name"
                    value={formData.patient_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ahmed Al-Rashid"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="procedure_code" className="block text-sm font-medium text-gray-700">
                    Procedure Code
                  </label>
                  <input
                    type="text"
                    name="procedure_code"
                    id="procedure_code"
                    value={formData.procedure_code}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="CPT-29881"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="procedure_name" className="block text-sm font-medium text-gray-700">
                    Procedure Name
                  </label>
                  <input
                    type="text"
                    name="procedure_name"
                    id="procedure_name"
                    value={formData.procedure_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Arthroscopy, knee, surgical"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    name="diagnosis"
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="M23.91 - Other internal derangement of knee"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                    Provider
                  </label>
                  <input
                    type="text"
                    name="provider"
                    id="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Dr. Sarah Ahmed"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="facility" className="block text-sm font-medium text-gray-700">
                    Facility
                  </label>
                  <input
                    type="text"
                    name="facility"
                    id="facility"
                    value={formData.facility}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Dubai Medical Center"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="estimated_cost" className="block text-sm font-medium text-gray-700">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    name="estimated_cost"
                    id="estimated_cost"
                    value={formData.estimated_cost}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? (
                    <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authorization List Tab */}
      {activeTab === 'list' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Prior Authorization Requests
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <ClockIcon className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading authorizations...</p>
              </div>
            ) : authList.length === 0 ? (
              <div className="text-center py-8">
                <DocumentArrowUpIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No prior authorizations found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {authList.map((auth) => (
                  <div key={auth.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">{auth.procedure_name}</h4>
                          <div className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(auth.status)}`}>
                            {getStatusIcon(auth.status)}
                            <span className="ml-1 capitalize">{auth.status}</span>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <p><strong>Patient:</strong> {auth.patient_name} ({auth.patient_id})</p>
                          <p><strong>Code:</strong> {auth.procedure_code} | <strong>Provider:</strong> {auth.provider}</p>
                          <p><strong>Submitted:</strong> {auth.submitted_date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedAuth(auth)}
                        className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result/Details Modal */}
      {selectedAuth && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Authorization Details - {selectedAuth.id}
                </h3>
                <button
                  onClick={() => setSelectedAuth(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Patient</p>
                    <p className="text-sm text-gray-900">{selectedAuth.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAuth.status)}`}>
                      {getStatusIcon(selectedAuth.status)}
                      <span className="ml-1 capitalize">{selectedAuth.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Procedure</p>
                  <p className="text-sm text-gray-900">{selectedAuth.procedure_name} ({selectedAuth.procedure_code})</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                  <p className="text-sm text-gray-900">{selectedAuth.diagnosis}</p>
                </div>

                {selectedAuth.ai_analysis && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">AI Analysis</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-700">
                        <strong>Approval Likelihood:</strong> {selectedAuth.ai_analysis.approval_likelihood}%
                      </p>
                      {selectedAuth.ai_analysis.recommendations && selectedAuth.ai_analysis.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-700">Recommendations:</p>
                          <ul className="list-disc list-inside text-sm text-blue-600">
                            {selectedAuth.ai_analysis.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorAuth;
