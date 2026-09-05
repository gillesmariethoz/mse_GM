# Master Mariethoz — application web

Version en ligne (GitHub Pages) de l'application MSE : tableau de bord, planning et
suivi des notes. Même application utilisée sur PC et sur téléphone, à la même adresse.

Le code ne contient aucun PDF, aucune note ni donnée de cours (voir `.gitignore`).

## Accès aux fichiers de cours

Pas de connexion OAuth/Azure ici (ça a été tenté, bloqué par les restrictions du tenant
HES-SO et par la détection anti-fraude de Microsoft sur les comptes personnels — voir
l'historique de conversation si besoin de refaire cette tentative un jour).

À la place : `workspace.html` propose, pour chaque module/section, un lien direct qui
ouvre le vrai dossier dans **OneDrive** :
- Sur PC → s'ouvre dans OneDrive sur le web, dans ton navigateur.
- Sur téléphone → s'ouvre directement dans l'app OneDrive (déjà connectée à ton compte
  HES-SO), qui sait nativement prévisualiser, dessiner/annoter un PDF et l'enregistrer
  directement — sans étape de téléchargement/ré-upload manuel.

Ajouter ou supprimer un fichier dans un dossier ne nécessite aucun changement de code :
le lien pointe vers le dossier, OneDrive affiche toujours son contenu à jour. Un nouveau
**dossier/module** (ex. un semestre suivant) nécessite en revanche de mettre à jour la
liste dans `onedrive-links.js`.

## Structure

- `index.html` — tableau de bord (tâches, progression, questions, sauvegarde) — données locales au navigateur.
- `planning.html` — planning hebdomadaire — données locales au navigateur.
- `notes.html` — suivi des notes et moyennes — données locales au navigateur.
- `workspace.html` — liens directs vers les dossiers OneDrive d'un module/section.
- `onedrive-links.js` — construit les URL OneDrive (chemin du dossier racine, mapping module/section).
- `branding.js` — habillage commun (en-tête, pied de page, navigation) partagé par toutes les pages.

## Mettre à jour le chemin OneDrive

Si le dossier racine change (renommage, déplacement, autre compte), modifie la constante
`ROOT` dans `onedrive-links.js`. Pour la retrouver : ouvre le dossier concerné sur
[onedrive.com](https://onedrive.com), et copie la partie `id=...` de l'URL (décodée) de la
barre d'adresse.
