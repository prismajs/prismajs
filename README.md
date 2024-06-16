# PrismaJS Framework

PrismaJS is a large-scale framework in Node.js using Express, inspired by Laravel. This framework aims to provide developers with flexibility in front-end choices while maintaining a robust structure and functionalities similar to Laravel.

## Features

- **Template Engine Support**: Default support for EJS templates.
- **Front-end Integration**: Supports React with Inertia.js for seamless server-side rendering and single-page application capabilities.
- **Middleware**: Incorporates middleware architecture similar to Laravel.
- **Events and Jobs**: Allows for event-driven development and background jobs.
- **Socket Services**: Provides built-in support for WebSocket services.
- **Route Grouping and Resourceful Routes**: Facilitates organized and RESTful route management.
- **Service Provider Architecture**: Enables modular and scalable application development.

## Why PrismaJS?

PrismaJS is designed to bring the best of Laravel to the Node.js ecosystem. It offers a familiar structure for Laravel developers transitioning to Node.js, along with the flexibility to use modern front-end frameworks like React. With features like middleware, events, jobs, and socket services, PrismaJS aims to be a comprehensive solution for building scalable web applications.

## Current Phase

**Note**: PrismaJS is currently in the development phase and is not recommended for production applications. We are actively working on stabilizing the framework and adding more features.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/prismajs.git
    ```

2. Navigate to the project directory:
    ```bash
    cd prismajs
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Set up your environment variables by copying `.env.example` to `.env` and configuring as needed:
    ```bash
    cp .env.example .env
    ```

### Basic Usage

1. Create a new application by copying the `example-app` folder (if provided) or setting up your project structure manually.

2. Start the development server:
    ```bash
    npm run dev
    ```

### Directory Structure

- `app/`: Contains the core application files.
- `config/`: Configuration files for the application.
- `public/`: Public assets.
- `resources/`: Views and templates.
- `routes/`: Route definitions.
- `storage/`: Storage for logs and uploaded files.

### Creating Routes

Routes can be defined in the `routes/web.js` file. Here is an example of a basic route:

```javascript
const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.render('welcome');
});

module.exports = router;
```
### Middleware
Middleware can be added to the app/Http/Middleware directory and registered in the app.js file.

### Example Middleware
Here is an example of a simple middleware that logs the request method and URL:

Create a file named LogRequests.js in the app/Http/Middleware directory:

```javascript
class LogRequests {
    handle(req, res, next) {
        console.log(`${req.method} ${req.url}`);
        next();
    }
}

module.exports = LogRequests;
```
Register the middleware in app.js:

```javascript
const express = require('express');
const app = express();
const LogRequests = require('./app/Http/Middleware/LogRequests');

// Use the middleware
app.use((req, res, next) => new LogRequests().handle(req, res, next));

// Other middlewares and routes

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
```
### Service Providers

Service providers are used to bind classes into the service container and can be created in the `app/Providers` directory.

### Events and Jobs

Events and jobs can be created and managed within the `app/Events` and `app/Jobs` directories respectively.

### Contributing

We welcome contributions from the community. Please read our contributing guidelines for more information.

### License

This project is licensed under the MIT License. See the LICENSE file for details.


## Contact

- **Email**: [me@chwaqas.com](mailto:me@chwaqas.com)
- **Website**: [www.chwaqas.com](http://www.chwaqas.com)
- **WhatsApp**: +92 332 4500545
