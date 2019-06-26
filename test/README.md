# Test

![build status](https://travis-ci.org/bbc/VideoContext.svg?branch=master)
![cypress](https://img.shields.io/badge/testing-cypress-informational.svg)
![jest](https://img.shields.io/badge/testing-jest-informational.svg?style=flat&logo=jest)


There are three approaches to testing within `VideoContext`. All must pass on CI for PRs to be merged.

### [🔗unit](./unit)

Testing the individual components that make up `VideoContext` as isolated units

- __framework__: [jest](https://jestjs.io/)
- __coverage__: moderate
- __coupling__: high - we're using a reasonable amount of mocking and testing against some private APIs

### [🔗integration](./integration)

Spec testing on the public APIs of `VideoContext`

- __framework__: [jest](https://jestjs.io/)
- __coverage__: moderate/low
- __coupling__: low

### [🔗cypress](./cypress)

End-to-end regression testing in the browser. `VideoContext` is driven as it would be in the real world.
Cypress is used to take and compare screenshots out the output to previous builds 

- __framework__: [cypress](https://www.cypress.io/)
- __coverage__: low
- __coupling__: low
