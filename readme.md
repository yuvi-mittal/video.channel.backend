This repository contains the backend for VideoTube, a video streaming platform. The backend is built using Node.js and connects to a MongoDB database. The project involves handling user authentication, video uploads, and token-based authentication with access and refresh tokens.

The backend requires the following environment variables to be configured. You can create a .env file in the root of the project and define these variables:

PORT=8000
MONGODB_URI=
CORS_ORIGIN= *
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
