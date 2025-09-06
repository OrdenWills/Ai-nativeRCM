import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../services/api';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CodeBracketIcon,
  LightBulbIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const MedicalCoding = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('code');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ icd10: [], cpt: [] });
  const [aiSuggestions, setAiSuggestions] = useState({ diagnosis: [], procedure: [] });
  const [codingSessions, setCodingSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewingSession, setViewingSession] = useState(null);

  const [sessionData, setSessionData] = useState({
    patient_id: '',
    patient_name: '',
    encounter_date: '',
    provider: '',
    chief_complaint: '',
    clinical_notes: '',
    status: 'draft'
  });

  const [validationResult, setValidationResult] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState({ diagnosis: [], procedure: [] });

  useEffect(() => {
    if (activeTab === 'sessions') fetchCodingSessions();
    else if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  const searchCodes = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const mockResults = {
        icd10: [
          { code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular' },
          { code: 'E11.9', description: 'Type 2 diabetes', category: 'Endocrine' }
        ],
        cpt: [
          { code: '99213', description: 'Office visit, level 3', category: 'E&M', rvu: 1.3 },
          { code: '93000', description: 'ECG', category: 'Cardiology', rvu: 0.3 }
        ]
      };
      setSearchResults(mockResults);
    } catch (error) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getAiSuggestions = async () => {
    if (!sessionData.chief_complaint.trim()) {
      setError('Please enter chief complaint');
      return;
    }
    setLoading(true);
    try {
      const mockSuggestions = {
        diagnosis: [{ code: 'I25.10', description: 'Atherosclerotic heart disease', confidence: 0.85 }],
        procedure: [{ code: '99214', description: 'Office visit, level 4', confidence: 0.88 }]
      };
      setAiSuggestions(mockSuggestions);
    } catch (error) {
      setError('AI suggestion failed');
    } finally {
      setLoading(false);
    }
  };

  const validateCodes = async () => {
    setLoading(true);
    try {
      const mockValidation = {
        valid: true,
        warnings: ['Consider adding E&M code'],
        compliance_score: 0.92
      };
      setValidationResult(mockValidation);
    } catch (error) {
      setError('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async () => {
    setLoading(true);
    try {
      const newSession = {
        id: `CS${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ...sessionData,
        diagnosis_codes: selectedCodes.diagnosis.map(c => c.code),
        procedure_codes: selectedCodes.procedure.map(c => c.code),
        ai_confidence: 0.92,
        created_date: new Date().toISOString().split('T')[0]
      };
      setCodingSessions(prev => [newSession, ...prev]);
      setActiveTab('sessions');
      setSessionData({ patient_id: '', patient_name: '', encounter_date: '', provider: '', chief_complaint: '', clinical_notes: '', status: 'draft' });
      setSelectedCodes({ diagnosis: [], procedure: [] });
    } catch (error) {
      setError('Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  const fetchCodingSessions = async () => {
    setLoading(true);
    try {
      const mockSessions = [
        {
          id: 'CS001',
          patient_name: 'Ahmed Al-Rashid',
          provider: 'Dr. Sarah Ahmed',
          chief_complaint: 'Chest pain',
          diagnosis_codes: ['I25.10'],
          procedure_codes: ['99214'],
          status: 'completed',
          ai_confidence: 0.94
        }
      ];
      setCodingSessions(mockSessions);
    } catch (error) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const mockAnalytics = {
        total_sessions: 45,
        completed_sessions: 38,
        avg_ai_confidence: 0.91,
        ai_insights: ["AI confidence improved by 15% this month"]
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const addCodeToSelection = (code, type) => {
    setSelectedCodes(prev => ({ ...prev, [type]: [...prev[type], code] }));
  };

  const removeCodeFromSelection = (codeToRemove, type) => {
    setSelectedCodes(prev => ({ ...prev, [type]: prev[type].filter(code => code.code !== codeToRemove) }));
  };

  const getStatusIcon = (status) => {
    return status === 'completed' ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <ClockIcon className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? 'text-green-700 bg-green-50' : 'text-yellow-700 bg-yellow-50';
  };

  const tabs = [
    { id: 'code', name: 'Code Assignment', icon: CodeBracketIcon },
    { id: 'sessions', name: 'Coding Sessions', icon: DocumentTextIcon },
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

      {/* Code Assignment Tab */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          {/* Patient Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Patient Encounter</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input type="text" value={sessionData.patient_id} onChange={(e) => setSessionData({...sessionData, patient_id: e.target.value})} className="border-gray-300 rounded-md" placeholder="Patient ID" />
                <input type="text" value={sessionData.patient_name} onChange={(e) => setSessionData({...sessionData, patient_name: e.target.value})} className="border-gray-300 rounded-md" placeholder="Patient Name" />
                <input type="date" value={sessionData.encounter_date} onChange={(e) => setSessionData({...sessionData, encounter_date: e.target.value})} className="border-gray-300 rounded-md" />
                <input type="text" value={sessionData.provider} onChange={(e) => setSessionData({...sessionData, provider: e.target.value})} className="border-gray-300 rounded-md" placeholder="Provider" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea value={sessionData.chief_complaint} onChange={(e) => setSessionData({...sessionData, chief_complaint: e.target.value})} rows={3} className="border-gray-300 rounded-md" placeholder="Chief complaint..." />
                <textarea value={sessionData.clinical_notes} onChange={(e) => setSessionData({...sessionData, clinical_notes: e.target.value})} rows={3} className="border-gray-300 rounded-md" placeholder="Clinical notes..." />
              </div>
              <div className="mt-4">
                <button onClick={getAiSuggestions} disabled={loading} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                  <SparklesIcon className="w-4 h-4 mr-2" />Get AI Suggestions
                </button>
              </div>
            </div>
          </div>

          {/* Code Search */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Code Search</h3>
              <div className="flex space-x-4 mb-4">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 border-gray-300 rounded-md" placeholder="Search codes..." onKeyPress={(e) => e.key === 'Enter' && searchCodes()} />
                <button onClick={searchCodes} disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </button>
              </div>
              {searchResults.icd10.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">ICD-10 Codes</h4>
                  {searchResults.icd10.map((code, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg mb-2">
                      <div><span className="font-medium text-primary-600">{code.code}</span> - {code.description}</div>
                      <button onClick={() => addCodeToSelection(code, 'diagnosis')} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">Add</button>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.cpt.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">CPT Codes</h4>
                  {searchResults.cpt.map((code, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg mb-2">
                      <div><span className="font-medium text-green-600">{code.code}</span> - {code.description}</div>
                      <button onClick={() => addCodeToSelection(code, 'procedure')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Add</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          {(aiSuggestions.diagnosis.length > 0 || aiSuggestions.procedure.length > 0) && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />AI Suggestions
                </h3>
                {aiSuggestions.diagnosis.map((suggestion, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                    <div><span className="font-medium">{suggestion.code}</span> - {suggestion.description} <span className="text-blue-600 text-sm">({(suggestion.confidence * 100).toFixed(0)}%)</span></div>
                    <button onClick={() => addCodeToSelection(suggestion, 'diagnosis')} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">Add</button>
                  </div>
                ))}
                {aiSuggestions.procedure.map((suggestion, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                    <div><span className="font-medium">{suggestion.code}</span> - {suggestion.description} <span className="text-green-600 text-sm">({(suggestion.confidence * 100).toFixed(0)}%)</span></div>
                    <button onClick={() => addCodeToSelection(suggestion, 'procedure')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Codes */}
          {(selectedCodes.diagnosis.length > 0 || selectedCodes.procedure.length > 0) && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Codes</h3>
                {selectedCodes.diagnosis.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Diagnosis Codes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCodes.diagnosis.map((code, index) => (
                        <div key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                          {code.code} - {code.description}
                          <button onClick={() => removeCodeFromSelection(code.code, 'diagnosis')} className="ml-2 text-primary-600">
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCodes.procedure.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Procedure Codes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCodes.procedure.map((code, index) => (
                        <div key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          {code.code} - {code.description}
                          <button onClick={() => removeCodeFromSelection(code.code, 'procedure')} className="ml-2 text-green-600">
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button onClick={validateCodes} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <CheckCircleIcon className="w-4 h-4 inline mr-2" />Validate
                  </button>
                  <button onClick={saveSession} disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Session'}
                  </button>
                </div>
                {validationResult && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Validation Results</h4>
                    <p className="text-sm text-blue-700">Compliance Score: {(validationResult.compliance_score * 100).toFixed(0)}%</p>
                    {validationResult.warnings?.map((warning, index) => (
                      <p key={index} className="text-sm text-orange-600">⚠️ {warning}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Coding Sessions</h3>
            {loading ? (
              <div className="text-center py-8"><ClockIcon className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
            ) : codingSessions.length === 0 ? (
              <div className="text-center py-8"><DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400" /><p className="mt-2 text-gray-500">No sessions found</p></div>
            ) : (
              <div className="space-y-4">
                {codingSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium">{session.id}</h4>
                          <div className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {getStatusIcon(session.status)}<span className="ml-1">{session.status}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">Patient: {session.patient_name} | Provider: {session.provider}</p>
                        <p className="text-sm text-gray-600">Chief Complaint: {session.chief_complaint}</p>
                        <p className="text-xs text-gray-500">AI Confidence: {(session.ai_confidence * 100).toFixed(0)}%</p>
                      </div>
                      <button onClick={() => setViewingSession(session)} className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="w-4 h-4 inline mr-1" />View
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
            <div className="text-center py-8"><ClockIcon className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
          ) : analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-500"><DocumentTextIcon className="w-6 h-6 text-white" /></div>
                    <div className="ml-4"><p className="text-sm text-gray-600">Total Sessions</p><p className="text-2xl font-bold">{analytics.total_sessions}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-500"><CheckCircleIcon className="w-6 h-6 text-white" /></div>
                    <div className="ml-4"><p className="text-sm text-gray-600">Completed</p><p className="text-2xl font-bold">{analytics.completed_sessions}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-500"><SparklesIcon className="w-6 h-6 text-white" /></div>
                    <div className="ml-4"><p className="text-sm text-gray-600">AI Confidence</p><p className="text-2xl font-bold">{(analytics.avg_ai_confidence * 100).toFixed(0)}%</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI Insights</h3>
                  <div className="space-y-3">
                    {analytics.ai_insights?.map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg"><p className="text-sm text-blue-800">{insight}</p></div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Session View Modal */}
      {viewingSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Session Details - {viewingSession.id}</h3>
              <button onClick={() => setViewingSession(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p><strong>Patient:</strong> {viewingSession.patient_name}</p>
              <p><strong>Provider:</strong> {viewingSession.provider}</p>
              <p><strong>Chief Complaint:</strong> {viewingSession.chief_complaint}</p>
              <p><strong>Diagnosis Codes:</strong> {viewingSession.diagnosis_codes?.join(', ')}</p>
              <p><strong>Procedure Codes:</strong> {viewingSession.procedure_codes?.join(', ')}</p>
              <p><strong>AI Confidence:</strong> {(viewingSession.ai_confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>
      )}
    </div>
  );
};

export default MedicalCoding;
