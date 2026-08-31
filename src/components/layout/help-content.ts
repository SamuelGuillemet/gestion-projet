import {
  Archive,
  BarChart3,
  Clock,
  FileText,
  FolderKanban,
  GitBranch,
  KanbanSquare,
  Keyboard,
  LayoutDashboard,
  Link2,
  ListTree,
  type LucideIcon,
  Rocket,
  Search,
  Settings,
  Tags,
} from "lucide-react";

export type HelpSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  paragraphs: string[];
  bullets?: string[];
};

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "overview",
    title: "Vue d'ensemble",
    icon: Rocket,
    paragraphs: [
      "Cette application est un gestionnaire de projets type Trello, entièrement local : aucune donnée n'est envoyée sur un serveur, tout est stocké dans le navigateur (IndexedDB).",
      "Chaque projet regroupe des tâches, des questions, des livrables, une note markdown et des saisies de temps.",
      "L'application propose deux espaces de navigation, accessibles via les onglets à gauche de la barre du haut : le Dashboard (vue transverse, tous projets confondus) et la vue Projet (le détail d'un projet). Le bouton « Dashboard » ou le sélecteur de projet, à droite de la barre, permet de passer de l'un à l'autre.",
    ],
    bullets: [
      "Dashboard → Overview : cartes de synthèse par projet",
      "Dashboard → Suivi : tâches à venir, bloquées et informations importantes",
      "Dashboard → Rapport : rapport d'activité et temps passé tous projets confondus",
      "Dashboard → Gestion : tags, sauvegardes et import/export",
      "Vue Projet → Board, Backlog, Notes, Temps : contenu du projet actif",
    ],
  },
  {
    id: "projects",
    title: "Projets & navigation",
    icon: FolderKanban,
    paragraphs: [
      "Depuis le Dashboard, cliquez sur une carte de projet (Overview) ou sur « Ouvrir un projet » (en haut à droite) pour entrer dans la vue Projet de ce projet ; elle s'ouvre par défaut sur le Board.",
      "Une fois dans la vue Projet, le sélecteur de projet (en haut à droite) permet de changer de projet actif, ainsi que de créer, renommer, changer la couleur/description ou supprimer le projet en cours. Le bouton « Dashboard » à côté ramène vers le Dashboard.",
      "Le sélecteur de projet n'est visible que dans la vue Projet ; depuis le Dashboard, seul le bouton « Ouvrir un projet » est proposé.",
      "Supprimer un projet supprime en cascade toutes ses tâches, questions, livrables, notes, jalons et saisies de temps. Cette action est irréversible : pensez à exporter ou créer un backup avant de supprimer un projet important.",
    ],
  },
  {
    id: "dashboard-overview",
    title: "Dashboard : Overview",
    icon: LayoutDashboard,
    paragraphs: [
      "La page Overview du Dashboard est la page d'accueil de l'application : elle donne une vue d'ensemble de tous les projets.",
      "Le bandeau d'en-tête résume le nombre de tâches en cours, à faire et bloquées, tous projets confondus, avec un filtre pour masquer certains projets de cette vue.",
      "La section « Projets » affiche, pour chaque projet, une barre de progression, des compteurs (en cours / en attente / à faire / temps passé cette semaine) et un badge pour les questions sans réponse.",
      "Cliquer sur une carte de projet ouvre directement ce projet sur son Board.",
      "La section « Tâches à venir » liste les tâches dont l'échéance est proche ou dépassée, avec projet, statut, priorité, taille et date d'échéance.",
      "La section « En attente » regroupe les tâches bloquées et les questions sans réponse.",
      "La section « Informations importantes » signale les tâches restées inactives depuis longtemps (stagnantes).",
      "Cliquer sur un élément de ces listes ouvre directement le détail de la tâche ou de la question concernée.",
    ],
  },
  {
    id: "dashboard-rapport",
    title: "Dashboard : Rapport",
    icon: BarChart3,
    paragraphs: [
      "La page Rapport du Dashboard propose un rapport d'activité tous projets confondus.",
      "Le sélecteur de plage de dates permet de suivre l'avancement par projet sur une période choisie (jours prévus vs réalisé, dépassement).",
      "Le récapitulatif quotidien (vues « Liste » ou « Calendrier ») détaille le temps passé jour par jour et projet par projet.",
    ],
  },
  {
    id: "dashboard-gestion",
    title: "Dashboard : Gestion",
    icon: Settings,
    paragraphs: [
      "La page Gestion du Dashboard regroupe, sous forme d'onglets, les réglages transverses de l'application.",
    ],
    bullets: [
      "Tags : créer, renommer, recolorer ou supprimer les tags globaux utilisables sur les tâches",
      "Backups : créer, restaurer ou supprimer des snapshots de l'ensemble des données",
      "Import / Export : exporter toutes les données en JSON, ou importer un fichier précédemment exporté",
    ],
  },
  {
    id: "board",
    title: "Projet : Board (Kanban)",
    icon: KanbanSquare,
    paragraphs: [
      "Le Board affiche les tâches du projet actif sous forme de colonnes (statuts) que vous pouvez glisser-déposer d'une colonne à l'autre pour changer leur statut.",
      "Le champ en haut permet d'ajouter rapidement une tâche (touche Entrée ou bouton Ajouter) ; elle est créée dans la première colonne.",
      "Cliquer sur une carte ouvre le détail complet de la tâche : titre, description, statut, priorité, taille, échéance, tags, temps passé, relations et références.",
      "Les tags colorés et badges affichés sur chaque carte permettent d'identifier rapidement son état (retard, blocage, etc.).",
    ],
  },
  {
    id: "backlog",
    title: "Projet : Backlog",
    icon: ListTree,
    paragraphs: [
      "Le Backlog présente une arborescence complète du projet actif : tâches, questions et livrables classés par sections.",
      "Vous pouvez ajouter un élément directement depuis la ligne d'ajout de chaque section, et filtrer la liste par tag.",
      "Cliquer sur une ligne ouvre un panneau de détail dédié (tâche, question ou livrable) permettant de modifier tous les champs, sans quitter la vue backlog.",
      "C'est la vue la plus exhaustive pour parcourir et éditer tout le contenu d'un projet, y compris les livrables (non visibles dans le Board).",
    ],
  },
  {
    id: "notes",
    title: "Projet : Notes",
    icon: FileText,
    paragraphs: [
      "Chaque projet dispose d'un espace de prise de notes au format markdown, avec possibilité de créer plusieurs fichiers de notes.",
      "L'éditeur propose un aperçu markdown en direct (rendu à côté ou au-dessus de la zone d'édition), la prise en charge des images collées/insérées, et des diagrammes Mermaid (flowcharts, séquences, etc. dans un bloc de code ```mermaid).",
      "Vous pouvez référencer des tâches, questions, livrables ou d'autres notes directement dans le texte grâce à la syntaxe de référence (voir section « Références & liens »).",
    ],
  },
  {
    id: "time",
    title: "Projet : Temps",
    icon: Clock,
    paragraphs: [
      "L'onglet Temps permet de saisir le temps passé chaque jour sur une tâche du projet actif ; les saisies peuvent être corrigées ou supprimées depuis cet onglet.",
      "La saisie du temps peut aussi se faire directement depuis le détail d'une tâche via la section « Temps passé ».",
      "Le récapitulatif (« Recap ») agrège le temps passé par projet et par tâche.",
      "La frise des jalons (« Milestones ») affiche les dates clés du projet sur une timeline.",
      "Pour un rapport d'activité tous projets confondus, voir la page « Rapport » du Dashboard.",
    ],
  },
  {
    id: "search",
    title: "Recherche globale",
    icon: Search,
    paragraphs: [
      "La recherche globale (bouton centré dans la barre du haut, ou raccourci clavier) permet de retrouver instantanément une tâche, question, livrable ou note dans tous les projets, quelle que soit la vue active.",
      "Utilisez les flèches haut/bas pour naviguer dans les résultats et Entrée pour ouvrir l'élément sélectionné ; l'ouverture bascule automatiquement sur le projet et la vue concernés et affiche le détail de l'élément.",
    ],
  },
  {
    id: "references",
    title: "Références & liens",
    icon: Link2,
    paragraphs: [
      "Dans les descriptions et les notes, vous pouvez créer des liens rapides vers d'autres éléments grâce à des préfixes suivis du numéro de l'élément :",
    ],
    bullets: [
      "#12 → renvoie vers la tâche n°12",
      "?5 → renvoie vers la question n°5",
      "!3 → renvoie vers le livrable n°3",
      "%2 → renvoie vers la note n°2",
    ],
  },
  {
    id: "relations",
    title: "Relations",
    icon: GitBranch,
    paragraphs: [
      "En plus des références textuelles, les tâches, questions et livrables peuvent être reliés entre eux via le gestionnaire de relations disponible dans leur panneau de détail.",
      "Ces relations permettent de matérialiser des dépendances ou des liens logiques (ex. une tâche bloquée par une question) et apparaissent sous forme de badges cliquables dans le détail de chaque élément.",
    ],
  },
  {
    id: "backups",
    title: "Sauvegardes & données",
    icon: Archive,
    paragraphs: [
      "Toutes les données sont stockées uniquement dans le navigateur (IndexedDB). Vider les données du navigateur ou changer de machine/navigateur fait perdre l'accès aux données si aucune sauvegarde n'a été faite.",
      "Ces options sont regroupées dans Dashboard → Gestion, sous les onglets « Import / Export » et « Backups ».",
      "« Exporter » télécharge un fichier JSON contenant l'intégralité des données de l'application (tous projets confondus). « Importer » remplace les données actuelles par celles d'un fichier JSON exporté précédemment ; un snapshot de sécurité est créé automatiquement avant l'import, et la page se recharge une fois l'import terminé.",
      "L'onglet « Backups » permet de créer des snapshots manuels, et un snapshot automatique est créé toutes les heures si nécessaire. Vous pouvez restaurer un snapshot (un snapshot de sécurité est aussi créé juste avant la restauration) ou en supprimer.",
      "Recommandation : exportez régulièrement vos données ou créez un snapshot manuel avant toute opération risquée (import, suppression de projet).",
    ],
  },
  {
    id: "tags",
    title: "Tags",
    icon: Tags,
    paragraphs: [
      "Le gestionnaire de tags (Dashboard → Gestion → onglet « Tags ») permet de créer, renommer, recolorer ou supprimer des tags globaux, utilisables sur les tâches.",
      "Chaque tag a un nom et une couleur (choisie librement via le sélecteur de couleur) ; une couleur aléatoire est proposée par défaut pour un nouveau tag.",
      "Supprimer un tag ne retire pas automatiquement sa référence des tâches qui l'utilisaient déjà (voir limitations connues dans le code) : vérifiez les tâches concernées après suppression.",
    ],
  },
  {
    id: "shortcuts",
    title: "Raccourcis clavier",
    icon: Keyboard,
    bullets: [
      "Ctrl/Cmd + K → ouvrir la recherche globale",
      "Flèches haut/bas → naviguer dans les résultats de recherche",
      "Entrée → valider un champ d'ajout rapide (tâche, tag, ...) ou ouvrir le résultat sélectionné",
      "Alt (maintenu) + A → basculer entre le Dashboard et les projets, comme Alt+Tab (+ Maj pour l'ordre inverse)",
    ],
    paragraphs: [],
  },
];
