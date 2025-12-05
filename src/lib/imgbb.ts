// ============================================
// DigestAI - ImgBB Integration
// Upload de imagens para ImgBB
// ============================================

const IMGBB_API_KEY = '55f36cf170ead780461094f42b006c12';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Faz upload de uma imagem para o ImgBB
 * @param file - Arquivo de imagem (File ou Blob)
 * @param name - Nome opcional para a imagem
 * @returns URL da imagem hospedada
 */
export async function uploadImage(
  file: File | Blob,
  name?: string
): Promise<{ url: string; deleteUrl: string; error?: string }> {
  try {
    console.log('Iniciando upload para ImgBB...', { size: file.size, type: file.type });

    // Valida o arquivo
    if (file.size > 32 * 1024 * 1024) {
      // 32MB é o limite do ImgBB
      throw new Error('Imagem muito grande. Máximo 32MB.');
    }

    // Converte para base64
    const base64 = await fileToBase64(file);
    console.log('Arquivo convertido para base64');

    // Prepara o FormData
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64.split(',')[1]); // Remove o prefixo data:image/...
    if (name) {
      formData.append('name', name);
    }

    console.log('Enviando para ImgBB API...');

    // Faz o upload
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });

    console.log('Resposta recebida:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta:', errorText);
      throw new Error(`Erro no upload: ${response.status} - ${errorText}`);
    }

    const data: ImgBBResponse = await response.json();
    console.log('Upload bem-sucedido:', data);

    if (!data.success) {
      throw new Error('Falha no upload da imagem');
    }

    return {
      url: data.data.display_url,
      deleteUrl: data.data.delete_url,
    };
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return {
      url: '',
      deleteUrl: '',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Converte File/Blob para base64
 */
function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Valida se o arquivo é uma imagem
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Redimensiona uma imagem antes do upload
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcula novas dimensões mantendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao converter canvas para blob'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
  });
}

/**
 * Hook React para upload de imagens
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const upload = async (file: File, options?: { resize?: boolean; name?: string }) => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Valida
      if (!isValidImage(file)) {
        throw new Error('Formato de imagem inválido. Use JPG, PNG, GIF ou WebP.');
      }

      setProgress(25);

      // Redimensiona se necessário
      let fileToUpload: File | Blob = file;
      if (options?.resize && file.size > 1024 * 1024) {
        // Redimensiona se maior que 1MB
        fileToUpload = await resizeImage(file);
      }

      setProgress(50);

      // Upload
      const result = await uploadImage(fileToUpload, options?.name);

      setProgress(100);

      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    upload,
    isUploading,
    progress,
  };
}

// Importa React para o hook
import React from 'react';
