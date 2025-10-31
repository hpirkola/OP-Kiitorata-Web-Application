import app from "./app";

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Local dev server running at http://localhost:${PORT}`);
});