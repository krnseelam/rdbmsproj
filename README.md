# 🎵 Music Label Management System (Sonic Recordings)

A full-stack, enterprise-grade **Music Label Management System** designed and built for a College RDBMS project. The application interfaces directly with an existing **MySQL 8** database schema without modifying, renaming, or duplicating any database-level logic.

---

## 🌟 Architecture & RDBMS Alignment

```
┌───────────────────────────────┐
│     React + Vite Frontend     │
│   (Tailwind CSS + Recharts)   │
│     http://localhost:3000     │
└───────────────┬───────────────┘
                │  REST API Calls (JSON)
                ▼
┌───────────────────────────────┐
│     Express.js API Server     │
│   (Node.js + mysql2 Pool)     │
│     http://localhost:5001     │
└───────────────┬───────────────┘
                │  Parameterized SQL Queries
                ▼
┌─────────────────────────────────────────────────────────────┐
│                      MySQL 8 Database                       │
│                     (music_label_db)                        │
│                                                             │
│  • Views:            v_song_details, v_royalty_earnings,    │
│                      v_artist_summary, v_active_contracts   │
│  • Procedures:       sp_add_royalty, sp_calculate_payouts   │
│  • Stored Function:  fn_song_earnings                       │
│  • Triggers:         trg_royalties_before_insert,           │
│                      trg_royalties_before_update,           │
│                      trg_contracts_before_insert            │
└─────────────────────────────────────────────────────────────┘
```

### Key RDBMS Business Logic Rules Enforced
1. **Views**:
   - `v_song_details`: Powers all master track, album, and artist relations.
   - `v_royalty_earnings`: Calculates gross earnings dynamically (`stream_count * rate_per_stream`). Money is never statically duplicated in tables.
   - `v_artist_summary`: Supplies real-time album and song counts per artist.
   - `v_active_contracts`: Directly filters active agreements (`WITH CHECK OPTION`).
2. **Stored Procedures**:
   - `sp_add_royalty(p_song_id, p_platform_id, p_period, p_streams)`: Handles insertion and accumulates stream count (`ON DUPLICATE KEY UPDATE stream_count = stream_count + p_streams`).
   - `sp_calculate_payouts(p_period)`: Uses MySQL cursors and temporary tables (`tmp_payout`) to calculate artist gross revenue, contractual royalty percentages, and final payouts.
3. **Stored Function**:
   - `fn_song_earnings(p_song_id)`: Evaluates lifetime earnings for any given master track.
4. **Triggers**:
   - `trg_royalties_before_insert` & `trg_royalties_before_update`: Signals `SQLSTATE '45000'` if a royalty period precedes the album release date.
   - `trg_contracts_before_insert`: Enforces that an artist cannot hold overlapping active contracts, and auto-expires contracts whose end date has passed.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ or v20+ LTS
- **MySQL Server**: 8.0 or 8.4 running on port 3306

### 1. MySQL Database Setup
If you haven't loaded the database yet, run the scripts included in the `database/` directory:

```bash
# 1. Connect to MySQL as root and execute the DDL & DML script
mysql -u root -p < database/ddl-dml-ftp.sql

# 2. Execute user management & privileges script
mysql -u root -p < database/user_management_queries.sql
```

The database user configured for the application is:
- **User**: `label_app`
- **Password**: `App@12345`
- **Database**: `music_label_db`

### 2. Configure Environment Variables
Copy `.env.example` into `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Ensure `backend/.env` contains:
```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=label_app
DB_PASSWORD=App@12345
DB_NAME=music_label_db
```

### 3. Start the Backend API Server
```bash
cd backend
npm install
npm run dev
```
The backend server runs on `http://localhost:5001`.

