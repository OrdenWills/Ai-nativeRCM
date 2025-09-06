import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../services/api';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const Claims = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('submit');
  const [claimsList, setClaimsList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    provider: '',
    facility: '',
    service_date: '',
    claim_amount: '',
    insurance_provider: '',
    diagnosis_codes: '',
    procedure_codes: ''
  });

  useEffect(() => {
    if (activeTab === 'list') {
      fetchClaimsList();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchClaimsList = async () => {
    setLoading(true);
    try {
      const response = await apiEndpoints.getClaimsList();
      setClaimsList(response.data.claims);
    } catch (error) {
      setError('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiEndpoints.getDashboardStats();
      setAnalytics(response.data);
    } catch (error) {
      // Mock analytics data
      setAnalytics({
        total_claims: 156,
        total_submitted: 425000,
        total_paid: 340000,
        denial_rate: 8.5,
        avg_processing_time: 8.5,
        ai_insights: [
          "Denial rate decreased by 12% this month",
          "Claims with AI pre-screening have 85% approval rate",
          "Average processing time: 8.5 days"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        diagnosis_codes: formData.diagnosis_codes.split(',').map(code => code.trim()),
        procedure_codes: formData.procedure_codes.split(',').map(code => code.trim()),
        claim_amount: parseFloat(formData.claim_amount)
      };

      const response = await apiEndpoints.submitClaim(submitData);
      
      // Show success and switch to list view
      setActiveTab('list');
      fetchClaimsList();
      
      // Reset form
      setFormData({
        patient_id: '',
        patient_name: '',
        provider: '',
        facility: '',
        service_date: '',
        claim_amount: '',
        insurance_provider: '',
        diagnosis_codes: '',
        procedure_codes: ''
      });
    } catch (error) {
      setError('Failed to submit claim');
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
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'submitted':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'review_required':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-700 bg-green-50';
      case 'denied':
        return 'text-red-700 bg-red-50';
      case 'processing':
      case 'submitted':
        return 'text-yellow-700 bg-yellow-50';
      case 'review_required':
        return 'text-orange-700 bg-orange-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const tabs = [
    { id: 'submit', name: 'Submit Claim', icon: PlusIcon },
    { id: 'list', name: 'Claims List', icon: DocumentDuplicateIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
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

      {/* Submit Claim Tab */}
      {activeTab === 'submit' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Submit Insurance Claim
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
                  <label htmlFor="service_date" className="block text-sm font-medium text-gray-700">
                    Service Date
                  </label>
                  <input
                    type="date"
                    name="service_date"
                    id="service_date"
                    value={formData.service_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="claim_amount" className="block text-sm font-medium text-gray-700">
                    Claim Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="claim_amount"
                    id="claim_amount"
                    value={formData.claim_amount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="2500.00"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700">
                    Insurance Provider
                  </label>
                  <select
                    name="insurance_provider"
                    id="insurance_provider"
                    value={formData.insurance_provider}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Provider</option>
                    <option value="Daman Health Insurance">Daman Health Insurance</option>
                    <option value="Tawuniya Insurance">Tawuniya Insurance</option>
                    <option value="Qatar Insurance Company">Qatar Insurance Company</option>
                    <option value="Gulf Insurance Group">Gulf Insurance Group</option>
                    <option value="Oman Insurance Company">Oman Insurance Company</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="diagnosis_codes" className="block text-sm font-medium text-gray-700">
                    Diagnosis Codes
                  </label>
                  <input
                    type="text"
                    name="diagnosis_codes"
                    id="diagnosis_codes"
                    value={formData.diagnosis_codes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Z00.00, M79.3 (comma separated)"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="procedure_codes" className="block text-sm font-medium text-gray-700">
                    Procedure Codes
                  </label>
                  <input
                    type="text"
                    name="procedure_codes"
                    id="procedure_codes"
                    value={formData.procedure_codes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="99213, 73060 (comma separated)"
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
                  {loading ? 'Processing...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claims List Tab */}
      {activeTab === 'list' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Claims Management
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <ClockIcon className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading claims...</p>
              </div>
            ) : claimsList.length === 0 ? (
              <div className="text-center py-8">
                <DocumentDuplicateIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No claims found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {claimsList.map((claim) => (
                  <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">{claim.id}</h4>
                          <div className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                            {getStatusIcon(claim.status)}
                            <span className="ml-1 capitalize">{claim.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <p><strong>Patient:</strong> {claim.patient_name} ({claim.patient_id})</p>
                          <p><strong>Provider:</strong> {claim.provider} | <strong>Amount:</strong> ${claim.claim_amount}</p>
                          <p><strong>Service Date:</strong> {claim.service_date} | <strong>Submitted:</strong> {claim.submission_date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedClaim(claim)}
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <ClockIcon className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading analytics...</p>
            </div>
          ) : analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-500">
                      <DocumentDuplicateIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Claims</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.total_claims}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-500">
                      <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Submitted</p>
                      <p className="text-2xl font-bold text-gray-900">${analytics.total_submitted?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-500">
                      <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Paid</p>
                      <p className="text-2xl font-bold text-gray-900">${analytics.total_paid?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-red-500">
                      <XCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Denial Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.denial_rate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    AI Insights
                  </h3>
                  <div className="space-y-3">
                    {analytics.ai_insights?.map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Claim Details Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Claim Details - {selectedClaim.id}
                </h3>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Patient</p>
                    <p className="text-sm text-gray-900">{selectedClaim.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedClaim.status)}`}>
                      {getStatusIcon(selectedClaim.status)}
                      <span className="ml-1 capitalize">{selectedClaim.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Claim Amount</p>
                    <p className="text-sm text-gray-900">${selectedClaim.claim_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Paid Amount</p>
                    <p className="text-sm text-gray-900">${selectedClaim.paid_amount}</p>
                  </div>
                </div>

                {selectedClaim.ai_scrubbing && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">AI Scrubbing Results</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-700">
                        <strong>Confidence Score:</strong> {(selectedClaim.ai_scrubbing.confidence_score * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Errors:</strong> {selectedClaim.ai_scrubbing.errors_found} | 
                        <strong> Warnings:</strong> {selectedClaim.ai_scrubbing.warnings}
                      </p>
                      {selectedClaim.ai_scrubbing.issues && selectedClaim.ai_scrubbing.issues.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-700">Issues:</p>
                          <ul className="list-disc list-inside text-sm text-blue-600">
                            {selectedClaim.ai_scrubbing.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
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

export default Claims;
