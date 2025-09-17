import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  requirements: any;
  earned?: boolean;
  earned_at?: string;
}

export const AchievementsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState({ points: 0, level: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
    loadUserStats();
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    
    try {
      // Get all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Get user's earned achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user.id);

      if (userError) throw userError;

      // Combine the data
      const achievementsWithStatus = allAchievements?.map(achievement => ({
        ...achievement,
        earned: userAchievements?.some(ua => ua.achievement_id === achievement.id) || false,
        earned_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.earned_at,
      })) || [];

      setAchievements(achievementsWithStatus);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('points, level')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserStats({ points: data.points || 0, level: data.level || 1 });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tasks':
        return 'bg-blue-100 text-blue-800';
      case 'collaboration':
        return 'bg-purple-100 text-purple-800';
      case 'productivity':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['all', 'tasks', 'collaboration', 'productivity', 'social'];
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

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
            {t('achievements.title')}
          </h1>
          <p className="text-gray-600">
            Track your progress and unlock achievements as you master productivity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center" hover>
            <div className="w-12 h-12 bg-yellow-100 rounded-md mx-auto mb-3 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{earnedCount}</p>
            <p className="text-sm text-gray-600">Achievements Earned</p>
          </Card>

          <Card className="p-6 text-center" hover>
            <div className="w-12 h-12 bg-blue-100 rounded-md mx-auto mb-3 flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
            <p className="text-sm text-gray-600">Total Points</p>
          </Card>

          <Card className="p-6 text-center" hover>
            <div className="w-12 h-12 bg-purple-100 rounded-md mx-auto mb-3 flex items-center justify-center">
              <div className="text-lg font-bold text-purple-600">{userStats.level}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900">Level {userStats.level}</p>
            <p className="text-sm text-gray-600">Current Level</p>
          </Card>

          <Card className="p-6 text-center" hover>
            <div className="w-12 h-12 bg-green-100 rounded-md mx-auto mb-3 flex items-center justify-center">
              <div className="text-sm font-bold text-green-600">
                {Math.round((earnedCount / achievements.length) * 100)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((earnedCount / achievements.length) * 100)}%
            </p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`p-6 h-full relative ${
                  achievement.earned 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                hover
              >
                {/* Achievement Status */}
                <div className="absolute top-4 right-4">
                  {achievement.earned ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Achievement Icon */}
                <div className="text-center mb-4">
                  <div className={`text-4xl mb-2 ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                    {achievement.category}
                  </div>
                </div>

                {/* Achievement Info */}
                <div className="text-center">
                  <h3 className={`font-semibold mb-2 ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm mb-3 ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className={`flex items-center space-x-1 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`}>
                      <Star className="w-4 h-4" />
                      <span>{achievement.points} points</span>
                    </div>
                  </div>

                  {achievement.earned && achievement.earned_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};