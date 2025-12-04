import { AppLayout } from '@/components/layout/AppLayout';
import { mockReports } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Utensils,
  Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Reports() {
  const report = mockReports[0];

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-success';
    if (score <= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 30) return 'Baixo Risco';
    if (score <= 60) return 'Risco Moderado';
    return 'Alto Risco';
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (prob >= 40) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-success/10 text-success border-success/20';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Análises detalhadas da sua saúde digestiva
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Share2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
            <Button variant="gradient" size="sm" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Baixar</span> PDF
            </Button>
          </div>
        </div>

        {/* Report Header Card */}
        <Card className="animate-fade-in stagger-1">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Relatório Mensal</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(report.periodStart).toLocaleDateString('pt-BR')} - {new Date(report.periodEnd).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Gerado em {new Date(report.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/50">
                <span className="text-sm text-muted-foreground mb-1">Score de Risco</span>
                <span className={cn("text-4xl font-bold", getScoreColor(report.riskScore))}>
                  {report.riskScore}%
                </span>
                <Badge variant="outline" className={cn("mt-2", getScoreColor(report.riskScore))}>
                  {getScoreLabel(report.riskScore)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="animate-fade-in stagger-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {report.summary}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="font-semibold text-destructive">Principais Alertas</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Alta probabilidade de intolerância à lactose</li>
                  <li>• Sensibilidade ao glúten detectada</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-5 h-5 text-warning" />
                  <span className="font-semibold text-warning">Atenção</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 6 alimentos devem ser evitados</li>
                  <li>• Padrão de sintomas após almoço</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-semibold text-success">Pontos Positivos</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 12 alimentos seguros identificados</li>
                  <li>• Boa tolerância a proteínas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intolerances Analysis */}
        <Card className="animate-fade-in stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Análise de Intolerâncias
            </CardTitle>
            <CardDescription>
              Probabilidade baseada na correlação entre sintomas e alimentos consumidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {report.intolerances.map((intolerance, index) => (
              <div key={index} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Badge className={getProbabilityColor(intolerance.probability)}>
                      {intolerance.probability}%
                    </Badge>
                    <h3 className="text-lg font-semibold">Intolerância à {intolerance.type}</h3>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    intolerance.probability >= 70 ? "text-destructive" :
                    intolerance.probability >= 40 ? "text-warning" : "text-success"
                  )}>
                    {intolerance.probability >= 70 ? "Alta probabilidade" :
                     intolerance.probability >= 40 ? "Probabilidade moderada" : "Baixa probabilidade"}
                  </span>
                </div>
                
                <Progress 
                  value={intolerance.probability} 
                  className={cn(
                    "h-3 rounded-full",
                    intolerance.probability >= 70 ? "[&>div]:bg-destructive" :
                    intolerance.probability >= 40 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Sintomas Correlacionados</h4>
                    <div className="flex flex-wrap gap-2">
                      {intolerance.correlatedSymptoms.map((symptom, i) => (
                        <Badge key={i} variant="outline" className="bg-background">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Alimentos Identificados</h4>
                    <div className="flex flex-wrap gap-2">
                      {intolerance.correlatedFoods.map((food, i) => (
                        <Badge key={i} variant="outline" className="bg-background">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {index < report.intolerances.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="animate-fade-in stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Recomendações Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-semibold mb-2">1. Período de Eliminação</h4>
                <p className="text-sm text-muted-foreground">
                  Recomenda-se um período de 2-4 semanas eliminando completamente laticínios e alimentos com glúten para confirmar as intolerâncias identificadas.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-semibold mb-2">2. Diário Alimentar Detalhado</h4>
                <p className="text-sm text-muted-foreground">
                  Continue registrando todos os alimentos consumidos e sintomas para melhorar a precisão das análises futuras.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-semibold mb-2">3. Consulta Médica</h4>
                <p className="text-sm text-muted-foreground">
                  Considere agendar uma consulta com um gastroenterologista para confirmar os diagnósticos e receber orientação profissional.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-semibold mb-2">4. Substitutos Alimentares</h4>
                <p className="text-sm text-muted-foreground">
                  Explore alternativas como leite vegetal, pães sem glúten e alimentos com baixo teor de FODMAPs para manter uma dieta equilibrada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border text-center animate-fade-in stagger-5">
          <p className="text-sm text-muted-foreground">
            <strong>Aviso:</strong> Este relatório é informativo e não substitui uma consulta médica profissional. 
            Para diagnósticos definitivos e tratamentos, consulte um gastroenterologista.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
