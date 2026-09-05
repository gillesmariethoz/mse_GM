# Master Mariethoz — application web

Version en ligne (GitHub Pages) de l'application MSE : tableau de bord, planning, notes,
espace de fichiers par module et lecteur/annotateur de PDF. Même application utilisée
sur PC et sur téléphone, à la même adresse.

Le code ne contient aucun PDF, aucune note ni donnée de cours (voir `.gitignore`). Les
fichiers réels restent dans OneDrive : l'application s'y connecte directement depuis le
navigateur via Microsoft Graph, avec ton compte HES-SO.

## Configurer la connexion OneDrive

Il faut créer une inscription d'application dans Azure/Entra ID (gratuit, une seule fois) :

1. Va sur [entra.microsoft.com](https://entra.microsoft.com) et connecte-toi avec ton compte HES-SO.
2. **Identité** → **Applications** → **Inscriptions d'applications** → **Nouvelle inscription**.
3. Nom : `Master Mariethoz` (libre). Type de compte pris en charge : **Comptes dans cet annuaire organisationnel uniquement** (HES-SO).
4. URI de redirection : type **SPA (application monopage)**, valeur `https://gillesmariethoz.github.io/mse_GM/`.
5. Une fois créée, note le **ID d'application (client)** et l'**ID d'annuaire (locataire)** affichés sur la page de présentation.
6. **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions** → coche `Files.ReadWrite`, `offline_access`, `User.Read` → **Add permissions**.
7. Si un bouton **Grant admin consent** est disponible, clique dessus. S'il est grisé (tu n'es pas administrateur du tenant), la première connexion depuis l'application te demandera ton consentement directement — si HES-SO bloque le consentement utilisateur pour ces permissions, il faudra demander à l'IT HES-SO d'accorder le consentement admin pour cette application.
8. Dans `App-MSE/online/config.local.js` (ce fichier n'est jamais publié sur GitHub), renseigne :
   ```js
   window.MSE_ONEDRIVE_CONFIG = {
     clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Client ID de l'étape 5
     tenantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Tenant ID de l'étape 5
     oneDriveRootPath: '/HES-SO-Master',               // dossier racine dans ton OneDrive
     redirectUri: ''
   };
   ```
9. Republie ce fichier avec le site (attention : comme il est dans `.gitignore`, il faut le déposer manuellement sur chaque appareil, ou l'héberger différemment si tu veux qu'il soit disponible partout — voir remarque ci-dessous).

Tant que `config.local.js` n'est pas rempli, le site affiche « OneDrive à configurer » et
reste utilisable pour le tableau de bord, le planning et les notes (ces pages ne dépendent
pas d'OneDrive).

### Remarque sur `config.local.js` et GitHub Pages

Le Client ID d'une application SPA n'est pas un secret (il est visible dans le trafic
réseau de toute façon), mais il reste hors du dépôt public par choix de conception. Si tu
veux que la connexion fonctionne automatiquement sur tous tes appareils sans copier ce
fichier à la main, tu peux à la place le committer (retire la ligne `config.local.js` du
`.gitignore`) une fois que tu es à l'aise avec le fait qu'il soit visible publiquement sur
GitHub — cela ne donne accès à rien sans que tu te connectes toi-même avec ton compte
HES-SO dans la fenêtre d'authentification Microsoft.

## Structure

- `index.html` — tableau de bord (tâches, progression, questions, sauvegarde) — données locales au navigateur.
- `planning.html` — planning hebdomadaire — données locales au navigateur.
- `notes.html` — suivi des notes et moyennes — données locales au navigateur.
- `workspace.html` — liste des fichiers OneDrive d'un module/section (upload, suppression, ouverture).
- `document.html` — aperçu et annotation des PDF, enregistrement direct dans OneDrive.
- `onedrive.js` — connexion Microsoft (MSAL.js) et appels Microsoft Graph, partagés par `workspace.html`/`document.html`.
