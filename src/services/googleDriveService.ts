import { getAccessToken } from '../lib/googleDriveAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  thumbnailLink?: string;
  trashed?: boolean;
}

export interface DriveAboutInfo {
  user?: {
    displayName?: string;
    emailAddress?: string;
    photoLink?: string;
  };
  storageQuota?: {
    limit?: string;
    usage?: string;
    usageInDrive?: string;
    usageInDriveTrash?: string;
  };
}

export const fetchAboutDrive = async (): Promise<DriveAboutInfo | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching Drive about info:', err);
    return null;
  }
};

export const listDriveFiles = async (options: {
  query?: string;
  folderId?: string;
  pageSize?: number;
  mimeTypeFilter?: string;
} = {}): Promise<DriveFileItem[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No hay sesión de Google activa');

  const { query, folderId, pageSize = 40, mimeTypeFilter } = options;

  const conditions: string[] = ['trashed = false'];

  if (folderId) {
    conditions.push(`'${folderId}' in parents`);
  }

  if (query && query.trim()) {
    conditions.push(`name contains '${query.replace(/'/g, "\\'")}'`);
  }

  if (mimeTypeFilter && mimeTypeFilter !== 'all') {
    if (mimeTypeFilter === 'folder') {
      conditions.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (mimeTypeFilter === 'document') {
      conditions.push("(mimeType contains 'document' or mimeType contains 'text' or mimeType contains 'pdf')");
    } else if (mimeTypeFilter === 'spreadsheet') {
      conditions.push("(mimeType contains 'spreadsheet' or mimeType contains 'sheet' or mimeType contains 'csv')");
    } else if (mimeTypeFilter === 'image') {
      conditions.push("mimeType contains 'image/'");
    }
  }

  const q = encodeURIComponent(conditions.join(' and '));
  const fields = encodeURIComponent(
    'files(id, name, mimeType, iconLink, webViewLink, webContentLink, createdTime, modifiedTime, size, thumbnailLink)'
  );

  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=${pageSize}&orderBy=folder desc,modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error al listar archivos: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
};

export const createDriveFolder = async (folderName: string, parentId?: string): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No hay sesión de Google activa');

  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al crear carpeta');
  }

  return await res.json();
};

export const uploadTextFileToDrive = async (
  filename: string,
  content: string,
  mimeType: string = 'text/plain',
  parentId?: string
): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No hay sesión de Google activa');

  const metadata: Record<string, any> = {
    name: filename,
    mimeType,
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al subir archivo a Google Drive');
  }

  return await res.json();
};

export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No hay sesión de Google activa');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al eliminar archivo');
  }

  return true;
};
