// ============================================
// DigestAI - Image Upload Component
// Componente para upload de imagens
// ============================================

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, isValidImage, resizeImage } from '@/lib/imgbb';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // em MB
  resize?: boolean;
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  maxSize = 10,
  resize = true,
  className,
  buttonText = 'Escolher Imagem',
  showPreview = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valida tipo
    if (!isValidImage(file)) {
      toast({
        title: 'Formato inválido',
        description: 'Use apenas JPG, PNG, GIF ou WebP.',
        variant: 'destructive',
      });
      onUploadError?.('Formato inválido');
      return;
    }

    // Valida tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: `Tamanho máximo: ${maxSize}MB`,
        variant: 'destructive',
      });
      onUploadError?.('Arquivo muito grande');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    setProgress(0);

    try {
      setProgress(25);

      // Redimensiona se necessário
      let fileToUpload: File | Blob = file;
      if (resize && file.size > 1024 * 1024) {
        toast({
          title: 'Otimizando imagem...',
          description: 'Redimensionando para melhor performance.',
        });
        fileToUpload = await resizeImage(file);
      }

      setProgress(50);

      // Upload para ImgBB
      const result = await uploadImage(fileToUpload, file.name);

      setProgress(100);

      if (result.error) {
        throw new Error(result.error);
      }

      setUploadedUrl(result.url);
      onUploadComplete?.(result.url);

      toast({
        title: 'Upload concluído! ✅',
        description: 'Imagem enviada com sucesso.',
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      
      toast({
        title: 'Erro no upload',
        description: errorMessage,
        variant: 'destructive',
      });
      
      onUploadError?.(errorMessage);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showPreview && (previewUrl || uploadedUrl) ? (
        <Card className="relative overflow-hidden">
          <img
            src={uploadedUrl || previewUrl || ''}
            alt="Preview"
            className="w-full h-64 object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </Card>
      ) : (
        <Card
          className={cn(
            'border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer',
            isUploading && 'pointer-events-none opacity-50'
          )}
          onClick={handleClick}
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <ImageIcon className="w-8 h-8 text-primary" />
              )}
            </div>
            <h3 className="font-semibold mb-2">
              {isUploading ? 'Enviando...' : 'Clique para escolher uma imagem'}
            </h3>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, GIF ou WebP (máx. {maxSize}MB)
            </p>
          </div>
        </Card>
      )}

      {isUploading && progress > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">
            {progress}% concluído
          </p>
        </div>
      )}

      {!showPreview && (
        <Button
          variant="outline"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      )}

      {uploadedUrl && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <p className="text-sm text-success font-medium">✅ Imagem hospedada</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {uploadedUrl}
          </p>
        </div>
      )}
    </div>
  );
}
