export type ToolCardLanguage = 'en' | 'fr';

export type ToolCard = {
  id: string;
  title: string;
  text: string;
};

export const toolCardsByLanguage: Record<ToolCardLanguage, ToolCard[]> = {
  en: [
    { id: 'breathing', title: 'Breathing exercise', text: 'A simple paced-breathing pause. Follow your comfort; stop if it feels uncomfortable.' },
    { id: 'grounding', title: 'Grounding exercise', text: 'Reconnect with the room around you through your senses.' },
    { id: 'offline-moment', title: 'OFFLINE MOMENT', text: 'Seven unhurried steps to make a little space for the next thing.' },
    { id: 'journal', title: 'Private journaling', text: 'A few prompts for your own thoughts. Nothing is saved or sent.' },
    { id: 'mood', title: 'Mood check-in', text: 'Notice how this moment feels. This is not an assessment or diagnosis.' },
  ],
  fr: [
    { id: 'breathing', title: 'Exercice de respiration', text: 'Une courte pause de respiration rythmée. Suivez votre confort ; arrêtez si cela vous semble inconfortable.' },
    { id: 'grounding', title: 'Exercice de recentrage', text: 'Reconnectez-vous à la pièce autour de vous à travers vos sens.' },
    { id: 'offline-moment', title: 'OFFLINE MOMENT', text: 'Sept étapes sans hâte pour faire un peu de place à la prochaine chose.' },
    { id: 'journal', title: 'Écriture privée', text: 'Quelques invitations pour vos pensées. Rien n’est enregistré ni envoyé.' },
    { id: 'mood', title: 'Vérification de l’humeur', text: 'Notez comment ce moment vous semble. Ce n’est ni une évaluation ni un diagnostic.' },
  ],
};

export const toolCards: ToolCard[] = toolCardsByLanguage.en;

export function getToolCards(language: ToolCardLanguage = 'en') {
  return toolCardsByLanguage[language];
}