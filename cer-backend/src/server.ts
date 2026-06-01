import app from "./app";
import { PORT } from "./config/variables";

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});