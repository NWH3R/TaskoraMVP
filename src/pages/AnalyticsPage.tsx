import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Clock, Target, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    tasksByPriority: {
      'urgent-important': 0,
      'not-urgent-important': 0,
      'urgent-not-important': 0,
      'not-urgent-not-important': 0,
    },
    tasksByStatus: {
      'todo': 0,
      'in-progress': 0,
      'completed': 0,
    },
    weeklyProgress: [],
    productivityScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      // Get all user tasks
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate tasks by priority
      const tasksByPriority = {
        'urgent-important': tasks?.filter(t => t.priority === 'urgent-important').length || 0,
        'not-urgent-important': tasks?.filter(t => t.priority === 'not-urgent-important').length || 0,
        'urgent-not-important': tasks?.filter(t => t.priority === 'urgent-not-important').length || 0,
        'not-urgent-not-important': tasks?.filter(t => t.priority === 'not-urgent-not-important').length || 0,
      };

      // Calculate tasks by status
      const tasksByStatus = {
        'todo': tasks?.filter(t => t.status === 'todo').length || 0,
        'in-progress': tasks?.filter(t => t.status === 'in-progress').length || 0,
        'completed': completedTasks,
      };

      // Calculate productivity score (simplified)
      const urgentImportantCompleted = tasks?.filter(t => 
        t.priority === 'urgent-important' && t.status === 'completed'
      ).length || 0;
      const productivityScore = totalTasks > 0 ? 
        Math.round(((urgentImportantCompleted * 2 + completedTasks) / (totalTasks * 2)) * 100) : 0;

      setAnalytics({
        totalTasks,
        completedTasks,
        completionRate,
        averageCompletionTime: 0, // Would need more complex calculation
        tasksByPriority,
        tasksByStatus,
        weeklyProgress: [], // Would need historical data
        productivityScore,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    'urgent-important': { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent & Important' },
    'not-urgent-important': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Not Urgent & Important' },
    'urgent-not-important': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Urgent & Not Important' },
    'not-urgent-not-important': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Not Urgent & Not Important' },
  };

  const statusColors = {
    'todo': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'To Do' },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
    'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('analytics.title')}
          </h1>
          <p className="text-gray-600">
            Gain insights into your productivity patterns and optimize your workflow.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="p-6 text-center" hover>
              <div className="w-12 h-12 bg-blue-100 rounded-md mx-auto mb-3 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</p>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 text-center" hover>
              <div className="w-12 h-12 bg-green-100 rounded-md mx-auto mb-3 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 text-center" hover>
              <div className="w-12 h-12 bg-purple-100 rounded-md mx-auto mb-3 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.productivityScore}%</p>
              <p className="text-sm text-gray-600">Productivity Score</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 text-center" hover>
              <div className="w-12 h-12 bg-yellow-100 rounded-md mx-auto mb-3 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.completedTasks}</p>
              <p className="text-sm text-gray-600">Completed Tasks</p>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks by Priority */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6" hover>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
              <div className="space-y-3">
                {Object.entries(analytics.tasksByPriority).map(([priority, count]) => {
                  const config = priorityColors[priority as keyof typeof priorityColors];
                  const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0;
                  
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${config.bg}`}></div>
                        <span className="text-sm text-gray-700">{config.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${config.bg.replace('100', '500')}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Tasks by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6" hover>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
              <div className="space-y-3">
                {Object.entries(analytics.tasksByStatus).map(([status, count]) => {
                  const config = statusColors[status as keyof typeof statusColors];
                  const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${config.bg}`}></div>
                        <span className="text-sm text-gray-700">{config.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${config.bg.replace('100', '500')}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6" hover>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-md mx-auto mb-3 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Focus Area</h4>
                <p className="text-sm text-gray-600">
                  {analytics.tasksByPriority['urgent-important'] > 0 
                    ? 'You have urgent & important tasks to complete'
                    : 'Great! No urgent & important tasks pending'
                  }
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-md mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Progress</h4>
                <p className="text-sm text-gray-600">
                  {analytics.completionRate >= 70 
                    ? 'Excellent completion rate!'
                    : analytics.completionRate >= 50
                    ? 'Good progress, keep it up!'
                    : 'Focus on completing more tasks'
                  }
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-md mx-auto mb-3 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Recommendation</h4>
                <p className="text-sm text-gray-600">
                  {analytics.tasksByPriority['not-urgent-important'] > 0
                    ? 'Schedule time for important but not urgent tasks'
                    : 'Consider adding some strategic planning tasks'
                  }
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};