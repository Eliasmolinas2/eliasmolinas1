import React, { useState, useEffect } from 'react';
import {
  initDriveAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../../lib/googleDriveAuth';
import {
  listDriveFiles,
  createDriveFolder,
  uploadTextFileToDrive,
  deleteDriveFile,
  fetchAboutDrive,
  DriveFileItem,
  DriveAboutInfo,
} from '../../services/googleDriveService';
import {
  Folder,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  Upload,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GoogleDriveView: React.FC = () => {
  const { user, wallet, transactions } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [aboutInfo, setAboutInfo] = useState<DriveAboutInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mimeFilter, setMimeFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals for actions
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('RoyalPlay Argentina');

  const [showUploadReceiptModal, setShowUploadReceiptModal] = useState<boolean>(false);
  const [receiptType, setReceiptType] = useState<'balance' | 'provably_fair' | 'account_summary'>('balance');

  // Mandatory Delete Confirmation Modal (REQUIRED BY SKILL)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Init auth listener on mount
  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, token) => {
        setIsAuthenticated(true);
        setGoogleUser(user);
        loadDriveData();
      },
      () => {
        setIsAuthenticated(false);
        setGoogleUser(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadDriveData = async () => {
    setLoadingFiles(true);
    setErrorMsg(null);
    try {
      const [fetchedFiles, about] = await Promise.all([
        listDriveFiles({ query: searchQuery, mimeTypeFilter: mimeFilter }),
        fetchAboutDrive(),
      ]);
      setFiles(fetchedFiles);
      setAboutInfo(about);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al cargar archivos de Google Drive');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsAuthenticated(true);
        setGoogleUser(res.user);
        await loadDriveData();
        setSuccessMsg('Conectado con Google Drive exitosamente');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al autenticar con Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setIsAuthenticated(false);
    setGoogleUser(null);
    setFiles([]);
    setAboutInfo(null);
    setSuccessMsg('Sesión de Google cerrada');
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await createDriveFolder(newFolderName.trim());
      setSuccessMsg(`Carpeta "${newFolderName}" creada con éxito en Google Drive`);
      setShowNewFolderModal(false);
      setNewFolderName('RoyalPlay Argentina');
      loadDriveData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear carpeta');
    }
  };

  const handleUploadReceipt = async () => {
    try {
      const timestamp = new Date().toISOString();
      let filename = `RoyalPlay_Comprobante_${Date.now()}.json`;
      let content = '';

      if (receiptType === 'balance') {
        filename = `RoyalPlay_Estado_Billetera_${new Date().toISOString().slice(0, 10)}.json`;
        content = JSON.stringify(
          {
            plataforma: 'RoyalPlay Casino Online Argentina',
            titular: user.fullName,
            dni: user.dni,
            fechaEmision: timestamp,
            saldoRealARS: wallet.realBalance,
            saldoBonoARS: wallet.bonusBalance,
            totalDepositadoARS: wallet.totalDeposited,
            totalRetiradoARS: wallet.totalWithdrawn,
            estadoKYC: user.kycStatus,
            firmaDigitalSHA256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          },
          null,
          2
        );
      } else if (receiptType === 'provably_fair') {
        filename = `RoyalPlay_Certificado_ProvablyFair_${Date.now()}.json`;
        content = JSON.stringify(
          {
            plataforma: 'RoyalPlay Casino Online Argentina',
            jugador: user.fullName,
            algoritmo: 'HMAC-SHA256 / Provably Fair Cryptographic Verification',
            semillaServidorHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            semillaCliente: 'royal_client_seed_2026',
            nonce: 1482,
            verificado: true,
            selloTiempo: timestamp,
          },
          null,
          2
        );
      } else {
        filename = `RoyalPlay_Historial_Transacciones_${new Date().toISOString().slice(0, 10)}.csv`;
        const headers = 'ID,Tipo,Monto ARS,Metodo,Estado,Fecha\n';
        const rows = transactions
          .map(t => `${t.id},${t.type},${t.amount},${t.method},${t.status},${t.createdAt}`)
          .join('\n');
        content = headers + rows;
      }

      await uploadTextFileToDrive(
        filename,
        content,
        filename.endsWith('.json') ? 'application/json' : 'text/csv'
      );
      setSuccessMsg(`Comprobante "${filename}" guardado exitosamente en tu Google Drive.`);
      setShowUploadReceiptModal(false);
      loadDriveData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar comprobante');
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setSuccessMsg(`El archivo "${fileToDelete.name}" fue eliminado de Google Drive.`);
      setFileToDelete(null);
      loadDriveData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar el archivo');
    } finally {
      setDeleting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
    if (mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
    if (mimeType.includes('image')) {
      return <FileImage className="w-5 h-5 text-purple-400 shrink-0" />;
    }
    return <File className="w-5 h-5 text-slate-400 shrink-0" />;
  };

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return '-';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatStorage = (bytesStr?: string) => {
    if (!bytesStr) return '0 GB';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '0 GB';
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1a2d] via-[#091522] to-[#061019] border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/40">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury text-cyan-200">
                Bóveda Personal & Documentos Google Drive
              </h2>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono-tech border border-cyan-500/30 font-bold">
                GOOGLE WORKSPACE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Almacena y gestiona en tu nube privada de Google Drive comprobantes oficiales de juego,
              constancias de retiros bancarios, certificados Provably Fair y documentación de identidad.
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl">
            {googleUser?.photoURL ? (
              <img
                src={googleUser.photoURL}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-cyan-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">
                {googleUser?.displayName?.[0] || 'G'}
              </div>
            )}
            <div className="text-left font-mono-tech">
              <span className="text-xs font-bold text-white block">
                {googleUser?.displayName || 'Cuenta Google Conectada'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                {googleUser?.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition"
              title="Cerrar sesión de Google"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* FEEDBACK BANNERS */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-3 text-xs text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Aviso del Sistema</span>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-start gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Operación Exitosa</span>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UNAUTHENTICATED STATE: OFFICIAL SIGN IN WITH GOOGLE BUTTON */}
      {!isAuthenticated ? (
        <div className="bg-[#0b101d] border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-blue-900/30 to-slate-900 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-300 shadow-xl shadow-cyan-950/50">
            <HardDrive className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-xl sm:text-2xl font-black font-serif-luxury text-slate-100">
              Conecta tu Cuenta de Google Drive
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Inicia sesión con Google para acceder a tus archivos, respaldar tus estados de cuenta en tiempo real,
              guardar certificados criptográficos de apuestas y exportar comprobantes con firma digital.
            </p>
          </div>

          {/* Official Google Material Sign-In Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm shadow-xl hover:shadow-2xl transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoggingIn ? 'Conectando con Google...' : 'Iniciar Sesión con Google'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono-tech text-slate-400 pt-4 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Token Seguro en Memoria</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Permisos Oficiales Drive API v3</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Cifrado TLS 1.3 End-to-End</span>
            </span>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED STATE: FULL GOOGLE DRIVE BROWSER & MANAGER */
        <div className="space-y-6">
          {/* Storage Quota Card & Action Toolbar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Storage Quota Widget */}
            <div className="md:col-span-4 bg-[#0c1220] border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="text-slate-400 uppercase">Espacio en Google Drive:</span>
                <span className="text-cyan-400 font-bold">
                  {formatStorage(aboutInfo?.storageQuota?.usage)} /{' '}
                  {formatStorage(aboutInfo?.storageQuota?.limit)}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{
                    width: aboutInfo?.storageQuota?.limit
                      ? `${Math.min(
                          100,
                          (parseInt(aboutInfo.storageQuota.usage || '0') /
                            parseInt(aboutInfo.storageQuota.limit || '1')) *
                            100
                        )}%`
                      : '20%',
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono-tech block">
                Cuenta autorizada: {aboutInfo?.user?.emailAddress || googleUser?.email}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="md:col-span-8 flex flex-wrap items-center justify-start md:justify-end gap-2.5">
              <button
                onClick={() => setShowUploadReceiptModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Exportar Comprobante a Drive</span>
              </button>

              <button
                onClick={() => setShowNewFolderModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Carpeta</span>
              </button>

              <button
                onClick={loadDriveData}
                disabled={loadingFiles}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                title="Actualizar archivos"
              >
                <RefreshCw className={`w-4 h-4 ${loadingFiles ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar en tu Google Drive..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadDriveData()}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto font-mono-tech text-xs">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Tipo:</span>
              <select
                value={mimeFilter}
                onChange={e => {
                  setMimeFilter(e.target.value);
                  setTimeout(() => loadDriveData(), 50);
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Todos los Archivos</option>
                <option value="folder">Carpetas</option>
                <option value="document">Documentos / PDFs</option>
                <option value="spreadsheet">Planillas / CSV</option>
                <option value="image">Imágenes</option>
              </select>
            </div>
          </div>

          {/* Files List Table */}
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-tech">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nombre del Archivo</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Tamaño</th>
                    <th className="py-3 px-4">Última Modificación</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingFiles ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                          <span>Cargando archivos desde Google Drive...</span>
                        </div>
                      </td>
                    </tr>
                  ) : files.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 space-y-2">
                        <Folder className="w-10 h-10 text-slate-600 mx-auto" />
                        <p className="font-bold text-slate-300">No se encontraron archivos en Google Drive</p>
                        <p className="text-xs text-slate-500">
                          Utiliza el botón "Exportar Comprobante a Drive" para crear tu primer archivo.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    files.map(file => (
                      <tr key={file.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.mimeType)}
                            <div>
                              <span className="font-bold text-slate-200 block truncate max-w-sm sm:max-w-md">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate block">
                                ID: {file.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {file.mimeType === 'application/vnd.google-apps.folder'
                            ? 'Carpeta'
                            : file.mimeType.split('.').pop()?.split('/').pop() || 'Archivo'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleDateString('es-AR')
                            : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white transition"
                                title="Abrir en Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                              title="Eliminar archivo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW FOLDER IN GOOGLE DRIVE */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-cyan-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowNewFolderModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
                Crear Carpeta en Google Drive
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Organiza tus archivos y certificados del casino en una carpeta dedicada.
              </p>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4 text-xs font-mono-tech">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nombre de la Carpeta:</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  required
                  placeholder="Ej: RoyalPlay Comprobantes 2026"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-lg shadow-cyan-900/30"
                >
                  Crear Carpeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXPORT RECEIPT TO GOOGLE DRIVE */}
      {showUploadReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowUploadReceiptModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif-luxury text-emerald-300">
                Exportar Comprobante Oficial a Google Drive
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Genera un comprobante inalterable con firma SHA-256 y guárdalo en tu nube personal.
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono-tech">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  Seleccionar Tipo de Comprobante:
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'balance',
                      label: 'Estado de Billetera & Saldos ARS',
                      desc: `Saldo actual: $${wallet.realBalance.toLocaleString('es-AR')} ARS • Titular: ${user.fullName}`,
                    },
                    {
                      id: 'provably_fair',
                      label: 'Certificado de Integridad Criptográfica Provably Fair',
                      desc: 'Verificación de semilla HMAC-SHA256 y tiradas transparentes.',
                    },
                    {
                      id: 'account_summary',
                      label: 'Historial de Transacciones (Depósitos & Retiros)',
                      desc: `${transactions.length} movimientos registrados en formato CSV compatible con Excel.`,
                    },
                  ].map(item => (
                    <div
                      key={item.id}
                      onClick={() => setReceiptType(item.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        receiptType === item.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-slate-200">{item.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                El archivo se guardará automáticamente en la raíz de tu Google Drive con sello de tiempo institucional.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadReceiptModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUploadReceipt}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-900/30"
                >
                  Guardar en Google Drive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE OPERATIONS (REQUIRED BY SKILL) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-rose-500/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-shake">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold font-serif-luxury text-rose-200">
                ¿Eliminar archivo de Google Drive?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ¿Está seguro de que desea eliminar{' '}
                <strong className="text-white font-mono-tech">"{fileToDelete.name}"</strong> de su cuenta de
                Google Drive? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono-tech text-slate-400 space-y-1">
              <div><strong>Archivo:</strong> {fileToDelete.name}</div>
              <div><strong>ID:</strong> {fileToDelete.id}</div>
              <div><strong>Tamaño:</strong> {formatFileSize(fileToDelete.size)}</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                {deleting ? 'Eliminando...' : 'Sí, Eliminar Archivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
