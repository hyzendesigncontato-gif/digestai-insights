import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockSymptoms, symptomTypeLabels } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Plus, 
  Calendar, 
  Clock, 
  Filter,
  TrendingUp,
  AlertTriangle,
  Search
} from 'lucide-react';
import { Symptom, SymptomType } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const symptomTypes: { value: SymptomType; label: string }[] = [
  { value: 'abdominal_pain', label: 'Dor Abdominal' },
  { value: 'bloating', label: 'Estufamento' },
  { value: 'gas', label: 'Gases' },
  { value: 'diarrhea', label: 'Diarreia' },
  { value: 'constipation', label: 'Prisão de Ventre' },
  { value: 'nausea', label: 'Náusea' },
  { value: 'heartburn', label: 'Azia/Refluxo' },
  { value: 'vomiting', label: 'Vômito' },
  { value: 'cramps', label: 'Cólicas' },
  { value: 'other', label: 'Outro' },
];

export default function Symptoms() {
  const [symptoms, setSymptoms] = useState<Symptom[]>(mockSymptoms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntensity, setFilterIntensity] = useState<string>('all');
  const { toast } = useToast();

  // Form state
  const [selectedTypes, setSelectedTypes] = useState<SymptomType[]>([]);
  const [intensity, setIntensity] = useState([5]);
  const [datetime, setDatetime] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (selectedTypes.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um tipo de sintoma.',
        variant: 'destructive',
      });
      return;
    }

    const newSymptom: Symptom = {
      id: Date.now().toString(),
      userId: '1',
      types: selectedTypes,
      intensity: intensity[0],
      datetime: datetime || new Date().toISOString(),
      duration,
      notes,
      createdAt: new Date().toISOString(),
    };

    setSymptoms([newSymptom, ...symptoms]);
    
    // Reset form
    setSelectedTypes([]);
    setIntensity([5]);
    setDatetime('');
    setDuration('');
    setNotes('');
    setIsDialogOpen(false);

    toast({
      title: 'Sintoma registrado! ✅',
      description: 'O DigestAI irá analisar este novo dado.',
    });
  };

  const toggleSymptomType = (type: SymptomType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-success';
    if (intensity <= 6) return 'bg-warning';
    return 'bg-destructive';
  };

  const getIntensityEmoji = (intensity: number) => {
    if (intensity <= 2) return '😊';
    if (intensity <= 4) return '😐';
    if (intensity <= 6) return '😕';
    if (intensity <= 8) return '😣';
    return '😫';
  };

  const filteredSymptoms = symptoms.filter(symptom => {
    const matchesSearch = symptom.types.some(t => 
      symptomTypeLabels[t].toLowerCase().includes(searchTerm.toLowerCase())
    ) || (symptom.notes?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIntensity = filterIntensity === 'all' || 
      (filterIntensity === 'low' && symptom.intensity <= 3) ||
      (filterIntensity === 'medium' && symptom.intensity > 3 && symptom.intensity <= 6) ||
      (filterIntensity === 'high' && symptom.intensity > 6);
    
    return matchesSearch && matchesIntensity;
  });

  // Stats
  const avgIntensity = symptoms.length > 0 
    ? (symptoms.reduce((acc, s) => acc + s.intensity, 0) / symptoms.length).toFixed(1)
    : '0';
  
  const mostFrequentType = symptoms.length > 0
    ? Object.entries(
        symptoms.flatMap(s => s.types).reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              Meus Sintomas
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Registre e acompanhe seus sintomas digestivos
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Sintoma
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Novo Sintoma</DialogTitle>
                <DialogDescription>
                  Descreva o que você está sentindo para que possamos analisar
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Symptom Types */}
                <div className="space-y-3">
                  <Label>Tipo de Sintoma *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptomTypes.map((type) => (
                      <div
                        key={type.value}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition-all",
                          selectedTypes.includes(type.value)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => toggleSymptomType(type.value)}
                      >
                        <Checkbox 
                          checked={selectedTypes.includes(type.value)}
                          onCheckedChange={() => toggleSymptomType(type.value)}
                        />
                        <span className="text-sm">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Intensity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Intensidade</Label>
                    <span className="text-2xl">{getIntensityEmoji(intensity[0])} {intensity[0]}/10</span>
                  </div>
                  <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Leve</span>
                    <span>Moderado</span>
                    <span>Intenso</span>
                  </div>
                </div>

                {/* Date/Time */}
                <div className="space-y-2">
                  <Label>Data e Hora</Label>
                  <Input
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    className="input-focus"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quanto tempo durou?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menos de 30 minutos">Menos de 30 minutos</SelectItem>
                      <SelectItem value="30 minutos a 1 hora">30 minutos a 1 hora</SelectItem>
                      <SelectItem value="1 a 2 horas">1 a 2 horas</SelectItem>
                      <SelectItem value="2 a 4 horas">2 a 4 horas</SelectItem>
                      <SelectItem value="mais de 4 horas">Mais de 4 horas</SelectItem>
                      <SelectItem value="o dia todo">O dia todo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Descreva detalhes adicionais, como o que você comeu antes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] input-focus"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="gradient" className="flex-1" onClick={handleSubmit}>
                    Salvar Sintoma
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 animate-fade-in stagger-1">
          <Card className="card-metric">
            <CardContent className="p-3 sm:pt-6 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Registros</p>
                  <p className="text-xl sm:text-3xl font-bold">{symptoms.length}</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-metric">
            <CardContent className="p-3 sm:pt-6 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Intensidade</p>
                  <p className="text-xl sm:text-3xl font-bold">{avgIntensity}</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-metric">
            <CardContent className="p-3 sm:pt-6 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <div className="text-center sm:text-left min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Frequente</p>
                  <p className="text-sm sm:text-xl font-bold truncate">
                    {mostFrequentType ? symptomTypeLabels[mostFrequentType].split(' ')[0] : '-'}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="animate-fade-in stagger-2">
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-focus h-9 sm:h-10 text-sm"
                />
              </div>
              <Select value={filterIntensity} onValueChange={setFilterIntensity}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 sm:h-10 text-sm">
                  <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Leve (1-3)</SelectItem>
                  <SelectItem value="medium">Moderado (4-6)</SelectItem>
                  <SelectItem value="high">Intenso (7-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms List */}
        <div className="space-y-4">
          {filteredSymptoms.length === 0 ? (
            <Card className="animate-fade-in">
              <CardContent className="py-12 text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum sintoma encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterIntensity !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece registrando seu primeiro sintoma'}
                </p>
                <Button variant="gradient" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Sintoma
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredSymptoms.map((symptom, index) => (
              <Card 
                key={symptom.id} 
                className="hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Intensity Indicator */}
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl",
                        getIntensityColor(symptom.intensity)
                      )}>
                        {symptom.intensity}
                      </div>
                      
                      <div className="flex-1">
                        {/* Symptom Types */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {symptom.types.map((type) => (
                            <Badge key={type} variant="secondary">
                              {symptomTypeLabels[type]}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(symptom.datetime).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(symptom.datetime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {symptom.duration && (
                            <span>Duração: {symptom.duration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {symptom.notes && (
                      <div className="sm:ml-auto sm:max-w-xs">
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
                          "{symptom.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
