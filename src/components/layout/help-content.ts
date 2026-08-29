import {
  Archive,
  Clock,
  FileText,
  FolderKanban,
  GitBranch,
  KanbanSquare,
  Keyboard,
  Link2,
  List,
  type LucideIcon,
  Rocket,
  Search,
  Tags,
  Target,
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
      "La navigation se fait via les 5 onglets en haut de l'écran : Focus, Board, Backlog, Notes et Temps. Le projet actif (sélecteur en haut à gauche) détermine les données affichées dans chaque onglet.",
    ],
    bullets: [
      "Focus : vue d'ensemble quotidienne et priorités",
      "Board : tableau kanban avec drag & drop",
      "Backlog : arborescence complète du projet",
      "Notes : prise de notes markdown par projet",
      "Temps : saisie et récapitulatif du temps passé",
    ],
  },
  {
    id: "projects",
    title: "Projets",
    icon: FolderKanban,
    paragraphs: [
      "Le sélecteur de projet (en haut à gauche) permet de créer, renommer, changer la couleur/description ou supprimer un projet.",
      "Le projet actif détermine les données affichées dans Focus, Board, Backlog, Notes et Temps ; changez de projet à tout moment via ce sélecteur.",
      "Supprimer un projet supprime en cascade toutes ses tâches, questions, livrables, notes, jalons et saisies de temps. Cette action est irréversible : pensez à exporter ou créer un backup avant de supprimer un projet important.",
    ],
  },
  {
    id: "focus",
    title: "Focus",
    icon: Target,
    paragraphs: [
      "L'onglet Focus donne une vue d'ensemble de tous les projets et met en avant ce qui nécessite votre attention aujourd'hui.",
      "Le bandeau d'en-tête résume le nombre de tâches en cours, à faire et bloquées, tous projets confondus.",
      "La section « Projets » affiche, pour chaque projet, une barre de progression, des compteurs (en cours / bloqué / à faire / temps passé cette semaine) et des badges pour les questions sans réponse, tâches en retard ou à échéance proche.",
      "La section « Tâches à venir » liste les tâches dont l'échéance est proche ou dépassée, avec projet, statut, priorité, taille et date d'échéance.",
      "La section « En attente » regroupe les tâches bloquées et les questions sans réponse.",
      "La section « Informations importantes » signale les tâches restées inactives depuis longtemps (stagnantes).",
      "Cliquer sur un élément de ces listes ouvre directement le détail de la tâche ou de la question concernée.",
    ],
  },
  {
    id: "board",
    title: "Board (Kanban)",
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
    title: "Backlog",
    icon: List,
    paragraphs: [
      "Le Backlog présente une arborescence complète du projet actif : tâches, questions et livrables classés par sections.",
      "Vous pouvez ajouter un élément directement depuis la ligne d'ajout de chaque section, et filtrer la liste par tag.",
      "Cliquer sur une ligne ouvre un panneau de détail dédié (tâche, question ou livrable) permettant de modifier tous les champs, sans quitter la vue backlog.",
      "C'est la vue la plus exhaustive pour parcourir et éditer tout le contenu d'un projet, y compris les livrables (non visibles dans le Board).",
    ],
  },
  {
    id: "notes",
    title: "Notes",
    icon: FileText,
    paragraphs: [
      "Chaque projet dispose d'un espace de prise de notes au format markdown, avec possibilité de créer plusieurs fichiers de notes.",
      "L'éditeur propose un aperçu markdown en direct (rendu à côté ou au-dessus de la zone d'édition), la prise en charge des images collées/insérées, et des diagrammes Mermaid (flowcharts, séquences, etc. dans un bloc de code ```mermaid).",
      "Vous pouvez référencer des tâches, questions, livrables ou d'autres notes directement dans le texte grâce à la syntaxe de référence (voir section « Références & liens »).",
    ],
  },
  {
    id: "time",
    title: "Temps",
    icon: Clock,
    paragraphs: [
      "L'onglet Temps permet de saisir le temps passé chaque jour sur une tâche du projet actif.",
      "Les saisies peuvent être corrigées ou supprimées depuis l'onglet Temps.",
      "La saisie du temps peuit se faire directement depuis le détail d'une tâche via la section « Temps passé ».",
      "Le récapitulatif (« Recap ») agrège le temps passé par projet et par tâche.",
      "La frise des jalons (« Milestones ») affiche les dates clés du projet sur une timeline.",
      "Le rapport d'activité (icône dans la barre d'outils du haut) propose des vues journalière et hebdomadaire, avec un sélecteur de période, pour visualiser le temps passé tous projets confondus.",
    ],
  },
  {
    id: "tags",
    title: "Tags",
    icon: Tags,
    paragraphs: [
      "Le gestionnaire de tags (icône Tags dans la barre d'outils du haut) permet de créer, renommer, recolorer ou supprimer des tags globaux, utilisables sur les tâches.",
      "Chaque tag a un nom et une couleur (choisie librement via le sélecteur de couleur) ; une couleur aléatoire est proposée par défaut pour un nouveau tag.",
      "Supprimer un tag ne retire pas automatiquement sa référence des tâches qui l'utilisaient déjà (voir limitations connues dans le code) : vérifiez les tâches concernées après suppression.",
    ],
  },
  {
    id: "search",
    title: "Recherche globale",
    icon: Search,
    paragraphs: [
      "La recherche globale (barre en haut, ou raccourci clavier) permet de retrouver instantanément une tâche, question, livrable ou note dans tous les projets.",
      "Utilisez les flèches haut/bas pour naviguer dans les résultats et Entrée pour ouvrir l'élément sélectionné ; l'ouverture affiche directement le détail de l'élément.",
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
      "« Exporter » télécharge un fichier JSON contenant l'intégralité des données de l'application (tous projets confondus).",
      "« Importer » remplace les données actuelles par celles d'un fichier JSON exporté précédemment ; un snapshot de sécurité est créé automatiquement avant l'import, et la page se recharge une fois l'import terminé.",
      "Le gestionnaire de « Backups » permet de créer des snapshots manuels, et un snapshot automatique est créé toutes les heures si nécessaire. Vous pouvez restaurer un snapshot (un snapshot de sécurité est aussi créé juste avant la restauration) ou en supprimer.",
      "Recommandation : exportez régulièrement vos données ou créez un snapshot manuel avant toute opération risquée (import, suppression de projet).",
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
    ],
    paragraphs: [],
  },
];
