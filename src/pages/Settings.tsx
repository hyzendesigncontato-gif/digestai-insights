import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
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
  Lock,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/imgbb';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { preferences, updatePreferences, isLoading: loadingPreferences } = useUserPreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dietary preferences state
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');

  // Carrega dados do usuário
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
      setBirthDate(user.birthDate || '');
      setGender(user.gender || '');
      setWeight(user.weight?.toString() || '');
      setHeight(user.height?.toString() || '');
    }
  }, [user]);

  // Carrega preferências
  useEffect(() => {
    if (preferences) {
      setDietaryRestrictions(preferences.dietaryRestrictions);
      setAllergies(preferences.allergies.join(', '));
    }
  }, [preferences]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação de tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione uma imagem (JPG, PNG ou GIF).',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      toast({
        title: 'Enviando imagem...',
        description: 'Aguarde enquanto fazemos o upload.',
      });

      // Upload para ImgBB
      const result = await uploadImage(file);
      
      if (result.error || !result.url) {
        throw new Error(result.error || 'Erro ao fazer upload da imagem');
      }
      
      // Atualiza o avatar no Supabase Auth (metadata do usuário)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: result.url }
      });

      if (updateError) throw updateError;

      setAvatarUrl(result.url);
      
      // Recarrega os dados do usuário para atualizar em todos os componentes
      await refreshUser();
      
      toast({
        title: 'Foto atualizada! ✅',
        description: 'Sua foto de perfil foi alterada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erro ao enviar foto',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar sua foto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Atualiza os dados do usuário no Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: email,
        data: { 
          full_name: fullName,
          birth_date: birthDate,
          gender: gender,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseInt(height) : null,
        }
      });

      if (error) throw error;

      await refreshUser();

      toast({
        title: 'Perfil atualizado! ✅',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar seu perfil. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async () => {
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

    try {
      // Atualiza a senha no Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Senha alterada! ✅',
        description: 'Sua senha foi atualizada com sucesso.',
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: error instanceof Error ? error.message : 'Não foi possível alterar sua senha. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDietaryPreferences = async () => {
    try {
      const allergiesArray = allergies.split(',').map(a => a.trim()).filter(Boolean);
      
      const { success } = await updatePreferences({
        dietaryRestrictions,
        allergies: allergiesArray,
      });

      if (!success) throw new Error('Falha ao salvar');

      toast({
        title: 'Preferências salvas! ✅',
        description: 'Suas preferências alimentares foram atualizadas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas preferências.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const { success } = await updatePreferences({
        notificationSettings: preferences.notificationSettings,
        alertIntensity: preferences.alertIntensity,
      });

      if (!success) throw new Error('Falha ao salvar');

      toast({
        title: 'Notificações atualizadas! ✅',
        description: 'Suas preferências foram salvas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas preferências.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveAppearance = async () => {
    try {
      const { success } = await updatePreferences({
        theme: preferences.theme,
      });

      if (!success) throw new Error('Falha ao salvar');

      toast({
        title: 'Aparência atualizada! ✅',
        description: 'Suas preferências foram salvas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas preferências.',
        variant: 'destructive',
      });
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
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
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                      {user?.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAvatarClick}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Alterar foto
                        </>
                      )}
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
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="input-focus"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select value={gender} onValueChange={setGender}>
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
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="input-focus"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
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
                        <Switch 
                          id={restriction}
                          checked={dietaryRestrictions.includes(restriction)}
                          onCheckedChange={() => toggleDietaryRestriction(restriction)}
                        />
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
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="input-focus"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe múltiplas alergias por vírgula
                  </p>
                </div>

                <Button variant="gradient" onClick={handleSaveDietaryPreferences}>
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

                <Button variant="gradient" onClick={handleSaveAppearance}>
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
