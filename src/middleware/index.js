import pb from "../utils/pb";

export const onRequest = async (context, next) => {
    // --- AUTHENTIFICATION ---
    const cookie = context.cookies.get("pb_auth")?.value;
    if (cookie) {
        pb.authStore.loadFromCookie(cookie);
        if (pb.authStore.isValid) {
            context.locals.user = pb.authStore.record;
        }
    }

    // --- GESTION LANGUE ---
    // POST formulaire de changement de langue
    if (context.request.method === 'POST') {
        const form = await context.request.formData().catch(() => null);
        const lang = form?.get('language');
        if (lang === 'en' || lang === 'fr') {
            context.cookies.set('locale', String(lang), { path: '/', maxAge: 60 * 60 * 24 * 365 });
            return Response.redirect(new URL(context.url.pathname + context.url.search, context.url), 303);
        }
    }

    // Déterminer la langue pour cette requête
    const cookieLocale = context.cookies.get('locale')?.value;
    context.locals.lang = (cookieLocale === 'fr' || cookieLocale === 'en')
        ? cookieLocale
        : (context.preferredLocale ?? 'en');

    // --- ACCÈS API ---
    if (context.url.pathname.startsWith("/api/")) {
        if (!context.locals.user && !['/api/login', '/api/signup'].includes(context.url.pathname)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        return next();
    }

    // --- REDIRECTION SI NON AUTH ---
    if (!context.locals.user) {
        if (!['/login', '/signup', '/'].includes(context.url.pathname)) {
            return Response.redirect(new URL("/login", context.url), 303);
        }
    }

    return next();
};
