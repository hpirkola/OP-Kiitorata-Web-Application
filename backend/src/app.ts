import express from 'express';

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.get('/api/dog', async (_req, res) => {
	try {
		const result = await fetch("https://dog.ceo/api/breeds/image/random");
		const json = await result.json();
		res.json({ imageUrl: json.message as string });
	} catch (err) {
		console.log(err);
		res.status(502).json({ error: "Failed to fetch image" });
	}
});

export default app;