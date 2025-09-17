import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Crown, Shield, User, Settings, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Tribe {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
  user_role?: string;
}

export const TribesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadTribes();
  }, [user]);

  const loadTribes = async () => {
    if (!user) return;
    
    try {
      // Get tribes where user is a member
      const { data: memberTribes, error: memberError } = await supabase
        .from('tribe_members')
        .select(`
          tribe_id,
          role,
          tribes (
            id,
            name,
            description,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Get member counts for each tribe
      const tribeIds = memberTribes?.map(mt => mt.tribe_id) || [];
      const { data: memberCounts, error: countError } = await supabase
        .from('tribe_members')
        .select('tribe_id')
        .in('tribe_id', tribeIds);

      if (countError) throw countError;

      // Process the data
      const tribesWithCounts = memberTribes?.map(mt => ({
        ...mt.tribes,
        user_role: mt.role,
        member_count: memberCounts?.filter(mc => mc.tribe_id === mt.tribe_id).length || 0,
      })) || [];

      setTribes(tribesWithCounts);
    } catch (error) {
      console.error('Error loading tribes:', error);
      toast.error('Failed to load tribes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Create the tribe
      const { data: tribe, error: tribeError } = await supabase
        .from('tribes')
        .insert([{
          name: formData.name,
          description: formData.description,
          owner_id: user.id,
        }])
        .select()
        .single();

      if (tribeError) throw tribeError;

      // Add the creator as owner member
      const { error: memberError } = await supabase
        .from('tribe_members')
        .insert([{
          tribe_id: tribe.id,
          user_id: user.id,
          role: 'owner',
        }]);

      if (memberError) throw memberError;

      toast.success('Tribe created successfully!');
      setFormData({ name: '', description: '' });
      setIsCreateModalOpen(false);
      loadTribes();
    } catch (error) {
      console.error('Error creating tribe:', error);
      toast.error('Failed to create tribe');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('tribes.title')}
            </h1>
            <p className="text-gray-600">
              Collaborate with your team members and manage shared tasks together.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              {t('tribes.join')}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('tribes.create')}
            </Button>
          </div>
        </div>

        {/* Tribes Grid */}
        {tribes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tribes yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first tribe to start collaborating with your team.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Tribe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tribes.map((tribe, index) => (
              <motion.div
                key={tribe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full" hover>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tribe.name}</h3>
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(tribe.user_role || 'member')}`}>
                          {getRoleIcon(tribe.user_role || 'member')}
                          <span className="capitalize">{tribe.user_role}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {tribe.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tribe.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{tribe.member_count} {t('tribes.members')}</span>
                    </div>
                    <span>
                      Created {new Date(tribe.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tribe Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('tribes.create')}
        size="md"
      >
        <form onSubmit={handleCreateTribe} className="space-y-4">
          <Input
            label="Tribe Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter tribe name..."
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your tribe's purpose..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};