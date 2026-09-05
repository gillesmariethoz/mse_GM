// Copie ce fichier en "config.local.js" (déjà ignoré par git) et remplis les valeurs
// obtenues lors de la création de l'inscription d'application dans Azure/Entra ID.
// Voir README.md pour la procédure complète.
window.MSE_ONEDRIVE_CONFIG = {
  clientId: '',           // Client ID (ID d'application) de l'inscription
  tenantId: '',           // Tenant ID du tenant HES-SO (ou "organizations")
  oneDriveRootPath: '/HES-SO-Master', // Chemin du dossier racine dans OneDrive
  redirectUri: ''         // Laisser vide pour utiliser l'URL de la page courante
};
