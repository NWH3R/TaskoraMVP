import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Calendar, Users, Trophy, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Task } from '../types';
import { Layout } from '../components/layout/Layout';
import { EisenhowerMatrix } from '../components/tasks/EisenhowerMatrix';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('not-urgent-important');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load tasks from Supabase
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title!,
          description: taskData.description,
          priority: taskData.priority!,
          status: 'todo',
          due_date: taskData.due_date,
          user_id: user.id,
          tags: taskData.tags,
        }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (task: Task, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status } : t
      ));
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          due_date: updatedTask.due_date,
          tags: updatedTask.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedTask.id);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === updatedTask.id ? { ...t, ...updatedTask } : t
      ));
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmitTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await handleEditTask({ ...editingTask, ...taskData } as Task);
    } else {
      await handleCreateTask(taskData);
    }
  };

  const handleCreateTaskWithPriority = (priority: Task['priority']) => {
    setSelectedPriority(priority);
    setIsCreateModalOpen(true);
  };

  const stats = [
    {
      title: 'Total Tasks',
      value: tasks.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Completed',
      value: tasks.filter(t => t.status === 'completed').length,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'In Progress',
      value: tasks.filter(t => t.status === 'in-progress').length,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Team Tasks',
      value: tasks.filter(t => t.tribe_id).length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('tasks.title')}
            </h1>
            <p className="text-gray-600">
              Organize your tasks using the Eisenhower Matrix for maximum productivity.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('tasks.create')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6" hover>
                  <div className="flex items-center">
                    <div className={`p-3 rounded-md ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Eisenhower Matrix */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Task Matrix</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          
          <EisenhowerMatrix
            tasks={tasks.filter(task => 
              task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            onCreateTask={handleCreateTaskWithPriority}
            onEditTask={handleEditTaskModal}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleUpdateTaskStatus}
          />
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTask}
        initialPriority={selectedPriority}
        editTask={editingTask}
      />
    </Layout>
  );
};