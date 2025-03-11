
# API TYCOON Documentation

Welcome to the **Tycoon Game API**! Build your empire and learn how to use API's

---

## Base URL

All endpoints are available at:

```
http://localhost:3000
```

---

## Authentication

### Signup

**Endpoint:** `POST /signup` (No authentication required)

**Description:**  
Registers a new user with a unique username, password, alignment, and region.  
*Alignment must be either `"hero"` or `"villain"`.*

**Request Body:**

| Field     | Type   | Required | Description                                        |
| --------- | ------ | -------- | -------------------------------------------------- |
| username  | string | Yes      | A unique username                                  |
| password  | string | Yes      | The user's password (plaintext in this prototype)  |
| alignment | string | Yes      | Must be `"hero"` or `"villain"`                     |
| region    | string | Yes      | The region (city area) where the player operates   |

**Example Request:**

```json
{
  "username": "batman",
  "password": "pass",
  "alignment": "hero",
  "region": "gotham"
}
```

**Success Response (Status 201):**

```json
{
  "token": "some_generated_token",
  "user": {
    "id": "unique_user_id",
    "username": "batman",
    "alignment": "hero",
    "region": "gotham"
  }
}
```

**Error Cases:**

- **Missing Required Fields (400):**

  ```json
  { "error": "Missing required fields" }
  ```

- **Invalid Alignment Value (400):**

  ```json
  { "error": "Alignment must be either 'hero' or 'villain'" }
  ```

- **Username Already Exists (400):**

  ```json
  { "error": "Username already exists" }
  ```

---

### Login

**Endpoint:** `POST /login` (No authentication required)

**Description:**  
Logs in an existing user to retrieve an authentication token.

**Request Body:**

| Field    | Type   | Required | Description                  |
| -------- | ------ | -------- | ---------------------------- |
| username | string | Yes      | The user's username          |
| password | string | Yes      | The user's password          |

**Example Request:**

```json
{
  "username": "batman",
  "password": "pass"
}
```

**Success Response (Status 200):**

```json
{
  "token": "new_generated_token",
  "user": {
    "id": "unique_user_id",
    "username": "batman",
    "alignment": "hero",
    "region": "gotham"
  }
}
```

**Error Cases:**

- **Missing Fields (400):**

  ```json
  { "error": "Missing username or password" }
  ```

- **Invalid Credentials (401):**

  ```json
  { "error": "Invalid credentials" }
  ```

> **Note:** For all endpoints except `/signup` and `/login`, please must include the following header:  
> `Authorization: Bearer <token>`  
> where `<token>` is the token provided on signup/login.

---

## Endpoints

### 1. Get Base

**Endpoint:** `GET /base`

**Description:**  
Returns the current status of the authenticated user's base.

**Headers:**  
`Authorization: Bearer <token>`

**Example Request:**

```
GET /base
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (Status 200):**

```json
{
  "base": {
    "level": 1,
    "upgrades": [],
    "influence": 0,
    "resources": { "power": 100, "money": 1000, "notoriety": 0 },
    "minions": 0,
    "sidekicks": 0,
    "gadgets": []
  }
}
```

**Error Cases:**

- **Unauthorized (401):**

  ```json
  { "error": "Unauthorized" }
  ```

---

### 2. Upgrade Base

**Endpoint:** `PATCH /upgrade`

**Description:**  
Upgrades the user's base by spending money. The cost is calculated as `current level * 500`. The upgrade increases base level and influence.

**Headers:**  
`Authorization: Bearer <token>`

**Request Body:**

| Field   | Type   | Required | Description                  |
| ------- | ------ | -------- | ---------------------------- |
| upgrade | string | Yes      | The upgrade name/description |

**Example Request:**

```json
{
  "upgrade": "security defenses"
}
```

**Success Response (Status 200):**

```json
{
  "base": {
    "level": 2,
    "upgrades": ["security defenses"],
    "influence": 10,
    "resources": { "power": 100, "money": 500, "notoriety": 0 },
    "minions": 0,
    "sidekicks": 0,
    "gadgets": []
  }
}
```

**Error Cases:**

- **Missing Upgrade Field (400):**

  ```json
  { "error": "Missing upgrade field" }
  ```

- **Insufficient Funds (400):**

  ```json
  { "error": "Not enough money for upgrade", "cost": <required_cost> }
  ```

---

### 3. Start Mission

**Endpoint:** `POST /mission/start`

**Description:**  
Initiates a mission. For heroes, the mission might involve stopping crimes; for villains, it could be a heist. The outcome depends on the player's power and some randomness.

**Headers:**  
`Authorization: Bearer <token>`

**Request Body:**

| Field   | Type   | Required | Description            |
| ------- | ------ | -------- | ---------------------- |
| mission | string | Yes      | Mission name/description |

**Example Request:**

```json
{
  "mission": "Stop Bank Robbery"
}
```

**Success Response (Status 200):**

- **If Successful:**

  ```json
  {
    "mission": "Stop Bank Robbery",
    "success": true,
    "reward": { "money": 250, "power": 35 }
  }
  ```

- **If Unsuccessful:**

  ```json
  {
    "mission": "Stop Bank Robbery",
    "success": false,
    "penalty": 100
  }
  ```

**Error Cases:**

- **Missing Mission Field (400):**

  ```json
  { "error": "Missing mission field" }
  ```

---

### 4. Battle

**Endpoint:** `POST /battle`

**Description:**  
Initiates a battle against another player’s base. The target is specified by username. The battle outcome is determined by comparing power levels and randomness.

**Headers:**  
`Authorization: Bearer <token>`

**Request Body:**

| Field  | Type   | Required | Description                           |
| ------ | ------ | -------- | ------------------------------------- |
| target | string | Yes      | Username of the opponent to attack    |

**Example Request:**

```json
{
  "target": "joker"
}
```

**Success Response (Status 200):**

```json
{
  "outcome": "win"  // or "lose"
}
```

**Error Cases:**

- **Missing Target Field (400):**

  ```json
  { "error": "Missing target field" }
  ```

- **Target Not Found (404):**

  ```json
  { "error": "Target not found" }
  ```

---

### 5. Get Players Nearby

**Endpoint:** `GET /players/nearby`

**Description:**  
Returns a list of players in the same region as the authenticated user (excluding the user).

**Headers:**  
`Authorization: Bearer <token>`

**Example Request:**

```
GET /players/nearby
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (Status 200):**

