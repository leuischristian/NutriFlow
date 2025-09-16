"use client"

import { useState, useEffect } from 'react'
import { Plus, Droplets, Flame, Target, TrendingUp, Calendar, Clock, Zap, Award, ChevronRight, Trash2, LogOut, Eye, EyeOff, User, Mail, Lock, Settings, History, Search, Scale, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  supabase, 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser,
  addFoodEntry,
  getFoodEntries,
  deleteFoodEntry,
  addWaterEntry,
  getWaterEntries,
  deleteWaterEntry,
  addWorkoutEntry,
  getWorkoutEntries,
  deleteWorkoutEntry,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  searchFoods,
  getDailyHistory,
  calculateDailyStats,
  type User,
  type FoodEntry,
  type WaterEntry,
  type WorkoutEntry,
  type UserProfile,
  type FoodDatabase,
  type DailyHistory
} from '@/lib/supabase'

// Componente de Login/Cadastro
function AuthScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!formData.email) {
      newErrors.push('Email é obrigatório')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Email inválido')
    }
    
    if (!formData.password) {
      newErrors.push('Senha é obrigatória')
    } else if (formData.password.length < 6) {
      newErrors.push('Senha deve ter pelo menos 6 caracteres')
    }
    
    if (!isLogin) {
      if (!formData.name) {
        newErrors.push('Nome é obrigatório')
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.push('Senhas não coincidem')
      }
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors([])

    try {
      if (isLogin) {
        // Login
        const { data, error } = await signIn(formData.email, formData.password)
        if (error) {
          setErrors([error.message])
        } else if (data.user) {
          const user: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email || '',
            email: data.user.email || '',
            created_at: data.user.created_at || ''
          }
          onLogin(user)
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo de volta, ${user.name}!`
          })
        }
      } else {
        // Cadastro
        const { data, error } = await signUp(formData.email, formData.password, formData.name)
        if (error) {
          setErrors([error.message])
        } else if (data.user) {
          toast({
            title: "Conta criada com sucesso!",
            description: "Verifique seu email para confirmar a conta."
          })
          setIsLogin(true)
          setFormData({ name: '', email: '', password: '', confirmPassword: '' })
        }
      }
    } catch (error) {
      setErrors(['Erro inesperado. Tente novamente.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            NutriFlow
          </h1>
          <p className="text-gray-400 mt-2">Seu tracker nutricional do futuro</p>
        </div>

        {/* Card de Login/Cadastro */}
        <Card className="bg-black/40 backdrop-blur-xl border-gray-700/50">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">
              {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-gray-300">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800/50 border-gray-600 text-white pl-10"
                      placeholder="Seu nome completo"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-800/50 border-gray-600 text-white pl-10"
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-gray-800/50 border-gray-600 text-white pl-10 pr-10"
                    placeholder="Sua senha"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="bg-gray-800/50 border-gray-600 text-white pl-10"
                      placeholder="Confirme sua senha"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-400 text-sm">{error}</p>
                  ))}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                disabled={loading}
              >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar conta')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrors([])
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' })
                }}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
                disabled={loading}
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de Perfil do Usuário
function ProfileTab({ user, profile, onProfileUpdate }: { 
  user: User; 
  profile: UserProfile | null; 
  onProfileUpdate: (profile: UserProfile) => void 
}) {
  const [formData, setFormData] = useState({
    height: profile?.height?.toString() || '',
    weight: profile?.weight?.toString() || '',
    age: profile?.age?.toString() || '',
    gender: profile?.gender || '',
    activity_level: profile?.activity_level || '',
    calorie_goal: profile?.calorie_goal?.toString() || '2000'
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Calcular meta de hidratação automaticamente baseada no peso
  const calculateWaterGoal = () => {
    const weight = parseFloat(formData.weight)
    if (weight && weight > 0) {
      return Math.round(weight * 35) // peso em kg × 35ml
    }
    return 2500 // valor padrão
  }

  const calculateBMI = () => {
    const height = parseFloat(formData.height)
    const weight = parseFloat(formData.weight)
    if (height && weight) {
      return (weight / Math.pow(height / 100, 2)).toFixed(1)
    }
    return null
  }

  const calculateIdealWeight = () => {
    const height = parseFloat(formData.height)
    if (height && formData.gender) {
      // Fórmula de Devine
      const heightInches = height / 2.54
      if (formData.gender === 'male') {
        return (50 + 2.3 * (heightInches - 60)).toFixed(1)
      } else if (formData.gender === 'female') {
        return (45.5 + 2.3 * (heightInches - 60)).toFixed(1)
      } else {
        return (47.75 + 2.3 * (heightInches - 60)).toFixed(1)
      }
    }
    return null
  }

  const getWeightProgress = () => {
    const currentWeight = parseFloat(formData.weight)
    const idealWeight = parseFloat(calculateIdealWeight() || '0')
    if (currentWeight && idealWeight) {
      const difference = Math.abs(currentWeight - idealWeight)
      const maxDifference = 30 // Assumindo uma diferença máxima de 30kg para o cálculo
      return Math.max(0, Math.min(100, ((maxDifference - difference) / maxDifference) * 100))
    }
    return 0
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-400' }
    if (bmi < 25) return { category: 'Peso normal', color: 'text-green-400' }
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-yellow-400' }
    return { category: 'Obesidade', color: 'text-red-400' }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const waterGoal = calculateWaterGoal()
      
      const profileData = {
        user_id: user.id,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other' | undefined,
        activity_level: formData.activity_level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | undefined,
        calorie_goal: parseInt(formData.calorie_goal),
        water_goal: waterGoal
      }

      let result
      if (profile) {
        result = await updateUserProfile(user.id, profileData)
      } else {
        result = await createUserProfile(profileData)
      }

      if (result.error) throw result.error

      if (result.data) {
        onProfileUpdate(result.data)
        toast({
          title: "Perfil atualizado!",
          description: `Suas informações foram salvas. Meta de hidratação: ${waterGoal}ml/dia`
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar perfil",
        description: error.message || "Não foi possível salvar as informações.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const bmi = calculateBMI()
  const idealWeight = calculateIdealWeight()
  const weightProgress = getWeightProgress()
  const waterGoal = calculateWaterGoal()

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Altura (cm)</Label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Ex: 175"
              />
            </div>
            <div>
              <Label className="text-gray-300">Peso atual (kg)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Ex: 70"
              />
              {formData.weight && (
                <p className="text-xs text-cyan-400 mt-1">
                  Meta de hidratação: {waterGoal}ml/dia (baseada no seu peso)
                </p>
              )}
            </div>
            <div>
              <Label className="text-gray-300">Idade</Label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Ex: 25"
              />
            </div>
            <div>
              <Label className="text-gray-300">Gênero</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Nível de Atividade</Label>
            <Select value={formData.activity_level} onValueChange={(value) => setFormData({ ...formData, activity_level: value })}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Selecione seu nível de atividade" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="sedentary">Sedentário (pouco ou nenhum exercício)</SelectItem>
                <SelectItem value="light">Leve (exercício leve 1-3 dias/semana)</SelectItem>
                <SelectItem value="moderate">Moderado (exercício moderado 3-5 dias/semana)</SelectItem>
                <SelectItem value="active">Ativo (exercício pesado 6-7 dias/semana)</SelectItem>
                <SelectItem value="very_active">Muito ativo (exercício muito pesado, trabalho físico)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metas */}
      <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Metas Diárias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Meta de Calorias (kcal)</Label>
              <Input
                type="number"
                value={formData.calorie_goal}
                onChange={(e) => setFormData({ ...formData, calorie_goal: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Ex: 2000"
              />
            </div>
            <div>
              <Label className="text-gray-300">Meta de Hidratação (ml)</Label>
              <div className="bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-white">
                {waterGoal}ml (calculado automaticamente)
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Baseado na fórmula: peso × 35ml
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {bmi && (
        <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IMC */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">IMC Atual</span>
                  <span className="text-2xl font-bold text-white">{bmi}</span>
                </div>
                <div className={`text-sm ${getBMICategory(parseFloat(bmi)).color}`}>
                  {getBMICategory(parseFloat(bmi)).category}
                </div>
              </div>

              {/* Peso Ideal */}
              {idealWeight && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Peso Ideal</span>
                    <span className="text-2xl font-bold text-white">{idealWeight} kg</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Progresso para o peso ideal</span>
                      <span>{Math.round(weightProgress)}%</span>
                    </div>
                    <Progress value={weightProgress} className="h-2 bg-gray-800" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
      >
        {loading ? 'Salvando...' : 'Salvar Perfil'}
      </Button>
    </div>
  )
}

// Componente de Histórico Diário
function HistoryTab({ user }: { user: User }) {
  const [history, setHistory] = useState<DailyHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7') // últimos 7 dias
  const { toast } = useToast()

  const loadHistory = async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      const { data, error } = await getDailyHistory(user.id, startDate, endDate)
      if (error) throw error

      setHistory(data || [])
    } catch (error) {
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [user.id, selectedPeriod])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Histórico Diário</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48 bg-black/40 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="14">Últimas 2 semanas</SelectItem>
            <SelectItem value="30">Último mês</SelectItem>
            <SelectItem value="90">Últimos 3 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista do Histórico */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30">
            <CardContent className="py-12 text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum registro encontrado para este período.</p>
            </CardContent>
          </Card>
        ) : (
          history.map((day) => {
            const calorieProgress = Math.min((day.total_calories / day.calorie_goal) * 100, 100)
            const waterProgress = Math.min((day.total_water / day.water_goal) * 100, 100)
            const netCalories = day.total_calories - day.total_workout_calories

            return (
              <Card key={day.id} className="bg-black/40 backdrop-blur-xl border-gray-700/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      {new Date(day.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-cyan-400/30 text-cyan-300">
                        {Math.round(calorieProgress)}% calorias
                      </Badge>
                      <Badge variant="outline" className="border-blue-400/30 text-blue-300">
                        {Math.round(waterProgress)}% água
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Calorias */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Calorias</span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-lg font-bold text-white">{netCalories}</span>
                        <span className="text-sm text-gray-400">/ {day.calorie_goal}</span>
                      </div>
                      <Progress value={calorieProgress} className="h-1 bg-gray-800" />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>+{day.total_calories}</span>
                        <span>-{day.total_workout_calories}</span>
                      </div>
                    </div>

                    {/* Água */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Hidratação</span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-lg font-bold text-white">{day.total_water}</span>
                        <span className="text-sm text-gray-400">/ {day.water_goal} ml</span>
                      </div>
                      <Progress value={waterProgress} className="h-1 bg-gray-800" />
                    </div>

                    {/* Exercícios */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Exercícios</span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-lg font-bold text-white">{day.total_workout_calories}</span>
                        <span className="text-sm text-gray-400">kcal queimadas</span>
                      </div>
                      {day.weight && (
                        <div className="text-xs text-gray-400">
                          Peso: {day.weight} kg
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// Componente principal do app
function NutriFlowApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([])
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [foodSearch, setFoodSearch] = useState('')
  const [searchResults, setSearchResults] = useState<FoodDatabase[]>([])

  const [newFood, setNewFood] = useState({ name: '', calories: '', meal: 'breakfast', quantity: '100' })
  const [newWater, setNewWater] = useState('250')
  const [newWorkout, setNewWorkout] = useState({ name: '', duration: '', calories: '' })

  const { toast } = useToast()

  const dateString = currentDate.toISOString().split('T')[0]

  const calorieGoal = profile?.calorie_goal || 2000
  const waterGoal = profile?.water_goal || 2500

  const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const totalWater = waterEntries.reduce((sum, entry) => sum + entry.amount, 0)
  const totalWorkoutCalories = workoutEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const netCalories = totalCalories - totalWorkoutCalories

  const calorieProgress = Math.min((netCalories / calorieGoal) * 100, 100)
  const waterProgress = Math.min((totalWater / waterGoal) * 100, 100)

  // Carregar perfil do usuário
  const loadUserProfile = async () => {
    try {
      const { data, error } = await getUserProfile(user.id)
      if (error && error.code !== 'PGRST116') { // Ignorar erro de "não encontrado"
        throw error
      }
      setProfile(data)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  // Carregar dados do dia atual
  const loadTodayData = async () => {
    setLoading(true)
    try {
      const [foodResult, waterResult, workoutResult] = await Promise.all([
        getFoodEntries(user.id, dateString),
        getWaterEntries(user.id, dateString),
        getWorkoutEntries(user.id, dateString)
      ])

      if (foodResult.data) setFoodEntries(foodResult.data)
      if (waterResult.data) setWaterEntries(waterResult.data)
      if (workoutResult.data) setWorkoutEntries(workoutResult.data)

      // Atualizar histórico diário
      await calculateDailyStats(user.id, dateString)
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dia.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserProfile()
    loadTodayData()
  }, [user.id, dateString])

  // Buscar alimentos na base de dados
  const handleFoodSearch = async (query: string) => {
    setFoodSearch(query)
    if (query.length > 2) {
      try {
        const { data, error } = await searchFoods(query)
        if (error) throw error
        setSearchResults(data || [])
      } catch (error) {
        console.error('Erro ao buscar alimentos:', error)
      }
    } else {
      setSearchResults([])
    }
  }

  const selectFood = (food: FoodDatabase) => {
    const quantity = parseFloat(newFood.quantity) || 100
    const calories = Math.round((food.calories_per_100g * quantity) / 100)
    
    setNewFood({
      ...newFood,
      name: food.name,
      calories: calories.toString()
    })
    setFoodSearch(food.name)
    setSearchResults([])
  }

  const addFood = async () => {
    if (newFood.name && newFood.calories) {
      try {
        const entry = {
          user_id: user.id,
          name: newFood.name,
          calories: parseInt(newFood.calories),
          meal: newFood.meal as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: dateString
        }

        const { data, error } = await addFoodEntry(entry)
        
        if (error) throw error

        if (data && data[0]) {
          setFoodEntries([...foodEntries, data[0]])
          setNewFood({ name: '', calories: '', meal: 'breakfast', quantity: '100' })
          setFoodSearch('')
          toast({
            title: "Alimento adicionado!",
            description: `${entry.name} foi registrado com sucesso.`
          })
        }
      } catch (error: any) {
        toast({
          title: "Erro ao adicionar alimento",
          description: error?.message || "Não foi possível registrar o alimento.",
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e as calorias do alimento.",
        variant: "destructive"
      })
    }
  }

  const deleteFood = async (id: string) => {
    try {
      const { error } = await deleteFoodEntry(id)
      if (error) throw error

      setFoodEntries(foodEntries.filter(entry => entry.id !== id))
      toast({
        title: "Alimento removido",
        description: "O registro foi excluído com sucesso."
      })
    } catch (error) {
      toast({
        title: "Erro ao remover alimento",
        description: "Não foi possível excluir o registro.",
        variant: "destructive"
      })
    }
  }

  const addWater = async () => {
    try {
      const entry = {
        user_id: user.id,
        amount: parseInt(newWater),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: dateString
      }

      const { data, error } = await addWaterEntry(entry)
      if (error) throw error

      if (data && data[0]) {
        setWaterEntries([...waterEntries, data[0]])
        toast({
          title: "Água registrada!",
          description: `${entry.amount}ml adicionados ao seu consumo diário.`
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao registrar água",
        description: "Não foi possível registrar o consumo de água.",
        variant: "destructive"
      })
    }
  }

  const deleteWater = async (id: string) => {
    try {
      const { error } = await deleteWaterEntry(id)
      if (error) throw error

      setWaterEntries(waterEntries.filter(entry => entry.id !== id))
      toast({
        title: "Registro removido",
        description: "O consumo de água foi excluído."
      })
    } catch (error) {
      toast({
        title: "Erro ao remover registro",
        description: "Não foi possível excluir o registro.",
        variant: "destructive"
      })
    }
  }

  const addWorkout = async () => {
    if (newWorkout.name && newWorkout.duration && newWorkout.calories) {
      try {
        const entry = {
          user_id: user.id,
          name: newWorkout.name,
          duration: parseInt(newWorkout.duration),
          calories: parseInt(newWorkout.calories),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: dateString
        }

        const { data, error } = await addWorkoutEntry(entry)
        if (error) throw error

        if (data && data[0]) {
          setWorkoutEntries([...workoutEntries, data[0]])
          setNewWorkout({ name: '', duration: '', calories: '' })
          toast({
            title: "Exercício registrado!",
            description: `${entry.name} foi adicionado com sucesso.`
          })
        }
      } catch (error) {
        toast({
          title: "Erro ao registrar exercício",
          description: "Não foi possível registrar o exercício.",
          variant: "destructive"
        })
      }
    }
  }

  const deleteWorkout = async (id: string) => {
    try {
      const { error } = await deleteWorkoutEntry(id)
      if (error) throw error

      setWorkoutEntries(workoutEntries.filter(entry => entry.id !== id))
      toast({
        title: "Exercício removido",
        description: "O registro foi excluído com sucesso."
      })
    } catch (error) {
      toast({
        title: "Erro ao remover exercício",
        description: "Não foi possível excluir o registro.",
        variant: "destructive"
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      onLogout()
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      })
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao desconectar.",
        variant: "destructive"
      })
    }
  }

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'breakfast': return '🌅'
      case 'lunch': return '☀️'
      case 'dinner': return '🌙'
      case 'snack': return '🍎'
      default: return '🍽️'
    }
  }

  const getMealName = (meal: string) => {
    switch (meal) {
      case 'breakfast': return 'Café da Manhã'
      case 'lunch': return 'Almoço'
      case 'dinner': return 'Jantar'
      case 'snack': return 'Lanche'
      default: return 'Refeição'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Futurista */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  NutriFlow
                </h1>
                <p className="text-gray-400 text-sm">Olá, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {currentDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Calorias */}
          <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Calorias
                </CardTitle>
                <Badge variant="outline" className="border-cyan-400/30 text-cyan-300">
                  {Math.round(calorieProgress)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">{netCalories}</span>
                  <span className="text-gray-400 mb-1">/ {calorieGoal}</span>
                </div>
                <Progress value={calorieProgress} className="h-2 bg-gray-800" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Consumidas: {totalCalories}</span>
                  <span>Queimadas: {totalWorkoutCalories}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Água */}
          <Card className="bg-black/40 backdrop-blur-xl border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  Hidratação
                </CardTitle>
                <Badge variant="outline" className="border-blue-400/30 text-blue-300">
                  {Math.round(waterProgress)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">{totalWater}</span>
                  <span className="text-gray-400 mb-1">/ {waterGoal} ml</span>
                </div>
                <Progress value={waterProgress} className="h-2 bg-gray-800" />
                <p className="text-xs text-gray-400">
                  {waterEntries.length} copos registrados hoje
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Exercícios */}
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Exercícios
                </CardTitle>
                <Badge variant="outline" className="border-purple-400/30 text-purple-300">
                  {workoutEntries.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">{totalWorkoutCalories}</span>
                  <span className="text-gray-400 mb-1">kcal</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  {workoutEntries.reduce((sum, entry) => sum + entry.duration, 0)} min total
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs defaultValue="food" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/40 backdrop-blur-xl border border-gray-700/50">
            <TabsTrigger value="food" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Alimentação
            </TabsTrigger>
            <TabsTrigger value="water" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              Hidratação
            </TabsTrigger>
            <TabsTrigger value="workout" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Exercícios
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Histórico
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Tab Alimentação */}
          <TabsContent value="food" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Refeições de Hoje</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Alimento
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-gray-700/50 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-cyan-400">Adicionar Alimento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="food-search">Buscar Alimento</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="food-search"
                          value={foodSearch}
                          onChange={(e) => handleFoodSearch(e.target.value)}
                          className="bg-gray-800/50 border-gray-600 text-white pl-10"
                          placeholder="Digite o nome do alimento..."
                        />
                      </div>
                      {searchResults.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto bg-gray-800/50 border border-gray-600 rounded-lg">
                          {searchResults.map((food) => (
                            <button
                              key={food.id}
                              onClick={() => selectFood(food)}
                              className="w-full text-left p-3 hover:bg-gray-700/50 border-b border-gray-600 last:border-b-0"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-white">{food.name}</span>
                                <span className="text-sm text-gray-400">{food.calories_per_100g} kcal/100g</span>
                              </div>
                              {food.category && (
                                <span className="text-xs text-gray-500">{food.category}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="food-quantity">Quantidade (g)</Label>
                        <Input
                          id="food-quantity"
                          type="number"
                          value={newFood.quantity}
                          onChange={(e) => {
                            const quantity = e.target.value
                            setNewFood({ ...newFood, quantity })
                            
                            // Recalcular calorias se há um alimento selecionado
                            const selectedFood = searchResults.find(f => f.name === newFood.name)
                            if (selectedFood && quantity) {
                              const calories = Math.round((selectedFood.calories_per_100g * parseFloat(quantity)) / 100)
                              setNewFood(prev => ({ ...prev, quantity, calories: calories.toString() }))
                            }
                          }}
                          className="bg-gray-800/50 border-gray-600 text-white"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="food-calories">Calorias</Label>
                        <Input
                          id="food-calories"
                          type="number"
                          value={newFood.calories}
                          onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                          className="bg-gray-800/50 border-gray-600 text-white"
                          placeholder="Ex: 150"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="food-meal">Refeição</Label>
                      <Select value={newFood.meal} onValueChange={(value) => setNewFood({ ...newFood, meal: value })}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="breakfast">Café da Manhã</SelectItem>
                          <SelectItem value="lunch">Almoço</SelectItem>
                          <SelectItem value="dinner">Jantar</SelectItem>
                          <SelectItem value="snack">Lanche</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addFood} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => {
                const mealEntries = foodEntries.filter(entry => entry.meal === meal)
                const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0)
                
                return (
                  <Card key={meal} className="bg-black/40 backdrop-blur-xl border-gray-700/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getMealIcon(meal)}</span>
                          <div>
                            <h3 className="font-semibold text-white">{getMealName(meal)}</h3>
                            <p className="text-sm text-gray-400">{mealCalories} kcal</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    {mealEntries.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {mealEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg group">
                              <div>
                                <p className="font-medium text-white">{entry.name}</p>
                                <p className="text-sm text-gray-400">{entry.time}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-cyan-400/30 text-cyan-300">
                                  {entry.calories} kcal
                                </Badge>
                                <Button
                                  onClick={() => deleteFood(entry.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Tab Hidratação */}
          <TabsContent value="water" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Hidratação</h2>
              <div className="flex items-center gap-3">
                <Select value={newWater} onValueChange={setNewWater}>
                  <SelectTrigger className="w-32 bg-black/40 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="250">250ml</SelectItem>
                    <SelectItem value="500">500ml</SelectItem>
                    <SelectItem value="750">750ml</SelectItem>
                    <SelectItem value="1000">1L</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addWater} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>

            <Card className="bg-black/40 backdrop-blur-xl border-blue-500/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {waterEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 group">
                      <div className="flex items-center gap-3">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="font-medium text-white">{entry.amount}ml</p>
                          <p className="text-sm text-gray-400">{entry.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-blue-400/30 text-blue-300">
                          Registrado
                        </Badge>
                        <Button
                          onClick={() => deleteWater(entry.id)}
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Exercícios */}
          <TabsContent value="workout" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Exercícios</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Exercício
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-gray-700/50 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-purple-400">Adicionar Exercício</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="workout-name">Nome do Exercício</Label>
                      <Input
                        id="workout-name"
                        value={newWorkout.name}
                        onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="Ex: Corrida, Musculação..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="workout-duration">Duração (minutos)</Label>
                      <Input
                        id="workout-duration"
                        type="number"
                        value={newWorkout.duration}
                        onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="Ex: 30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workout-calories">Calorias Queimadas</Label>
                      <Input
                        id="workout-calories"
                        type="number"
                        value={newWorkout.calories}
                        onChange={(e) => setNewWorkout({ ...newWorkout, calories: e.target.value })}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="Ex: 300"
                      />
                    </div>
                    <Button onClick={addWorkout} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {workoutEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 group">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="font-medium text-white">{entry.name}</p>
                          <p className="text-sm text-gray-400">{entry.time} • {entry.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-purple-400/30 text-purple-300">
                          -{entry.calories} kcal
                        </Badge>
                        <Button
                          onClick={() => deleteWorkout(entry.id)}
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="history">
            <HistoryTab user={user} />
          </TabsContent>

          {/* Tab Perfil */}
          <TabsContent value="profile">
            <ProfileTab 
              user={user} 
              profile={profile} 
              onProfileUpdate={setProfile}
            />
          </TabsContent>
        </Tabs>

        {/* Seção de Conquistas */}
        <Card className="bg-black/40 backdrop-blur-xl border-yellow-500/20 mt-8">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Conquistas de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Flame className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Meta de Calorias</p>
                  <p className="text-sm text-gray-400">
                    {calorieProgress >= 100 ? 'Concluída!' : `${Math.round(calorieProgress)}% completa`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Hidratação</p>
                  <p className="text-sm text-gray-400">
                    {waterProgress >= 100 ? 'Concluída!' : `${Math.round(waterProgress)}% completa`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Consistência</p>
                  <p className="text-sm text-gray-400">Continue assim!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente principal com controle de autenticação
export default function NutriFlow() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          const userData: User = {
            id: currentUser.id,
            name: currentUser.user_metadata?.name || currentUser.email || '',
            email: currentUser.email || '',
            created_at: currentUser.created_at || ''
          }
          setUser(userData)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email || '',
            email: session.user.email || '',
            created_at: session.user.created_at || ''
          }
          setUser(userData)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />
  }

  return <NutriFlowApp user={user} onLogout={handleLogout} />
}