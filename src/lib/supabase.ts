import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface FoodEntry {
  id: string
  user_id: string
  name: string
  calories: number
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time: string
  date: string
  created_at: string
}

export interface WaterEntry {
  id: string
  user_id: string
  amount: number
  time: string
  date: string
  created_at: string
}

export interface WorkoutEntry {
  id: string
  user_id: string
  name: string
  duration: number
  calories: number
  time: string
  date: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  height?: number
  weight?: number
  target_weight?: number
  age?: number
  gender?: 'male' | 'female' | 'other'
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  calorie_goal: number
  water_goal: number
  created_at: string
  updated_at: string
}

export interface FoodDatabase {
  id: string
  name: string
  calories_per_100g: number
  protein_per_100g?: number
  carbs_per_100g?: number
  fat_per_100g?: number
  fiber_per_100g?: number
  category?: string
  created_at: string
}

export interface DailyHistory {
  id: string
  user_id: string
  date: string
  total_calories: number
  total_water: number
  total_workout_calories: number
  calorie_goal: number
  water_goal: number
  weight?: number
  created_at: string
  updated_at: string
}

// Funções de autenticação
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Funções para refeições
export const addFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('food_entries')
    .insert([entry])
    .select()
  return { data, error }
}

export const getFoodEntries = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  return { data, error }
}

export const deleteFoodEntry = async (id: string) => {
  const { error } = await supabase
    .from('food_entries')
    .delete()
    .eq('id', id)
  return { error }
}

// Funções para hidratação
export const addWaterEntry = async (entry: Omit<WaterEntry, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('water_entries')
    .insert([entry])
    .select()
  return { data, error }
}

export const getWaterEntries = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('water_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  return { data, error }
}

export const deleteWaterEntry = async (id: string) => {
  const { error } = await supabase
    .from('water_entries')
    .delete()
    .eq('id', id)
  return { error }
}

// Funções para exercícios
export const addWorkoutEntry = async (entry: Omit<WorkoutEntry, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('workout_entries')
    .insert([entry])
    .select()
  return { data, error }
}

export const getWorkoutEntries = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('workout_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  return { data, error }
}

export const deleteWorkoutEntry = async (id: string) => {
  const { error } = await supabase
    .from('workout_entries')
    .delete()
    .eq('id', id)
  return { error }
}

// Funções para perfil do usuário
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    // Primeiro, tentar inserir um novo perfil
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        ...profile,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      // Se der erro de duplicata, fazer update
      if (error.code === '23505') {
        return await updateUserProfile(profile.user_id, profile)
      }
      throw error
    }
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  // Se não encontrou registro para atualizar, criar um novo
  if (error && error.code === 'PGRST116') {
    return await supabase
      .from('user_profiles')
      .insert([{
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
  }
  
  return { data, error }
}

// Funções para base de dados de alimentos
export const searchFoods = async (query: string) => {
  const { data, error } = await supabase
    .from('foods_database')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(20)
  return { data, error }
}

export const getFoodById = async (id: string) => {
  const { data, error } = await supabase
    .from('foods_database')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const getAllFoods = async () => {
  const { data, error } = await supabase
    .from('foods_database')
    .select('*')
    .order('name')
  return { data, error }
}

// Funções para histórico diário
export const getDailyHistory = async (userId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('daily_history')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query
  return { data, error }
}

export const updateDailyHistory = async (userId: string, date: string, updates: Partial<DailyHistory>) => {
  const { data, error } = await supabase
    .from('daily_history')
    .upsert({
      user_id: userId,
      date: date,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  return { data, error }
}

// Função para calcular e atualizar histórico diário automaticamente
export const calculateDailyStats = async (userId: string, date: string) => {
  try {
    // Buscar dados do dia
    const [foodResult, waterResult, workoutResult, profileResult] = await Promise.all([
      getFoodEntries(userId, date),
      getWaterEntries(userId, date),
      getWorkoutEntries(userId, date),
      getUserProfile(userId)
    ])

    const totalCalories = foodResult.data?.reduce((sum, entry) => sum + entry.calories, 0) || 0
    const totalWater = waterResult.data?.reduce((sum, entry) => sum + entry.amount, 0) || 0
    const totalWorkoutCalories = workoutResult.data?.reduce((sum, entry) => sum + entry.calories, 0) || 0

    const calorieGoal = profileResult.data?.calorie_goal || 2000
    const waterGoal = profileResult.data?.water_goal || 2500

    // Atualizar histórico diário
    await updateDailyHistory(userId, date, {
      total_calories: totalCalories,
      total_water: totalWater,
      total_workout_calories: totalWorkoutCalories,
      calorie_goal: calorieGoal,
      water_goal: waterGoal
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao calcular estatísticas diárias:', error)
    return { success: false, error }
  }
}