```json
{
  "players": [
    {
      "username": "joker",
      "alignment": "villain",
      "level": 1,
      "influence": 0
    },
    ...
  ]
}
```

**Error Cases:**

- **Unauthorized (401)**

---

### 6. Recruit

**Endpoint:** `POST /recruit`

**Description:**  
Recruits an ally for the player. Heroes can recruit sidekicks, and villains can recruit minions. Recruitment costs a fixed amount (300 money).

**Headers:**  
`Authorization: Bearer <token>`

**Request Body:**

| Field | Type   | Required | Description                                           |
| ----- | ------ | -------- | ----------------------------------------------------- |
| type  | string | Yes      | `"sidekick"` for heroes; `"minion"` for villains      |

**Example Request (Hero):**

```json
{ "type": "sidekick" }
```

**Success Response (Status 200):**

```json
{
  "base": {
    "sidekicks": 1,
    "level": 1,
    "upgrades": [],
    "influence": 0,
    "resources": { "power": 100, "money": 700, "notoriety": 0 },
    "minions": 0,
    "gadgets": []
  }
}
```

**Error Cases:**

- **Missing Type Field (400):**

  ```json
  { "error": "Missing type field" }
  ```

- **Incorrect Type for Alignment (400):**

  - For heroes recruiting minions:

    ```json
    { "error": "Heroes can only recruit sidekicks" }
    ```

  - For villains recruiting sidekicks:

    ```json
    { "error": "Villains can only recruit minions" }
    ```

- **Insufficient Funds (400):**

  ```json
  { "error": "Not enough money to recruit", "cost": 300 }
  ```

---

### 7. Get Map

**Endpoint:** `GET /map`

**Description:**  
Returns a map view of the current region including nearby players and active events.

**Headers:**  
`Authorization: Bearer <token>`

**Example Request:**

```
GET /map
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (Status 200):**

```json
{
  "players": [
    { "username": "batman", "alignment": "hero", "level": 2, "influence": 10 },
    ...
  ],
  "events": [
    {
      "id": "event123",
      "event": "Cyber Attack",
      "region": "gotham",
      "createdBy": "joker",
      "status": "active"
    },
    ...
  ]
}
```

**Error Cases:**

- **Unauthorized (401)**

---

### 8. Attack Territory

**Endpoint:** `POST /attack/territory`

**Description:**  
Attempts to capture or contest territory in the user's region. The outcome is based on the user’s level and randomness.

**Headers:**  
`Authorization: Bearer <token>`

**Example Request:**

```
POST /attack/territory
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (Status 200):**

```json
{
  "success": true,
  "influence": 30
}
```

_or_

```json
{
  "success": false,
  "influence": 25
}
```

**Error Cases:**

- **Unauthorized (401)**

---

### 9. Get Influence

**Endpoint:** `GET /influence`

**Description:**  
Retrieves the current influence score of the authenticated user.

**Headers:**  
`Authorization: Bearer <token>`

**Example Request:**

```
GET /influence
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (Status 200):**

```json
{ "influence": 30 }
```

**Error Cases:**

- **Unauthorized (401)**

---

### 10. Invest Money

**Endpoint:** `POST /invest`

**Description:**  
Invests a specified amount of money. There is an 80% chance for a 20% profit and a 20% chance for a 10% loss.

**Headers:**  
`Authorization: Bearer <token>`

**Request Body:**

| Field  | Type   | Required | Description                   |
| ------ | ------ | -------- | ----------------------------- |
| amount | number | Yes      | Amount of money to invest     |

**Example Request:**

```json
{ "amount": 100 }
```

**Success Response (Status 200):**

- **If Successful (Profit):**

  ```json
  { "success": true, "profit": 20 }
  ```

- **If Unsuccessful (Loss):**

  ```json
  { "success": false, "loss": 10 }
  ```

**Error Cases:**

- **Missing/Invalid Amount (400):**

  ```json
  { "error": "Missing or invalid amount" }
  ```

- **Insufficient Funds (400):**

  ```json
  { "error": "Not enough money to invest" }
  ```

---

### 11. Get Market Items

**Endpoint:** `GET /market`

**Description:**  
Retrieves a list of market items available for purchase. Items depend on the player's alignment.

**Headers:**  
`Authorization: Bearer <token>`

**Example Request:**

```
GET /market
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (Status 200):**

