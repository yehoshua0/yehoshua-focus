/* eslint-disable react/no-unescaped-entities */
export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="mb-8 text-xs uppercase tracking-[0.2em] text-zinc-400">
            Système d'Exploitation de la Pensée
          </p>
          <h1 className="mb-6 text-4xl font-light leading-tight tracking-tight text-black dark:text-white md:text-6xl">
            Yehoshua Focus
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl">
            Un outil pour clarifier.<br />
            Un système pour décider.<br />
            Un espace pour réduire le bruit.
          </p>
        </div>

        {/* The Problem */}
        <section className="mb-20 border-t border-zinc-200 pt-12 dark:border-zinc-800 md:mb-32 md:pt-16">
          <h2 className="mb-8 text-2xl font-light text-black dark:text-white md:text-3xl">
            Le problème
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-lg">
            <p>
              Tu dis que X est prioritaire. Tu passes la journée sur Y, Z, et mille autres choses.
            </p>
            <p>
              Ce n'est pas un problème de productivité. C'est un problème de clarté.
            </p>
            <p className="italic">
              Tu ne sais pas vraiment où investir ton attention.
            </p>
          </div>
        </section>

        {/* The Solution */}
        <section className="mb-20 md:mb-32">
          <h2 className="mb-8 text-2xl font-light text-black dark:text-white md:text-3xl">
            La solution
          </h2>
          <p className="mb-12 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-lg">
            Un partenaire qui te challenge trois fois par jour, par email. Pas de complaisance. Juste la vérité.
          </p>

          {/* Three Moments */}
          <div className="space-y-12 md:space-y-16">
            {/* Morning */}
            <div className="border-l-2 border-black pl-6 dark:border-white md:pl-8">
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                  08:00
                </span>
                <h3 className="text-xl font-medium text-black dark:text-white md:text-2xl">
                  Clarification
                </h3>
              </div>
              <blockquote className="mb-3 italic text-zinc-700 dark:text-zinc-300 md:text-lg">
                "Pas une liste. Pas dix priorités. Une seule chose qui compte aujourd'hui. Laquelle ?"
              </blockquote>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Si tu ne peux pas répondre en une phrase, c'est que tu n'as pas encore décidé.
              </p>
            </div>

            {/* Midday */}
            <div className="border-l-2 border-black pl-6 dark:border-white md:pl-8">
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                  13:00
                </span>
                <h3 className="text-xl font-medium text-black dark:text-white md:text-2xl">
                  Confrontation
                </h3>
              </div>
              <blockquote className="mb-3 italic text-zinc-700 dark:text-zinc-300 md:text-lg">
                "Ce matin tu as dit qu'une chose comptait. Es-tu dessus, ou tu dérives déjà ?"
              </blockquote>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Le bruit gagne toujours si tu ne décides pas de le refuser activement.
              </p>
            </div>

            {/* Evening */}
            <div className="border-l-2 border-black pl-6 dark:border-white md:pl-8">
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                  19:00
                </span>
                <h3 className="text-xl font-medium text-black dark:text-white md:text-2xl">
                  Vérité
                </h3>
              </div>
              <blockquote className="mb-3 italic text-zinc-700 dark:text-zinc-300 md:text-lg">
                "Ce matin, tu avais une priorité. Qu'est-ce qui s'est vraiment passé ?"
              </blockquote>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Pas de justification. Juste la vérité. C'est comme ça qu'on apprend.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20 border-t border-zinc-200 pt-12 dark:border-zinc-800 md:mb-32 md:pt-16">
          <h2 className="mb-8 text-2xl font-light text-black dark:text-white md:text-3xl">
            Comment ça marche
          </h2>
          <ol className="space-y-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-lg">
            <li className="flex gap-4">
              <span className="font-mono text-zinc-400">01.</span>
              <span>Tu reçois un email à 8h, 13h, et 19h</span>
            </li>
            <li className="flex gap-4">
              <span className="font-mono text-zinc-400">02.</span>
              <span>Tu réponds directement par email (ou pas)</span>
            </li>
            <li className="flex gap-4">
              <span className="font-mono text-zinc-400">03.</span>
              <span>Le système mémorise tes engagements et te confronte avec tes propres mots</span>
            </li>
            <li className="flex gap-4">
              <span className="font-mono text-zinc-400">04.</span>
              <span>Pas d'app à ouvrir. Pas de dashboard. Juste ton inbox et ta clarté</span>
            </li>
          </ol>
        </section>

        {/* Philosophy */}
        <section className="mb-20 md:mb-32">
          <h2 className="mb-8 text-2xl font-light text-black dark:text-white md:text-3xl">
            Philosophie
          </h2>
          <div className="space-y-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-lg">
            <p>
              Yehoshua Focus n'est pas un gestionnaire de tâches. Ce n'est pas un tracker de productivité.
            </p>
            <p>
              C'est un outil de <span className="font-medium text-black dark:text-white">décision</span>.
            </p>
            <p>
              Décider où investir ton attention. Décider ce qui compte vraiment. Décider de refuser le bruit.
            </p>
            <p className="border-l-2 border-zinc-300 pl-6 italic dark:border-zinc-700">
              "Le focus ne suit pas la motivation. Le focus suit la clarté."
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-zinc-200 pt-12 dark:border-zinc-800 md:pt-16">
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-light text-black dark:text-white md:text-3xl">
              Prêt à clarifier ?
            </h2>
            <p className="max-w-xl text-base text-zinc-600 dark:text-zinc-400 md:text-lg">
              Le projet est <span className="font-medium text-black dark:text-white">Open Source</span>. Choisissez la voie qui vous correspond.
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-2">
            {/* Option 1: Join Existing */}
            <div className="flex flex-col items-start">
               <h3 className="mb-2 text-lg font-medium text-black dark:text-white">
                 Rejoindre l'instance officielle
               </h3>
               <p className="mb-6 h-full text-sm leading-relaxed text-zinc-500">
                 Rejoignez le serveur existant géré par Yehoshua. Idéal pour commencer immédiatement sans configuration.
               </p>
               <a
                href="mailto:jackjosue517@gmail.com?subject=Je%20veux%20rejoindre%20Yehoshua%20Focus"
                className="inline-flex w-full items-center justify-center rounded-none border-2 border-black bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white md:w-auto"
              >
                Demander l'accès
              </a>
            </div>

            {/* Option 2: Clone & Deploy */}
             <div className="flex flex-col items-start">
               <h3 className="mb-2 text-lg font-medium text-black dark:text-white">
                 Déployer votre instance
               </h3>
               <p className="mb-6 h-full text-sm leading-relaxed text-zinc-500">
                 Gardez le contrôle total. Clonez le dépôt et déployez votre propre serveur Yehoshua Focus.
               </p>
               <a
                href="https://github.com/yehoshua0/yehoshua-focus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-none border-2 border-zinc-300 bg-transparent px-6 py-3 text-sm font-medium text-black transition-all hover:border-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:border-white dark:hover:bg-zinc-900 md:w-auto"
              >
                Voir sur GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-32 border-t border-zinc-200 pt-12 text-center dark:border-zinc-800">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Yehoshua Focus © 2026
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Système d'Exploitation de la Pensée
          </p>
        </footer>
      </main>
    </div>
  );
}