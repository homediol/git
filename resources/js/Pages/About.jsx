import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import { useLocale } from '@/Providers/LocaleProvider';

export default function About({ auth, teamMembers = [], advertisements = [], settings }) {
    const { t } = useLocale();

    return (
        <PublicLayout
            auth={auth}
            settings={settings}
            pageTitle={t('about.title')}
            pageSubtitle={t('about.subtitle')}
            pageIcon="👥"
        >
            <Head title={t('about.meta.title')}>
                <meta name="description" content={t('about.meta.description')} />
                <meta name="keywords" content={t('about.meta.keywords')} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid gap-6 md:grid-cols-2 mb-12">
                        <div className="surface p-8">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)] mb-4">
                                {t('about.mission.title')}
                            </h2>
                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                                {t('about.mission.body')}
                            </p>
                        </div>
                        <div className="surface p-8">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)] mb-4">
                                {t('about.vision.title')}
                            </h2>
                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                                {t('about.vision.body')}
                            </p>
                        </div>
                    </div>

                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">
                            {t('about.team.title')}
                        </h2>
                        <p className="text-slate-600 mt-3">
                            {t('about.team.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="surface p-6 text-center transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                                {member.image && (
                                    <img src={member.image} alt={member.name} loading="lazy" className="w-28 h-28 rounded-full mx-auto mb-4 object-cover" />
                                )}
                                <h3 className="text-lg font-semibold text-[color:var(--md-text)]">{member.name}</h3>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-3">{member.position}</p>
                                <p className="text-sm text-slate-600">{member.bio}</p>
                            </div>
                        ))}
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-6 text-[color:var(--md-text)]">
                                {t('about.partners')}
                            </h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
