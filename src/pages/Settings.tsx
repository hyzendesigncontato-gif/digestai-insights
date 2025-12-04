import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockUserPreferences } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Utensils, 
  Bell, 
  Palette,
  Save,
  Camera,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState(mockUserPreferences);
  
  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    toast({
      title: 'Perfil atualizado! ✅',
      description: 'Suas informações foram salvas com sucesso.',
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Senha alterada! ✅',
      description: 'Sua senha foi atualizada com sucesso.',
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notificações atualizadas! ✅',
      description: 'Suas preferências foram salvas.',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 max-w-4xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie suas preferências
          </p>
        </div>

        <Tabs defaultValue="profile" className="animate-fade-in stagger-1">
          <TabsList className="flex w-full h-auto gap-1 bg-muted/50 p-1 rounded-lg overflow-x-auto">
            <TabsTrigger value="profile" className="flex-1 min-w-0 data-[state=active]:bg-primary data-[state=active]:text-white gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 min-w-0 data-[state=active]:bg-primary data-[state=active]:text-white gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="dietary" className="flex-1 min-w-0 data-[state=active]:bg-primary data-[state=active]:text-white gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <Utensils className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Alimentar</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 min-w-0 data-[state=active]:bg-primary data-[state=active]:text-white gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1 min-w-0 data-[state=active]:bg-primary data-[state=active]:text-white gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <Palette className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Aparência</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                      {user?.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Alterar foto
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG ou GIF. Máximo 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-focus"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-focus"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      defaultValue={user?.birthDate}
                      className="input-focus"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select defaultValue={user?.gender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      defaultValue={user?.weight}
                      className="input-focus"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      defaultValue={user?.height}
                      className="input-focus"
                    />
                  </div>
                </div>

                <Button variant="gradient" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Mantenha sua conta segura com uma senha forte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-focus"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-focus"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 8 caracteres, incluindo letra maiúscula e número
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-focus"
                  />
                </div>

                <Button variant="gradient" onClick={handleChangePassword}>
                  <Shield className="w-4 h-4 mr-2" />
                  Alterar senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dietary Tab */}
          <TabsContent value="dietary" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências Alimentares</CardTitle>
                <CardDescription>
                  Configure suas restrições e preferências para análises mais precisas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Restrições Dietéticas</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Vegano', 'Vegetariano', 'Sem lactose', 'Sem glúten', 'Low FODMAP', 'Sem açúcar'].map((restriction) => (
                      <div key={restriction} className="flex items-center space-x-2">
                        <Switch id={restriction} />
                        <Label htmlFor={restriction} className="text-sm font-normal cursor-pointer">
                          {restriction}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias conhecidas</Label>
                  <Input
                    id="allergies"
                    placeholder="Ex: amendoim, frutos do mar..."
                    className="input-focus"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe múltiplas alergias por vírgula
                  </p>
                </div>

                <Button variant="gradient">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Escolha como e quando deseja ser notificado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Notificações Push</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Lembrete de sintomas</Label>
                      <p className="text-sm text-muted-foreground">
                        Lembrete diário para registrar sintomas
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.notificationSettings.symptomReminder}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notificationSettings: { ...preferences.notificationSettings, symptomReminder: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Novos insights</Label>
                      <p className="text-sm text-muted-foreground">
                        Quando o DigestAI identificar novos padrões
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.notificationSettings.newInsights}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notificationSettings: { ...preferences.notificationSettings, newInsights: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Relatórios prontos</Label>
                      <p className="text-sm text-muted-foreground">
                        Quando um novo relatório estiver disponível
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.notificationSettings.reportsReady}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notificationSettings: { ...preferences.notificationSettings, reportsReady: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dicas diárias</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber dicas personalizadas diariamente
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.notificationSettings.dailyTips}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notificationSettings: { ...preferences.notificationSettings, dailyTips: checked }
                      })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Intensidade de Alertas</Label>
                  <Select 
                    value={preferences.alertIntensity} 
                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                      setPreferences({ ...preferences, alertIntensity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta - Alertas imediatos</SelectItem>
                      <SelectItem value="medium">Média - Sintomas moderados/graves</SelectItem>
                      <SelectItem value="low">Baixa - Apenas resumos semanais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="gradient" onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar notificações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select 
                    value={preferences.theme}
                    onValueChange={(value: 'light' | 'dark' | 'auto') => 
                      setPreferences({ ...preferences, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático (seguir sistema)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="gradient">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar aparência
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
