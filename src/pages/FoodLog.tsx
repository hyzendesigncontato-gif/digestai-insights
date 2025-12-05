import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  Plus, 
  Search,
  Loader2,
  Clock,
  Calendar,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { cn } from '@/lib/utils';

const mealTypes = [
  { value: 'breakfast', label: '☀️ Café da Manhã' },
  { value: 'lunch', label: '🌤️ Almoço' },
  { value: 'dinner', label: '🌙 Jantar' },
  { value: 'snack', label: '🍎 Lanche' },
];

export default function FoodLog() {
  const { foodLogs, isLoading, addFoodLog, deleteFoodLog } = useFoodLogs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [datetime, setDatetime] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!foodName.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite o nome do alimento.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const { error } = await addFoodLog({
      foodName: foodName.trim(),
      mealType,
      datetime: datetime || new Date().toISOString(),
      portionSize: portionSize || undefined,
      notes: notes || undefined,
    });

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível registrar o alimento. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    // Reset form
    setFoodName('');
    setMealType('lunch');
    setDatetime('');
    setPortionSize('');
    setNotes('');
    setIsDialogOpen(false);

    toast({
      title: 'Alimento registrado! ✅',
      description: 'O DigestAI irá analisar este dado.',
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteFoodLog(id);

    if (error) {
      toast({
        title: 'Erro ao deletar',
        description: 'Não foi possível remover o registro.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Registro removido',
      description: 'O alimento foi removido do histórico.',
    });
  };

  const getMealTypeIcon = (type: string) => {
    const meal = mealTypes.find(m => m.value === type);
    return meal?.label || '🍽️';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando registros...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              Diário Alimentar
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Registre o que você come para análises precisas
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="sm">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Registrar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Alimento</DialogTitle>
                <DialogDescription>
                  Anote o que você comeu para o DigestAI analisar
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="foodName">Alimento *</Label>
                  <Input
                    id="foodName"
                    placeholder="Ex: Pão integral, Leite, Arroz..."
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="input-focus"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mealType">Refeição *</Label>
                  <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTypes.map((meal) => (
                        <SelectItem key={meal.value} value={meal.value}>
                          {meal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="datetime">Data e Hora</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={datetime}
                      onChange={(e) => setDatetime(e.target.value)}
                      className="input-focus"
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe vazio para usar agora
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portionSize">Porção</Label>
                    <Input
                      id="portionSize"
                      placeholder="Ex: 1 xícara, 200g"
                      value={portionSize}
                      onChange={(e) => setPortionSize(e.target.value)}
                      className="input-focus"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma observação sobre este alimento?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-focus resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 animate-fade-in stagger-1">
          {mealTypes.map((meal) => {
            const count = foodLogs.filter(log => log.mealType === meal.value).length;
            return (
              <Card key={meal.value} className="card-metric">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-2xl mb-1">{meal.label.split(' ')[0]}</div>
                  <p className="text-lg sm:text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{meal.label.split(' ').slice(1).join(' ')}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Food Logs List */}
        <Card className="animate-fade-in stagger-2">
          <CardHeader>
            <CardTitle>Histórico de Alimentação</CardTitle>
            <CardDescription>
              Últimos alimentos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {foodLogs.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum alimento registrado</h3>
                <p className="text-muted-foreground mb-6">
                  Comece registrando o que você come para análises precisas
                </p>
                <Button variant="gradient" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primeiro Alimento
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {foodLogs.map((log, index) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-3xl flex-shrink-0">
                      {getMealTypeIcon(log.mealType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{log.foodName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(log.datetime)}
                        </span>
                        {log.portionSize && (
                          <Badge variant="outline" className="text-xs">
                            {log.portionSize}
                          </Badge>
                        )}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(log.id)}
                      className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20 animate-fade-in">
          <CardContent className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">💡 Dica</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Registre seus alimentos logo após comer. Se tiver sintomas nas próximas 4 horas, 
                o DigestAI irá correlacionar automaticamente e atualizar sua lista de alimentos seguros.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
