import express, { type NextFunction, type Request, type Response as ExpressResponse} from "express";
import type { HealthResponse, DogResponse, ErrorResponse } from "@shared/apiTypes";

const app = express();
app.use(express.json());

app.get("/api/health", (_req: Request, res: ExpressResponse<HealthResponse>) => {
	res.json({ status: "ok" });
});

type DogCeoResponse = { message: string; status: "success" };

async function fetchWithTimeout(url: string, ms: number): Promise<globalThis.Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), ms);
	try {
		const res = await fetch(url, { signal: controller.signal });
		clearTimeout(timeout);
		return res;
	} catch (err) {
		clearTimeout(timeout);
		throw new Error("External API request timed out");
	}
};

async function fetchWithRetry(url: string, attempts = 2): Promise<globalThis.Response> {
	for (let i = 0; i < attempts; i++) {
		try {
			return await fetchWithTimeout(url, 2000);
		} catch (err) {
			if (i === attempts - 1) {
				throw err;
			} else {
				await new Promise((r) => setTimeout(r, 200));
			}
		}
	}
	throw new Error("Unexpected unreachable code");
}

app.get("/api/dog/image", async (_req: Request, res: ExpressResponse<DogResponse | ErrorResponse>) => {
    try {
		const result = await fetchWithRetry("https://dog.ceo/api/breeds/image/random");
		if (!result.ok) {
			return res.status(500).json({ error: "Failed to fetch image" });
		}
		const json = (await result.json()) as DogCeoResponse;

		if (!isDogCeoResponse(json)) {
			console.error("Unexpected JSON:", json);
			return res.status(500).json({ error: "Upstream returned unexpected format" });
		}
		
		try {
			new URL(json.message);
		} catch {
			console.error("Invalid URL:", json.message);
			return res.status(500).json({ error: "Upstream returned invalid image URL" });
		}
		const body: DogResponse = { imageUrl: json.message };
			return res.json(body);
	} catch (err: unknown) {
		if (err instanceof Error && err.message.includes("timed out")) {
			console.error("Dog API timeout: ", err);
			return res.status(500).json({ error: "Upstream API timeout" });

		}
		console.error("Dog API error: ", err);
		return res.status(500).json({ error: "Failed to fetch image" });
    }
});

function isDogCeoResponse(data: unknown): data is DogCeoResponse {
	return ( typeof data === "object" && data !== null && "message" in data && typeof (data as any).message === "string" && (data as any).status === "success");
}

export default app;
