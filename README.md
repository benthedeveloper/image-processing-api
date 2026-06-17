# Image Processing API
TODO document what the app does, how it works, URL examples.

## Prerequisites
* [NodeJS](https://nodejs.org/) (this app has been tested to work on latest LTS version 24.16.0)
* I recommend using Node Version Manager (NVM) to be able to easily switch between any version of Node:
  * unix, macOS, Windows WSL: https://github.com/nvm-sh/nvm
  * Windows: https://github.com/coreybutler/nvm-windows

## Setup
1. Clone the repo
2. Run `npm install` to install dependencies

## Running the app locally
Run `npm run start` to start the server locally.

## Tests
Unit tests are written using [Jasmine](https://jasmine.github.io/), [SuperTest](https://www.npmjs.com/package/supertest) library for API testing.
Run `npm test` to run the tests.

## Linting
Run `npm run lint` to run ESLint.

## Building
Run `npm run build` to compile the TypeScript code to the `dist` folder.
