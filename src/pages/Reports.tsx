import { AppLayout } from '@/components/layout/AppLayout';
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
  Pill,
  Loader2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReports } from '@/hooks/useReports';
import { useToast } from '@/hooks/use-toast';

export default function Reports() {
  const { reports, isLoading, generateReport } = useReports();
  const { toast } = useToast();
  const report = reports[0];

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

  const handleGenerateReport = async () => {
    toast({
      title: 'Gerando relatório...',
      description: 'Isso pode levar alguns segundos.',
    });

    const { error } = await generateReport(30);

    if (error) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Relatório gerado! ✅',
        description: 'Seu novo relatório está disponível.',
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;

    // Cria o conteúdo HTML do relatório
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório DigestAI</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #6366f1; border-bottom: 3px solid #6366f1; padding-bottom: 10px; }
          h2 { color: #4f46e5; margin-top: 30px; }
          .header { text-align: center; margin-bottom: 40px; }
          .score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
          .score.low { color: #10b981; }
          .score.medium { color: #f59e0b; }
          .score.high { color: #ef4444; }
          .section { margin: 30px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .intolerance { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin: 4px; }
          .badge-high { background: #fee2e2; color: #991b1b; }
          .badge-medium { background: #fef3c7; color: #92400e; }
          .badge-low { background: #d1fae5; color: #065f46; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🩺 DigestAI - Relatório de Análise</h1>
          <p>Período: ${new Date(report.periodStart).toLocaleDateString('pt-BR')} - ${new Date(report.periodEnd).toLocaleDateString('pt-BR')}</p>
          <p>Gerado em: ${new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div class="section">
          <h2>Score de Risco</h2>
          <div class="score ${report.riskScore <= 30 ? 'low' : report.riskScore <= 60 ? 'medium' : 'high'}">
            ${report.riskScore}%
          </div>
          <p style="text-align: center; font-weight: bold;">
            ${getScoreLabel(report.riskScore)}
          </p>
        </div>

        <div class="section">
          <h2>Resumo Executivo</h2>
          <p>${report.summary}</p>
        </div>

        <div class="section">
          <h2>Análise de Intolerâncias</h2>
          ${report.intolerances.map(intolerance => `
            <div class="intolerance">
              <h3>
                <span class="badge ${intolerance.probability >= 70 ? 'badge-high' : intolerance.probability >= 40 ? 'badge-medium' : 'badge-low'}">
                  ${intolerance.probability}%
                </span>
                Intolerância à ${intolerance.type}
              </h3>
              <p><strong>Sintomas Correlacionados:</strong> ${intolerance.correlatedSymptoms.join(', ')}</p>
              <p><strong>Alimentos Identificados:</strong> ${intolerance.correlatedFoods.join(', ')}</p>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h2>Recomendações Personalizadas</h2>
          <ol>
            <li><strong>Período de Eliminação:</strong> Recomenda-se um período de 2-4 semanas eliminando completamente os alimentos identificados para confirmar as intolerâncias.</li>
            <li><strong>Diário Alimentar Detalhado:</strong> Continue registrando todos os alimentos consumidos e sintomas para melhorar a precisão das análises futuras.</li>
            <li><strong>Consulta Médica:</strong> Considere agendar uma consulta com um gastroenterologista para confirmar os diagnósticos e receber orientação profissional.</li>
            <li><strong>Substitutos Alimentares:</strong> Explore alternativas saudáveis para manter uma dieta equilibrada.</li>
          </ol>
        </div>

        <div class="footer">
          <p><strong>Aviso:</strong> Este relatório é informativo e não substitui uma consulta médica profissional.</p>
          <p>Para diagnósticos definitivos e tratamentos, consulte um gastroenterologista.</p>
        </div>
      </body>
      </html>
    `;

    // Cria um blob e faz o download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-digestai-${new Date(report.createdAt).toLocaleDateString('pt-BR').replace(/\//g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download iniciado! 📥',
      description: 'Seu relatório foi baixado em formato HTML.',
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout>
        <div className="space-y-6">
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
          </div>

          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum relatório gerado</h3>
              <p className="text-muted-foreground mb-6">
                Registre sintomas e alimentos para gerar seu primeiro relatório
              </p>
              <Button variant="gradient" onClick={handleGenerateReport}>
                <Plus className="w-4 h-4 mr-2" />
                Gerar Primeiro Relatório
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
            <Button variant="gradient" size="sm" className="flex-1 sm:flex-none" onClick={handleDownloadPDF}>
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
