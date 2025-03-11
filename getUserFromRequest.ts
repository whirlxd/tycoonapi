import { sessions, loadDB } from ".";

export function getUserFromRequest({ req }: { req: Request; }): any {
	const authHeader = req.headers.get("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
	const token = authHeader.slice("Bearer ".length);
	const userId = sessions[token];
	if (!userId) return null;
	const db = loadDB();
	return db.users.find((u: { id: string; }) => u.id === userId);
}
