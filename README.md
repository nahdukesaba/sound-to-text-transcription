# Sound to Text Transcription App

This is a Dockerized web application that provides sound-to-text transcription using a local OpenAI Whisper model, a React frontend, and a FastAPI backend. It also integrates with Supabase to store and display transcription history.

## Features

*   **Local Transcription**: Utilizes the OpenAI Whisper `base` model for accurate, local, and free transcription, supporting multiple languages.
*   **Web Interface**: A user-friendly React frontend for uploading audio files and viewing transcriptions.
*   **Transcription History**: Integrates with Supabase to store and retrieve past transcriptions.
*   **Dockerized**: Easily deployable using Docker and Docker Compose.
*   **Download Transcriptions**: Option to download transcriptions as `.txt` files.

## Architecture

The application consists of three main components:

1.  **Frontend (React)**: A single-page application built with React and TypeScript, providing the user interface for file uploads and displaying results.
2.  **Backend (FastAPI)**: A Python FastAPI application that handles audio file uploads, performs transcription using the Whisper model, and interacts with Supabase.
3.  **Database (Supabase)**: A cloud-based PostgreSQL database with a convenient API for storing transcription records.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)
*   A Supabase account (for database and API keys)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd sound-to-text-app
```

### 2. Supabase Configuration

1.  **Create a Supabase Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Get API Keys**: Navigate to `Project Settings > API` to find your `Project URL` and `anon public` key. These will be your `SUPABASE_URL` and `SUPABASE_KEY` respectively.
3.  **Create `transcriptions` Table**: In your Supabase project, go to the `Table Editor` and create a new table named `transcriptions` with the following schema:

    ```sql
    CREATE TABLE transcriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      filename TEXT NOT NULL,
      transcription TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    ```

### 3. Environment Variables

Create a `.env` file in the root of the `sound-to-text-app` directory (where `docker-compose.yml` is located) and add your Supabase credentials:

```env
# Supabase credentials
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_KEY="YOUR_SUPABASE_KEY"
```

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_KEY` with the values obtained from your Supabase project.

### 4. Build and Run with Docker Compose

Navigate to the root directory of the project (`sound-to-text-app`) and run:

```bash
docker-compose build
docker-compose up
```

This will build the Docker images for both the frontend and backend services and start them. The Whisper model will be downloaded the first time the backend service starts, which might take some time depending on your internet connection.

## Usage

Once the Docker containers are up and running:

1.  Open your web browser and go to `http://localhost`.
2.  On the 
frontend, you will see the upload interface.
3.  Click on the upload area or drag and drop an audio file (e.g., MP3, WAV) to select it.
4.  Click the "Start Transcription" button. The backend will process the audio and display the transcription.
5.  You can switch to the "History" tab to view all your past transcriptions stored in Supabase.
6.  From the "Upload" view, after a transcription is complete, you can click "Download as .txt" to save the transcription locally.

## Development

### Frontend

The frontend is a React application. To run it in development mode (outside Docker):

```bash
cd frontend
pnpm install
pnpm run dev
```

This will start the React development server, usually on `http://localhost:5173`.

### Backend

The backend is a FastAPI application. To run it in development mode (outside Docker):

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Ensure your `.env` file with Supabase credentials is in the `backend` directory or accessible in your environment.

## Important Notes

*   **Whisper Model**: The `base` model is used for transcription. For higher accuracy, you can modify `backend/main.py` to use a larger model (e.g., `small`, `medium`), but this will require more computational resources and download time.
*   **Hardware**: For limited hardware, the `base` model is a good balance between accuracy and performance. `fp16=False` is set in `main.py` to ensure it runs on CPU.
*   **CORS**: The backend is configured with CORS to allow requests from the frontend. If you change the frontend's domain/port, update `allow_origins` in `backend/main.py`.

## Contributing

Feel free to fork this repository, open issues, or submit pull requests.

## License

This project is open-source and available under the MIT License.
