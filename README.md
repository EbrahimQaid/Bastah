# Bastah

## تشغيل الخادم

يتطلب الخادم `DATABASE_URL` و`JWT_SECRET` في الإنتاج. لا يتم تشغيل schema تلقائياً أثناء cold start؛ نفّذ `supabase-schema.sql` مرة واحدة في قاعدة البيانات، ولا تستخدم `AUTO_INIT_DB=true` إلا للتطوير.

متغيرات اختيارية مهمة:

- `CORS_ORIGIN`: قائمة origins مفصولة بفواصل.
- `DB_POOL_MAX`: الحد الأقصى لاتصالات PostgreSQL، وقيمته الافتراضية `10`.
- `BCRYPT_ROUNDS`: عدد جولات bcrypt.

قبل النشر شغّل:

```bash
npm run typecheck
npm run build
```
