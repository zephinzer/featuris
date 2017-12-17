# Contribution Guide

Fork this repository, add your changes, write tests for them (in `./tests` according to component path) and document them in the readme (in `./docs`).

Submit a merge requests back to this repository (:

## Guidelines
As far as possible, please try to follow the guidelines set forth in the [twelve factor app](https://12factor.net/). Specifically, some things to note:

- keep configurations in the environment (keys, tokens *et cetera*)
- do not depend on configuration for logical code execution (no `if (process.env.* === 'something') {...}`)

Code reviews will be done on submitting of a pull request.

## Running Locally
To start the application locally, you'll need an `.env` file to specify environment variables such as your API keys (if you're developing a new integration). Start the application locally via:

```bash
npm start
```

## Style Guide
We use ESLint to enforce coding conventions. You can check out the configuration in `.eslintrc.json`. We follow [Google's JavaScript style guide](https://google.github.io/styleguide/javascriptguide.xml).

To run the linter, use:

```bash
npm run eslint
```

## Testing
We use Mocha to test and the command to run the test is:

```bash
npm run test
```

In development, it will be useful to run it with watches via:

```bash
npm run test-watch
```

## Building & Releasing
The build and release is done automatically on Travis upon merging with `master` branch. We use Docker to package the application for use.

To test the build process, you may run:

```bash
npm run build
```

Then to try running it locally, follow the instructions in [Deploying - Via Docker Image Pull](./deploying.md#via-docker-image-pull).
