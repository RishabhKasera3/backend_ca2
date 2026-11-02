# Student Feedback Management API

A beginner-friendly REST API for submitting student feedback, listing feedback with pagination, and updating its review status.

## Technology stack

- Node.js and Express.js
- MongoDB with Mongoose
- CommonJS JavaScript
- dotenv

## Installation

Install Node.js and MongoDB, then run these commands from the project directory:

```bash
npm install
```

Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string. The supplied local default connects to a MongoDB server on this computer.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/student-feedback-api
PORT=8000
```

For MongoDB Atlas, replace the local URI with your Atlas connection string and ensure the database user and network access are configured. Do not commit `.env`; it is excluded by `.gitignore`.

## Run the project

Start the API:

```bash
npm start
```

For development with Node's file watcher:

```bash
npm run dev
```

The API listens on `http://localhost:8000` after a successful MongoDB connection. If MongoDB cannot be reached or `MONGODB_URI` is missing, startup reports the error and exits.

## Data model

Feedback documents contain `studentName`, `courseName`, `message`, `rating` (1–5), `status` (`Pending` or `Reviewed`), and Mongoose-managed `createdAt` and `updatedAt` timestamps. New feedback has status `Pending`.

## API endpoints

All endpoints use the `/api/feedback` base path and JSON request/response bodies.

### Submit feedback

`POST /api/feedback` — returns `201 Created`; required text values cannot be blank and rating must be a JSON number from 1 through 5.

Request:

```json
{
  "studentName": "Rahul",
  "courseName": "Database Management",
  "message": "The teaching method is excellent.",
  "rating": 5
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "673000000000000000000001",
    "studentName": "Rahul",
    "courseName": "Database Management",
    "message": "The teaching method is excellent.",
    "rating": 5,
    "status": "Pending",
    "createdAt": "2026-11-02T05:50:00.000Z",
    "updatedAt": "2026-11-02T05:50:00.000Z",
    "__v": 0
  }
}
```

Missing/blank fields, non-numeric ratings, or ratings outside the range return `400 Bad Request`.

### Retrieve feedback

`GET /api/feedback?page=1&limit=10` — both query parameters are optional; defaults are `page=1` and `limit=10`. Page and limit must be positive integers. Records are ordered newest first.

Response:

```json
{
  "success": true,
  "currentPage": 1,
  "totalRecords": 25,
  "totalPages": 3,
  "data": []
}
```

Invalid page or limit values return `400 Bad Request`. `data` contains the feedback documents for the requested page.

### Update feedback status

`PATCH /api/feedback/:id` — accepts only `Pending` or `Reviewed`; returns `200 OK` with the updated record.

Request:

```json
{
  "status": "Reviewed"
}
```

Malformed IDs and invalid statuses return `400 Bad Request`. A well-formed ID that does not match a document returns `404 Not Found`.

## Error responses

Errors use this JSON shape:

```json
{
  "success": false,
  "message": "A useful description of the error"
}
```

The API uses `400` for invalid input, `404` for missing routes or feedback, and `500` for unexpected server errors.

## Postman testing

1. Start MongoDB and run `npm start`.
2. In Postman, set the request body type to **raw** and **JSON** for POST and PATCH requests.
3. Use `http://localhost:8000` as the base URL.

| Test | Method and URL | Body | Expected result |
|---|---|---|---|
| Submit feedback | `POST /api/feedback` | `{"studentName":"Rahul","courseName":"Database Management","message":"The teaching method is excellent.","rating":5}` | `201`; `success: true`, new feedback in `data`, status `Pending`. |
| Missing fields | `POST /api/feedback` | `{"studentName":"Rahul"}` | `400`; required field error. |
| Rating of 6 | `POST /api/feedback` | `{"studentName":"Rahul","courseName":"Database Management","message":"Excellent.","rating":6}` | `400`; rating range error. |
| First page | `GET /api/feedback` | None | `200`; page 1, total count/pages, and up to 10 records. |
| Second page | `GET /api/feedback?page=2&limit=5` | None | `200`; page 2 and up to 5 records. |
| Mark reviewed | `PATCH /api/feedback/<id-from-create-response>` | `{"status":"Reviewed"}` | `200`; updated feedback has status `Reviewed`. |
| Unknown feedback ID | `PATCH /api/feedback/673000000000000000000099` | `{"status":"Reviewed"}` | `404` if no document has that ID. |
| Invalid status | `PATCH /api/feedback/<id-from-create-response>` | `{"status":"Done"}` | `400`; only `Pending` or `Reviewed` is allowed. |

Use the `_id` returned by the create request for update tests. To test pagination beyond page 1, create at least six feedback records.

# CA2_BACKEND
