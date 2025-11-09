import app from "./app";

/***************************************************
* Starts the Express server for local development. *
***************************************************/
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Local dev server running at http://localhost:${PORT}`);
});