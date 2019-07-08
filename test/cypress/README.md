# Cypress Testing

## Table of Contents

- [Before you begin (some known issues)](#before-you-begin-some-known-issues)
  - [GUI and headless mode produce different snapshots](#gui-and-headless-mode-produce-different-snapshots)
  - [GUI mode saves snapshots in different locations](#gui-mode-saves-snapshots-in-different-locations)
- [Why Cypress?](#why-cypress)
- [Structure](#structure)
- [Creating a test](#creating-a-test)
- [Running the tests](#running-the-tests)
  - [Command Line (Headless)](#command-line-headless)
  - [GUI (Headed)](#gui-headed)
- [Debugging a test](#debugging-a-test)
  - [Debugging locally](#debugging-locally)
  - [Debugging on CI](#debugging-on-ci)
- [Updating snapshots](#updating-snapshots)
  - [CI snapshots](#ci-snapshots)
  - [GUI snapshots](#gui-snapshots)

## Before you begin (some known issues)

### GUI and headless mode produce different snapshots

An open issue with Cypress https://github.com/cypress-io/cypress/issues/3324 causes the
[cypress-image-snapshot](https://github.com/palmerhq/cypress-image-snapshot/issues/67#issuecomment-499565103) plugin to capture snapshots at a smaller size when run with
`yarn cypress` (`cypress run`) as opposed to `yarn cypress:gui` (`cypress open`).

To get around this issue, two sets of snapshots are generated and committed for every test:

- `ci` - Used by Travis (CI) and for headless browser testing using the Docker container. These are the important ones.
- `local` - Used by the headed browser when testing locally using the Cypress GUI.

See the [Updating snapshots](#updating-snapshots) section for more information on generating both types of snapshots. Also see [Running the tests](#running-the-tests) for more information on how they're used.

### GUI mode saves snapshots in different locations

When using the GUI mode (`yarn cypress:gui`), how you run the specs affects where the snapshots are saved:

1. **Run All Specs**: saves snapshots under `<cypress dir>/snapshots/local/All Specs`
2. **Running an individual spec**: saves snapshots under `<cypress dir>/snapshots/local/<name-of-spec.spec>`

Headless mode always saves snapshots under `<cypress dir>/snapshots/ci/<name-of-spec.spec>`. With this in mind we are
`.gitignore`ing the `All Specs` directory.

Feel free to run specs individually during development. But be aware that the first run will generate the
snapshots (do this before you make changes to the code!).

## Why Cypress?

Cypress enables us to:

- Open a browser during development to visibly see failing tests.
- Produce pixel diffs of the `VideoContext` canvas before and after changes to code.
- Run headless browser testing as part of our Travis CI.

![cypress open](assets/readme-screenshot-cypress.png)

<p align="center"><em>The Cypress GUI</em></p>

![cypress image diff](assets/readme-screenshot-image-diff.png)

<p align="center"><em>A failing image diff</em></p>

## Structure

#### [📁 html/index.html](./html/index.html)

The very simple html fixture we use for all tests. This is pretty much just a `canvas`
element and some js to help inject `VideoContext` into our test code.

#### [📂 assets/](./assets)

A few video and image files used in the tests.

#### [📁 support/commands.js](./support/commands.js)

Where we register our custom test commands and configure the third party `matchImageSnapshot`
command.

#### [📂 integration/\*.spec.js](./integration)

The spec files containing the test code.

## Creating a test

To create a new test, add a new `my-test.spec.js` file to the `<cypress dir>/integration` directory and write your test code.

> We recommend reading through one of the existing specs first, to get an idea of how they should be structured and formatted.

If you're testing with snapshots, then you'll need to generate some base snapshots first to test against. See the [Updating snapshots](#updating-snapshots) for instructions.

## Running the tests

There are two ways to run the tests:

### Command line (Headless)

To run the tests in an environment most similar to the CI, use:

```sh
yarn cypress
```

This wil build and run a [Docker](https://www.docker.com) container with Cypress installed. The tests will be run in a headless version of the Chrome browser using the snapshots in the `<cypress dir>/snapshots/ci/` directory (see the "[GUI and headless mode produce different snapshots](#gui-and-headless-mode-produce-different-snapshots)" section for an explanation on why different snapshots are used).

> **Prerequisite**: [Docker](https://www.docker.com) must be installed on your system - download the [Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac) or [Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows) version.

### GUI (Headed)

To see the tests running inside a browser, you can run the GUI version with:

```sh
yarn cypress:gui
```

This will serve a HTML page and open the [Cypress GUI](https://www.cypress.io/features), where you can select to run all or individual specs.

These tests will use the snapshots from the `<cypress dir>/snapshots/local` directory (see the "[GUI and headless mode produce different snapshots](#gui-and-headless-mode-produce-different-snapshots)" section for an explanation on why different snapshots are used).

## Debugging a test

### Debugging locally

There are a couple of ways to find out what went wrong when a test fails.

#### 1. Watch it fail

You can watch the test fail by opening the Cypress GUI and running the test:

```sh
yarn cypress:gui
```

#### 2. Look at the image diff

Alternatively, you can inspect the difference between the accepted snapshots for your test and your most recent test run (assuming the test failed because a snapshot did not match).

First run your tests in either in [headless](#command-line-headless) or [GUI](#gui-headed) mode then, once its failed, inspect the contents of:

```sh
<cypress dir>/screenshots/<name of your spec / All Specs>/diff_output/
```

Here you will find an image like this one:

![cypress image diff](assets/readme-screenshot-image-diff.png)

<p align="center"><em>A failing image diff</em></p>

### Debugging on CI

We have a cypress dashboard where you can view screenshots of the CI test runs:

https://dashboard.cypress.io/#/projects/mdase9/runs

## Updating snapshots

If you add a new test or change the result of an existing test, then you will need to generate, commit and push an updated snapshot for both the [CI](#ci-snapshots) and [GUI](#gui-snapshots) version.

### CI snapshots

Snapshots for the CI and headless environment can be generated using:

```sh
cypress:update-snapshots
```

This wil build and run a [Docker](https://www.docker.com) container with Cypress installed. It will run the tests through a headless version of the Chrome browser and update the snapshots in the `<cypress dir>/snapshots/ci/` directory.

> **Prerequisite**: [Docker](https://www.docker.com) must be installed on your system - download the [Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac) or [Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows) version.

### GUI snapshots

Snapshots for the local GUI version can be generated using:

```sh
cypress:gui-update-snapshots
```

This will load the Cypress GUI and run through all the tests, updating the snapshots in the `<cypress dir>/snapshots/local` directory.
