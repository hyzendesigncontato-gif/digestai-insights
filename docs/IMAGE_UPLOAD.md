# 📸 Upload de Imagens - ImgBB

## 🎨 Novas Cores do Projeto

### Cores Atualizadas
- **Primary (Verde):** `#2AAF23` - HSL(123, 75%, 41%)
- **Secondary (Verde Claro):** `#09C400` - HSL(120, 100%, 39%)
- **Success:** Usa a cor primary (verde)

### Antes vs Depois
| Antes | Depois |
|-------|--------|
| #1D8BF2 (Azul) | #2AAF23 (Verde) |
| #00D1A0 (Verde água) | #09C400 (Verde claro) |

## 📤 Upload de Imagens com ImgBB

### API Key
```
55f36cf170ead780461094f42b006c12
```

### Configuração

A API key está configurada em:
- `.env` → `VITE_IMGBB_API_KEY`
- `src/lib/imgbb.ts` → Hardcoded como fallback

### Como Usar

#### 1. Componente Pronto (Recomendado)

```tsx
import { ImageUpload } from '@/components/ImageUpload';

function MyComponent() {
  const handleUploadComplete = (url: string) => {
    console.log('Imagem hospedada em:', url);
    // Salvar URL no Supabase, etc
  };

  return (
    <ImageUpload
      onUploadComplete={handleUploadComplete}
      maxSize={10} // MB
      resize={true} // Otimiza automaticamente
      showPreview={true}
    />
  );
}
```

#### 2. Função Direta

```tsx
import { uploadImage } from '@/lib/imgbb';

async function handleUpload(file: File) {
  const result = await uploadImage(file, 'minha-imagem');
  
  if (result.error) {
    console.error('Erro:', result.error);
    return;
  }
  
  console.log('URL:', result.url);
  console.log('Delete URL:', result.deleteUrl);
}
```

#### 3. Com Redimensionamento

```tsx
import { uploadImage, resizeImage } from '@/lib/imgbb';

async function handleUpload(file: File) {
  // Redimensiona para max 1920x1080
  const resized = await resizeImage(file, 1920, 1080, 0.9);
  
  // Upload
  const result = await uploadImage(resized, 'imagem-otimizada');
  
  console.log('URL:', result.url);
}
```

### Funcionalidades

#### ✅ Validação Automática
- Formatos aceitos: JPG, PNG, GIF, WebP
- Tamanho máximo: 32MB (limite do ImgBB)
- Validação de tipo MIME

#### ✅ Redimensionamento
- Reduz imagens grandes automaticamente
- Mantém aspect ratio
- Qualidade configurável (0-1)

#### ✅ Preview
- Preview local antes do upload
- Loading state durante upload
- Progress bar

#### ✅ Feedback
- Toasts de sucesso/erro
- Progress percentage
- URL da imagem hospedada

### Exemplos de Uso

#### Avatar do Usuário

```tsx
import { ImageUpload } from '@/components/ImageUpload';
import { supabase } from '@/lib/supabase';

function ProfileSettings() {
  const handleAvatarUpload = async (url: string) => {
    // Salva URL no profile
    await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', userId);
  };

  return (
    <div>
      <h3>Foto de Perfil</h3>
      <ImageUpload
        onUploadComplete={handleAvatarUpload}
        maxSize={5}
        resize={true}
        showPreview={true}
      />
    </div>
  );
}
```

#### Imagem de Alimento

```tsx
function AddFoodForm() {
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async () => {
    await supabase.from('foods').insert({
      name: 'Banana',
      category: 'Frutas',
      image_url: imageUrl, // URL do ImgBB
    });
  };

  return (
    <form>
      <Input name="name" placeholder="Nome do alimento" />
      
      <ImageUpload
        onUploadComplete={setImageUrl}
        buttonText="Adicionar Foto"
      />
      
      <Button onClick={handleSubmit}>Salvar</Button>
    </form>
  );
}
```

#### Múltiplas Imagens

