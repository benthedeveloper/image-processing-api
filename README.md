# Image Processing API

This app was built for the course [Backend Development with NodeJS](https://www.udacity.com/course/backend-development-with-node-js--cd0292) on [Udacity](https://www.udacity.com/). It is an image processing server app built with [NodeJS](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), and uses [Sharp](https://sharp.pixelplumbing.com/) to do the image processing.

Here's how it works:

1. First make sure you have the required prerequisites, and went through the Setup steps.
2. Run the app (run `npm start` from a terminal). A server will start at `http://localhost:3000`.
3. You may add any image assets you want to the assets/full directory (supported file types are JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF). There are 5 images pre-supplied, and an additional .txt file just for testing purposes.
4. In a browser, navigate to the URL `http://localhost:3000/api/images?filename={name_of_file}&width={desired_width}&height={desired_height}`. Width and height are optional, but supplying at least one makes the most sense.

Example URL: [http://localhost:3000/api/images?filename=fjord&width=200&height=140](http://localhost:3000/api/images?filename=fjord&width=200&height=140)

The local server will resize the image to the specified width/height (cropping if necessary, using Sharp's defaults), and output the result into the directory `assets/thumbs`. The resulting filename will look like `{name_of_file}_{width}x{height}.{extension}`. If you load the image again (reload the page, or visit the same URL), and that image already exists in the `assets/thumbs` directory, then that cached image will be served, rather than re-processing the image to the same size.

This app could be used to create thumbnails, placeholder images for wireframes, etc. It could also be forked and extended to add more functionality, as Sharp has many image processing capabilities way beyond just resizing width/height.

## Prerequisites

* [NodeJS](https://nodejs.org/) (this app has been tested to work on latest LTS version 24.16.0)
* I recommend using Node Version Manager (NVM) to be able to easily switch between any version of Node:
  * unix, macOS, Windows WSL: [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
  * Windows: [https://github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)

## Setup

1. Clone the repo
2. Run `npm install` to install dependencies

## Running the app locally

Run `npm run start` to start the server locally.

## Tests

Unit tests are written using [Jasmine](https://jasmine.github.io/), [SuperTest](https://www.npmjs.com/package/supertest) library for API testing.
Run `npm test` to run the tests.

## Linting

Run `npm run lint` to run ESLint to check for linting errors/warnings.

## Building

Run `npm run build` to compile the TypeScript code to the `dist` folder.
