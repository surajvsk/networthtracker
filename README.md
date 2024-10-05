# Secure MERN API

## Project Description
This project is a RESTful API built with Hapi.js and Sequelize for securely managing user information. PII data is encrypted, and authentication is implemented using JWT.

## Setup Instructions
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file with database connection and JWT secret.
4. Run the server: `npm start`.

## API Endpoints
- `POST /users`: Create a new user.

## Running Tests
Run `npm test` to execute unit tests.

## Deployment
The project includes a CI/CD pipeline with GitHub Actions that builds and deploys the app using Docker.
