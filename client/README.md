# Client

This directory contains the client-side code for the Spoonful application.

## Commands

### Running the Development Server

To start the development server, run the following command. This will build the Docker image and start the container

```bash
docker-compose up --build 
```

if you have trouble getting node modules to update after you install something, rebuild with no-cache

```
docker-compose up --build --force-recreate
```

To list all the docker containers running

```
sudo docker ps -a
```

To remove a container 

```
sudo docker rm <container_id> <--- note container ID can be retrieve from the command above, will look something like 2781e82e591f
```

or remove all the stopped ones

```
sudo docker container prune 
```
### Running Tests

To run the test suite, use the following command:

```bash
docker-compose run --rm react-dev npm run test
```

**When to use:** Use this command to execute the unit and integration tests for the client application. The `--rm` flag will remove the container after the tests have run.

### Building for Production

To create a production build of the application, run the following command:

```bash
docker-compose run --rm react-dev npm run build
```

**When to use:** This capstone does not require deployment — the app is expected to run locally via `docker-compose up --build` for grading and demo. This command is available if you want to verify your app builds cleanly for production (a good practice regardless), or if you're attempting deployment as a self-directed stretch goal. The build artifacts will be located in the `dist` directory.
