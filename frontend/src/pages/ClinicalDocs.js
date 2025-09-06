import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../services/api';
import {
  DocumentTextIcon,
  PlusIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BookmarkIcon,
  LightBulbIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ClinicalDocs = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('create');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);

  // Form state
  const [documentData, setDocumentData] = useState({
    patient_id: '',
    patient_name: '',
    provider: '',
    template_id: '',
    content: {},
    status: 'draft'
  });

  useEffect(() => {
    fetchTemplates();
    if (activeTab === 'manage') {
      fetchDocuments();
    }
  }, [activeTab]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Mock templates data
      const mockTemplates = [
        {
          id: 'progress_note',
          name: 'Progress Note',
          category: 'general',
          sections: [
            { id: 'subjective', name: 'Subjective', required: true, ai_assistance: true },
            { id: 'objective', name: 'Objective', required: true, ai_assistance: true },
            { id: 'assessment', name: 'Assessment', required: true, ai_assistance: true },
            { id: 'plan', name: 'Plan', required: true, ai_assistance: true }
          ]
        },
        {
          id: 'discharge_summary',
          name: 'Discharge Summary',
          category: 'inpatient',
          sections: [
            { id: 'admission_diagnosis', name: 'Admission Diagnosis', required: true, ai_assistance: true },
            { id: 'discharge_diagnosis', name: 'Discharge Diagnosis', required: true, ai_assistance: true },
            { id: 'hospital_course', name: 'Hospital Course', required: true, ai_assistance: true },
            { id: 'discharge_instructions', name: 'Discharge Instructions', required: true, ai_assistance: true },
            { id: 'medications', name: 'Medications', required: true, ai_assistance: false },
            { id: 'follow_up', name: 'Follow-up', required: true, ai_assistance: true }
          ]
        },
        {
          id: 'consultation_note',
          name: 'Consultation Note',
          category: 'specialty',
          sections: [
            { id: 'reason_for_consultation', name: 'Reason for Consultation', required: true, ai_assistance: false },
            { id: 'history_present_illness', name: 'History of Present Illness', required: true, ai_assistance: true },
            { id: 'review_of_systems', name: 'Review of Systems', required: true, ai_assistance: true },
            { id: 'physical_examination', name: 'Physical Examination', required: true, ai_assistance: true },
            { id: 'impression', name: 'Impression', required: true, ai_assistance: true },
            { id: 'recommendations', name: 'Recommendations', required: true, ai_assistance: true }
          ]
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Mock documents data
      const mockDocuments = [
        {
          id: 'DOC001',
          template_id: 'progress_note',
          patient_id: 'P001',
          patient_name: 'Ahmed Al-Rashid',
          provider: 'Dr. Sarah Ahmed',
          date_created: '2024-01-15',
          last_modified: '2024-01-15',
          status: 'completed',
          ai_confidence: 0.92,
          compliance_score: 0.95
        },
        {
          id: 'DOC002',
          template_id: 'discharge_summary',
          patient_id: 'P002',
          patient_name: 'Fatima Al-Zahra',
          provider: 'Dr. Omar Hassan',
          date_created: '2024-01-18',
          last_modified: '2024-01-19',
          status: 'draft',
          ai_confidence: 0.88,
          compliance_score: 0.91
        }
      ];
      setDocuments(mockDocuments);
    } catch (error) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setDocumentData({
      ...documentData,
      template_id: template.id,
      content: {}
    });
    
    // Initialize content sections
    const initialContent = {};
    template.sections.forEach(section => {
      initialContent[section.id] = '';
    });
    setDocumentData(prev => ({
      ...prev,
      content: initialContent
    }));
  };

  const handleContentChange = (sectionId, value) => {
    setDocumentData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [sectionId]: value
      }
    }));
  };

  const requestAiAssistance = async (sectionId) => {
    setLoading(true);
    try {
      // Mock AI suggestions
      const mockSuggestions = {
        subjective: [
          "Patient reports chest pain, 7/10 severity, substernal, radiating to left arm",
          "Chief complaint: Shortness of breath for 2 days, worse with exertion",
          "Patient presents with headache, throbbing, bilateral, 6/10 severity"
        ],
        objective: [
          "Vital signs: BP 120/80, HR 72, RR 16, Temp 98.6°F, O2 sat 98% on RA",
          "General appearance: Alert, oriented, no acute distress",
          "Cardiovascular: Regular rate and rhythm, no murmurs"
        ],
        assessment: [
          "Chest pain, rule out acute coronary syndrome vs musculoskeletal",
          "Hypertension, well controlled on current medications",
          "Type 2 diabetes mellitus, HbA1c goal <7%"
        ],
        plan: [
          "Continue current medications, follow up in 3 months",
          "Order EKG, chest X-ray, basic metabolic panel",
          "Patient education provided regarding diet and exercise"
        ]
      };

      setAiSuggestions({
        ...aiSuggestions,
        [sectionId]: mockSuggestions[sectionId] || ["AI suggestion not available"]
      });
      setShowAiPanel(true);
    } catch (error) {
      setError('AI assistance failed');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (sectionId, suggestion) => {
    handleContentChange(sectionId, suggestion);
    setShowAiPanel(false);
  };

  const validateDocument = async () => {
    setLoading(true);
    try {
      // Mock validation
      const mockValidation = {
        ai_confidence: 0.92,
        compliance_score: 0.95,
        errors: [],
        warnings: ['Section "objective" may need more detail'],
        suggestions: ['Consider adding vital signs to objective section'],
        completeness: 0.9
      };
      setValidationResult(mockValidation);
    } catch (error) {
      setError('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    setLoading(true);
    try {
      // Mock save
      const newDoc = {
        id: `DOC${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ...documentData,
        date_created: new Date().toISOString().split('T')[0],
        last_modified: new Date().toISOString().split('T')[0],
        ai_confidence: 0.92,
        compliance_score: 0.95
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      setActiveTab('manage');
      
      // Reset form
      setDocumentData({
        patient_id: '',
        patient_name: '',
        provider: '',
        template_id: '',
        content: {},
        status: 'draft'
      });
      setSelectedTemplate(null);
    } catch (error) {
      setError('Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (doc) => {
    setViewingDocument(doc);
  };

  const editDocument = (doc) => {
    setEditingDocument(doc);
    setDocumentData({
      patient_id: doc.patient_id,
      patient_name: doc.patient_name,
      provider: doc.provider,
      template_id: doc.template_id,
      content: doc.content || {},
      status: doc.status
    });
    const template = templates.find(t => t.id === doc.template_id);
    setSelectedTemplate(template);
    setActiveTab('create');
  };

  const updateDocument = async () => {
    setLoading(true);
    try {
      // Mock update
      const updatedDoc = {
        ...editingDocument,
        ...documentData,
        last_modified: new Date().toISOString().split('T')[0],
        ai_confidence: 0.92,
        compliance_score: 0.95
      };
      
      setDocuments(prev => prev.map(doc => 
        doc.id === editingDocument.id ? updatedDoc : doc
      ));
      setActiveTab('manage');
      setEditingDocument(null);
      
      // Reset form
      setDocumentData({
        patient_id: '',
        patient_name: '',
        provider: '',
        template_id: '',
        content: {},
        status: 'draft'
      });
      setSelectedTemplate(null);
    } catch (error) {
      setError('Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'draft':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'review':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50';
      case 'draft':
        return 'text-yellow-700 bg-yellow-50';
      case 'review':
        return 'text-orange-700 bg-orange-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const tabs = [
    { id: 'create', name: 'Create Document', icon: PlusIcon },
    { id: 'manage', name: 'Manage Documents', icon: DocumentTextIcon },
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

      {/* Create Document Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Template Selection */}
          {!selectedTemplate && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Select Documentation Template
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-center mb-2">
                        <DocumentTextIcon className="w-6 h-6 text-primary-500 mr-2" />
                        <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Category: {template.category}</p>
                      <p className="text-sm text-gray-500">{template.sections.length} sections</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document Creation Form */}
          {selectedTemplate && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedTemplate.name}
                  </h3>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Change Template
                  </button>
                </div>

                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                    <input
                      type="text"
                      value={documentData.patient_id}
                      onChange={(e) => setDocumentData({...documentData, patient_id: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="P001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                    <input
                      type="text"
                      value={documentData.patient_name}
                      onChange={(e) => setDocumentData({...documentData, patient_name: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ahmed Al-Rashid"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provider</label>
                    <input
                      type="text"
                      value={documentData.provider}
                      onChange={(e) => setDocumentData({...documentData, provider: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Dr. Sarah Ahmed"
                    />
                  </div>
                </div>

                {/* Documentation Sections */}
                <div className="space-y-6">
                  {selectedTemplate.sections.map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {section.name}
                          {section.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {section.ai_assistance && (
                          <button
                            onClick={() => requestAiAssistance(section.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            AI Assist
                          </button>
                        )}
                      </div>
                      <textarea
                        value={documentData.content[section.id] || ''}
                        onChange={(e) => handleContentChange(section.id, e.target.value)}
                        rows={4}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder={`Enter ${section.name.toLowerCase()}...`}
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={validateDocument}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Validate
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setDocumentData({...documentData, status: 'draft'})}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={editingDocument ? updateDocument : saveDocument}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingDocument ? 'Update Document' : 'Save Document'}
                    </button>
                  </div>
                </div>

                {/* Validation Results */}
                {validationResult && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Validation Results</h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-blue-700">AI Confidence: </span>
                        <span className="font-medium">{(validationResult.ai_confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-sm text-blue-700">Compliance Score: </span>
                        <span className="font-medium">{(validationResult.compliance_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    {validationResult.warnings.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-orange-700">Warnings:</p>
                        <ul className="list-disc list-inside text-sm text-orange-600">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {validationResult.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-blue-700">Suggestions:</p>
                        <ul className="list-disc list-inside text-sm text-blue-600">
                          {validationResult.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manage Documents Tab */}
      {activeTab === 'manage' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Clinical Documents
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <ClockIcon className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No documents found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">{doc.id}</h4>
                          <div className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)}
                            <span className="ml-1 capitalize">{doc.status}</span>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <p><strong>Patient:</strong> {doc.patient_name} ({doc.patient_id})</p>
                          <p><strong>Provider:</strong> {doc.provider}</p>
                          <p><strong>Template:</strong> {templates.find(t => t.id === doc.template_id)?.name || doc.template_id}</p>
                          <p><strong>Created:</strong> {doc.date_created} | <strong>Modified:</strong> {doc.last_modified}</p>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="text-xs text-gray-500">
                            AI Confidence: {(doc.ai_confidence * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Compliance: {(doc.compliance_score * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => viewDocument(doc)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button 
                          onClick={() => editDocument(doc)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Document Details - {viewingDocument.id}
                </h3>
                <button
                  onClick={() => setViewingDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Document Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Patient</p>
                    <p className="text-sm text-gray-900">{viewingDocument.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Provider</p>
                    <p className="text-sm text-gray-900">{viewingDocument.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Template</p>
                    <p className="text-sm text-gray-900">{templates.find(t => t.id === viewingDocument.template_id)?.name || viewingDocument.template_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingDocument.status)}`}>
                      {getStatusIcon(viewingDocument.status)}
                      <span className="ml-1 capitalize">{viewingDocument.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="space-y-6">
                {viewingDocument.content && Object.entries(viewingDocument.content).map(([sectionId, content]) => {
                  const template = templates.find(t => t.id === viewingDocument.template_id);
                  const section = template?.sections.find(s => s.id === sectionId);
                  
                  return (
                    <div key={sectionId} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        {section?.name || sectionId}
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{content || 'No content provided'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Document Metrics */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Document Quality Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-blue-700">AI Confidence: </span>
                    <span className="font-medium">{(viewingDocument.ai_confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Compliance Score: </span>
                    <span className="font-medium">{(viewingDocument.compliance_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setViewingDocument(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewingDocument(null);
                    editDocument(viewingDocument);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions Panel */}
      {showAiPanel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                  AI Suggestions
                </h3>
                <button
                  onClick={() => setShowAiPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(aiSuggestions).map(([sectionId, suggestions]) => (
                  <div key={sectionId}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => applySuggestion(sectionId, suggestion)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all"
                      >
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default ClinicalDocs;
