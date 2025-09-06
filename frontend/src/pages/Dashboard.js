import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../services/api';
import {
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, activityResponse, insightsResponse] = await Promise.all([
          apiEndpoints.getDashboardStats(),
          apiEndpoints.getRecentActivity(),
          apiEndpoints.getAiInsights()
        ]);
        
        setStats(statsResponse.data);
        setRecentActivity(activityResponse.data.activities || []);
        setAiInsights(insightsResponse.data.insights || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set mock data for demo
        setStats({
          overview: {
            total_patients: 50,
            total_claims: 40,
            total_prior_auths: 18,
            total_eligibility_checks: 161,
            total_claim_amount: 116963.14,
            approved_amount: 45000.00
          },
          claims: {
            total: 40,
            pending: 0,
            approved: 9,
            denied: 11,
            submitted: 20,
            approval_rate: 22.5,
            total_amount: 116963.14
          },
          prior_authorizations: {
            total: 18,
            pending: 4,
            approved: 2,
            denied: 8,
            expired: 4,
            approval_rate: 11.1
          },
          eligibility: {
            total: 161,
            eligible: 91,
            not_eligible: 33,
            pending: 37,
            success_rate: 56.5
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = stats ? [
    {
      title: 'Total Patients',
      value: stats.overview.total_patients.toLocaleString(),
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Claims',
      value: stats.claims.total.toString(),
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
    },
    {
      title: 'Pending Prior Auths',
      value: stats.prior_authorizations.pending.toString(),
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Claims Approval Rate',
      value: `${stats.claims.approval_rate}%`,
      icon: CheckCircleIcon,
      color: stats.claims.approval_rate > 70 ? 'bg-green-500' : 'bg-red-500',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.overview.total_claim_amount.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Eligibility Success Rate',
      value: `${stats.eligibility.success_rate}%`,
      icon: ExclamationTriangleIcon,
      color: stats.eligibility.success_rate > 60 ? 'bg-green-500' : 'bg-orange-500',
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('welcome')}
        </h1>
        <p className="text-gray-600">
          AI-powered Revenue Cycle Management for GCC Healthcare
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      activity.type === 'claim' ? 'bg-blue-500' :
                      activity.type === 'eligibility' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`}></span>
                    <span className="text-sm text-gray-600">{activity.description}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No recent activity</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            AI Insights
          </h3>
          <div className="space-y-3">
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-50' :
                  insight.type === 'warning' ? 'bg-yellow-50' :
                  insight.type === 'info' ? 'bg-blue-50' :
                  'bg-gray-50'
                }`}>
                  <h4 className={`text-sm font-medium mb-1 ${
                    insight.type === 'success' ? 'text-green-800' :
                    insight.type === 'warning' ? 'text-yellow-800' :
                    insight.type === 'info' ? 'text-blue-800' :
                    'text-gray-800'
                  }`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm ${
                    insight.type === 'success' ? 'text-green-700' :
                    insight.type === 'warning' ? 'text-yellow-700' :
                    insight.type === 'info' ? 'text-blue-700' :
                    'text-gray-700'
                  }`}>
                    {insight.message}
                  </p>
                  {insight.action && (
                    <p className={`text-xs mt-1 font-medium ${
                      insight.type === 'success' ? 'text-green-600' :
                      insight.type === 'warning' ? 'text-yellow-600' :
                      insight.type === 'info' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      Action: {insight.action}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  AI insights will appear here based on your data patterns.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
