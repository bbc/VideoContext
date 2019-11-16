# Build with:
#   docker build -t cypress-tests .
#
# Run with:
#   docker run --shm-size=256m cypress-tests
#
# Or, build and run with:
#   docker build -t cypress-tests . && docker run --shm-size=256m cypress-tests
#
# To generate new snapshots, run:
#   docker run -v `pwd`/test/cypress/snapshots:/cypress/test/cypress/snapshots -e "CYPRESS_updateSnapshots=true" --shm-size=256m cypress-tests

# This uses the Cypress image with Chrome support
# We need Chrome as Electron doesn't support WebGL
FROM cypress/browsers:node12.6.0-chrome77

# Define the working directory
WORKDIR /cypress

# Copy everything needed for installation
COPY package.json yarn.lock ./

# Install cypress
RUN yarn

# Copy over the source, tests, etc
# The ".dockerignore" prevents the user's `node_modules/*` from being copied
COPY . .

# Run the CI version of cypress
CMD ["yarn", "test-ci:cypress"]
