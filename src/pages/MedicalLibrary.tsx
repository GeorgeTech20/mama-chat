import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, Image, Trash2, Eye, Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import BottomNav from '@/components/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api, MedicalDocument, DocumentType } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Default patient ID - TODO: Get from user context once mapping is implemented
const PATIENT_ID = 1;

const MedicalLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MedicalDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const documents = await api.getPatientDocuments(PATIENT_ID);
      setFiles(documents);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los archivos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentType = (fileType: string): DocumentType => {
    if (fileType.includes('pdf')) return 'OTHER';
    return 'MEDICAL_EXAM';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de archivo no válido',
        description: 'Solo se permiten imágenes (JPG, PNG, WebP) y PDFs',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El tamaño máximo es 10MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const documentType = getDocumentType(file.type);
      
      await api.uploadDocument(
        file,
        PATIENT_ID,
        documentType,
        `Archivo subido: ${file.name}`
      );

      toast({
        title: 'Archivo subido',
        description: 'El archivo se ha guardado correctamente',
      });

      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo subir el archivo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (file: MedicalDocument) => {
    try {
      await api.deleteDocument(file.id);

      toast({
        title: 'Archivo eliminado',
        description: 'El archivo se ha eliminado correctamente',
      });

      setFiles(files.filter((f) => f.id !== file.id));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivo',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = async (file: MedicalDocument) => {
    setSelectedFile(file);
    // For preview, we'll use the download endpoint
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    setPreviewUrl(`${API_BASE_URL}/api/documents/${file.id}/download`);
  };

  const handleDownload = (file: MedicalDocument) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const downloadUrl = `${API_BASE_URL}/api/documents/${file.id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels: Record<DocumentType, string> = {
      'MEDICAL_EXAM': 'Examen Médico',
      'PRESCRIPTION': 'Receta',
      'LAB_RESULT': 'Resultado de Lab',
      'IMAGING_RESULT': 'Imagen Médica',
      'OTHER': 'Otro',
    };
    return labels[type] || type;
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 bg-card border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground">Historia Clínica Digital</h1>
          <p className="text-xs text-muted-foreground">Tus archivos médicos centralizados</p>
        </div>
      </header>

      <div className="px-4 py-6 pb-32 space-y-6">
        {/* Upload Section */}
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center gap-3 py-2"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">
                  {isUploading ? 'Subiendo...' : 'Subir archivo'}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG o PDF • Max 10MB
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Files List */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">
            Mis Archivos ({files.length})
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No tienes archivos médicos guardados
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sube tus recetas, análisis y documentos médicos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {file.contentType?.includes('pdf') ? (
                          <FileText className="w-6 h-6 text-primary" />
                        ) : (
                          <Image className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.fileSize)} • {formatDate(file.uploadedAt)}
                        </p>
                        <p className="text-xs text-primary">
                          {getDocumentTypeLabel(file.documentType)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-2 hover:bg-accent rounded-full transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handlePreview(file)}
                          className="p-2 hover:bg-accent rounded-full transition-colors"
                          title="Ver"
                        >
                          <Eye className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="truncate">{selectedFile?.fileName}</DialogTitle>
          </DialogHeader>
          {previewUrl && selectedFile && (
            <div className="mt-4">
              {selectedFile.contentType?.includes('pdf') ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Abrir PDF en nueva pestaña
                  </a>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt={selectedFile.fileName}
                  className="w-full rounded-lg"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </MobileLayout>
  );
};

export default MedicalLibrary;
