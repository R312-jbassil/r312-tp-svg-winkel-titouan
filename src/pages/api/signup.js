import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export const POST = async ({ request }) => {
    try {
        const { email, password, passwordConfirm, name } = await request.json();

        if (!email || !password || !passwordConfirm)
            return new Response(JSON.stringify({ error: "Champs manquants" }), { status: 400 });

        if (password !== passwordConfirm)
            return new Response(JSON.stringify({ error: "Les mots de passe ne correspondent pas" }), { status: 400 });

        const newUser = await pb.collection(Collections.Users).create({
            email,
            password,
            passwordConfirm,
            name: name || email.split("@")[0],
        });

        return new Response(JSON.stringify({ user: newUser }), { status: 201 });
    } catch (err) {
        console.error("Erreur d'inscription :", err);
        return new Response(JSON.stringify({ error: "Erreur lors de l'inscription" }), { status: 500 });
    }
};
