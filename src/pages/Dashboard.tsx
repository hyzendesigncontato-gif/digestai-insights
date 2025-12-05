import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { symptomTypeLabels } from '@/data/mockData';
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
  Plus,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/hooks/useDashboard';
import { useSymptoms } from '@/hooks/useSymptoms';
import { useFoods } from '@/hooks/useFoods';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboard();
  const { symptoms, isLoading: symptomsLoading } = useSymptoms();
  const { userFoodStatus, isLoading: foodsLoading } = useFoods();
  
  const isLoading = statsLoading || symptomsLoading || foodsLoading;
  
  // Valores padrão caso stats seja null
  const latestReport = stats?.latestReport || null;
  const avoidFoods = userFoodStatus?.filter(f => f.status === 'avoid') || [];
  const recentSymptoms = symptoms?.slice(0, 5) || [];
  const symptomCount = stats?.totalSymptoms || symptoms?.length || 0;
  
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando seus dados...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="animate-fade-in">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
              {getGreeting()}, {user?.fullName.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Como está seu intestino hoje?
            </p>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 animate-fade-in stagger-1">
            <Button variant="outline" asChild className="text-sm">
              <Link to="/symptoms">
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Registrar Sintoma</span>
              </Link>
            </Button>
            <Button variant="gradient" asChild className="text-sm">
              <Link to="/chat">
                <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Falar com DigestAI</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Last Report */}
          <Card className="card-metric group animate-fade-in stagger-1">
            <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                {latestReport && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(latestReport.createdAt || latestReport.created_at).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <h3 className="font-semibold text-base sm:text-lg mb-1">Último Relatório</h3>
              {latestReport ? (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                    {latestReport.summary?.slice(0, 60)}...
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-primary text-xs sm:text-sm" asChild>
                    <Link to="/reports">
                      Ver relatório
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    Nenhum relatório gerado ainda
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-primary text-xs sm:text-sm" asChild>
                    <Link to="/reports">
                      Gerar relatório
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Risk Level */}
          <Card className="card-metric group animate-fade-in stagger-2">
            <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                  <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                </div>
                <span className={cn("text-xl sm:text-2xl font-bold", latestReport ? getRiskColor(latestReport.riskScore || latestReport.risk_score || 0) : "text-muted-foreground")}>
                  {latestReport ? `${latestReport.riskScore || latestReport.risk_score || 0}%` : '--'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <h3 className="font-semibold text-base sm:text-lg mb-1">Nível de Risco</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                Risco digestivo <span className={cn("font-medium", latestReport ? getRiskColor(latestReport.riskScore || latestReport.risk_score || 0) : "")}>
                  {latestReport ? getRiskLabel(latestReport.riskScore || latestReport.risk_score || 0) : 'Sem dados'}
                </span>
              </p>
              <Progress value={latestReport ? (latestReport.riskScore || latestReport.risk_score || 0) : 0} className="h-2" />
            </CardContent>
          </Card>

          {/* Avoid Foods */}
          <Card className="card-metric group animate-fade-in stagger-3">
            <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-destructive">
                  {avoidFoods.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <h3 className="font-semibold text-base sm:text-lg mb-1">Alimentos a Evitar</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 truncate">
                {avoidFoods.slice(0, 2).map(f => f.food.name).join(', ')}
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-destructive text-xs sm:text-sm" asChild>
                <Link to="/foods?filter=avoid">
                  Ver lista
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Symptoms */}
          <Card className="card-metric group animate-fade-in stagger-4">
            <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-secondary">
                  {symptomCount}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <h3 className="font-semibold text-base sm:text-lg mb-1">Sintomas Recentes</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                Últimos 7 dias
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-secondary text-xs sm:text-sm" asChild>
                <Link to="/symptoms">
                  Registrar
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Intolerances Overview */}
          <Card className="lg:col-span-2 animate-fade-in">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    Análise de Intolerâncias
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Baseado nos seus dados dos últimos 30 dias
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
                  <Link to="/reports">Ver detalhes</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              {latestReport && latestReport.intolerances && latestReport.intolerances.length > 0 ? (
                latestReport.intolerances.map((intolerance, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm sm:text-base truncate">{intolerance.type}</span>
                      <span className={cn(
                        "text-xs sm:text-sm font-semibold whitespace-nowrap",
                        intolerance.probability >= 70 ? "text-destructive" :
                        intolerance.probability >= 40 ? "text-warning" : "text-success"
                      )}>
                        {intolerance.probability}%
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
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      {intolerance.correlatedFoods?.slice(0, 3).join(', ')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    Registre mais sintomas e alimentos para gerar análises de intolerâncias
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="animate-fade-in stagger-1">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="space-y-3">
                {recentSymptoms.slice(0, 4).map((symptom) => (
                  <div key={symptom.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      symptom.intensity >= 7 ? "bg-destructive" :
                      symptom.intensity >= 4 ? "bg-warning" : "bg-success"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {symptom.types.slice(0, 2).map(t => symptomTypeLabels[t]).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {symptom.intensity}/10 • {new Date(symptom.datetime).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-sm" asChild>
                <Link to="/symptoms">
                  Ver todos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestion Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20 animate-fade-in">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg">Dica do DigestAI</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  Evite laticínios após às 18h para melhorar a qualidade do sono.
                </p>
              </div>
            </div>
            <Button variant="gradient" asChild className="w-full sm:w-auto flex-shrink-0">
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