_For a hero (example):_

```json
{
  "items": [
    { "name": "Tech Gadget", "cost": 500 },
    { "name": "Advanced Armor", "cost": 1000 },
    { "name": "Energy Shield", "cost": 1500 }
  ]
}
```

**Error Cases:**

- **Unauthorized (401)**

---

### 12. Buy Market Item

**Endpoint:** `POST /buy`

**Description:**  
Purchases an item from the market. Deducts the cost from the user’s money and adds the item to the inventory.

**Headers:**  
`Authorization: Bearer <token>`

**Request Body:**

| Field | Type   | Required | Description                       |
| ----- | ------ | -------- | --------------------------------- |
| item  | string | Yes      | Name of the market item to buy    |

**Example Request:**

```json
{ "item": "Tech Gadget" }
```

**Success Response (Status 200):**

```json
{
  "inventory": [
    { "name": "Tech Gadget", "cost": 500 }
  ]
}
```

**Error Cases:**

- **Missing Item Field (400):**

  ```json
  { "error": "Missing item field" }
  ```

- **Item Not Found (404):**

  ```json
  { "error": "Item not found in market" }
  ```

- **Insufficient Funds (400):**

  ```json
  { "error": "Not enough money", "cost": <item_cost> }
  ```

---

### 13. Create Event

**Endpoint:** `POST /create/event`

**Description:**  
Allows villains to create a city-wide event (e.g., "Cyber Attack") in a specific region.

**Headers:**  
`Authorization: Bearer <token>`

**Request Body:**

| Field  | Type   | Required | Description                         |
| ------ | ------ | -------- | ----------------------------------- |
| event  | string | Yes      | Description of the event            |
| region | string | Yes      | Region where the event takes place  |

**Example Request:**

```json
{
  "event": "Cyber Attack",
  "region": "gotham"
}
```

**Success Response (Status 201):**

```json
{
  "event": {
    "id": "unique_event_id",
    "event": "Cyber Attack",
    "region": "gotham",
    "createdBy": "joker",
    "status": "active"
  }
}
```

**Error Cases:**

- **Unauthorized Alignment (403):**  
  (Only villains can create events.)

  ```json
  { "error": "Only villains can create events" }
  ```

- **Missing Fields (400):**

  ```json
  { "error": "Missing event or region field" }
  ```

---

### 14. Defend Event

**Endpoint:** `POST /defend`

**Description:**  
Allows heroes to defend against an active event in their region.

**Headers:**  
`Authorization: Bearer <token>`

**Request Body:**

| Field   | Type   | Required | Description                        |
| ------- | ------ | -------- | ---------------------------------- |
| eventId | string | Yes      | The ID of the event to defend      |

**Example Request:**

```json
{ "eventId": "unique_event_id" }
```

**Success Response (Status 200):**

- **If Defense is Successful:**

  ```json
  { "success": true, "message": "Event defended successfully" }
  ```

- **If Defense Fails:**

  ```json
  { "success": false, "message": "Defense failed, you lost some money" }
  ```

**Error Cases:**

- **Unauthorized Alignment (403):**  
  (Only heroes can defend events.)

  ```json
  { "error": "Only heroes can defend events" }
  ```

- **Missing eventId Field (400):**

  ```json
  { "error": "Missing eventId field" }
  ```

- **Event Not Found (404):**

  ```json
  { "error": "Event not found in your region" }
  ```

---

### 15. Leaderboard

**Endpoint:** `GET /leaderboard`

**Description:**  
Returns the top players sorted by influence.

**Headers:**  
`Authorization: Bearer <token>`

**Example Request:**

```
GET /leaderboard
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (Status 200):**

```json
{
  "leaderboard": [
    { "username": "batman", "influence": 30, "alignment": "hero", "region": "gotham" },
    { "username": "joker", "influence": 25, "alignment": "villain", "region": "gotham" },
    ...
  ]
}
```

**Error Cases:**

- **Unauthorized (401)**

---

## Error Handling Summary

For every endpoint, error responses are returned as JSON objects with an appropriate HTTP status code:

- **400 Bad Request:**  
  - Missing required fields  
  - Invalid field values  
  - Insufficient funds

- **401 Unauthorized:**  
  - When no token or an invalid token is provided

- **403 Forbidden:**  
  - When a user tries to access an endpoint not allowed for their alignment (e.g., heroes creating events)

- **404 Not Found:**  
  - When a target user, event, or item is not found

---
