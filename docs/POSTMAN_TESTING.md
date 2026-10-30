# Testing ToolShare with Postman

## Start the API and MongoDB

Copy `.env.example` to `.env`, then start the services from the repository root:

```sh
docker compose up -d --build
docker compose ps
```

Wait until `toolshare_mongo` is healthy and `toolshare_api` is running. MongoDB
is exposed on local port `27018`; the API is available at `http://localhost:5000`.
Connect from the host with:

```sh
mongosh "mongodb://127.0.0.1:27018/toolshare?directConnection=true"
```

## Load demo data

Run the seed command inside the API container:

```sh
docker compose exec api npm run seed
```

The script can be run again safely. It creates or updates two demo stores, four
tools, these test accounts, and one overdue reservation for `DEMO-SANDER-001`;
it does not delete other database records. Run the seed again before each
collection run to reset the overdue-return fixture.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.test` | `Admin123!` |
| Manager | `manager@example.test` | `Manager123!` |
| User | `user@example.test` | `User123!` |

The manager is assigned to `ToolShare Demo - Centre`. Demo tool references
include `DEMO-DRILL-001`, `DEMO-SAW-001`, `DEMO-SANDER-001`, and
`DEMO-LADDER-001`.

## Run the Postman collection

Import [`postman/ToolShare.postman_collection.json`](../postman/ToolShare.postman_collection.json)
in Postman. Run the requests in order:

1. Health
2. Login - Admin
3. List Stores - Admin
4. Login - Manager
5. List Tools - Manager
6. Login - User
7. Create Reservation - User
8. Cancel Reservation - User
9. List Overdue Reservations - Manager
10. Check In Damaged Tool - Manager
11. Verify Damaged Tool Unavailable - Manager
12. List My Reservations - User

The collection saves the login tokens, demo store/tool IDs, and created
reservation IDs in its collection variables. It also checks that a damaged
return completes the overdue reservation and leaves the tool unavailable. The
new-reservation request chooses a start time one hour in the future and is
cancelled by the following request.

The seeded credentials are for local testing only. Do not use them in a
deployed environment.
