import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockSymptoms, mockUserFoodStatus, mockReports, symptomTypeLabels } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  ShieldAlert, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  
  const latestReport = mockReports[0];
  const avoidFoods = mockUserFoodStatus.filter(f => f.status === 'avoid');
  const recentSymptoms = mockSymptoms.slice(0, 5);
  const symptomCount = mockSymptoms.length;
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-success';
    if (score <= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Baixo';
    if (score <= 60) return 'Moderado';
    return 'Alto';
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {getGreeting()}, {user?.fullName.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Como está seu intestino hoje?
            </p>
          </div>
          
          <div className="flex gap-3 animate-fade-in stagger-1">
            <Button variant="outline" asChild>
              <Link to="/symptoms">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Sintoma
              </Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/chat">
                <Sparkles className="w-4 h-4 mr-2" />
                Falar com DigestAI
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Last Report */}
          <Card className="card-metric group animate-fade-in stagger-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(latestReport.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-1">Último Relatório</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {latestReport.summary.slice(0, 80)}...
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-primary" asChild>
                <Link to="/reports">
                  Ver relatório completo
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Risk Level */}
          <Card className="card-metric group animate-fade-in stagger-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                  <ShieldAlert className="w-6 h-6 text-warning" />
                </div>
                <span className={cn("text-2xl font-bold", getRiskColor(latestReport.riskScore))}>
                  {latestReport.riskScore}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-1">Nível de Risco</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Risco digestivo <span className={cn("font-medium", getRiskColor(latestReport.riskScore))}>
                  {getRiskLabel(latestReport.riskScore)}
                </span>
              </p>
              <Progress value={latestReport.riskScore} className="h-2" />
            </CardContent>
          </Card>

          {/* Avoid Foods */}
          <Card className="card-metric group animate-fade-in stagger-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <span className="text-2xl font-bold text-destructive">
                  {avoidFoods.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-1">Alimentos a Evitar</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {avoidFoods.slice(0, 3).map(f => f.food.name).join(', ')}
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-destructive" asChild>
                <Link to="/foods?filter=avoid">
                  Ver lista completa
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Symptoms */}
          <Card className="card-metric group animate-fade-in stagger-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Activity className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-2xl font-bold text-secondary">
                  {symptomCount}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-1">Sintomas Recentes</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Últimos 7 dias
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-secondary" asChild>
                <Link to="/symptoms">
                  Registrar sintoma
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intolerances Overview */}
          <Card className="lg:col-span-2 animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Análise de Intolerâncias
                  </CardTitle>
                  <CardDescription>
                    Baseado nos seus dados dos últimos 30 dias
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/reports">Ver detalhes</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestReport.intolerances.map((intolerance, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{intolerance.type}</span>
                    <span className={cn(
                      "text-sm font-semibold",
                      intolerance.probability >= 70 ? "text-destructive" :
                      intolerance.probability >= 40 ? "text-warning" : "text-success"
                    )}>
                      {intolerance.probability}% probabilidade
                    </span>
                  </div>
                  <Progress 
                    value={intolerance.probability} 
                    className={cn(
                      "h-2",
                      intolerance.probability >= 70 ? "[&>div]:bg-destructive" :
                      intolerance.probability >= 40 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    Alimentos: {intolerance.correlatedFoods.join(', ')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="animate-fade-in stagger-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Atividade Recente
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSymptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      symptom.intensity >= 7 ? "bg-destructive" :
                      symptom.intensity >= 4 ? "bg-warning" : "bg-success"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {symptom.types.map(t => symptomTypeLabels[t]).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Intensidade: {symptom.intensity}/10
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(symptom.datetime).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/symptoms">
                  Ver todos os sintomas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestion Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20 animate-fade-in">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Dica do DigestAI</h3>
                <p className="text-muted-foreground">
                  Baseado nos seus padrões, evite laticínios após às 18h para melhorar a qualidade do sono.
                </p>
              </div>
            </div>
            <Button variant="gradient" asChild>
              <Link to="/chat">
                Saber mais
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
