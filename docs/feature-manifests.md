# Feature Manifests
Feature manifests are YAML or JSON formatted files that indicate to Featuris the feature flags, their types and values.

Feature manifests are stored as files at `./data/features` by default. You change that by modifying the configuration through the `DEFAULT_DATA_SOURCE` environment variable. See [Configurations > DEFAULT_DATA_SOURCE](configuration.md#default_data_source) for more info.

Featuris will read through all YAML and JSON files in the specified directory and add the filename as a path endpoint to access each feature flag set. For example, given two files in `./data/features`:

```bash
ls -lA ./data/features;
# -rw-r--r--  1 zephinzer  staff  1107 Dec 11 23:24 ab-tests.yaml
# -rw-r--r--  1 zephinzer  staff  1107 Dec 11 23:24 in-development.yaml
```

There will exist two endpoints:

`http://localhost:3000/ab-tests`

and

`http://localhost:3000/in-development`

They will return the feature sets specified in the `.yaml` files respectively.

- - -

We proceed with a complete example followed by documentation for the various types of feature toggles.

## Complete Example
This example assumes the use of three environments, *development*, *staging* and *production*, and feature flags for three features, each demonstrating different types of feature flags.

The `checkout_page` feature flag controls a feature that is under development and is intended to be hidden in production.

The `purchase_button_component` feature flag is performing an A/B test of two designs of a purchase button.

Lastly, the `display_christmas_banner` feature flag is indicating whether to display a Christmas banner and is activated throughout the 12 days of Christmas.

```yaml
checkout_page:
  development: true
  staging: true
  production: false
purchase_button_component:
  development: "a"
  staging: "a"
  production:
    type: variant
    values:
      - value: "a"
        percentage: 50
      - value: "b"
        percentage: 50
display_christmas_banner:
  development: false
  staging: true
  production:
    type: schedule
    values:
      - from: "2017-12-25 00:00:00"
        to: "2018-01-05 23:59:59"
```

## Generic Structure

### Root
The root keys of the feature manifest should be the feature IDs:

```yaml
feature_toggle_id:
  environment_name:
    ...
...
```

### Environment Key
The `environment_name` property should specify an object with details about the feature flag and the keys within `environment_name` is dependent on the type of feature flag.

```yaml
environment_name:
  type: String
  [source]: String (used for acceptance flags)
  [state]: String (used for acceptance flags)
  [values]: Array<Object> (all flags except static)
    - [from]: DateString (used for schedule flags)
      [to]: DateString (used for schedule flags)
    - [value]: Any (used for variant flags)
      [percentage]: Float32 (used for variant flags)
    - : Number (used for acceptance flags)
  [value]: Any (used for static flags)
```

The environment key is selected by Featuris based on the `NODE_ENV`. For example, if `NODE_ENV` is `production`, only feature flags under the `production` environment name will be returned. If no `NODE_ENV` is specified, all environments will be returned.

For example, given a feature manifest:

```yaml
feature_01:
  env_01: true
  env_02: false
  env_03:
    type: schedule
    values:
      - from: "2017-04-20 12:35:00"
        to: "2017-04-20 16:20:00
```

When the `NODE_ENV` is set to `env_01`, the returned value is `true`.

When the `NODE_ENV` is set to `env_02`, the returned value is `false`.

Finally when the `NODE_ENV` is set to `env_03`, the returned value is calculcated to true if the current time is between 20th April 2017 12:35 PM and 20th April 4:20 PM.

If `NODE_ENV` is not set, the returned value includes all environments. This looks like:

```
{
  "env_01": {
    "value": true,
    ...
  },
  "env_02": {
    "value": false,
    ...
  },
  "env_03": {
    "value: true
  }
}
```

- - -

## Feature Flag Types
We proceed by running through each of the supported types of feature flags and examples of them.

- [Static](#static)
- [Variant](#variant)
- [Schedule](#schedule)
- [Acceptance](#acceptance)

### Static
Static values are used when developers have begun working on a story but are not yet ready to push it into production. Hence, in development environments, a `true` should always be set, but in production environments, a `false` should be set since it is not ready.

The static type can be written either implicitly or explicitly.

#### Implicit Example
```yaml
environment_name: true
```

#### Explicit Example
```yaml
environment_name:
  type: static
  value: true
```

### Variant
Variant values are useful for A/B testing and provide a way to randomly toggle between features or to assign a percentage of page visits where a feature should be `"a"` or a feature should be a `"b"` variant. The percentages can be a floating point value and you can add as many variants as you want but **the percentages need to add up to 100** or an error will be returned.

#### Example
```yaml
environment_name:
  type: variant
  values:
    - value: "a"
      percentage: 30
    - value: "b"
      percentage: 40
    - value: "c"
      percentage: 10.5
    - value: "d"
      percentage: 19.5

```

### Schedule
Schedule flags are useful for displaying seasonal banners or for time sensitive events such as planned flash sales. They are designed to be assertive in nature and returns a `true` when the current time period fits any one of the time periods specified in the `values` property.

The date format in the `from` and `to` properties of an object in the values array should be `YYYY-MM-DD HH:mm:ss`.

#### Example
This example sets a schedule that returns `true` on two occassions, in January and in March of 2018.

```yaml
environment_name:
  type: schedule
  values:
    - from: "2018-01-01 00:00:00"
      to: "2018-01-31 23:59:59"
    - from: "2019-03-01 00:00:00"
      to: "2019-03-31 23:59:59"
```

### Acceptance
Acceptance flags are useful when implementing continuous delivery using a trunk based development model, the workaround being to cherry-pick commits which can get ugly when moving too quickly.

Using acceptance flags requires integrations to external product backlog platforms and you can [check out the Integrations page](integrations.md) to learn about the currently supported integrations.

#### Example
The following example assumes the use of Pivotal Tracker API (specified via the `source` property) and is a feature flag that depends on 4 stories with IDs `123456789`, `987654321`, `112233445` and `998877665` to be in the *delivered* state (specified via the `state` property) in the Pivotal Tracker board having the project ID `1234567`.

```yaml
environment_name:
  type: acceptance
  source: pivotal
  state: delivered
  values:
    - projectId: 1234567
      storyId: 123456789
    - projectId: 1234567
      storyId: 987654321
    - projectId: 1234567
      storyId: 112233445
    - projectId: 1234567
      storyId: 998877665
```

## Next Up

Done up a feature manifest? [Deploy](deploying.md) it!