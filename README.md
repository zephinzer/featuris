# Featuris Feature Toggling Server

A no-frills, unopinionated feature toggling server.

## Contents
- [Getting Started](docs/getting-started.md)
- [Feature Manifests](docs/feature-manifests.md)
- [Deploying](docs/deploying.md)
- [Configuration](docs/configuration.md)
- [Integrations](docs/integrations.md)
- [Roadmap](docs/roadmap.md)

- - -

## Feature Support

Currently supported features:
  - Static flags
  - A/B variant testing toggles
  - Scheduled value falgs
  - Acceptance flags
    - Pivotal Tracker integration

### Static Flags
Static flags are hard values which should be returned. Think of these as setting the value for different environments.

### A/B Variant Flags
A/B Variant flags are used in A/B testing and can be configured to target a certain percentage of users. For example, we can release a new feature to only 10% of users by specifying the **"a"** variant to be returned 90% of the time and the **"b"** variant to be returned 10% of the time.

### Scheduled Flags
Scheduled flags are useful for seasonal banners or other time sensitive toggles and allow us to define a start and end timing for which a `true` value should be returned.

### Acceptance Flags
Acceptance flags are useful when practicing continuous delivery with trunk based development and provide a way for product owners to toggle features on/off depending on whether they have accepted user stories.