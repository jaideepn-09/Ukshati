#Ukshati-2.0

This is a full-stack application with a **Next.js frontend**, **Express backend**, and **MySQL database**. The project is containerized using Docker, making it easy to set up and run on any machine.

---

## Features

- **Frontend**: Next.js with hot reloading for development.
- **Backend**: Express.js with automatic server restarts using `nodemon`.
- **Database**: MySQL for persistent data storage.
- **Docker**: Containerized setup for easy deployment and development.

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

---

## Setup

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

Replace `your-username` and `your-repo` with your GitHub username and repository name.

---

### 2. Set Up Environment Variables

1. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and fill in the required values:

   ```env
   # MySQL Configuration
   MYSQL_ROOT_PASSWORD=your_root_password
   MYSQL_DATABASE=your_database_name
   MYSQL_USER=your_database_user
   MYSQL_PASSWORD=your_database_password

   # Backend Configuration
   DB_HOST=mysql
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   PORT=5000

   # Frontend Configuration
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

   Replace the placeholder values (e.g., `your_root_password`, `your_database_name`) with your actual configuration.

---

### 3. Build and Start the Containers

Run the following command to build and start the Docker containers:

```bash
docker-compose up --build
```

This will:
- Build the Docker images for the frontend, backend, and MySQL database.
- Start the containers and link them together.

---

### 4. Access the Application

Once the containers are running, you can access the application at the following URLs:

- **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend**: Open [http://localhost:5000](http://localhost:5000) in your browser.
- **MySQL Database**: Accessible on `localhost:3306` using the credentials from the `.env` file.

---

## Hot Reloading

- **Frontend**: Changes to the `frontend` code will automatically reload in the browser.
- **Backend**: Changes to the `backend` code will automatically restart the server.

---

## Stopping the Application

To stop the application, press `Ctrl+C` in the terminal where the containers are running, or run:

```bash
docker-compose down
```

This will stop and remove the containers.

---

## Troubleshooting

### 1. **MySQL Container Fails to Start**

- Ensure the `.env` file is correctly configured with valid MySQL credentials.
- Check the MySQL logs for errors:

  ```bash
  docker-compose logs mysql
  ```

### 2. **Port Conflicts**

- If port `3000` or `5000` is already in use, change the ports in `docker-compose.yml`:

  ```yaml
  services:
    frontend:
      ports:
        - "3001:3000"  # Change the host port to 3001
    backend:
      ports:
        - "5001:5000"  # Change the host port to 5001
  ```

### 3. **Hot Reloading Not Working**

- Ensure the bind mounts are correctly configured in `docker-compose.yml`:

  ```yaml
  services:
    frontend:
      volumes:
        - ./frontend:/app
        - /app/node_modules
    backend:
      volumes:
        - ./backend:/app
        - /app/node_modules
  ```

### 4. **Check Container Logs**

- If a service fails to start, check its logs for errors:

  ```bash
  docker-compose logs frontend
  docker-compose logs backend
  docker-compose logs mysql
  ```

---

## Project Structure

```
my-app/
├── frontend/            # Next.js frontend
│   ├── Dockerfile
│   ├── .env.local
│   ├── pages/
│   └── ...
├── backend/             # Express backend
│   ├── Dockerfile
│   ├── .env
│   ├── server.js
│   └── ...
├── docker-compose.yml   # Docker Compose configuration
├── .env                 # Environment variables
└── README.md            # Project documentation
```

---

## Contributing

If you'd like to contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add your feature"
   ```

4. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a pull request on GitHub.

---


---

This `README.md` is clean, well-structured, and includes all the necessary information for users to set up and run your project. It uses proper Markdown syntax, including code blocks for commands, making it easy to follow. Let me know if you need further adjustments! 😊
