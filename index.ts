import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { getUserFromRequest } from "./getUserFromRequest";
import { marketItems } from "./marketItems";

const DB_PATH = "./db.json";

if (!existsSync(DB_PATH)) {
	writeFileSync(DB_PATH, JSON.stringify({ users: [], events: [] }, null, 2));
}

export function loadDB() {
	return JSON.parse(readFileSync(DB_PATH, "utf-8"));
}

function saveDB(db: any) {
	writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function generateId() {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const sessions: { [key: string]: string } = {};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function parseJSON({ req }: { req: Request }): Promise<any> {
	try {
		return await req.json();
	} catch (e) {
		return null;
	}
}

function unauthorizedResponse(): Response {
	return new Response(JSON.stringify({ error: "Unauthorized" }), {
		status: 401,
		headers: { "Content-Type": "application/json" },
	});
}

Bun.serve({
	async fetch(req) {
		const url = new URL(req.url);
		const pathname = url.pathname;
		const method = req.method;

		if (method === "POST" && pathname === "/signup") {
			const data = await parseJSON({ req });
			if (
				!data ||
				!data.username ||
				!data.password ||
				!data.alignment ||
				!data.region
			) {
				console.log(data);
				return new Response(
					JSON.stringify({
						error: `Missing required fields: ${data}`,
					}),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			if (data.alignment !== "hero" && data.alignment !== "villain") {
				return new Response(
					JSON.stringify({
						error: "Alignment must be either 'hero' or 'villain'",
					}),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			const db = loadDB();
			if (
				db.users.find((u: { username: any }) => u.username === data.username)
			) {
				return new Response(
					JSON.stringify({ error: "Username already exists" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			// Initial Base
			const newUser = {
				id: generateId(),
				username: data.username,
				password: data.password, // not secure but since its json it works
				alignment: data.alignment,
				region: data.region,
				base: {
					level: 1,
					upgrades: [],
					influence: 0,
					resources: { power: 100, money: 1000, notoriety: 0 },
					minions: 0,
					sidekicks: 0,
					gadgets: [],
				},
				inventory: [],
				stats: { missionsCompleted: 0, battlesWon: 0, battlesLost: 0 },
			};
			db.users.push(newUser);
			saveDB(db);
			const token = generateId();
			sessions[token] = newUser.id;
			return new Response(
				JSON.stringify({
					token,
					user: {
						id: newUser.id,
						username: newUser.username,
						alignment: newUser.alignment,
						region: newUser.region,
					},
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } },
			);
		}

		if (method === "POST" && pathname === "/login") {
			const data = await parseJSON({ req });
			if (!data || !data.username || !data.password) {
				return new Response(
					JSON.stringify({ error: "Missing username or password" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			const db = loadDB();
			const user = db.users.find(
				(u: { username: any; password: any }) =>
					u.username === data.username && u.password === data.password,
			);
			if (!user) {
				return new Response(JSON.stringify({ error: "Invalid credentials" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}
			const token = generateId();
			sessions[token] = user.id;
			return new Response(
				JSON.stringify({
					token,
					user: {
						id: user.id,
						username: user.username,
						alignment: user.alignment,
						region: user.region,
					},
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}

		let user: {
			base: {
				level: number;
				resources: { money: number; power: number };
				upgrades: any[];
				influence: number;
				minions: number;
				sidekicks: number;
			};
			id: any;
			stats: {
				missionsCompleted: number;
				battlesWon: number;
				battlesLost: number;
			};
			region: any;
			alignment: string;
			inventory: any[];
			username: any;
		} | null = null;
		if (pathname !== "/signup" && pathname !== "/login") {
			user = getUserFromRequest({ req });
			if (!user) return unauthorizedResponse();
		}
		const db = loadDB();

		if (method === "GET" && pathname === "/base") {
			return new Response(JSON.stringify({ base: user.base }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// current level * 500
		if (method === "PATCH" && pathname === "/upgrade") {
			const data = await parseJSON({ req });
			if (!data || !data.upgrade) {
				return new Response(
					JSON.stringify({ error: "Missing upgrade field" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			const cost = user.base.level * 500;
			if (user.base.resources.money < cost) {
				return new Response(
					JSON.stringify({ error: "Not enough money for upgrade", cost }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			user.base.resources.money -= cost;
			user.base.level += 1;
			user.base.upgrades.push(data.upgrade);
			user.base.influence += 10;
			const idx = db.users.findIndex((u: { id: any }) => u.id === user.id);
			db.users[idx] = user;
			saveDB(db);
			return new Response(JSON.stringify({ base: user.base }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (method === "POST" && pathname === "/mission/start") {
			const data = await parseJSON({ req });
			if (!data || !data.mission) {
				return new Response(
					JSON.stringify({ error: "Missing mission field" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			const successChance = Math.min(
				0.9,
				0.5 + user.base.resources.power / 1000,
			);
			const missionSuccess = Math.random() < successChance;
			if (missionSuccess) {
				const rewardMoney = 200 + Math.floor(Math.random() * 200);
				const rewardPower = 20 + Math.floor(Math.random() * 20);
				user.base.resources.money += rewardMoney;
				user.base.resources.power += rewardPower;
				user.stats.missionsCompleted += 1;
				user.base.influence += 5;
				const result = {
					mission: data.mission,
					success: true,
					reward: { money: rewardMoney, power: rewardPower },
				};
				const idx = db.users.findIndex((u: { id: any }) => u.id === user.id);
				db.users[idx] = user;
				saveDB(db);
				return new Response(JSON.stringify(result), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
			const penalty = 100;
			user.base.resources.money = Math.max(
				0,
				user.base.resources.money - penalty,
			);
			user.stats.missionsCompleted += 1;
			const result = { mission: data.mission, success: false, penalty };
			const idx = db.users.findIndex((u: { id: any }) => u.id === user.id);
			db.users[idx] = user;
			saveDB(db);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (method === "POST" && pathname === "/battle") {
			const data = await parseJSON({ req });
			if (!data || !data.target) {
				return new Response(JSON.stringify({ error: "Missing target field" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}
			const targetUser = db.users.find(
				(u: { username: any }) => u.username === data.target,
			);
			if (!targetUser) {
				return new Response(JSON.stringify({ error: "Target not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}
			// random battle outcome based on power
			const attackerScore = user.base.resources.power + Math.random() * 50;
			const defenderScore =
				targetUser.base.resources.power + Math.random() * 50;
			let outcome;
			if (attackerScore > defenderScore) {
				outcome = "win";
				user.stats.battlesWon += 1;
				targetUser.stats.battlesLost += 1;
				const loot = Math.min(200, targetUser.base.resources.money);
				targetUser.base.resources.money -= loot;
				user.base.resources.money += loot;
				user.base.influence += 10;
			} else {
				outcome = "lose";
				user!.stats.battlesLost += 1;
				targetUser.stats.battlesWon = (targetUser.stats.battlesWon || 0) + 1;
				const penalty = 100;
				user.base.resources.money = Math.max(
					0,
					user.base.resources.money - penalty,
				);
			}
			const idx1 = db.users.findIndex((u: { id: any }) => u.id === user.id);
			const idx2 = db.users.findIndex(
				(u: { id: any }) => u.id === targetUser.id,
			);
			db.users[idx1] = user;
			db.users[idx2] = targetUser;
			saveDB(db);
			return new Response(JSON.stringify({ outcome }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// list of players in the same region (excluding self) [only for hosted version]
		if (method === "GET" && pathname === "/players/nearby") {
			const nearby = db.users
				.filter(
					(u: { region: any; id: any }) =>
						u.region === user.region && u.id !== user.id,
				)
				.map(
					(u: {
						username: any;
						alignment: any;
						base: { level: any; influence: any };
					}) => ({
						username: u.username,
						alignment: u.alignment,
						level: u.base.level,
						influence: u.base.influence,
					}),
				);
			return new Response(JSON.stringify({ players: nearby }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// robin or bane
		if (method === "POST" && pathname === "/recruit") {
			const data = await parseJSON({ req });
			if (!data || !data.type) {
				return new Response(JSON.stringify({ error: "Missing type field" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}
			if (user.alignment === "hero" && data.type !== "sidekick") {
				return new Response(
					JSON.stringify({ error: "Heroes can only recruit sidekicks" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			if (user.alignment === "villain" && data.type !== "minion") {
				return new Response(
					JSON.stringify({ error: "Villains can only recruit minions" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			const cost = 300;
			if (user.base.resources.money < cost) {
				return new Response(
					JSON.stringify({ error: "Not enough money to recruit", cost }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			user.base.resources.money -= cost;
			if (data.type === "minion") {
				user.base.minions += 1;
			} else {
				user.base.sidekicks += 1;
			}
			const idx = db.users.findIndex((u: { id: any }) => u.id === user.id);
			db.users[idx] = user;
			saveDB(db);
			return new Response(JSON.stringify({ base: user.base }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (method === "GET" && pathname === "/map") {
			const nearby = db.users
				.filter((u: { region: any }) => u.region === user.region)
				.map(
					(u: {
						username: any;
						alignment: any;
						base: { level: any; influence: any };
					}) => ({
						username: u.username,
						alignment: u.alignment,
						level: u.base.level,
						influence: u.base.influence,
					}),
				);
			return new Response(
				JSON.stringify({ players: nearby, events: db.events }),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}

		// conquest land
		if (method === "POST" && pathname === "/attack/territory") {
			const successChance = Math.min(0.9, 0.5 + user.base.level * 0.1);
			const success = Math.random() < successChance;
			if (success) {
				user.base.influence += 20;
			} else {
				user.base.influence = Math.max(0, user.base.influence - 5);
			}
			const idx = db.users.findIndex((u: { id: any }) => u.id === user.id);
			db.users[idx] = user;
			saveDB(db);
			return new Response(
				JSON.stringify({ success, influence: user.base.influence }),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}

		if (method === "GET" && pathname === "/influence") {
			return new Response(JSON.stringify({ influence: user.base.influence }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		//main money making gambling scheme
		if (method === "POST" && pathname === "/invest") {
			const data = await parseJSON({ req });
			if (!data || typeof data.amount !== "number") {
				return new Response(
					JSON.stringify({ error: "Missing or invalid amount" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			if (user.base.resources.money < data.amount) {
				return new Response(
					JSON.stringify({ error: "Not enough money to invest" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			user.base.resources.money -= data.amount;
			let outcome;
			if (Math.random() < 0.8) {
				const profit = Math.floor(data.amount * 0.2);
				user.base.resources.money += data.amount + profit;
				outcome = { success: true, profit };
			} else {
				const loss = Math.floor(data.amount * 0.1);
				user.base.resources.money += data.amount - loss;
				outcome = { success: false, loss };
			}
			const idx = db.users.findIndex((u: { id: any }) => u.id === user.id);
			db.users[idx] = user;
			saveDB(db);
			return new Response(JSON.stringify(outcome), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (method === "GET" && pathname === "/market") {
			const items = marketItems[user.alignment] || [];
			return new Response(JSON.stringify({ items }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (method === "POST" && pathname === "/buy") {
			const data = await parseJSON({ req });
			if (!data || !data.item) {
				return new Response(JSON.stringify({ error: "Missing item field" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}
			const items = marketItems[user.alignment] || [];
			const item = items.find((i: { name: any }) => i.name === data.item);
			if (!item) {
				return new Response(
					JSON.stringify({ error: "Item not found in market" }),
					{ status: 404, headers: { "Content-Type": "application/json" } },
				);
			}
			if (user.base.resources.money < item.cost) {
				return new Response(
					JSON.stringify({ error: "Not enough money", cost: item.cost }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			user.base.resources.money -= item.cost;
			user.inventory.push(item);
			const idx = db.users.findIndex((u: { id: any }) => u.id === user.id);
			db.users[idx] = user;
			saveDB(db);
			return new Response(JSON.stringify({ inventory: user.inventory }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}
		// ragnarok
		if (method === "POST" && pathname === "/create/event") {
			if (user?.alignment !== "villain") {
				return new Response(
					JSON.stringify({ error: "Only villains can create events" }),
					{ status: 403, headers: { "Content-Type": "application/json" } },
				);
			}
			const data = await parseJSON({ req });
			if (!data || !data.event || !data.region) {
				return new Response(
					JSON.stringify({ error: "Missing event or region field" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			const newEvent = {
				id: generateId(),
				event: data.event,
				region: data.region,
				createdBy: user.username,
				status: "active",
			};
			db.events.push(newEvent);
			saveDB(db);
			return new Response(JSON.stringify({ event: newEvent }), {
				status: 201,
				headers: { "Content-Type": "application/json" },
			});
		}

		// inverse of ragnarok
		if (method === "POST" && pathname === "/defend") {
			if (user?.alignment !== "hero") {
				return new Response(
					JSON.stringify({ error: "Only heroes can defend events" }),
					{ status: 403, headers: { "Content-Type": "application/json" } },
				);
			}
			const data = await parseJSON({ req });
			if (!data || !data.eventId) {
				return new Response(
					JSON.stringify({ error: "Missing eventId field" }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			const eventIndex = db.events.findIndex(
				(e: { id: any; region: any }) =>
					e.id === data.eventId && e.region === user.region,
			);
			if (eventIndex === -1) {
				return new Response(
					JSON.stringify({ error: "Event not found in your region" }),
					{ status: 404, headers: { "Content-Type": "application/json" } },
				);
			}
			const successChance = Math.min(0.9, 0.5 + user.base.level * 0.1);
			const success = Math.random() < successChance;
			let result;
			if (success) {
				db.events.splice(eventIndex, 1);
				user.base.influence += 15;
				result = { success: true, message: "Event defended successfully" };
			} else {
				user.base.resources.money = Math.max(
					0,
					user.base.resources.money - 100,
				);
				result = {
					success: false,
					message: "Defense failed, you lost some money",
				};
			}
			const idx = db.users.findIndex((u: { id: any }) => u.id === user.id);
			db.users[idx] = user;
			saveDB(db);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (method === "GET" && pathname === "/leaderboard") {
			const sorted = db.users
				.sort(
					(
						a: { base: { influence: number } },
						b: { base: { influence: number } },
					) => b.base.influence - a.base.influence,
				)
				.map(
					(u: {
						username: any;
						base: { influence: any };
						alignment: any;
						region: any;
					}) => ({
						username: u.username,
						influence: u.base.influence,
						alignment: u.alignment,
						region: u.region,
					}),
				);
			return new Response(
				JSON.stringify({ leaderboard: sorted.slice(0, 10) }),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}

		return new Response(JSON.stringify({ error: "Endpoint not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	},
	port: 3000,
});
console.log(
	"\x1b[32m%s\x1b[0m",
	"Routes Loaded Successfully . \nListening on port 3000",
);