### 4. Start the Frontend React Client
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React frontend opens at `http://localhost:3000`.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Database Mechanism |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/dashboard/stats` | Aggregated dashboard KPI counters | Base tables, `v_active_contracts`, `v_royalty_earnings` |
| **GET** | `/api/dashboard/earnings` | Monthly revenue trends | `v_royalty_earnings` GROUP BY `royalty_period` |
| **GET** | `/api/dashboard/top-artists` | Top 5 artists by earnings | `v_royalty_earnings` GROUP BY artist |
| **GET** | `/api/dashboard/top-songs` | Top 5 songs by stream count | `v_royalty_earnings` GROUP BY song |
| **GET** | `/api/dashboard/platforms` | Stream and earnings distribution | `v_royalty_earnings` GROUP BY platform |
| **GET** | `/api/artists` | List all artists with summary stats | `artists` LEFT JOIN `v_artist_summary` |
| **GET** | `/api/artists/:id` | Artist profile, albums, tracks, contracts | `artists`, `albums`, `v_song_details`, `contracts` |
| **POST** | `/api/artists` | Create new recording artist | `INSERT INTO artists` (checks unique email, debut year) |
| **PUT** | `/api/artists/:id` | Update artist details | `UPDATE artists` |
| **DELETE**| `/api/artists/:id` | Delete artist | `DELETE FROM artists` (protected by FK constraints) |
| **GET** | `/api/albums` | List albums with track count & duration | `albums` JOIN `artists` LEFT JOIN `songs` |
| **GET** | `/api/albums/:id` | Album tracklist with individual earnings | `albums` JOIN `v_song_details`, `fn_song_earnings()` |
| **POST** | `/api/albums` | Register new album | `INSERT INTO albums` |
| **PUT** | `/api/albums/:id` | Update album | `UPDATE albums` |
| **DELETE**| `/api/albums/:id` | Delete album (cascades to tracks) | `DELETE FROM albums` |
| **GET** | `/api/songs` | List songs with credits and earnings | `v_song_details`, `fn_song_earnings()`, credits |
| **GET** | `/api/songs/:id` | Song details & streaming history | `v_song_details`, `song_producers`, `song_songwriters` |
| **POST** | `/api/songs` | Create master track with producers/writers | Transaction across `songs`, `song_producers`, `song_songwriters` |
| **PUT** | `/api/songs/:id` | Update track and credits | Transaction across songs and link tables |
| **DELETE**| `/api/songs/:id` | Delete track | `DELETE FROM songs` (protected if royalties exist) |
| **GET** | `/api/producers` | Producers list & tracks produced count | `producers` LEFT JOIN `song_producers` |
| **POST** | `/api/producers` | Add producer | `INSERT INTO producers` |
| **PUT** | `/api/producers/:id` | Update producer | `UPDATE producers` |
| **DELETE**| `/api/producers/:id` | Delete producer | `DELETE FROM producers` |
| **GET** | `/api/songwriters` | Songwriters list & tracks written count| `songwriters` LEFT JOIN `song_songwriters` |
| **POST** | `/api/songwriters` | Add songwriter | `INSERT INTO songwriters` |
| **PUT** | `/api/songwriters/:id` | Update songwriter | `UPDATE songwriters` |
| **DELETE**| `/api/songwriters/:id` | Delete songwriter | `DELETE FROM songwriters` |
| **GET** | `/api/contracts` | All contracts with artist names | `contracts` JOIN `artists` |
| **GET** | `/api/contracts/active` | Active contracts only | `v_active_contracts` JOIN `artists` |
| **POST** | `/api/contracts` | Sign contract agreement | `INSERT INTO contracts` (validated by `trg_contracts_before_insert`) |
| **PUT** | `/api/contracts/:id` | Update contract | `UPDATE contracts` |
| **DELETE**| `/api/contracts/:id` | Delete contract | `DELETE FROM contracts` |
| **GET** | `/api/platforms` | Streaming platforms with revenue generated| `streaming_platforms` LEFT JOIN `royalties` |
| **POST** | `/api/platforms` | Add platform | `INSERT INTO streaming_platforms` |
| **PUT** | `/api/platforms/:id` | Update platform | `UPDATE streaming_platforms` |
| **DELETE**| `/api/platforms/:id` | Delete platform | `DELETE FROM streaming_platforms` |
| **GET** | `/api/royalties` | Raw stream counts | `royalties` JOIN songs, albums, artists, platforms |
| **GET** | `/api/royalties/earnings` | Filtered earnings report | `v_royalty_earnings` (filters: artist, platform, month) |
| **POST** | `/api/royalties` | Record or increment streams | `CALL sp_add_royalty(?, ?, ?, ?)` (trigger checked) |
| **GET** | `/api/payouts/periods` | Available payout periods in DB | `SELECT DISTINCT royalty_period FROM royalties` |
| **POST** | `/api/payouts/calculate` | Execute payout calculations | `CALL sp_calculate_payouts(?)` |

---

## 🛡️ Database Error & Trigger Handling
The backend implements centralized MySQL error mapping:
- **`SQLSTATE '45000'` (Trigger Exceptions)**: Forwards the exact trigger failure message (e.g., *"Royalty period is before the album release date"* or *"Artist already has an overlapping Active contract"*).
- **`1062` (Duplicate Key)**: Identifies violated unique constraint (`uq_artists_email`, `uq_songs_track`, etc.).
- **`1451` (Foreign Key Restrict)**: Explains why a parent record cannot be deleted when dependent child records exist.
- **`3819` (Check Constraint Failure)**: Explains domain constraint rejections (`debut_year BETWEEN 1900 AND 2100`, `royalty_percent BETWEEN 0 AND 100`, `advance_amount >= 0`, `end_date > start_date`).

---

## 🎨 UI Pages & Navigation Routes
- `/dashboard`: High-level metrics, monthly revenue trends, platform breakdown, top artists and songs.
- `/artists` & `/artists/:id`: Artist CRUD, profile view, linked discography, and contract agreements.
- `/albums` & `/albums/:id`: Studio release tables, tracklists with individual song earnings.
- `/songs` & `/songs/:id`: Master tracks table with multi-select producer/songwriter credit assignments.
- `/producers`: Directory of sound engineers with track credit counts.
- `/songwriters`: Directory of lyrical composers with credit counts.
- `/contracts`: Agreement management with active contract filtering via `v_active_contracts`.
- `/platforms`: DSP partner registry with clickable official websites and rate settings.
- `/royalties`: 3-section tabbed interface (Raw Records, Filtered `v_royalty_earnings`, and `sp_add_royalty` submission form).
- `/payouts`: Period selector and execution of `sp_calculate_payouts()`, presenting artist payouts and summary metrics.

---

## ⚡ Vercel Deployment Guide

The repository includes native Vercel configuration (`vercel.json` + `api/index.js` serverless function):

### 1. Push to GitHub
Ensure the project is pushed to your GitHub repository:
```bash
git push -u origin main
```

### 2. Import into Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New Project"** and select `krnseelam/rdbmsproj`.
3. Vercel will detect `vercel.json` automatically:
   - **Framework Preset**: Other (or Vite)
   - **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build`
   - **Output Directory**: `frontend/dist`

### 3. Environment Variables on Vercel
Add the following Environment Variables in the Vercel project settings:
- `DB_HOST`: Your cloud MySQL host (e.g. from Aiven, PlanetScale, Railway, TiDB Cloud, AWS RDS)
- `DB_PORT`: `3306` (or your cloud MySQL port)
- `DB_USER`: Your MySQL username
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: `music_label_db`
- `DB_SSL`: `true` (enables SSL encryption for cloud MySQL connections)

### 4. Deploy
Click **Deploy**. Vercel will:
1. Build the React frontend into static assets served globally on the edge.
2. Convert the Express backend (`api/index.js`) into a serverless function responding to `/api/*`.
3. Route all client-side routes (`/dashboard`, `/artists`, `/albums`, etc.) directly to the React application.

---

## 👨‍💻 Student Information
- **Student**: Karan Kumar Seelam
- **Registration No.**: 2502050710
- **Section**: E4
- **Project**: Music Label Management System (RDBMS)
