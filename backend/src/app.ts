import express, { type NextFunction, type Request, type Response } from "express";
import type { HealthResponse, DogResponse, ErrorResponse } from "@shared/apiTypes";

const app = express();
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response<HealthResponse>) => {
	res.json({ status: "ok" });
});

type DogCeoResponse = { message: string; status: "success" };

app.get("/api/dog/image", async (_req: Request, res: Response<DogResponse | ErrorResponse>, _next: NextFunction) => {
    try {
		const result = await fetch("https://dog.ceo/api/breeds/image/random");
		if (!result.ok) {
			return res.status(502).json({ error: "Failed to fetch image" });
		}
		const json = (await result.json()) as DogCeoResponse;
		
		if (!json || typeof json.message !== "string") {
			return res.status(502).json({ error: "Upstream returned unexpected data" });
		}
		const body = { imageUrl: json.message } satisfies DogResponse;
			return res.json({ imageUrl: json.message });
	} catch (err: unknown) {
		console.error(err);
		return res.status(502).json({ error: "Failed to fetch image" });
    }
});

export default app;
