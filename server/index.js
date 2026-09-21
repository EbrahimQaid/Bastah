import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Dukkani MVC Server running: http://localhost:${PORT}/api`);
  console.log(`📚 Store:    http://localhost:3000/store`);
  console.log(`📊 Dashboard:http://localhost:3000/dashboard`);
});
