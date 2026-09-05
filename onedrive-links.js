window.MSEOneDriveLinks = (() => {
  const MODULES = ['01_FTP_Physics', '02_MA_HYBRD', '03_FTP_ModSim', '04_FTP_Multiphy', '05_CM_QRM-A', '06_FTP_OrdDiff-A', '07_TSM_FMechHeat', '08_TSM_CSM-A', '09_CM_AdvProjMgmt', '10_FTP_CompAlg', '11_MA_CFD'];
  const SECTIONS = { cours: '01_Cours', exercices: '02_Exercices', projets: '03_Projets', resumes: '04_Resumes' };
  const SITE = 'https://hessoit-my.sharepoint.com/my?id=';
  const ROOT = '/personal/gilles_marietho_hes-so_ch/Documents/HES-SO-Master/semestre 1';
  const folderPath = (module, section) => `${ROOT}/${MODULES[module]}/${SECTIONS[section]}`;
  const folderUrl = (module, section) => SITE + encodeURIComponent(folderPath(module, section));
  const fileUrl = (module, section, name) => {
    const folder = folderPath(module, section);
    return `${SITE}${encodeURIComponent(`${folder}/${name}`)}&parent=${encodeURIComponent(folder)}`;
  };
  return { MODULES, SECTIONS, folderUrl, fileUrl };
})();
