import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../services/api';
import PatientManagement from '../components/PatientManagement';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const Eligibility = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('quick-check');
  const [patientId, setPatientId] = useState('');
  const [serviceType, setServiceType] = useState('general_consultation');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const serviceTypes = [
    { value: 'general_consultation', label: 'General Consultation' },
    { value: 'specialist_consultation', label: 'Specialist Consultation' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'emergency', label: 'Emergency Care' },
    { value: 'laboratory_tests', label: 'Laboratory Tests' },
    { value: 'diagnostic_imaging', label: 'Medical Imaging' },
    { value: 'physiotherapy', label: 'Physiotherapy' },
    { value: 'dental', label: 'Dental Care' },
    { value: 'maternity', label: 'Maternity Care' },
    { value: 'pediatric', label: 'Pediatric Care' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'orthopedic', label: 'Orthopedic Care' },
    { value: 'dermatology', label: 'Dermatology' },
  ];

  const handleEligibilityCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEligibilityResult(null);

    try {
      const response = await apiEndpoints.checkEligibility({
        patient_id: patientId,
        service_type: serviceType,
      });
      setEligibilityResult(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Patient not found. Please verify the Patient ID.');
      } else {
        setError('Eligibility check failed. Please try again.');
      }
      console.error('Eligibility check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (eligible) => {
    return eligible ? (
      <CheckCircleIcon className="w-6 h-6 text-green-500" />
    ) : (
      <XCircleIcon className="w-6 h-6 text-red-500" />
    );
  };

  const getStatusColor = (eligible) => {
    return eligible ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50';
  };

  const tabs = [
    { id: 'quick-check', name: 'Quick Check', icon: MagnifyingGlassIcon },
    { id: 'patient-management', name: 'Patient Management', icon: UsersIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'quick-check' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Eligibility Check
              </h3>

              <form onSubmit={handleEligibilityCheck} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      id="patientId"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Patient ID (e.g., P001)"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                      Service Type
                    </label>
                    <select
                      id="serviceType"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      {serviceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
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
                    disabled={loading || !patientId}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Checking...' : 'Check Eligibility'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {eligibilityResult && (
            <div className="space-y-6">
              {/* Eligibility Status */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eligibility Status
                    </h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(eligibilityResult.eligible)}`}>
                      {getStatusIcon(eligibilityResult.eligible)}
                      <span className="ml-2">
                        {eligibilityResult.eligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Patient Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Name:</strong> {eligibilityResult.patient_info.name}</p>
                        <p><strong>DOB:</strong> {eligibilityResult.patient_info.dob}</p>
                        <p><strong>Insurance ID:</strong> {eligibilityResult.patient_info.insurance_id}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Insurance Provider</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Provider:</strong> {eligibilityResult.insurance_provider.name}</p>
                        <p><strong>Country:</strong> {eligibilityResult.insurance_provider.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Details */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Coverage Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Deductible</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${eligibilityResult.coverage_details.deductible}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Copay</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${eligibilityResult.coverage_details.copay}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Coverage</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {eligibilityResult.coverage_details.coverage_percentage}%
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Out-of-Pocket Max</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${eligibilityResult.coverage_details.out_of_pocket_max}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Prediction */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    AI Coverage Prediction
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Coverage Likelihood</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {eligibilityResult.ai_prediction.coverage_likelihood}%
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-700">Estimated Patient Cost</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${eligibilityResult.ai_prediction.estimated_patient_cost.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-700">Confidence Score</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {(eligibilityResult.ai_prediction.confidence_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* AI-Generated Insights */}
              {eligibilityResult.ai_prediction.ai_insights &&
                Array.isArray(eligibilityResult.ai_prediction.ai_insights) &&
                eligibilityResult.ai_prediction.ai_insights.length > 0 &&
                typeof eligibilityResult.ai_prediction.ai_insights[0] === 'object' && (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        AI-Generated Insights
                      </h3>

                      <div className="space-y-4">
                        {eligibilityResult.ai_prediction.ai_insights.map((insight, index) => (
                          <div key={insight.insight_id || index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center">
                                <h4 className="text-sm font-semibold text-blue-900">
                                  {insight.insight_title}
                                </h4>
                                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${insight.priority === 'High'
                                    ? 'bg-red-100 text-red-800'
                                    : insight.priority === 'Medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                  {insight.priority} Priority
                                </span>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {insight.insight_category}
                              </span>
                            </div>

                            <p className="text-sm text-blue-800 mb-3">
                              {insight.insight_description}
                            </p>

                            <div className="bg-white bg-opacity-60 rounded-md p-3">
                              <p className="text-xs font-medium text-blue-900 mb-1">Recommendation:</p>
                              <p className="text-sm text-blue-800">
                                {insight.recommendation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* Legacy AI Insights Display (for string-based insights) */}
              {eligibilityResult.ai_prediction.ai_insights &&
                Array.isArray(eligibilityResult.ai_prediction.ai_insights) &&
                eligibilityResult.ai_prediction.ai_insights.length > 0 &&
                typeof eligibilityResult.ai_prediction.ai_insights[0] === 'string' && (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        AI Analysis Notes
                      </h3>

                      <div className="space-y-3">
                        {eligibilityResult.ai_prediction.ai_insights.map((insight, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              {/* Recommendations */}
              {eligibilityResult.recommendations && eligibilityResult.recommendations.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Recommendations
                    </h3>

                    <div className="space-y-3">
                      {eligibilityResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Demo Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <DocumentTextIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Demo Patient IDs</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Try: <strong>P001</strong> to <strong>P050</strong> - Real patients from our database with comprehensive coverage details
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Management Tab */}
      {activeTab === 'patient-management' && (
        <PatientManagement />
      )}
    </div>
  );
};

export default Eligibility;
