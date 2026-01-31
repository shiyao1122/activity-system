# Client API Documentation

## Base URL
`https://activity-system-undh.onrender.com/api/v1`

## Authentication
All requests to the Client API must include the `x-api-key` header.
- **Header**: `x-api-key`
- **Value**: `hitpaw-test-20260112` (Replace with actual secret in production)

---

## Endpoints

### 1. Report Task Completion
Report a user's action to the system to earn points.

- **URL**: `/task/report`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User's email address. |
| `activityId` | Integer | Yes | ID of the activity. |
| `taskName` | String | Yes | The unique name of the task (e.g., `register`, `login`). Must be English alphanumeric/dashes only, no spaces. |
| `inviterEmail` | String | No | Email of the inviter. If provided, and if there is an invitation task targeting this `taskName`, the inviter will receive points. |

#### Example Request
```json
{
  "email": "user@example.com",
  "activityId": 1,
  "taskName": "login"
}
```

#### Success Response
- **Code**: `200 OK`
- **Content**:
```json
{
  "success": true,
  "points": 100
}
```

#### Limit Reached Response
- **Code**: `200 OK`
- **Content**:
```json
{
  "success": true,
  "points": 0,
  "message": "Daily limit reached"
}
```

#### Error Responses
- `400 Bad Request`: Missing required fields.
- `403 Forbidden`: Invalid API Key.
- `500 Internal Server Error`: Activity not active, Task not found, or other server errors.

---

### 2. Get User Status
Retrieve a user's current point total and task completion status for a specific activity.

- **URL**: `/user/status`
- **Method**: `GET`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User's email address. |
| `activityId` | Integer | Yes | ID of the activity. |
| `lang` | String | No | Language code for task descriptions (default: `en`). |

#### Example Request
`GET /user/status?email=user@example.com&activityId=1&lang=en`

#### Success Response
- **Code**: `200 OK`
- **Content**:
```json
{
  "totalPoints": 150,
  "tasks": [
    {
      "id": 1,
      "taskName": "login",
      "description": "Daily Login",
      "platform": "mobile",
      "category": null,
      "targetTaskName": null,
      "points": 50,
      "completed": {
        "total": 3,
        "daily": 1
      },
      "limits": {
        "total": 0,
        "daily": 1
      },
      "isFinished": true // True if totalLimit > 0 and total completed >= totalLimit. Daily limit does not affect this.
    },
    {
      "id": 2,
      "taskName": "register",
      "description": "Register Account",
      "platform": "mobile",
      "category": "Social",
      "targetTaskName": "login",
      "points": 100,
      "completed": {
        "total": 1,
        "daily": 1
      },
      "limits": {
        "total": 1,
        "daily": 0
      },
      "isFinished": true
    }
  ]
}
```

#### Error Responses
- `400 Bad Request`: Missing required fields.
- `404 Not Found`: Activity not found.
- `500 Internal Server Error`: Server errors.

---

### 3. Get Activity Details
Retrieve details of a specific activity and its associated tasks.

- **URL**: `/activity/:id`
- **Method**: `GET`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Yes | ID of the activity (Path Parameter). |
| `lang` | String | No | Language code for task descriptions (default: `en`). |

#### Example Request
`GET /activity/1?lang=en`

#### Success Response
- **Code**: `200 OK`
- **Content**:
```json
{
  "activity": {
    "id": 1,
    "name": "Launch Event",
    "startTime": "2023-10-01T00:00:00.000Z",
    "endTime": "2023-10-31T23:59:59.999Z",
    "status": "ACTIVE"
  },
  "tasks": [
    {
      "id": 1,
      "taskName": "register",
      "description": "Register an account",
      "platform": "mobile",
      "category": "Social",
      "targetTaskName": null,
      "points": 100,
      "limits": {
        "total": 1,
        "daily": 0
      }
    }
  ]
}
```

#### Error Responses
- `404 Not Found`: Activity not found.
- `500 Internal Server Error`: Server errors.
