import app from './app.js';
import { testConnection } from './config/db.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`🎵 Music Label Management System API`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`=================================================`);
  await testConnection();
});

export default app;
