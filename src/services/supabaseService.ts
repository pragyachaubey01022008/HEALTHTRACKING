import { supabase } from '../lib/supabase';
import { UserProfile, UserStats, AssignedUser } from '../types';

export const supabaseService = {
  // Profile Operations
  async saveProfile(profile: UserProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        name: profile.name,
        role: profile.role,
        pin: profile.pin,
        water_goal: profile.waterGoal,
        height: profile.height,
        weight: profile.weight,
        health_goals: profile.healthGoals,
        coach_id: profile.coachId,
        email: profile.email,
        avatar_url: profile.avatar
      });
    
    if (error) throw error;
    return data;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  },

  // Stats Operations
  async saveStats(userId: string, date: string, stats: UserStats, role: string = 'user') {
    const tableName = role === 'owner' ? 'owner_stats' : role === 'coach' ? 'coach_stats' : 'user_stats';
    const { data, error } = await supabase
      .from(tableName)
      .upsert({
        user_id: userId,
        date: date,
        calories: stats.calories,
        protein: stats.protein,
        carbs: stats.carbs,
        fats: stats.fats,
        fiber: stats.fiber,
        hydration: stats.hydration,
        energy_level: stats.energyLevel,
        target_energy_level: stats.targetEnergyLevel,
        weight: stats.weight,
        meals: stats.meals,
        check_ins: stats.checkIns,
        supplements: stats.supplements
      }, { onConflict: 'user_id,date' });
    
    if (error) throw error;
    return data;
  },

  async getStats(userId: string, date: string, role: string = 'user') {
    const tableName = role === 'owner' ? 'owner_stats' : role === 'coach' ? 'coach_stats' : 'user_stats';
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAllStats(userId: string, role: string = 'user') {
    const tableName = role === 'owner' ? 'owner_stats' : role === 'coach' ? 'coach_stats' : 'user_stats';
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  // Weight History
  async saveWeightLog(userId: string, weight: number, date: string) {
    const { data, error } = await supabase
      .from('weight_history')
      .insert({
        user_id: userId,
        weight: weight,
        date: date
      });
    
    if (error) throw error;
    return data;
  },

  async getWeightHistory(userId: string) {
    const { data, error } = await supabase
      .from('weight_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Coach/Owner Operations
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error("Supabase Error (getAllProfiles):", error);
      throw error;
    }
    return data;
  },

  async findProfile(name: string, pin: string, role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('name', name)
      .eq('pin', pin)
      .eq('role', role)
      .maybeSingle();
    
    if (error) {
      console.error("Supabase Error (findProfile):", error);
      throw error;
    }
    return data;
  },

  async updateFeedback(userId: string, coachId: string, content: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ feedback: content })
      .eq('id', userId);
    
    if (error) {
      console.error("Supabase Error (updateFeedback):", error);
      throw error;
    }
    return data;
  },

  // Diagnostic
  async testConnection() {
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true, message: "Connected to Supabase successfully." };
    } catch (error) {
      console.error("Supabase Connection Test Failed:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Could not connect to Supabase. Check your RLS policies and API keys." 
      };
    }
  }
};
