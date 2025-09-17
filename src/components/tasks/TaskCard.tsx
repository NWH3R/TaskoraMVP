import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, MoreVertical } from 'lucide-react';
import { Task } from '../../types';
import { Card } from '../ui/Card';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const priorityColors = {
    'urgent-important': 'border-l-red-500 bg-red-50/50',
    'not-urgent-important': 'border-l-blue-500 bg-blue-50/50',
    'urgent-not-important': 'border-l-yellow-500 bg-yellow-50/50',
    'not-urgent-not-important': 'border-l-gray-500 bg-gray-50/50',
  };

  const statusColors = {
    'todo': 'text-gray-600',
    'in-progress': 'text-blue-600',
    'completed': 'text-green-600',
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    onStatusChange?.(task, newStatus);
    setShowMenu(false);
  };
  return (
    <Card className={`p-4 border-l-4 ${priorityColors[task.priority]} hover:shadow-lg transition-all duration-200 relative`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {task.due_date && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(task.due_date), 'MMM dd')}</span>
              </div>
            )}
            
            {task.assigned_to && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>Assigned</span>
              </div>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>{task.tags.length} tags</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStatusChange(task.status === 'completed' ? 'todo' : 'completed')}
            className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${statusColors[task.status]} bg-current bg-opacity-10 hover:bg-opacity-20`}
          >
            {task.status.replace('-', ' ')}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
            <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => onEdit?.(task)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleStatusChange('todo')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark as Todo
                </button>
                <button
                  onClick={() => handleStatusChange('in-progress')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark as In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark as Completed
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => onDelete?.(task)}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </Card>
  );
};