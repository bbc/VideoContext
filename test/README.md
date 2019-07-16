# Test

![build status](https://travis-ci.org/bbc/VideoContext.svg?branch=master)
![cypress](https://img.shields.io/badge/testing-cypress-informational.svg)
![jest](https://img.shields.io/badge/testing-jest-informational.svg?style=flat&logo=jest)

There are three approaches to testing within `VideoContext`. All must pass on CI for PRs to be merged.

### [🔗unit](./unit)

Testing the individual components that make up `VideoContext` as isolated units

- **framework**: [jest](https://jestjs.io/)
- **coverage**: moderate
- **coupling**: high - we're using a reasonable amount of mocking and testing against some private APIs

### [🔗integration](./integration)

Spec testing on the public APIs of `VideoContext`

- **framework**: [jest](https://jestjs.io/)
- **coverage**: moderate/low
- **coupling**: low

### [🔗cypress](./cypress)

End-to-end regression testing in the browser. `VideoContext` is driven as it would be in the real world.
Cypress is used to take and compare screenshots out the output to previous builds

- **framework**: [cypress](https://www.cypress.io/)
- **coverage**: low
- **coupling**: low

For more detail see [./cypress#readme](./cypress#readme)
