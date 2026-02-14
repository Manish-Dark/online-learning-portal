# How to Run the Project Locally

Since the backend and frontend rely on different servers (Node/Express backend and Vite frontend dev server), you need to run them in separate terminals.

## 1. Start the Backend (API Server)

1.  Open a **Terminal** in the root directory: `c:\Users\User\Desktop\Online Learning Portal`
2.  Run the command:
    ```bash
    npm run dev
    ```
    - This will start the backend server on `http://localhost:5000`.
    - You should see messages like "MongoDB Connected" and "Server running on port 5000".

## 2. Start the Frontend (Client)

1.  Open a **Second Terminal**.
2.  Navigate to the client directory:
    ```bash
    cd "c:\Users\User\Desktop\Online Learning Portal\client"
    ```
3.  Run the command:
    ```bash
    npm run dev
    ```
    - This will start the frontend development server on `http://localhost:5173`.
    - Open your browser and go to `http://localhost:5173` to view the application.

## Troubleshooting

- **Port Conflicts**: If port 5000 or 5173 is in use, stop any running processes or check your `package.json` scripts.
- **Environment Variables**: Ensure your `.env` file is in the root directory and contains the correct `MONGO_URI`.
