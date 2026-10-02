export type FAQItem = { question: string; answer: string };
export type FAQLanguage = 'en' | 'fr';

export const faqByLanguage: Record<FAQLanguage, FAQItem[]> = {
  en: [
    { question: 'Why do I overthink everything at night?', answer: 'Quiet moments can leave more room for thoughts to repeat. That does not tell you what is wrong. You could write the thought down, return to a low-pressure activity, or talk it through with someone you trust.' },
    { question: "Why do I feel lonely even when I'm around people?", answer: 'Being physically near others does not always mean feeling understood or connected. Consider what kind of connection you are missing, and whether there is one person you could be more open with.' },
    { question: "Why don't I feel anything anymore?", answer: 'Feeling numb or distant can have many possible reasons. You do not need to figure it out alone; if it persists or worries you, consider talking with a qualified professional.' },
    { question: 'Why can’t I motivate myself?', answer: 'Motivation can shift with stress, rest, health, and circumstances. Try making a task very small and consider whether you need support or a pause rather than more pressure.' },
    { question: 'Can stress affect my sleep?', answer: 'Stress and sleep can influence one another for some people. If sleep difficulty is persistent or affecting your days, consider discussing it with a qualified professional.' },
    { question: 'Can anxiety cause physical symptoms?', answer: 'Worry and intense feelings may be accompanied by physical sensations, but physical symptoms can have many causes. New, severe, or concerning symptoms should be discussed with a qualified health professional.' },
    { question: 'How do I know if I should see a psychologist?', answer: 'You can seek support whenever you want help understanding what you are experiencing or it is affecting your life. You do not need to wait until things feel unbearable.' },
    { question: 'What happens during a first appointment with a psychologist?', answer: 'It can vary. You might ask about the professional’s approach, confidentiality, cost, and what to expect. You can share at a pace that feels manageable.' },
    { question: 'How can I help someone who is struggling?', answer: 'Listen, show care without judgment, ask what would help, and encourage them to connect with qualified support. If there is immediate danger, seek urgent in-person help.' },
    { question: 'What should I do if someone tells me they want to die?', answer: 'Take them seriously, listen without judgment, and ask whether they are in immediate danger. Stay with them if it is safe and seek urgent in-person support. Do not promise to keep immediate danger secret.' },
    { question: 'Is it normal to feel overwhelmed?', answer: 'Many people feel overwhelmed at times. The feeling is real, and it can help to focus on one small step and ask for support.' },
    { question: "What can I do when I can't sleep?", answer: 'Try lowering the pressure to sleep, and consider a quiet activity for a while. If the difficulty continues, a health professional can help explore it.' },
    { question: 'How can I stop overthinking?', answer: 'You may not be able to switch thoughts off instantly. Writing them down, grounding in the present, or choosing a time to revisit a concern can sometimes make it easier to shift attention.' },
    { question: 'How do I deal with a breakup?', answer: 'Give yourself time, reach out to someone you trust, and focus on basic care. If you feel unsafe or unable to cope, seek support from a qualified professional.' },
  ],
  fr: [
    { question: 'Pourquoi est-ce que je pense à tout à longueur de nuit ?', answer: 'Les moments calmes peuvent laisser plus de place aux pensées pour se répéter. Cela ne veut pas dire qu’il y a quelque chose de « faux » chez vous. Vous pouvez écrire la pensée, reprendre une activité sans pression ou en parler à une personne de confiance.' },
    { question: 'Pourquoi me sens-je seul·e même quand je suis entouré·e ?', answer: 'Être physiquement près des autres ne veut pas toujours dire se sentir compris ou connecté. Réfléchissez au type de lien qui vous manque et à la personne avec qui vous pourriez être plus ouvert·e.' },
    { question: 'Pourquoi je ne sens plus rien ?', answer: 'Se sentir engourdi ou distant peut avoir plusieurs causes possibles. Vous n’avez pas besoin de le comprendre seul·e ; si cela persiste ou vous inquiète, pensez à parler à un professionnel qualifié.' },
    { question: 'Pourquoi je n’ai plus de motivation ?', answer: 'La motivation peut varier selon le stress, le repos, la santé et les circonstances. Essayez de rendre une tâche très petite et considérez si vous avez besoin d’un soutien ou d’une pause plutôt que plus de pression.' },
    { question: 'Le stress peut-il affecter mon sommeil ?', answer: 'Le stress et le sommeil peuvent s’influencer mutuellement pour certaines personnes. Si les difficultés de sommeil persistent ou affectent votre journée, pensez à en parler à un professionnel qualifié.' },
    { question: 'L’anxiété peut-elle provoquer des symptômes physiques ?', answer: 'L’inquiétude et les émotions intenses peuvent s’accompagner de sensations physiques, mais les symptômes physiques peuvent avoir de nombreuses causes. Les symptômes nouveaux, graves ou inquiétants devraient être discutés avec un professionnel de santé qualifié.' },
    { question: 'Comment savoir si je dois voir un psychologue ?', answer: 'Vous pouvez demander un soutien dès que vous souhaitez comprendre ce que vous vivez ou que cela affecte votre vie. Vous n’avez pas besoin d’attendre que les choses deviennent insupportables.' },
    { question: 'Que se passe-t-il lors d’un premier rendez-vous avec un psychologue ?', answer: 'Cela peut varier. Vous pouvez demander quelle est son approche, la confidentialité, le coût et à quoi vous attendre. Vous pouvez partager à un rythme qui vous semble gérable.' },
    { question: 'Comment puis-je aider quelqu’un qui traverse une difficulté ?', answer: 'Écoutez, montrez de la considération sans jugement, demandez ce qui aiderait et encouragez-la ou -le à se rapprocher d’un soutien qualifié. S’il y a un danger immédiat, cherchez une aide urgente en personne.' },
    { question: 'Que faire si quelqu’un me dit qu’il veut mourir ?', answer: 'Prenez-le au sérieux, écoutez sans jugement et demandez s’il y a un danger immédiat. Restez avec lui ou elle si c’est sûr et cherchez une aide urgente en personne. Ne promettez pas de garder un danger immédiat secret.' },
    { question: 'Est-il normal de se sentir dépassé·e ?', answer: 'Beaucoup de gens se sentent dépassés à un moment donné. Le ressenti est réel, et il peut aider de se concentrer sur une petite étape et demander de l’aide.' },
    { question: 'Que faire quand je ne peux pas dormir ?', answer: 'Essayez de réduire la pression pour dormir et envisagez une activité calme pendant un moment. Si la difficulté persiste, un professionnel de santé peut aider à l’explorer.' },
    { question: 'Comment puis-je arrêter de trop penser ?', answer: 'Vous n’allez pas forcément pouvoir arrêter les pensées instantanément. Les écrire, revenir au présent ou choisir un moment pour revisiter une préoccupation peut parfois rendre le changement d’attention plus facile.' },
    { question: 'Comment gérer une rupture ?', answer: 'Donnez-vous du temps, contactez une personne de confiance et concentrez-vous sur les besoins de base. Si vous vous sentez en danger ou incapable de faire face, cherchez le soutien d’un professionnel qualifié.' },
  ],
};

export const faq: FAQItem[] = faqByLanguage.en;

export function getFaq(language: FAQLanguage = 'en') {
  return faqByLanguage[language];
}