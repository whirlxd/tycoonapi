### Signup

```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "hero1", "password": "pass", "alignment": "hero", "region": "Downtown"}'
```

### Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "hero1", "password": "pass"}'
```

### Get Base

```bash
curl -X GET http://localhost:3000/base \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Upgrade Base

```bash
curl -X PATCH http://localhost:3000/upgrade \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"upgrade": "security defenses"}'
```

### Start Mission

```bash
curl -X POST http://localhost:3000/mission/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"mission": "Stop Bank Robbery"}'
```

### Battle

```bash
curl -X POST http://localhost:3000/battle \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"target": "villain1"}'
```

<!-- TODO: Complete this  -->