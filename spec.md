# Care-Cartography-Commons Technical Project Specification

## 1. Overview

**Purpose**

To collect user feedback via a mobile interface accessed through QR codes, and transform this data into a generative visual artwork that evolves in real time. The system supports filtering and analysis by researchers.

**Stakeholders**

- Users of participating institutions
- Researchers and administrators
- Artists and designers
- Developers
- Curators / Art institutions

**Technical scope**

- QR-based feedback collection
- Backend API and data storage
- Generative artwork engine
- Admin panel for data filtering and export
- Dockerized deployment
- Monorepo codebase with JS/TS frontend and Python/PostgreSQL backend

---

## 2. User Experience Flow

1. User scans a QR code.
2. A mobile-friendly web interface opens.
3. User must consent to data collection.
4. User submits a rating (e.g., 1–5 scale).
5. The system captures:
    - Rating
    - Timestamp
    - Hashed institution ID
    - Optional: Location (GPS coordinates)
6. Data is sent to the backend.
7. Artwork engine updates visual output based on new data.
8. Artwork is shown to user in the browser.
9. Artwork display in a central location updates with the new data point.

---

## 3. System Architecture

### Monorepo Structure

Frontend and backend code is organized in a monorepo and containerized with docker.

```
project-root/
├── apps/
│   ├── frontend/        # React or Astro app
│   ├── artwork-display/ # paper.js renderer
│   └── admin-panel/     # Admin interface for researchers
├── packages/
│   ├── api/             # FastAPI backend
│   ├── db/              # Database models and migrations
│   └── shared/          # Shared utilities (language-specific)
├── docker/
│   └── Dockerfile       # Unified container setup
├── docker-compose.yml   # Multi-service orchestration
├── Caddyfile            # Caddy server configuration
├── README.md            # Project documentation
└── .env                 # Environment variables
```

### Development

- **Database**: Use a docker-compose.dev.yml to run a PostgreSQL container for the database. Create tables and fill with test data.
- **Backend**: Run the FastAPI server from the packages/api directory with uvicorn for hot reloading.
- **Frontend**: Each frontend application in apps/ will have its own development server (e.g., Vite). Can run concurrently.

### Deployment

Build process is a multi-stage Dockerfile:

1. Build frontend: Start from a Node.js base image. Copy the JS/TS source code, install dependencies, and run the `turbo build` command.
2. Build backend: Start from a Python base image. Copy the Python source code, install dependencies.
3. Final image contains both the built frontend assets and the backend server.

- Uses Docker Compose for multi-container setup (e.g., server/api + PostgreSQL + caddy).
- Static frontend files are served via caddy (using https).

### Runtime tasks

- Hourly backups of the PostgreSQL database.
- Store shown artwork snapshots daily/weekly/monthly.

---

## 4. Data Specification

**Rating**

- Type: Integer (1–3)

**Timestamp**

- Format: ISO 8601
- Timezone: Copenhagen

**Location**

- Format: Institution id (UUID)

**DB storage**

- PostgreSQL
- Tables:
  - `ratings`:
    - id (UUID string)
    - rating (integer)
    - timestamp (string)
    - institution_id (UUID string)
  - `institutions`:
    - id (UUID string)
    - name (string)
    - qr_code (image file)
    - location (coordinates for whole map)
    - active_start (timestamp)
    - active_end (timestamp)
    - created_at (timestamp)
    - updated_at (timestamp)
  - `artwork_snapshots`:
    - image (file path or blob)
    - timestamp (string)
    - metadata (JSON)
  - `admins`:
    - id (UUID string)
    - username (string)
    - password_hash (string)
    - role (string: admin/researcher)

---

## 5. Artwork

**Input Parameters**

Datapoints containing:

- Ratings
- Locations
- Timestamp?

**Visual Output**

- 2D canvas with artistic representation of data (paper.js)
- Static or lightly animated
- Evolves based on incoming data
- With multiple institutions, user sees the whole map but can zoom in on a single institution if desired

**Style**

- Artist-defined style
- To be determined in collaboration with artists

---

## 6. Admin panel features

**Administration**

- CRUD-operations on institutions and QR-codes
- Management of data collection

**View data with filtering**

- By time range
- By institution or location

**Export/download**

- CSV or JSON data dumps
- Artwork snapshots

**Access control**

- Login for admins/researchers

---

## 7. Endpoints

Frontend:

- `POST /api/ratings`: Submit a new rating
- `GET /artwork`: Show artwork frontend

Admin panel:

- `GET /admin`: Show admin panel frontend

- `GET /api/institutions`: List institutions
- `POST /api/institutions`: Create a new institution
- `GET /api/institutions/{id}`: Show an institution
- `PUT /api/institutions/{id}`: Update an institution
- `DELETE /api/institutions/{id}`: Delete an institution

---

## 8. Security and privacy

- Ratings are anonymous
- Institution IDs are hashed
- API secured with authentication for admin panel
- HTTPS enforced via Caddy
- Artwork data does not expose individual ratings

---

## 9. Development plan

**Milestones**

- MVP: QR interface + backend + basic artwork
- Phase 2: Admin panel + filtering
- Phase 3: Artist collaboration + aesthetic refinement
- Phase 4: Deployment and testing