```tsx
function GalleryUpload() {
  const [images, setImages] = useState<string[]>([]);

  const handleUpload = (url: string) => {
    setImages(prev => [...prev, url]);
  };

  return (
    <div>
      <ImageUpload
        onUploadComplete={handleUpload}
        showPreview={false}
      />
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((url, i) => (
          <img key={i} src={url} alt={`Image ${i}`} />
        ))}
      </div>
    </div>
  );
}
```

### API do ImgBB

#### Endpoint
```
POST https://api.imgbb.com/1/upload
```

#### Parâmetros
- `key` (required): API key
- `image` (required): Base64 da imagem (sem prefixo)
- `name` (optional): Nome da imagem

#### Resposta
```json
{
  "data": {
    "id": "abc123",
    "url": "https://i.ibb.co/abc123/image.jpg",
    "display_url": "https://i.ibb.co/abc123/image.jpg",
    "delete_url": "https://ibb.co/abc123/delete",
    "width": 1920,
    "height": 1080,
    "size": 245678
  },
  "success": true,
  "status": 200
}
```

### Limites

- **Tamanho máximo:** 32MB por imagem
- **Formatos:** JPG, PNG, GIF, WebP, BMP, TIFF
- **Rate limit:** Sem limite oficial, mas use com moderação
- **Armazenamento:** Gratuito e permanente

### Boas Práticas

#### ✅ Sempre Redimensionar
```tsx
// Redimensiona imagens grandes
const resized = await resizeImage(file, 1920, 1080, 0.9);
```

#### ✅ Validar Antes
```tsx
if (!isValidImage(file)) {
  toast({ title: 'Formato inválido' });
  return;
}
```

#### ✅ Salvar Delete URL
```tsx
// Salve o delete_url para poder remover depois
const result = await uploadImage(file);
await supabase.from('images').insert({
  url: result.url,
  delete_url: result.deleteUrl,
});
```

#### ✅ Feedback ao Usuário
```tsx
<ImageUpload
  onUploadComplete={(url) => {
    toast({ title: 'Upload concluído!' });
  }}
  onUploadError={(error) => {
    toast({ title: 'Erro', description: error });
  }}
/>
```

### Troubleshooting

#### Erro: "Imagem muito grande"
- Reduza o tamanho da imagem
- Use `resize={true}` no componente
- Ou redimensione manualmente antes

#### Erro: "Formato inválido"
- Use apenas: JPG, PNG, GIF, WebP
- Verifique o MIME type do arquivo

#### Erro: "Falha no upload"
- Verifique a conexão com internet
- Verifique se a API key está correta
- Tente novamente

### Integração com Supabase

#### Salvar URL no Profile
```tsx
const { url } = await uploadImage(file);

await supabase
  .from('profiles')
  .update({ avatar_url: url })
  .eq('id', userId);
```

#### Salvar URL em Foods
```tsx
const { url } = await uploadImage(file);

await supabase
  .from('foods')
  .update({ image_url: url })
  .eq('id', foodId);
```

## 🎨 Usando as Novas Cores

As cores já estão aplicadas automaticamente em todo o projeto via Tailwind CSS.

### Classes Disponíveis

```tsx
// Primary (Verde)
<div className="bg-primary text-primary-foreground">
<div className="border-primary text-primary">

// Secondary (Verde Claro)
<div className="bg-secondary text-secondary-foreground">

// Success (Verde - mesmo que primary)
<div className="bg-success text-success-foreground">

// Gradientes
<div className="bg-gradient-to-r from-primary to-secondary">
<Button variant="gradient">Botão com Gradiente</Button>
```

### Componentes Atualizados

Todos os componentes já usam as novas cores:
- ✅ Botões
- ✅ Cards
- ✅ Badges
- ✅ Progress bars
- ✅ Sidebar
- ✅ Inputs
- ✅ Toasts

## 🎉 Pronto!

Agora você tem:
- ✅ Novas cores verdes aplicadas
- ✅ Upload de imagens funcionando
- ✅ Componente pronto para usar
- ✅ Integração com ImgBB
- ✅ Redimensionamento automático
- ✅ Validação e feedback
