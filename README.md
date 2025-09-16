# NutriFlow - Tracker Nutricional Futurista 🚀

Um aplicativo moderno de rastreamento nutricional com design futurista, construído com Next.js 15, React 19, TypeScript e Supabase.

## ✨ Funcionalidades

- **🔐 Autenticação Completa**: Sistema de login e cadastro seguro
- **🍽️ Rastreamento de Refeições**: Registre alimentos por refeição (café, almoço, jantar, lanche)
- **💧 Monitoramento de Hidratação**: Acompanhe seu consumo diário de água
- **🏃‍♂️ Registro de Exercícios**: Monitore atividades físicas e calorias queimadas
- **📊 Dashboard Intuitivo**: Visualize progresso com gráficos e estatísticas
- **🏆 Sistema de Conquistas**: Metas diárias e acompanhamento de progresso
- **💾 Persistência de Dados**: Todos os dados são salvos no banco e sincronizados

## 🎨 Design

- **Interface Futurista**: Gradientes neon, glassmorphism e animações suaves
- **Responsivo**: Funciona perfeitamente em mobile e desktop
- **Tema Escuro**: Design moderno com cores vibrantes (cyan, purple, pink)
- **UX Intuitiva**: Navegação simples e clara

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4 com sistema OKLCH
- **UI Components**: Shadcn/ui com Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Como Usar

### 1. Configurar Banco de Dados

Execute o SQL abaixo no seu painel do Supabase:

\`\`\`sql
-- Criar tabelas para o NutriFlow

-- Tabela de entradas de comida
CREATE TABLE IF NOT EXISTS food_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  meal TEXT NOT NULL CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snack')),
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entradas de água
CREATE TABLE IF NOT EXISTS water_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entradas de exercícios
CREATE TABLE IF NOT EXISTS workout_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  calories INTEGER NOT NULL,
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_entries ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para food_entries
CREATE POLICY "Users can view their own food entries" ON food_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food entries" ON food_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food entries" ON food_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food entries" ON food_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para water_entries
CREATE POLICY "Users can view their own water entries" ON water_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water entries" ON water_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water entries" ON water_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water entries" ON water_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para workout_entries
CREATE POLICY "Users can view their own workout entries" ON workout_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout entries" ON workout_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout entries" ON workout_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout entries" ON workout_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS food_entries_user_date_idx ON food_entries(user_id, date);
CREATE INDEX IF NOT EXISTS water_entries_user_date_idx ON water_entries(user_id, date);
CREATE INDEX IF NOT EXISTS workout_entries_user_date_idx ON workout_entries(user_id, date);
\`\`\`

### 2. Configurar Variáveis de Ambiente

Crie um arquivo \`.env.local\` na raiz do projeto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
\`\`\`

### 3. Instalar Dependências

\`\`\`bash
npm install
\`\`\`

### 4. Executar o Projeto

\`\`\`bash
npm run dev
\`\`\`

## 📱 Como Usar o App

1. **Cadastro/Login**: Crie uma conta ou faça login
2. **Dashboard**: Visualize seu progresso diário
3. **Adicionar Refeições**: Registre alimentos com calorias por refeição
4. **Hidratação**: Adicione consumo de água (250ml, 500ml, 750ml, 1L)
5. **Exercícios**: Registre atividades físicas com duração e calorias queimadas
6. **Acompanhar Progresso**: Veja estatísticas e conquistas diárias

## 🔒 Segurança

- **Row Level Security (RLS)**: Cada usuário só acessa seus próprios dados
- **Autenticação Supabase**: Sistema seguro de login/cadastro
- **Validação de Dados**: Validação tanto no frontend quanto no backend
- **Políticas de Acesso**: Controle granular de permissões no banco

## 🎯 Funcionalidades Futuras

- [ ] Gráficos de progresso semanal/mensal
- [ ] Banco de dados de alimentos com busca
- [ ] Metas personalizáveis
- [ ] Integração com dispositivos fitness
- [ ] Compartilhamento de conquistas
- [ ] Receitas e sugestões nutricionais

## 🤝 Contribuição

Este projeto foi criado como demonstração de um tracker nutricional moderno. Sinta-se à vontade para usar como base para seus próprios projetos!

---

**NutriFlow** - Seu tracker nutricional do futuro! 🚀✨