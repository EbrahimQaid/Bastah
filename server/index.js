import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server running in MVC mode: http://localhost:${PORT}/api`);
  console.log(`📚 Store:    http://localhost:5173/store/bastah`);
  console.log(`📊 Dashboard:http://localhost:5173/dashboard`);
});
