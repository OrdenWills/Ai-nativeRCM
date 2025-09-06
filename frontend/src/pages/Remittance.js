import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../services/api';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const Remittance = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [reconciliationSessions, setReconciliationSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewingPayment, setViewingPayment] = useState(null);

  const [paymentData, setPaymentData] = useState({
    claim_id: '',
    patient_name: '',
    payer: '',
    amount_billed: '',
    amount_paid: '',
    payment_date: '',
    denial_reason: '',
    adjustment_codes: [],
    adjustment_amount: ''
  });

  const [reconciliationResult, setReconciliationResult] = useState(null);
  const [denialPredictions, setDenialPredictions] = useState([]);
  const [agingReport, setAgingReport] = useState(null);

  useEffect(() => {
    if (activeTab === 'payments') fetchPayments();
    else if (activeTab === 'reconciliation') fetchReconciliationSessions();
    else if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const mockPayments = [
        {
          id: 'PAY001',
          claim_id: 'CLM001',
          patient_name: 'Ahmed Al-Rashid',
          payer: 'Saudi Health Insurance',
          amount_billed: 1500.00,
          amount_paid: 1350.00,
          payment_date: '2024-01-15',
          status: 'posted',
          denial_reason: null,
          adjustment_amount: 150.00
        },
        {
          id: 'PAY002',
          claim_id: 'CLM002',
          patient_name: 'Fatima Al-Zahra',
          payer: 'UAE National Insurance',
          amount_billed: 800.00,
          amount_paid: 0.00,
          payment_date: null,
          status: 'denied',
          denial_reason: 'Prior authorization required',
          adjustment_amount: 800.00
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliationSessions = async () => {
    setLoading(true);
    try {
      const mockSessions = [
        {
          id: 'REC001',
          session_date: '2024-01-15',
          total_payments: 15,
          matched_payments: 12,
          unmatched_payments: 3,
          total_amount: 25000.00,
          matched_amount: 22500.00,
          discrepancies: 2500.00,
          status: 'completed',
          ai_confidence: 0.94
        }
      ];
      setReconciliationSessions(mockSessions);
    } catch (error) {
      setError('Failed to load reconciliation sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const mockAnalytics = {
        payment_metrics: {
          total_payments_this_month: 156,
          total_amount_collected: 245000.00,
          collection_rate: 87.3
        },
        reconciliation_metrics: {
          auto_match_rate: 92.1,
          manual_review_required: 7.9
        },
        denial_metrics: {
          denial_rate: 12.4,
          denial_prediction_accuracy: 89.2
        },
        ai_insights: [
          'Denial rate decreased by 15% this month',
          'Auto-reconciliation accuracy improved to 92.1%',
          'Top payer shows 95% collection rate'
        ]
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const postPayment = async () => {
    setLoading(true);
    try {
      const newPayment = {
        id: `PAY${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ...paymentData,
        amount_billed: parseFloat(paymentData.amount_billed),
        amount_paid: parseFloat(paymentData.amount_paid),
        adjustment_amount: parseFloat(paymentData.adjustment_amount || 0),
        status: 'posted'
      };
      setPayments(prev => [newPayment, ...prev]);
      setPaymentData({
        claim_id: '', patient_name: '', payer: '', amount_billed: '',
        amount_paid: '', payment_date: '', denial_reason: '',
        adjustment_codes: [], adjustment_amount: ''
      });
    } catch (error) {
      setError('Failed to post payment');
    } finally {
      setLoading(false);
    }
  };

  const runAutoReconciliation = async () => {
    setLoading(true);
    try {
      const mockResult = {
        session_id: `REC${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        total_payments: 25,
        matched_payments: 21,
        unmatched_payments: 4,
        match_rate: 84.0,
        ai_confidence: 0.91,
        discrepancies: [
          {
            payment_id: 'PAY123',
            issue: 'Amount mismatch',
            expected: 1500.00,
            actual: 1350.00,
            difference: 150.00
          }
        ],
        recommendations: [
          'Review adjustment codes for payment PAY123',
          'Follow up on missing payment for claim CLM456'
        ]
      };
      setReconciliationResult(mockResult);
    } catch (error) {
      setError('Auto reconciliation failed');
    } finally {
      setLoading(false);
    }
  };

  const predictDenials = async () => {
    setLoading(true);
    try {
      const mockPredictions = [
        {
          claim_id: 'CLM001',
          patient_name: 'Ahmed Al-Rashid',
          denial_probability: 0.15,
          risk_level: 'low',
          recommendations: ['Submit as scheduled']
        },
        {
          claim_id: 'CLM002',
          patient_name: 'Fatima Al-Zahra',
          denial_probability: 0.78,
          risk_level: 'high',
          recommendations: ['Obtain prior authorization', 'Complete documentation']
        }
      ];
      setDenialPredictions(mockPredictions);
    } catch (error) {
      setError('Denial prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const generateAgingReport = async () => {
    setLoading(true);
    try {
      const mockReport = {
        aging_buckets: {
          '0-30_days': { count: 45, amount: 125000.00 },
          '31-60_days': { count: 28, amount: 78000.00 },
          '61-90_days': { count: 15, amount: 42000.00 },
          '91-120_days': { count: 8, amount: 18000.00 },
          '120+_days': { count: 12, amount: 25000.00 }
        },
        total_ar: 288000.00,
        average_days: 42.3
      };
      setAgingReport(mockReport);
    } catch (error) {
      setError('Failed to generate aging report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'posted':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted':
        return 'text-green-700 bg-green-50';
      case 'denied':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-yellow-700 bg-yellow-50';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low':
        return 'text-green-700 bg-green-50';
      case 'high':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-yellow-700 bg-yellow-50';
    }
  };

  const tabs = [
    { id: 'payments', name: 'Payment Posting', icon: CurrencyDollarIcon },
    { id: 'reconciliation', name: 'Reconciliation', icon: DocumentTextIcon },
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

      {/* Payment Posting Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Post New Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="text" value={paymentData.claim_id} onChange={(e) => setPaymentData({...paymentData, claim_id: e.target.value})} className="border-gray-300 rounded-md" placeholder="Claim ID" />
                <input type="text" value={paymentData.patient_name} onChange={(e) => setPaymentData({...paymentData, patient_name: e.target.value})} className="border-gray-300 rounded-md" placeholder="Patient Name" />
                <input type="text" value={paymentData.payer} onChange={(e) => setPaymentData({...paymentData, payer: e.target.value})} className="border-gray-300 rounded-md" placeholder="Payer" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input type="number" value={paymentData.amount_billed} onChange={(e) => setPaymentData({...paymentData, amount_billed: e.target.value})} className="border-gray-300 rounded-md" placeholder="Amount Billed" />
                <input type="number" value={paymentData.amount_paid} onChange={(e) => setPaymentData({...paymentData, amount_paid: e.target.value})} className="border-gray-300 rounded-md" placeholder="Amount Paid" />
                <input type="date" value={paymentData.payment_date} onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})} className="border-gray-300 rounded-md" />
                <input type="number" value={paymentData.adjustment_amount} onChange={(e) => setPaymentData({...paymentData, adjustment_amount: e.target.value})} className="border-gray-300 rounded-md" placeholder="Adjustment" />
              </div>
              <div className="mb-4">
                <input type="text" value={paymentData.denial_reason} onChange={(e) => setPaymentData({...paymentData, denial_reason: e.target.value})} className="w-full border-gray-300 rounded-md" placeholder="Denial Reason (if applicable)" />
              </div>
              <div className="flex space-x-3">
                <button onClick={postPayment} disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                  <PlusIcon className="w-4 h-4 inline mr-2" />{loading ? 'Posting...' : 'Post Payment'}
                </button>
                <button onClick={predictDenials} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <SparklesIcon className="w-4 h-4 inline mr-2" />Predict Denials
                </button>
              </div>
            </div>
          </div>

          {/* Payments List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payments</h3>
              {loading ? (
                <div className="text-center py-8"><ClockIcon className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8"><CurrencyDollarIcon className="w-12 h-12 mx-auto text-gray-400" /><p className="mt-2 text-gray-500">No payments found</p></div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium">{payment.id}</h4>
                            <div className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)}<span className="ml-1">{payment.status}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">Patient: {payment.patient_name} | Payer: {payment.payer}</p>
                          <p className="text-sm text-gray-600">Billed: ${payment.amount_billed} | Paid: ${payment.amount_paid}</p>
                          {payment.denial_reason && <p className="text-sm text-red-600">Denial: {payment.denial_reason}</p>}
                        </div>
                        <button onClick={() => setViewingPayment(payment)} className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <EyeIcon className="w-4 h-4 inline mr-1" />View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Denial Predictions */}
          {denialPredictions.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Denial Predictions</h3>
                <div className="space-y-3">
                  {denialPredictions.map((prediction, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{prediction.claim_id}</span> - {prediction.patient_name}
                          <div className={`inline-flex ml-3 px-2 py-1 rounded-full text-xs ${getRiskColor(prediction.risk_level)}`}>
                            {prediction.risk_level} risk ({(prediction.denial_probability * 100).toFixed(0)}%)
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Recommendations: {prediction.recommendations.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reconciliation Tab */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          {/* Reconciliation Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Automated Reconciliation</h3>
              <div className="flex space-x-3 mb-4">
                <button onClick={runAutoReconciliation} disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                  <SparklesIcon className="w-4 h-4 inline mr-2" />Run Auto Reconciliation
                </button>
                <button onClick={generateAgingReport} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <DocumentTextIcon className="w-4 h-4 inline mr-2" />Generate Aging Report
                </button>
              </div>

              {/* Reconciliation Results */}
              {reconciliationResult && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Reconciliation Results - {reconciliationResult.session_id}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center"><p className="text-2xl font-bold text-blue-600">{reconciliationResult.total_payments}</p><p className="text-xs text-blue-700">Total Payments</p></div>
                    <div className="text-center"><p className="text-2xl font-bold text-green-600">{reconciliationResult.matched_payments}</p><p className="text-xs text-green-700">Matched</p></div>
                    <div className="text-center"><p className="text-2xl font-bold text-red-600">{reconciliationResult.unmatched_payments}</p><p className="text-xs text-red-700">Unmatched</p></div>
                    <div className="text-center"><p className="text-2xl font-bold text-purple-600">{reconciliationResult.match_rate.toFixed(1)}%</p><p className="text-xs text-purple-700">Match Rate</p></div>
                  </div>
                  {reconciliationResult.discrepancies?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-blue-800">Discrepancies:</p>
                      {reconciliationResult.discrepancies.map((disc, index) => (
                        <p key={index} className="text-sm text-blue-700">• {disc.payment_id}: {disc.issue} (${disc.difference})</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Aging Report */}
          {agingReport && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Accounts Receivable Aging</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(agingReport.aging_buckets).map(([bucket, data]) => (
                    <div key={bucket} className="text-center p-4 border rounded-lg">
                      <p className="text-lg font-bold">${data.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{bucket.replace('_', '-')}</p>
                      <p className="text-xs text-gray-500">{data.count} claims</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Total AR: <span className="font-bold">${agingReport.total_ar.toLocaleString()}</span> | Average Days: <span className="font-bold">{agingReport.average_days}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Sessions History */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reconciliation History</h3>
              {reconciliationSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{session.id} - {session.session_date}</h4>
                      <p className="text-sm text-gray-600">Matched: {session.matched_payments}/{session.total_payments} | Amount: ${session.matched_amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">AI Confidence: {(session.ai_confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    <div className="p-3 rounded-lg bg-green-500"><CurrencyDollarIcon className="w-6 h-6 text-white" /></div>
                    <div className="ml-4"><p className="text-sm text-gray-600">Total Collected</p><p className="text-2xl font-bold">${analytics.payment_metrics.total_amount_collected.toLocaleString()}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-500"><DocumentTextIcon className="w-6 h-6 text-white" /></div>
                    <div className="ml-4"><p className="text-sm text-gray-600">Auto Match Rate</p><p className="text-2xl font-bold">{analytics.reconciliation_metrics.auto_match_rate}%</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-red-500"><ExclamationTriangleIcon className="w-6 h-6 text-white" /></div>
                    <div className="ml-4"><p className="text-sm text-gray-600">Denial Rate</p><p className="text-2xl font-bold">{analytics.denial_metrics.denial_rate}%</p></div>
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

      {/* Payment View Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Payment Details - {viewingPayment.id}</h3>
              <button onClick={() => setViewingPayment(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-3">
              <p><strong>Claim ID:</strong> {viewingPayment.claim_id}</p>
              <p><strong>Patient:</strong> {viewingPayment.patient_name}</p>
              <p><strong>Payer:</strong> {viewingPayment.payer}</p>
              <p><strong>Amount Billed:</strong> ${viewingPayment.amount_billed}</p>
              <p><strong>Amount Paid:</strong> ${viewingPayment.amount_paid}</p>
              <p><strong>Status:</strong> {viewingPayment.status}</p>
              {viewingPayment.denial_reason && <p><strong>Denial Reason:</strong> {viewingPayment.denial_reason}</p>}
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

export default Remittance;
