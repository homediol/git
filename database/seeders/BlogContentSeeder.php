<?php

namespace Database\Seeders;

use App\Models\Post;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class BlogContentSeeder extends Seeder
{
    public function run(): void
    {
        $supportsTranslations = Schema::hasColumn('posts', 'title_rw');

        $legacyTitles = collect([
            'Introduction to GrgraphicIntroduction to Graphic Designaphic Design',
            'The Future of Web Development in 2024',
            'Best Practices for Mobile App Design',
            'Laravel 11: What\'s New and Exciting',
            'Building Scalable APIs with Laravel',
            'React vs Vue: Choosing the Right Framework',
            'SEO Optimization for Modern Web Apps',
        ]);

        $legacyPool = Post::query()
            ->whereIn('title', $legacyTitles->all())
            ->orderBy('id')
            ->get()
            ->values();

        foreach ($this->posts() as $item) {
            $post = Post::query()
                ->where('title', $item['title'])
                ->first();

            if (!$post) {
                $post = $legacyPool->shift() ?? new Post();
            } else {
                $legacyPool = $legacyPool->reject(fn (Post $candidate) => $candidate->id === $post->id)->values();
            }

            $timestamp = CarbonImmutable::parse($item['published_at']);

            $post->title = $item['title'];
            $post->content = $item['content'];
            $post->category = $item['category'];
            $post->image = $item['image'];
            $post->video = $item['video'];

            if ($supportsTranslations) {
                $post->title_rw = $item['title_rw'] ?? null;
                $post->title_en = $item['title_en'] ?? $item['title'];
                $post->title_fr = $item['title_fr'] ?? null;
                $post->content_rw = $item['content_rw'] ?? null;
                $post->content_en = $item['content_en'] ?? $item['content'];
                $post->content_fr = $item['content_fr'] ?? null;
                $post->category_rw = $item['category_rw'] ?? null;
                $post->category_en = $item['category_en'] ?? $item['category'];
                $post->category_fr = $item['category_fr'] ?? null;
            }

            $post->save();

            $post->timestamps = false;
            $post->created_at = $timestamp;
            $post->updated_at = $timestamp;
            $post->save();
            $post->timestamps = true;
        }

        if ($legacyPool->isNotEmpty()) {
            Post::query()->whereIn('id', $legacyPool->pluck('id')->all())->delete();
        }
    }

    private function posts(): array
    {
        return [
            [
                'title' => 'How to Prepare for a Graduation Shoot Without Stress',
                'title_rw' => "Uko witegura graduation shoot udafite stress",
                'title_en' => 'How to Prepare for a Graduation Shoot Without Stress',
                'title_fr' => "Comment se preparer a une seance de graduation sans stress",
                'category' => 'Photography Tips',
                'category_rw' => "Inama ku mafoto",
                'category_en' => 'Photography Tips',
                'category_fr' => 'Conseils photo',
                'image' => '/storage/posts/QNuWYyZyNuGa849l4LcZWzmrsDAi34DbuLojZJIN.png',
                'video' => null,
                'published_at' => '2026-03-26 09:30:00',
                'content' => <<<'TEXT'
Graduation sessions look best when the preparation stays simple and intentional. We always advise clients to decide early whether the final images are meant for family keepsakes, social announcements, framed prints, or a mix of all three.

Outfit planning matters more than bringing many clothes. One well-fitted formal look, a clean gown, and small accessories that feel personal usually create stronger photos than too many rushed wardrobe changes. When possible, bring your stole, cap, diploma holder, and one prop that tells your story.

Timing also changes the mood of the session. Studio portraits give a polished and controlled result, while outdoor golden-hour shots add warmth and movement. If you want both, the best approach is to schedule the studio set first and finish with a short outdoor segment.

Most importantly, come with a clear delivery deadline. If the photos are needed for invitations, class celebrations, or social media announcements, sharing that date with the studio helps the editing team prioritize the right output size and turnaround.
TEXT,
                'content_rw' => <<<'TEXT'
Amafoto ya graduation asohoka neza iyo imyiteguro igumye ku murongo woroshye kandi uteguye neza. Dusaba abakiliya guhera kare bagahitamo niba amafoto ya nyuma agenewe kwibukwaho n'umuryango, gutangazwa ku mbuga nkoranyambaga, gucapwa agashyirwa mu makadiri, cyangwa ibi byose hamwe.

Guhitamo imyambaro ni ingenzi kurusha kuzana imyenda myinshi. Umwambaro umwe wicaye neza, ikanzu isukuye ya graduation, n'udutambaro cyangwa ibikoresho bifite igisobanuro kuri wewe akenshi bitanga amafoto meza kurusha guhinduranya imyenda mu buryo bwihuta. Niba bishoboka, uzane stole, cap, aho ushyira impamyabumenyi, n'ikintu kimwe kivuga inkuru yawe.

Igihe na cyo gihindura mood y'amafoto. Studio itanga amafoto ateguye neza kandi agenwe neza, mu gihe amafoto yo hanze mu masaha ya golden hour atanga ubushyuhe n'ubuzima. Niba ushaka byombi, uburyo bwiza ni ugutangirira muri studio hanyuma ugasoreza ku gice gito cyo hanze.

Icy'ingenzi kurusha ibindi, jya ugaragaza igihe nyacyo ukeneye ko amafoto aba yarangiye. Niba akenewe ku butumire, ibirori by'ishuri, cyangwa announcements zo ku mbuga nkoranyambaga, kubimenyesha studio bituma editing team ibanza output ibereyeho n'igihe cyo kuyatanga.
TEXT,
                'content_en' => <<<'TEXT'
Graduation sessions look best when the preparation stays simple and intentional. We always advise clients to decide early whether the final images are meant for family keepsakes, social announcements, framed prints, or a mix of all three.

Outfit planning matters more than bringing many clothes. One well-fitted formal look, a clean gown, and small accessories that feel personal usually create stronger photos than too many rushed wardrobe changes. When possible, bring your stole, cap, diploma holder, and one prop that tells your story.

Timing also changes the mood of the session. Studio portraits give a polished and controlled result, while outdoor golden-hour shots add warmth and movement. If you want both, the best approach is to schedule the studio set first and finish with a short outdoor segment.

Most importantly, come with a clear delivery deadline. If the photos are needed for invitations, class celebrations, or social media announcements, sharing that date with the studio helps the editing team prioritize the right output size and turnaround.
TEXT,
                'content_fr' => <<<'TEXT'
Les seances de graduation sont meilleures lorsque la preparation reste simple et intentionnelle. Nous conseillons toujours aux clients de decider tot si les images finales serviront aux souvenirs de famille, aux annonces sur les reseaux sociaux, aux impressions encadrees ou a un melange de ces trois usages.

La preparation des tenues compte plus que le fait d'apporter beaucoup de vetements. Une tenue formelle bien ajustee, une toge propre et quelques accessoires personnels produisent souvent de meilleures photos que de nombreux changements faits dans la precipitation. Si possible, apportez votre stole, votre chapeau, le porte-diplome et un accessoire qui raconte votre parcours.

Le moment choisi change aussi l'ambiance de la seance. Les portraits en studio donnent un resultat propre et controle, tandis que les prises de vue en exterieur a l'heure doree apportent chaleur et mouvement. Si vous voulez les deux, le mieux est de commencer en studio puis de terminer par une courte sequence en exterieur.

Le plus important est d'arriver avec une date de livraison claire. Si les photos sont destinees aux invitations, aux celebrations de promotion ou aux annonces sur les reseaux sociaux, partager cette date avec le studio aide l'equipe de retouche a prioriser le bon format et le delai adapte.
TEXT,
            ],
            [
                'title' => 'From Idea to Delivery: How We Produce Branded Event Materials',
                'title_rw' => "Kuva ku gitekerezo kugera ku gutanga: uko dukora ibikoresho by'ibirori bifite branding",
                'title_en' => 'From Idea to Delivery: How We Produce Branded Event Materials',
                'title_fr' => "De l'idee a la livraison: comment nous produisons des supports d'evenement brandes",
                'category' => 'Studio News',
                'category_rw' => "Amakuru ya studio",
                'category_en' => 'Studio News',
                'category_fr' => 'Actualites du studio',
                'image' => '/storage/portfolio/videos/NLk1NuaJ8DcAQGEytimTskqOiI9jxgvSP1X8ZxZI.mp4',
                'video' => '/storage/videos/IbJ1i3dhoCXla7flxv6q96BQ9rBuTgXAYlaGnx5x.mp4',
                'published_at' => '2026-03-27 13:15:00',
                'content' => <<<'TEXT'
When a client asks for event materials, the real work starts long before the printer runs. We begin with a short brief that defines the audience, venue, dates, quantity, and where each item will be used. That keeps the design practical instead of only attractive.

After the brief, we align the visuals across banners, lanyards, badges, digital flyers, and social posts. This step is where many campaigns either feel connected or fall apart. Consistency in spacing, logo placement, and color tone makes the entire event feel more professional.

Before final production, we review proofs for spelling, contrast, and readability from a distance. A banner that looks perfect on a laptop can fail completely inside a busy venue if the key message is too small or the colors disappear under stage lighting.

The last step is delivery planning. We package and sort materials based on where they will be used so setup becomes faster on event day. That small operational detail saves clients time and reduces the stress that usually happens a few hours before doors open.
TEXT,
                'content_rw' => <<<'TEXT'
Iyo umukiliya asabye ibikoresho by'ibirori, akazi nyakuri gatangira mbere y'uko printer itangira gukora. Dutangirira kuri brief ngufi isobanura audience, aho event izabera, amatariki, umubare ukenewe, n'aho buri kintu kizakoreshwa. Ibyo bituma design iba practical aho kuba nziza gusa.

Nyuma ya brief, duhuza style imwe ku banners, lanyards, badges, digital flyers, na social posts. Aha ni ho campaigns nyinshi zigaragarira niba zifite coherence cyangwa se zidafite. Guhora ukoresha spacing imwe, placement ya logo, n'amabara afitanye isano bituma event yose isa n'ikorwa n'ababigize umwuga.

Mbere yo kujya mu icapiro rya nyuma, tureba proofs dushishoje ku myandikire, contrast, no ku buryo ubutumwa busomeka uri kure. Banner ishobora gusa neza kuri laptop ariko ikananirwa burundu mu cyumba kirimo abantu benshi niba ubutumwa bukomeye buri buto cyangwa amabara akaburira munsi y'urumuri rwo kuri stage.

Intambwe ya nyuma ni gutegura uko ibyo bikoresho bizatangwa. Turabipakira kandi tukabishyira mu byiciro dukurikije aho bizakoreshwa kugira ngo setup yihute ku munsi wa event. Iyo detail nto y'ikorwa itabara abakiliya igihe kandi ikagabanya stress ikunze kuza amasaha make mbere y'uko event itangira.
TEXT,
                'content_en' => <<<'TEXT'
When a client asks for event materials, the real work starts long before the printer runs. We begin with a short brief that defines the audience, venue, dates, quantity, and where each item will be used. That keeps the design practical instead of only attractive.

After the brief, we align the visuals across banners, lanyards, badges, digital flyers, and social posts. This step is where many campaigns either feel connected or fall apart. Consistency in spacing, logo placement, and color tone makes the entire event feel more professional.

Before final production, we review proofs for spelling, contrast, and readability from a distance. A banner that looks perfect on a laptop can fail completely inside a busy venue if the key message is too small or the colors disappear under stage lighting.

The last step is delivery planning. We package and sort materials based on where they will be used so setup becomes faster on event day. That small operational detail saves clients time and reduces the stress that usually happens a few hours before doors open.
TEXT,
                'content_fr' => <<<'TEXT'
Quand un client demande des supports pour un evenement, le vrai travail commence bien avant le lancement de l'impression. Nous debutons par un bref cahier des charges qui precise le public, le lieu, les dates, la quantite et l'usage de chaque support. Cela permet au design de rester pratique et pas seulement attrayant.

Apres ce brief, nous harmonisons les visuels sur les banners, les tours de cou, les badges, les flyers digitaux et les publications sociales. C'est a cette etape qu'une campagne parait coherente ou non. La regularite dans les espacements, la position du logo et la tonalite des couleurs rend l'ensemble de l'evenement plus professionnel.

Avant la production finale, nous verifions les epreuves pour l'orthographe, le contraste et la lisibilite a distance. Une banniere qui semble parfaite sur un ordinateur peut echouer dans une salle animee si le message principal est trop petit ou si les couleurs disparaissent sous l'eclairage de scene.

La derniere etape est la planification de la livraison. Nous emballons et trions les supports selon leur lieu d'utilisation pour accelerer l'installation le jour de l'evenement. Ce petit detail operationnel fait gagner du temps au client et reduit le stress qui apparait souvent quelques heures avant l'ouverture.
TEXT,
            ],
            [
                'title' => 'Why Short Highlight Videos Convert Better on Social Media',
                'title_rw' => "Impamvu highlight videos ngufi zitanga ibisubizo byiza ku mbuga nkoranyambaga",
                'title_en' => 'Why Short Highlight Videos Convert Better on Social Media',
                'title_fr' => "Pourquoi les courtes videos highlight convertissent mieux sur les reseaux sociaux",
                'category' => 'Video Marketing',
                'category_rw' => "Kwamamaza ukoresheje video",
                'category_en' => 'Video Marketing',
                'category_fr' => 'Marketing video',
                'image' => '/storage/rewards/QYR0P3uoQPafMXucPJ0o6vFEqRnq1xqQkUogbfJx.jpg',
                'video' => null,
                'published_at' => '2026-03-28 10:00:00',
                'content' => <<<'TEXT'
Short-form videos work because they respect the speed at which people browse. In most campaigns, the first two seconds decide whether the viewer keeps watching or scrolls away, so the opening frame needs movement, contrast, or a strong human moment.

The best-performing highlights are not simply shorter versions of long videos. They are edited with a different purpose: fast visual rhythm, simple captions, and one message that the viewer can understand without sound. That is especially important on Instagram, TikTok, and status-based sharing.

We recommend structuring a highlight video around one clear outcome. It can promote an event recap, announce a service, or push viewers toward booking. Trying to say too much in fifteen seconds often weakens the result.

If a business already has photos and raw footage, short highlight reels are one of the fastest ways to turn existing content into something that drives inquiries again. It is usually a better starting point than waiting to plan a completely new campaign from zero.
TEXT,
                'content_rw' => <<<'TEXT'
Amavideo magufi akora neza kubera ko ajyana n'umuvuduko abantu bareberaho ibintu kuri internet. Mu bukangurambaga bwinshi, amasegonda abiri ya mbere ni yo afata umwanzuro niba umuntu akomeza kureba cyangwa anyura kuri content yawe, bityo frame ya mbere ikeneye movement, contrast, cyangwa ikintu gifite amarangamutima y'umuntu.

Highlight videos zikora neza si uko ziba ari verisiyo ngufi z'amavideo maremare gusa. Zitunganwa zifite indi ntego: rhythm yihuta mu mashusho, captions zoroshye, n'ubutumwa bumwe umuntu ashobora kumva atanafunguye amajwi. Ibyo ni ingenzi cyane kuri Instagram, TikTok, na status-based sharing.

Dukunze gusaba ko highlight video yubakwa ku ntego imwe isobanutse. Ishobora kwamamaza recap ya event, kumenyesha service nshya, cyangwa gutera abantu gukora booking. Kuvuga ibintu byinshi mu masegonda make akenshi bigabanya imbaraga z'iyo video.

Niba business isanzwe ifite amafoto n'amashusho ataratunganywa, highlight reels ngufi ni imwe mu nzira zihuse zo guhindura ibyo usanzwe ufite mo content ishobora kongera kuzana inquiries. Akenshi ni intangiriro nziza kurusha gutegereza ngo utegure kampanye nshya uhereye kuri zero.
TEXT,
                'content_en' => <<<'TEXT'
Short-form videos work because they respect the speed at which people browse. In most campaigns, the first two seconds decide whether the viewer keeps watching or scrolls away, so the opening frame needs movement, contrast, or a strong human moment.

The best-performing highlights are not simply shorter versions of long videos. They are edited with a different purpose: fast visual rhythm, simple captions, and one message that the viewer can understand without sound. That is especially important on Instagram, TikTok, and status-based sharing.

We recommend structuring a highlight video around one clear outcome. It can promote an event recap, announce a service, or push viewers toward booking. Trying to say too much in fifteen seconds often weakens the result.

If a business already has photos and raw footage, short highlight reels are one of the fastest ways to turn existing content into something that drives inquiries again. It is usually a better starting point than waiting to plan a completely new campaign from zero.
TEXT,
                'content_fr' => <<<'TEXT'
Les videos courtes fonctionnent parce qu'elles respectent la vitesse de navigation du public. Dans la plupart des campagnes, les deux premieres secondes decident si la personne continue a regarder ou passe a autre chose. L'image d'ouverture doit donc contenir du mouvement, du contraste ou un moment humain fort.

Les meilleurs highlights ne sont pas simplement des versions raccourcies de longues videos. Ils sont montes avec un autre objectif: un rythme visuel rapide, des sous-titres simples et un seul message que l'on peut comprendre meme sans le son. C'est particulierement important sur Instagram, TikTok et les formats de partage type statut.

Nous recommandons de construire une video highlight autour d'un resultat clair. Elle peut servir a promouvoir le recap d'un evenement, annoncer un service ou pousser les visiteurs a reserver. Vouloir tout dire en quinze secondes affaiblit souvent l'impact.

Si une entreprise possede deja des photos et des rushes video, les reels highlights courts sont l'un des moyens les plus rapides de transformer ce contenu existant en un levier qui relance les demandes. C'est souvent un meilleur point de depart que d'attendre pour planifier une nouvelle campagne complete depuis zero.
TEXT,
            ],
            [
                'title' => 'What Clients Should Send Before Requesting a Website Quote',
                'title_rw' => "Ibyo abakiliya bakwiye kohereza mbere yo gusaba devis ya website",
                'title_en' => 'What Clients Should Send Before Requesting a Website Quote',
                'title_fr' => "Ce que les clients devraient envoyer avant de demander un devis pour un site web",
                'category' => 'Web Projects',
                'category_rw' => "Imishinga ya web",
                'category_en' => 'Web Projects',
                'category_fr' => 'Projets web',
                'image' => '/storage/rewards/43Xfqm2ISgyRPNlSQihwstsOxDGAPx17gpUvev7d.png',
                'video' => null,
                'published_at' => '2026-03-29 15:45:00',
                'content' => <<<'TEXT'
Website quotes become more accurate when the client shares a few practical details at the start. The first one is scope: how many pages are needed, what each page should help visitors do, and whether the site will include forms, bookings, payments, or a dashboard.

The second detail is content readiness. If the business already has logos, brand colors, photos, service descriptions, and contact information, production moves faster. If those materials still need to be created, the quote should account for that creative work too.

Reference links are helpful when they explain preferences clearly. Instead of saying "I want a site like this one," it is better to mention what you like about it, such as the layout, the colors, the animations, or the way services are organized.

A realistic deadline and budget range also help both sides make good decisions early. They allow the team to recommend the right version of the project, whether that is a focused launch site, a business portfolio, or a larger custom platform built in phases.
TEXT,
                'content_rw' => <<<'TEXT'
Devis ya website irushaho kuba nyayo iyo umukiliya atanze amakuru amwe y'ingenzi hakiri kare. Icya mbere ni scope: umubare w'amapaji akeneye, icyo buri page izafasha abashyitsi gukora, ndetse niba site izaba irimo forms, bookings, payments, cyangwa dashboard.

Icya kabiri ni uko content yiteguye cyangwa itaritegura. Niba business isanzwe ifite logo, brand colors, amafoto, ibisobanuro bya services, n'aho bayivugisha, production yihuta cyane. Niba ibyo bikoresho na byo bikenewe gukorwa, devis na yo igomba kubyitaho nk'akazi k'ubuhanzi.

Reference links zirafasha iyo zisobanuwe neza. Aho kuvuga gusa ngo "ndashaka site imeze nk'iyi," ni byiza kuvuga icyo uyikundaho, nk'imiterere yayo, amabara, animations, cyangwa uburyo services zateguwemo.

Deadline ishoboka na budget range bifasha impande zombi gufata imyanzuro myiza hakiri kare. Bituma team igusabira version ibereye y'umushinga, yaba site yo gutangiza business vuba, portfolio y'ubucuruzi, cyangwa platform nini yubakwa mu byiciro.
TEXT,
                'content_en' => <<<'TEXT'
Website quotes become more accurate when the client shares a few practical details at the start. The first one is scope: how many pages are needed, what each page should help visitors do, and whether the site will include forms, bookings, payments, or a dashboard.

The second detail is content readiness. If the business already has logos, brand colors, photos, service descriptions, and contact information, production moves faster. If those materials still need to be created, the quote should account for that creative work too.

Reference links are helpful when they explain preferences clearly. Instead of saying "I want a site like this one," it is better to mention what you like about it, such as the layout, the colors, the animations, or the way services are organized.

A realistic deadline and budget range also help both sides make good decisions early. They allow the team to recommend the right version of the project, whether that is a focused launch site, a business portfolio, or a larger custom platform built in phases.
TEXT,
                'content_fr' => <<<'TEXT'
Les devis de sites web deviennent plus precis lorsque le client partage quelques informations pratiques des le debut. La premiere concerne le perimetre: combien de pages sont necessaires, ce que chaque page doit aider les visiteurs a faire, et si le site inclura des formulaires, des reservations, des paiements ou un tableau de bord.

Le deuxieme point est la disponibilite du contenu. Si l'entreprise dispose deja du logo, des couleurs de marque, des photos, des descriptions de services et des coordonnees, la production avance plus vite. Si ces elements doivent encore etre crees, le devis doit aussi inclure ce travail creatif.

Les liens de reference sont utiles lorsqu'ils expliquent clairement les preferences. Au lieu de dire simplement "je veux un site comme celui-ci", il vaut mieux preciser ce que vous aimez: la mise en page, les couleurs, les animations ou la facon dont les services sont organises.

Un delai realiste et une fourchette de budget aident egalement les deux parties a prendre de bonnes decisions tres tot. Cela permet a l'equipe de recommander la bonne version du projet, qu'il s'agisse d'un site de lancement cible, d'un portfolio d'entreprise ou d'une plateforme sur mesure plus large construite par phases.
TEXT,
            ],
        ];
    }
}
