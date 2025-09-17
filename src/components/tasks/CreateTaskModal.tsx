import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Tag } from 'lucide-react';
import { Task } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  initialPriority?: Task['priority'];
  editTask?: Task | null;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialPriority = 'not-urgent-important',
  editTask = null,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    priority: editTask?.priority || initialPriority,
    due_date: editTask?.due_date || '',
    tags: editTask?.tags?.join(', ') || '',
  });

  // Update form when editTask changes
  React.useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description || '',
        priority: editTask.priority,
        due_date: editTask.due_date || '',
        tags: editTask.tags?.join(', ') || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: initialPriority,
        due_date: '',
        tags: '',
      });
    }
  }, [editTask, initialPriority]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Partial<Task> = {
      ...(editTask && { id: editTask.id }),
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      due_date: formData.due_date || undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
      status: editTask?.status || 'todo',
    };

    onSubmit(taskData);
    
    // Reset form only if not editing
    if (!editTask) {
      setFormData({
        title: '',
        description: '',
        priority: initialPriority,
        due_date: '',
        tags: '',
      });
    }
    
    onClose();
  };

  const priorityOptions = [
    { value: 'urgent-important', label: t('tasks.urgent_important') },
    { value: 'not-urgent-important', label: t('tasks.not_urgent_important') },
    { value: 'urgent-not-important', label: t('tasks.urgent_not_important') },
    { value: 'not-urgent-not-important', label: t('tasks.not_urgent_not_important') },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTask ? 'Edit Task' : t('tasks.create')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('tasks.description')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('tasks.priority')}
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <Input
            label={t('tasks.due_date')}
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-1">
          <Tag className="w-4 h-4 text-gray-400" />
          <Input
            label="Tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Enter tags separated by commas..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {editTask ? 'Update Task' : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};