// app/email-preview/page.tsx
// Preview page for Yehoshua Focus emails during development

import YehoshuaFocusEmail from "@/emails/yehoshua-focus-template";
import YehoshuaReplyEmail from "@/emails/yehoshua-reply-template";

export default function EmailPreviewPage() {
  const sessions = [
    {
      title: "L'Intention",
      prompt: "Quelle est l'unique chose qui mérite ton attention aujourd'hui ? Pourquoi ?",
      subtext: "Définis ton critère de succès pour ce soir.",
      moment: "morning" as const,
    },
    {
      title: "La Vérité",
      prompt: "Es-tu toujours aligné avec ton intention du matin ? Quel bruit as-tu laissé entrer ?",
      subtext: "Identifie la distraction. Corrige la trajectoire maintenant.",
      moment: "midday" as const,
    },
    {
      title: "Le Bilan",
      prompt: "Qu'as-tu appris aujourd'hui ? Qu'est-ce que tu devrais arrêter de répéter ?",
      subtext: "Convertis l'effort du jour en sagesse pour demain.",
      moment: "evening" as const,
    },
  ];

  const replies = [
    {
      moment: "morning" as const,
      message: "C'est noté. On verra ce soir.",
      memoryCount: 1,
    },
    {
      moment: "midday" as const,
      message: "Ce matin : 'Finir le module auth'. 'Beaucoup de choses' n'est pas une réponse. L'auth est finie, oui ou non ?",
      memoryCount: 2,
    },
    {
      moment: "evening" as const,
      message: "Ce matin : 'Finir le module auth'. Qu'est-ce qui s'est vraiment passé ?",
      memoryCount: 3,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-light text-black dark:text-white">
          Email Templates Preview
        </h1>
        
        {/* Challenge Emails (Scheduled) */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-medium text-black dark:text-white">
            1. Emails programmés (08:00, 12:00, 19:00)
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.moment}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="mb-4 text-lg font-medium text-black dark:text-white">
                  {session.title}
                </h3>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {session.moment === "morning" && "☀️ 08:00"}
                  {session.moment === "midday" && "🎯 12:00"}
                  {session.moment === "evening" && "🌙 19:00"}
                </p>
                
                <div className="scale-[0.6] origin-top-left border border-zinc-200 dark:border-zinc-700">
                  <div style={{ width: "600px" }}>
                    <YehoshuaFocusEmail
                      title={session.title}
                      prompt={session.prompt}
                      subtext={session.subtext}
                      moment={session.moment}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reply Emails (AI Confrontation) */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-medium text-black dark:text-white">
            2. Réponses AI (confrontation avec mémoire)
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {replies.map((reply) => (
              <div
                key={reply.moment}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="mb-4 text-lg font-medium text-black dark:text-white">
                  Réponse {reply.moment}
                </h3>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {reply.moment === "morning" && "☀️ Matin"}
                  {reply.moment === "midday" && "🎯 Midi"}
                  {reply.moment === "evening" && "🌙 Soir"}
                  {" • "}
                  {reply.memoryCount} réflexion(s)
                </p>
                
                <div className="scale-[0.6] origin-top-left border border-zinc-200 dark:border-zinc-700">
                  <div style={{ width: "600px" }}>
                    <YehoshuaReplyEmail
                      replyMessage={reply.message}
                      moment={reply.moment}
                      memoryCount={reply.memoryCount}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-medium text-black dark:text-white">
            Comment tester
          </h3>
          <ol className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>1. Les emails ci-dessus sont rendus avec React Email</li>
            <li>2. Pour tester l&apos;envoi réel, utilise le dev server de React Email</li>
            <li>3. Commande : <code className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">npm run email:dev</code></li>
            <li>4. Accède à <code className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">http://localhost:3001</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}