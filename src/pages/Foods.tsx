import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Apple, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  Loader2
} from 'lucide-react';
import { UserFoodStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useFoods } from '@/hooks/useFoods';

export default function Foods() {
  const { userFoodStatus, isLoading } = useFoods();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const categories = [...new Set(userFoodStatus.map(f => f.food?.category).filter(Boolean))];

  const filterFoods = (status?: 'safe' | 'moderate' | 'avoid') => {
    return userFoodStatus.filter(food => {
      const matchesSearch = food.food?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || food.food?.category === selectedCategory;
      const matchesStatus = !status || food.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'avoid':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe':
        return <Badge className="status-safe">Seguro</Badge>;
      case 'moderate':
        return <Badge className="status-moderate">Moderado</Badge>;
      case 'avoid':
        return <Badge className="status-avoid">Evitar</Badge>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return '[&>div]:bg-success';
    if (score >= 40) return '[&>div]:bg-warning';
    return '[&>div]:bg-destructive';
  };

  const safeFoods = filterFoods('safe');
  const moderateFoods = filterFoods('moderate');
  const avoidFoods = filterFoods('avoid');
  const allFoods = filterFoods();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando alimentos...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const FoodCard = ({ item }: { item: UserFoodStatus }) => (
    <Card className="hover-lift group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Food Icon/Image */}
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
            item.status === 'safe' ? "bg-success/10" :
            item.status === 'moderate' ? "bg-warning/10" : "bg-destructive/10"
          )}>
            {getStatusIcon(item.status)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {item.food.name}
                </h3>
                <p className="text-sm text-muted-foreground">{item.food.category}</p>
              </div>
              {getStatusBadge(item.status)}
            </div>

            {/* Score */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Score de Segurança</span>
                <span className={cn("text-sm font-bold", getScoreColor(item.safetyScore))}>
                  {item.safetyScore}%
                </span>
              </div>
              <Progress 
                value={item.safetyScore} 
                className={cn("h-2", getProgressColor(item.safetyScore))}
              />
            </div>

            {/* AI Notes */}
            {item.aiNotes && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item.aiNotes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <Apple className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            Alimentos Seguros
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Lista personalizada baseada no seu perfil
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 animate-fade-in stagger-1">
          <Card className="card-metric bg-success/5 border-success/20">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-success">{safeFoods.length}</p>
              <p className="text-xs text-muted-foreground">Seguros</p>
            </CardContent>
          </Card>

          <Card className="card-metric bg-warning/5 border-warning/20">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-warning">{moderateFoods.length}</p>
              <p className="text-xs text-muted-foreground">Moderado</p>
            </CardContent>
          </Card>

          <Card className="card-metric bg-destructive/5 border-destructive/20">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-destructive">{avoidFoods.length}</p>
              <p className="text-xs text-muted-foreground">Evitar</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="animate-fade-in stagger-2">
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-focus h-9 sm:h-10 text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="flex-shrink-0 text-xs sm:text-sm"
                >
                  Todos
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex-shrink-0 text-xs sm:text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in stagger-3">
          <TabsList className="grid w-full grid-cols-4 h-10 sm:h-12">
            <TabsTrigger value="all" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
              <span className="hidden sm:inline">Todos</span>
              <Badge variant="secondary" className="text-xs">{allFoods.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="safe" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
              <span className="hidden sm:inline">Seguros</span>
            </TabsTrigger>
            <TabsTrigger value="moderate" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />
              <span className="hidden sm:inline">Moderados</span>
            </TabsTrigger>
            <TabsTrigger value="avoid" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
              <span className="hidden sm:inline">Evitar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allFoods.map((food, index) => (
                <div key={food.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <FoodCard item={food} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="safe" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeFoods.map((food, index) => (
                <div key={food.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <FoodCard item={food} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="moderate" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moderateFoods.map((food, index) => (
                <div key={food.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <FoodCard item={food} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="avoid" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avoidFoods.map((food, index) => (
                <div key={food.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <FoodCard item={food} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20 animate-fade-in">
          <CardContent className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Como funciona?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                A lista é atualizada com base nos seus registros. Quanto mais você registra, mais precisa fica a análise.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
