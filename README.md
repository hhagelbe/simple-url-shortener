# Simple URL Shortener

This service allows you to shorten URLs and retrieve the original URLs by their shortened codes. It will also redirect you to the original URL when browsing the shortened URL.

## Features

- **Shorten URLs**: Convert long URLs into shorter, more manageable ones.
- **Redirect Shortened URLs**: Redirect to the original URL when accessing the shortened URL.
- **Fetch Original URL**: Retrieve the original URL using the shortened code.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (>=16.0.0)
- [PostgreSQL](https://www.postgresql.org/) (latest version recommended)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/simple-url-shortener.git
    cd simple-url-shortener
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
  
    Copy the example environment file and edit it with your own values:

    ```bash
    cp .env.example .env
    ```  

    You can adjust following env variables:


    ```env
    APP_PORT=3000
    APP_URL=http://localhost:3000
    DATABASE_URL=postgresql://username:password@localhost:5432/your-database
    ```

    Replace username, password, localhost, and your-database with your PostgreSQL credentials and database name.

4. **Start database:**

    ```bash
    docker compose up
    ```

5. **Run Prisma migrations:**
    
    ```bash
    npx prisma migrate deploy
    ```

6. **Start the application:**
  - For development:
    ```bash
    npm run start:dev
    ```
  - For prodution:
    ```bash
    npm run start:prod
    ```

## Endpoints

- **POST `/shorten`**
    
    Creates a shortened URL.

    **Request Body:**
    ```JSON
    {
      "url": "http://example.com"
    }
    ```

    **Response:**
    ```JSON
    {
      "code": "ABC123",
      "shortUrl": "http://localhost:3000/ABC123",
      "originalUrl": "http://example.com"
    }
    ```
- **GET `/original?code=ABC123`**

  Retrieves the original URL for a given code.

  **Response:**
    ```JSON
    {
      "code": "ABC123",
      "shortUrl": "http://localhost:3000/ABC123",
      "originalUrl": "http://example.com"
    }
    ```

- **GET `/:code`**

  Redirects to the original URL for a given code.

  **Response:**

  Redirects to the original URL, e.g., http://example.com.

## Running Tests

- **Unit tests:**

    ```bash
    npm run test
    ```

- **E2E tests:**

    ```bash
    npm run test:e2e
    ```

- **Coverage report:**

    ```bash
    npm run test:cov
    ```

## Linting and Formatting

- **Lint:**

    ```bash
    npm run lint
    ```

- **Format:**

    ```bash
    npm run format
    ```
