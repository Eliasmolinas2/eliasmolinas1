import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  encryptMessage,
  decryptMessage,
  EncryptedPayload,
} from '../../lib/crypto';
import {
  Lock,
  Unlock,
  Key,
  Copy,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  ShieldAlert,
  Send,
  Plus,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const SecureMessagesView: React.FC = () => {
  const {
    secureMessages,
    addSecureMessage,
    contacts,
    addContact,
    updateContactStatus,
    user,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'contacts' | 'history'>('encrypt');

  // Encryption State
  const [plainText, setPlainText] = useState<string>('Datos bancarios confidenciales: CBU 0070001620000018293014 - DNI 38.452.190');
  const [encryptPassword, setEncryptPassword] = useState<string>('ClaveSecretaRoyal2026!');
  const [encryptSubject, setEncryptSubject] = useState<string>('Información bancaria para retiro seguro');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(contacts[0]?.id || '');
  const [encryptedResult, setEncryptedResult] = useState<EncryptedPayload | null>(null);
  const [encrypting, setEncrypting] = useState<boolean>(false);
  const [copiedArmored, setCopiedArmored] = useState<boolean>(false);

  // Decryption State
  const [cipherInput, setCipherInput] = useState<string>('');
  const [decryptPassword, setDecryptPassword] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [decryptError, setDecryptError] = useState<string>('');
  const [decrypting, setDecrypting] = useState<boolean>(false);

  // New Contact State
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactIdentifier, setNewContactIdentifier] = useState<string>('');
  const [newContactConsent, setNewContactConsent] = useState<boolean>(true);
  const [contactSuccessMsg, setContactSuccessMsg] = useState<string>('');

  // Handle Encrypt
  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plainText.trim() || !encryptPassword.trim()) {
      alert('Por favor ingresa el mensaje y la contraseña de cifrado.');
      return;
    }

    setEncrypting(true);
    setEncryptedResult(null);

    try {
      const payload = await encryptMessage(plainText, encryptPassword);
      setEncryptedResult(payload);

      // Save into secure inbox
      const recipient = contacts.find(c => c.id === selectedRecipientId);
      addSecureMessage({
        senderId: user.id,
        senderName: user.fullName,
        recipientContactId: selectedRecipientId || 'ct_default',
        recipientName: recipient ? recipient.name : 'Destinatario Confidencial',
        ciphertext: payload.armoredString,
        salt: payload.salt,
        iv: payload.iv,
        tag: 'GCM-128-TAG',
        subjectHint: encryptSubject || 'Mensaje protegido',
      });
    } catch (err: unknown) {
      alert('Error al cifrar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setEncrypting(false);
    }
  };

  // Handle Decrypt
  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setDecryptError('');
    setDecryptedText('');
    setDecrypting(true);

    try {
      const plaintext = await decryptMessage(cipherInput, decryptPassword);
      setDecryptedText(plaintext);
    } catch (err: unknown) {
      setDecryptError(err instanceof Error ? err.message : 'Error al descifrar el mensaje.');
    } finally {
      setDecrypting(false);
    }
  };

  // Copy armored text
  const copyArmored = () => {
    if (!encryptedResult) return;
    navigator.clipboard.writeText(encryptedResult.armoredString);
    setCopiedArmored(true);
    setTimeout(() => setCopiedArmored(false), 2000);
  };

  // Add Contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactIdentifier.trim()) {
      alert('Ingresa el nombre e identificador del contacto.');
      return;
    }
    if (!newContactConsent) {
      alert('El contacto debe contar con consentimiento explícito de comunicación.');
      return;
    }

    addContact(newContactName, newContactIdentifier);
    setContactSuccessMsg(`Contacto '${newContactName}' registrado con consentimiento legal.`);
    setNewContactName('');
    setNewContactIdentifier('');
    setTimeout(() => setContactSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071926] via-[#091522] to-[#140b22] border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury text-cyan-300">
                Secure Messages Studio
              </h2>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono-tech border border-cyan-500/30 font-bold">
                AES-256-GCM
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Criptografía simétrica de nivel gubernamental implementada directamente en el navegador con
              la <strong>Web Crypto API nativa</strong>. Clave derivada con <strong>PBKDF2 (100.000 iteraciones SHA-256)</strong> y
              vector de inicialización (IV) de 96 bits aleatorio por mensaje.
            </p>
          </div>
        </div>

        <div className="shrink-0 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-mono-tech">Autenticidad de Datos</span>
          <span className="text-xs font-mono-tech text-emerald-400 font-bold">Anti-Alteración GCM (128-bit Tag)</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'encrypt', label: '1. Cifrar Mensaje (AES-256)', icon: Lock },
          { id: 'decrypt', label: '2. Pegar & Descifrar', icon: Unlock },
          { id: 'contacts', label: '3. Contactos & Consentimiento', icon: UserCheck },
          { id: 'history', label: '4. Historial Cifrado', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
                active
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ENCRYPT */}
      {activeTab === 'encrypt' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
              Escribir y Proteger Mensaje
            </h3>

            <form onSubmit={handleEncrypt} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Destinatario Autorizado:
                </label>
                <select
                  value={selectedRecipientId}
                  onChange={e => setSelectedRecipientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id} disabled={c.status === 'blocked'}>
                      {c.name} ({c.aliasOrPhone}) - {c.status === 'allowed' ? 'Permitido' : 'Bloqueado'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Asunto o Referencia:
                </label>
                <input
                  type="text"
                  value={encryptSubject}
                  onChange={e => setEncryptSubject(e.target.value)}
                  placeholder="Ej: Confirmación de CBU para retiro bancario"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Texto Plano Sensible (Será cifrado localmente):
                </label>
                <textarea
                  rows={4}
                  value={plainText}
                  onChange={e => setPlainText(e.target.value)}
                  placeholder="Escribe aquí datos confidenciales (DNI, CBU, token, etc.)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono-tech"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Clave Secreta de Cifrado (Passphrase):</span>
                  <span className="text-[10px] text-amber-400">Nunca se almacena en el servidor</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={encryptPassword}
                    onChange={e => setEncryptPassword(e.target.value)}
                    placeholder="Introduce una contraseña robusta..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-mono-tech text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={encrypting || !plainText.trim() || !encryptPassword.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-98 text-black font-serif-luxury font-black text-sm tracking-wider shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-black" />
                <span>{encrypting ? 'GENERANDO CIFRADO AES-256...' : 'CIFRAR CON AES-256-GCM'}</span>
              </button>
            </form>
          </div>

          {/* Encrypted Result Card */}
          <div className="md:col-span-5 bg-[#090e18] border border-cyan-500/30 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-mono-tech font-bold tracking-wider text-cyan-400">
                  Carga Cifrada Acorazada (Armored Payload)
                </h4>
                {encryptedResult && (
                  <button
                    onClick={copyArmored}
                    className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-mono-tech flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedArmored ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                )}
              </div>

              {encryptedResult ? (
                <div className="space-y-3 font-mono-tech text-xs">
                  <div className="p-3 bg-black/60 rounded-xl border border-slate-800 break-all text-emerald-400 max-h-48 overflow-y-auto select-all text-[11px] leading-relaxed">
                    {encryptedResult.armoredString}
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500">Algoritmo: </span>
                      <span className="text-cyan-300">{encryptedResult.algorithm} (Tag 128)</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Derivación Clave: </span>
                      <span className="text-amber-300">PBKDF2 SHA-256 (100k iter.)</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Salt (Base64): </span>
                      <span className="text-slate-300">{encryptedResult.salt.slice(0, 16)}...</span>
                    </div>
                    <div>
                      <span className="text-slate-500">IV Vector (Base64): </span>
                      <span className="text-slate-300">{encryptedResult.iv}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                  <Lock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500">
                    El texto cifrado se generará aquí. Podrás copiarlo para enviarlo por WhatsApp, email o soporte
                    sin que nadie pueda leer su contenido sin la clave.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
              Si alguien modifica tan solo 1 bit del texto cifrado, el algoritmo GCM detectará la manipulación
              y rechazará el descifrado.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DECRYPT */}
      {activeTab === 'decrypt' && (
        <div className="max-w-2xl mx-auto bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
              Pegar y Descifrar Mensaje Cifrado
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ingresa la carga acorazada recibida (formato <code>RP-AES256GCM:...</code>) y la clave secreta compartida.
            </p>
          </div>

          <form onSubmit={handleDecrypt} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Texto Cifrado (Armored Payload):
              </label>
              <textarea
                rows={4}
                value={cipherInput}
                onChange={e => setCipherInput(e.target.value)}
                placeholder="Pega aquí el código que empieza con RP-AES256GCM:..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono-tech text-white focus:outline-none focus:border-cyan-500 break-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Contraseña Secreta de Descifrado:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={decryptPassword}
                  onChange={e => setDecryptPassword(e.target.value)}
                  placeholder="Introduce la contraseña correcta..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-mono-tech text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {decryptError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{decryptError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={decrypting || !cipherInput.trim() || !decryptPassword.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-98 text-white font-serif-luxury font-black text-sm tracking-wider shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>{decrypting ? 'DESCIFRANDO Y VERIFICANDO...' : 'DESCIFRAR MENSAJE'}</span>
            </button>
          </form>

          {/* Decrypted Output Card */}
          {decryptedText && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Autenticación GCM Válida: Mensaje Original Recuperado
                </span>
                <span className="font-mono-tech text-[10px]">INTEGRIDAD CONFIRMADA</span>
              </div>
              <div className="p-3 bg-black/60 rounded-lg text-white font-mono-tech text-xs leading-relaxed select-all">
                {decryptedText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONTACTS & CONSENT */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Contacts List */}
          <div className="md:col-span-7 bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
              Agenda de Contactos & Consentimiento
            </h3>

            <div className="space-y-3">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 truncate">{contact.name}</span>
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-mono-tech font-bold ${
                          contact.status === 'allowed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : contact.status === 'blocked'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {contact.status === 'allowed' ? 'PERMITIDO' : contact.status === 'blocked' ? 'BLOQUEADO' : 'PENDIENTE'}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono-tech text-[11px] truncate">
                      {contact.aliasOrPhone}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Consentimiento otorgado: {new Date(contact.consentDate).toLocaleDateString('es-AR')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {contact.status !== 'allowed' && (
                      <button
                        onClick={() => updateContactStatus(contact.id, 'allowed')}
                        className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold"
                        title="Permitir contacto"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {contact.status !== 'blocked' && (
                      <button
                        onClick={() => updateContactStatus(contact.id, 'blocked')}
                        className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold"
                        title="Bloquear contacto"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Contact Form */}
          <div className="md:col-span-5 bg-[#090e18] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs uppercase font-mono-tech font-bold tracking-wider text-cyan-400">
              Registrar Nuevo Contacto
            </h4>

            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={e => setNewContactName(e.target.value)}
                  placeholder="Ej: Lic. Hernán Gómez"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email / Teléfono / Alias:</label>
                <input
                  type="text"
                  value={newContactIdentifier}
                  onChange={e => setNewContactIdentifier(e.target.value)}
                  placeholder="Ej: +54 9 11 9988-7766"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 text-slate-300 text-[11px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newContactConsent}
                    onChange={e => setNewContactConsent(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-cyan-500 mt-0.5"
                  />
                  <span>
                    El contacto prestó consentimiento formal e informado para intercambio de datos cifrados (Ley 25.326).
                  </span>
                </label>
              </div>

              {contactSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs">
                  {contactSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs tracking-wider transition"
              >
                AGREGAR CONTACTO
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
            Bandeja de Mensajes Cifrados Almacenados
          </h3>

          <div className="space-y-3">
            {secureMessages.map(msg => (
              <div
                key={msg.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{msg.subjectHint}</span>
                    <span className="px-2 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono-tech">
                      AES-256-GCM
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono-tech text-[11px]">
                    {new Date(msg.createdAt).toLocaleDateString('es-AR')} {new Date(msg.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Destinatario: <strong className="text-slate-300">{msg.recipientName}</strong></span>
                  <button
                    onClick={() => {
                      setCipherInput(msg.ciphertext);
                      setActiveTab('decrypt');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Abrir en Descifrador</span>
                  </button>
                </div>

                <div className="p-2 rounded bg-black/50 border border-slate-800/80 font-mono-tech text-[10px] text-emerald-400/80 truncate">
                  {msg.ciphertext}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
