### Signup

```bash
curl -X POST https://tycoonapi.onrender.com/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "hero1", "password": "pass", "alignment": "hero", "region": "Downtown"}'
```

### Login

```bash
curl -X POST https://tycoonapi.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"username": "hero1", "password": "pass"}'
```

### Get Base

```bash
curl -X GET https://tycoonapi.onrender.com/base \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Upgrade Base

```bash
curl -X PATCH https://tycoonapi.onrender.com/upgrade \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"upgrade": "security defenses"}'
```

### Start Mission

```bash
curl -X POST https://tycoonapi.onrender.com/mission/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"mission": "Stop Bank Robbery"}'
```

### Battle

```bash
curl -X POST https://tycoonapi.onrender.com/battle \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"target": "villain1"}'
```

<!-- TODO: Complete this  -->