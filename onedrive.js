window.MSEOneDrive = (() => {
  const cfg = window.MSE_ONEDRIVE_CONFIG || {};
  const MODULES = ['01_FTP_Physics', '02_MA_HYBRD', '03_FTP_ModSim', '04_FTP_Multiphy', '05_CM_QRM-A', '06_FTP_OrdDiff-A', '07_TSM_FMechHeat', '08_TSM_CSM-A', '09_CM_AdvProjMgmt', '10_FTP_CompAlg', '11_MA_CFD'];
  const SECTIONS = { cours: '01_Cours', exercices: '02_Exercices', projets: '03_Projets', resumes: '04_Resumes' };
  const SCOPES = ['Files.ReadWrite', 'offline_access', 'User.Read'];
  const PREVIEWABLE = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
  let msalApp = null, account = null;

  const configured = () => Boolean(cfg.clientId);
  const previewable = name => PREVIEWABLE.includes(name.split('.').pop().toLowerCase());

  function ensureMsal() {
    if (msalApp) return msalApp;
    if (!window.msal) throw new Error('MSAL non chargé');
    msalApp = new msal.PublicClientApplication({
      auth: {
        clientId: cfg.clientId,
        authority: `https://login.microsoftonline.com/${cfg.tenantId || 'organizations'}`,
        redirectUri: cfg.redirectUri || (location.origin + location.pathname.replace(/[^/]*$/, ''))
      },
      cache: { cacheLocation: 'localStorage' }
    });
    const accounts = msalApp.getAllAccounts();
    if (accounts.length) account = accounts[0];
    return msalApp;
  }

  async function signIn() {
    const app = ensureMsal();
    const result = await app.loginPopup({ scopes: SCOPES });
    account = result.account;
    return account;
  }

  async function signOut() {
    const app = ensureMsal();
    if (account) await app.logoutPopup({ account });
    account = null;
  }

  const isConnected = () => { ensureMsal(); return Boolean(account); };
  const getAccountLabel = () => account ? (account.username || account.name || '') : '';

  async function getToken() {
    const app = ensureMsal();
    if (!account) throw new Error('not-connected');
    try {
      const result = await app.acquireTokenSilent({ scopes: SCOPES, account });
      return result.accessToken;
    } catch {
      const result = await app.acquireTokenPopup({ scopes: SCOPES, account });
      return result.accessToken;
    }
  }

  function folderPath(module, section) {
    const mod = MODULES[module], sec = SECTIONS[section];
    if (!mod || !sec) throw new Error('invalid-path');
    const root = (cfg.oneDriveRootPath || '/HES-SO-Master').replace(/\/+$/, '');
    return `${root}/semestre 1/${mod}/${sec}`;
  }
  const filePath = (module, section, name) => `${folderPath(module, section)}/${name}`;
  const encodePath = path => path.split('/').map(encodeURIComponent).join('/');

  async function graphFetch(path, options = {}) {
    const token = await getToken();
    return fetch(`https://graph.microsoft.com/v1.0${path}`, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` } });
  }

  async function listChildren(module, section) {
    const response = await graphFetch(`/me/drive/root:${encodePath(folderPath(module, section))}:/children?$select=name,size,lastModifiedDateTime,file,webUrl`);
    if (response.status === 404) return [];
    if (!response.ok) throw new Error('graph-list-failed');
    const data = await response.json();
    return (data.value || []).filter(item => item.file).map(item => ({
      name: item.name, size: item.size, modified: new Date(item.lastModifiedDateTime).getTime(), webUrl: item.webUrl
    })).sort((a, b) => b.modified - a.modified);
  }

  async function getFileBytes(module, section, name) {
    const meta = await graphFetch(`/me/drive/root:${encodePath(filePath(module, section, name))}?$select=id`);
    if (!meta.ok) throw new Error('graph-get-meta-failed');
    const { id } = await meta.json();
    const response = await graphFetch(`/me/drive/items/${id}/content`);
    if (!response.ok) throw new Error('graph-download-failed');
    return response.arrayBuffer();
  }

  async function putFileBytes(module, section, name, bytes, contentType, overwrite) {
    const path = encodePath(filePath(module, section, name));
    if (!overwrite) {
      const exists = await graphFetch(`/me/drive/root:${path}?$select=id`);
      if (exists.ok) { const error = new Error('exists'); error.code = 'exists'; throw error; }
    }
    if (bytes.byteLength <= 4 * 1024 * 1024) {
      const response = await graphFetch(`/me/drive/root:${path}:/content`, { method: 'PUT', headers: { 'Content-Type': contentType || 'application/octet-stream' }, body: bytes });
      if (!response.ok) throw new Error('graph-put-failed');
      return response.json();
    }
    const sessionResponse = await graphFetch(`/me/drive/root:${path}:/createUploadSession`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item: { '@microsoft.graph.conflictBehavior': 'replace' } }) });
    if (!sessionResponse.ok) throw new Error('graph-session-failed');
    const { uploadUrl } = await sessionResponse.json();
    const chunkSize = 320 * 1024 * 10;
    let offset = 0, lastResponse;
    while (offset < bytes.byteLength) {
      const end = Math.min(offset + chunkSize, bytes.byteLength);
      const chunk = bytes.slice(offset, end);
      lastResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Length': String(chunk.byteLength), 'Content-Range': `bytes ${offset}-${end - 1}/${bytes.byteLength}` }, body: chunk });
      if (!lastResponse.ok && lastResponse.status !== 202) throw new Error('graph-chunk-failed');
      offset = end;
    }
    return lastResponse.status === 202 ? {} : lastResponse.json().catch(() => ({}));
  }

  async function deleteItem(module, section, name) {
    const response = await graphFetch(`/me/drive/root:${encodePath(filePath(module, section, name))}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 404) throw new Error('graph-delete-failed');
  }

  async function openItem(module, section, name) {
    const meta = await graphFetch(`/me/drive/root:${encodePath(filePath(module, section, name))}?$select=webUrl`);
    if (!meta.ok) throw new Error('graph-get-meta-failed');
    const { webUrl } = await meta.json();
    window.open(webUrl, '_blank', 'noopener');
  }

  return { configured, previewable, signIn, signOut, isConnected, getAccountLabel, listChildren, getFileBytes, putFileBytes, deleteItem, openItem, MODULES, SECTIONS };
})();
