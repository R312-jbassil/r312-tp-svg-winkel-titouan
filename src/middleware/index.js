import pb from "../utils/pb";

export const onRequest = async (context, next) => {
    const cookie = context.cookies.get("pb_auth")?.value;

    // Auth PocketBase
    if (cookie) {
        pb.authStore.loadFromCookie(cookie);

        if (pb.authStore.isValid) {
            context.locals.user = pb.authStore.record;
        }
    }

    // --- Gestion de la langue via cookie ---
    const langCookie = context.cookies.get("lang")?.value;
    context.locals.lang = ["fr", "en"].includes(langCookie) ? langCookie : "en";

    // --- Accès aux API ---
    if (context.url.pathname.startsWith("/api/")) {
        const publicAPIs = ["/api/login", "/api/signup", "/api/set-language"];

        const isPublic = publicAPIs.some(p => context.url.pathname.startsWith(p));

        if (!context.locals.user && !isPublic) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
            });
        }

        return next();
    }

    // --- Redirection login si non authentifié ---
    if (!context.locals.user) {
        if (
            context.url.pathname !== "/login" &&
            context.url.pathname !== "/signup" &&
            context.url.pathname !== "/"
        ) {
            return Response.redirect(new URL("/login", context.url), 303);
        }
    }

    return next();
};
