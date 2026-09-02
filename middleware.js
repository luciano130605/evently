export const config = {
    matcher: "/metrics",
};

export default function middleware(request) {
    const authHeader = request.headers.get("authorization");

    if (authHeader) {
        const authValue = authHeader.split(" ")[1];
        const [user, password] = atob(authValue).split(":");

        if (
            user === process.env.METRICS_USERNAME &&
            password === process.env.METRICS_PASSWORD
        ) {
            return; // undefined = deja pasar el request normalmente
        }
    }

    return new Response("Autenticación requerida", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Panel de métricas"',
        },
    });
}