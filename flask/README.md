# Flask Statistics Function

This folder contains the Python Flask application for serving statistics API.

## Setup Instructions

1.  **Install Python:** Ensure you have Python installed.
2.  **Install Dependencies:**
    Open a terminal in this `flask` directory and run:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the Server:**
    ```bash
    python app.py
    ```
    The server will start on `http://localhost:5000`.

## API Endpoints

-   `GET /api/stats/monthly` - Monthly revenue and order count.
-   `GET /api/stats/weekly` - Weekly stats.
-   `GET /api/stats/daily` - Daily stats (last 30 days).
-   `GET /api/stats/yearly` - Yearly stats.

## Database Configuration

Update `db_config` in `app.py` if your MySQL credentials differ from the default (root, no password, localhost).
