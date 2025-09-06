import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../services/api';
import { useTranslation } from 'react-i18next';

const PatientManagement = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityHistory, setEligibilityHistory] = useState([]);

  const serviceTypes = [
    'general_consultation',
    'specialist_consultation',
    'emergency',
    'surgery',
    'diagnostic_imaging',
    'laboratory_tests',
    'physiotherapy',
    'dental',
    'maternity',
    'pediatric',
    'cardiology',
    'orthopedic',
    'dermatology'
  ];

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getPatients({ 
        page: currentPage, 
        per_page: 10 
      });
      setPatients(response.data.patients);
      setTotalPages(response.data.pages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEligibilityCheck = async (patientId, serviceType) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.checkEligibility({
        patient_id: patientId,
        service_type: serviceType
      });
      setEligibilityResult(response.data);
      
      // Fetch updated history
      await fetchEligibilityHistory(patientId);
    } catch (err) {
      setError('Failed to check eligibility');
      console.error('Error checking eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibilityHistory = async (patientId) => {
    try {
      const response = await apiEndpoints.getEligibilityHistory(patientId);
      setEligibilityHistory(response.data.history);
    } catch (err) {
      console.error('Error fetching eligibility history:', err);
    }
  };

  const openEligibilityModal = async (patient) => {
    setSelectedPatient(patient);
    setShowEligibilityCheck(true);
    setEligibilityResult(null);
    await fetchEligibilityHistory(patient.patient_id);
  };

  const closeEligibilityModal = () => {
    setShowEligibilityCheck(false);
    setSelectedPatient(null);
    setEligibilityResult(null);
    setEligibilityHistory([]);
  };

  const formatServiceType = (serviceType) => {
    return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityStatusColor = (status) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800';
      case 'not_eligible': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('Patient Management')}
        </h1>
        <p className="text-gray-600">
          Manage patient records and eligibility verification
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Patients Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Insurance Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Policy Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Insurance ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.patient_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {patient.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {patient.patient_id}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {patient.insurance_provider.toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(patient.policy_status)}`}>
                    {patient.policy_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {patient.insurance_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openEligibilityModal(patient)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Check Eligibility
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Eligibility Check Modal */}
      {showEligibilityCheck && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Eligibility Check - {selectedPatient.name}
                </h3>
                <button
                  onClick={closeEligibilityModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Service Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {serviceTypes.map((serviceType) => (
                    <button
                      key={serviceType}
                      onClick={() => handleEligibilityCheck(selectedPatient.patient_id, serviceType)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300"
                      disabled={loading}
                    >
                      {formatServiceType(serviceType)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eligibility Result */}
              {eligibilityResult && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="text-lg font-medium mb-3">Eligibility Result</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${eligibilityResult.eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {eligibilityResult.eligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Service:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {formatServiceType(eligibilityResult.service_type)}
                      </span>
                    </div>
                  </div>

                  {/* AI Prediction */}
                  {eligibilityResult.ai_prediction && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">AI Prediction</h5>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Coverage Likelihood:</span>
                          <div className="font-medium">{eligibilityResult.ai_prediction.coverage_likelihood}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Estimated Patient Cost:</span>
                          <div className="font-medium">${eligibilityResult.ai_prediction.estimated_patient_cost}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Cost:</span>
                          <div className="font-medium">${eligibilityResult.ai_prediction.estimated_total_cost}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {eligibilityResult.recommendations && eligibilityResult.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Recommendations</h5>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {eligibilityResult.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Eligibility History */}
              {eligibilityHistory.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-3">Eligibility History</h4>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {eligibilityHistory.map((check) => (
                          <tr key={check.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {new Date(check.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatServiceType(check.service_type)}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEligibilityStatusColor(check.status)}`}>
                                {check.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {check.ai_prediction?.estimated_patient_cost ? 
                                `$${check.ai_prediction.estimated_patient_cost}` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
