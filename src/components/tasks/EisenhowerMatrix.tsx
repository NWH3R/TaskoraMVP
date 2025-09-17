import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { Card } from '../ui/Card';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onCreateTask?: (priority: Task['priority']) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onStatusChange?: (task: Task, status: Task['status']) => void;
}

export const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({
  tasks,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const { t } = useTranslation();

  const quadrants = [
    {
      id: 'urgent-important',
      title: t('tasks.urgent_important'),
      color: 'border-red-200 bg-red-50/30',
      headerColor: 'bg-red-100 text-red-800',
    },
    {
      id: 'not-urgent-important',
      title: t('tasks.not_urgent_important'),
      color: 'border-blue-200 bg-blue-50/30',
      headerColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'urgent-not-important',
      title: t('tasks.urgent_not_important'),
      color: 'border-yellow-200 bg-yellow-50/30',
      headerColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'not-urgent-not-important',
      title: t('tasks.not_urgent_not_important'),
      color: 'border-gray-200 bg-gray-50/30',
      headerColor: 'bg-gray-100 text-gray-800',
    },
  ];

  const getTasksForQuadrant = (priority: Task['priority']) => {
    return tasks.filter(task => task.priority === priority);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {quadrants.map((quadrant) => {
        const quadrantTasks = getTasksForQuadrant(quadrant.id as Task['priority']);
        
        return (
          <motion.div
            key={quadrant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-2 rounded-md ${quadrant.color} min-h-[400px]`}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
            }}
          >
            <div className={`px-4 py-3 rounded-t-md ${quadrant.headerColor} font-semibold text-sm flex items-center justify-between`}>
              <span>{quadrant.title}</span>
              <button
                onClick={() => onCreateTask?.(quadrant.id as Task['priority'])}
                className="p-1 hover:bg-white/20 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {quadrantTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                />
              ))}
              
              {quadrantTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No tasks in this quadrant</p>
                  <button
                    onClick={() => onCreateTask?.(quadrant.id as Task['priority'])}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Create your first task
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};