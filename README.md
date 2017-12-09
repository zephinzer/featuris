# Janus Feature Toggles

A no-frills, un-opinionated feature toggling server.

## Get Started

The recommended way to run Janus is via the Docker container with mapped volumes containing your feature manifests.

### Prepare a Feature Manifest
A feature manifest defines feature flags, environments and relevant values. The following is an example feature manifest demonstrating all available types of feature toggles.

```yaml
# runs an A/B test on the purchase buttons's appearance
purchase_button_appearance:
  development: true # static
  production: # variant
    type: variant
    values:
      - value: "a"
        percentage: 40
      - value: "b"
        percentage: 60
# displays a banner from 5th December 11:11 PM to 8th January 11:11 AM
christmas_banner:
  development: true # static
  production: # schedule
    type: schedule
    values:
      - from: "2017-12-05 23:11:00"
        to: "2018-1-08 11:11:11"
# checks whether the story with ID 123456789 in the project
# with ID 9999999 has been 'accepted' by the product owners.
#
# note that the following will not work without a valid Pivotal
# Tracker API key defined in the PIVOTAL_TRACKER_API_KEY
# environment variable and without substituting the :projectId
# and :storyId for a real project and story
social_sharing:
  development: true # static
  production: # acceptance
    type: acceptance
    source: pivotal
    state: accepted
    values:
      - projectId: 9999999
      - storyId: 123456789
```

Copy the above contents into a file named `hello_world.yml` in the `data/features` directory.

### Run Janus
If you've cloned this repository, build the Janus Docker image by running `npm build`. When the build completes, you should be able to run Janus using:

```
docker run \
  -v data/features:/app/data/features:ro \
  -p 3000:3000 \
  zephinzer/janus:latest
```

You should now be able to access the application at http://localhost:3000 with your feature toggles being available at http://localhost:3000/hello_world.

See [Other Ways To Deploy Janus](#other-ways-to-deploy-janus) for more options.

## Feature Manifests

Feature manifests can be written in YAML or JSON and they take the general form of:

```
featureCollection : Object
  featureKey : Object
    environment : {Object, *}
```

Each `environment` object is a feature toggle and defines the type, values and other required properties

## Feature Toggles

Feature toggles include a type and value(s). The following types are defined for use:

### Static
Static feature toggles are simply `true`/`false` values that indicate whether a feature should be made available. This is useful for hiding/displaying features at the development stage.

`static` types define a value. By default, if an environment key indicates a value instead of an object, the value will be used as the value for the feature toggle so there is no need to specify a type.

#### Example `static` feature toggle (implicit)
```yaml
environmentName: true
```

```json
"environmentName": true
```

#### Example `static` feature toggle (explicit)
```yaml
environmentName:
  type: "static"
  value: true
```

```json
"environmentName": {
  "type": "static",
  "value": true
}
```

### Variant
Variant feature toggles are more commonly known as A/B testing flags and they enable us to test between showing two variants of the same component to measure their effectiveness.

`variant` types define multiple values that can be selected via a percentage that is generated based on `Math.rand()`. The percentages need to add up to 100 or an error will be thrown.

#### Example `variant` feature toggle

```yaml
environmentName:
  type: "variant"
  values:
    - value: "a"
      percentage: 20
    - value: "b"
      percentage: 80
    ...
```

```json
"environmentName": {
  "type": "variant",
  "values": [
    {
      "value": "a",
      "percentage": 20
    },
    {
      "value": "b",
      "percentage": 80
    },
    ...
  ]
}
```

### Acceptance
Acceptance feature toggles are intended to automate the delivery process when doing trunk based development (TBD) by allowing developers to set feature toggles which can be set to true upon product owners accepting these stories.

`acceptance` types in addition to a values property, defines an acceptance source where states can be pulled from, and the desired state of the values. See [Currently Supported Acceptance Toggles](#currently-supported-acceptance-toggles) for the supported platforms.

#### Example `acceptance` feature toggle for Pivotal

```yaml
environmentName:
  type: "acceptance"
  source: "pivotal"
  state: "delivered"
  values:
    - projectId: 9999999
      storyId: 123456789
    - projectId: 9999999
      storyId: 987654321
    ...
```

```json
"environmentName": {
  "type": "acceptance",
  "source": "pivotal",
  "state": "delivered",
  "values": [
    {
      "projectId": "9999999",
      "storyId": "123456789"
    },
    {
      "projectId": "9999999",
      "storyId": "987654321"
    },
    ...
  ]
}
```

### Schedule
Schedule feature toggles are used for time sensitive features such as holiday banner displays so that a new code deploy is not required just to display/hide an image.

`schedule` types define an array of values that specify a `from` and `to` timestamp. These timestamps follow the format `YYYY-MM-DD HH:mm:ss".

#### Example `schedule` feature toggle

```yaml
environmentName:
  type: "schedule"
  values:
    - from: "2017-12-05 23:11:00"
      to: "2018-1-10 11:11:11"
    - from: "2017-12-03 11:11:00"
      to: "2017-12-05 00:25:00"
```

```json
"environmentName": {
  "type": "schedule",
  "values": [
    {
      "from": "2017-12-05 23:11:00",
      "to": "2018-1-10 11:11:11"
    },
    {
      "from": "2017-12-03 11:11:00",
      "to": "2017-12-05 00:25:00"
    },
    ...
  ]
}
```

## Deployment Configurations

Janus is configured using environment variables. Set them in your deployment to change the behaviour of Janus.

### `ALLOWED_ORIGINS`

> Defaults to `*`.

Defines the CORS response headers for allowed origins (`Access-Control-Allow-Origin` HTTP header).

### `DEFAULT_DATA_SOURCE`

> Defaults to `data/features`.

Defines where Janus will begin looking for feature manifests.

### `LOGS_COLORIZE`

> Defaults to `false`.

When `LOGS_FORMAT` is `text` and this is set to `true`, logs will be colored.

### `LOGS_DISABLED`

> Defaults to `false`.

When this is set to `true`, no logs will be displayed.

### `LOGS_FORMAT`

> Defaults to `text`.

### `LOGS_SHOW_LEVEL`

> Defaults to `false`.

Defines whether a `level` property should be included defining the severity level of the logs.

### `LOGS_STRINGIFY`

> Defaults to `false`

When `LOGS_FORMAT` is equal to `json`, if this is set to `true`, the JSON output will be a compact string:

```
{"this": "is","harderToRead": true}
```

If set to `false`, the JSON output will be pretty printed:

```
{
  "this": "is",
  "easierToRead": true
}
```

### `LOGS_TIMESTAMP`

> Defaults to `false`.

Defines whether a timestamp should be included in the logs.

### `NODE_ENV`

> Defaults to `development`.

Defines the environment which Janus runs in. The `NODE_ENV` environment variable primarily affects which environment of the feature toggle should be processed.

Consider the following feature toggle:

```
feature_01:
  development: true
  production: false
```

If `NODE_ENV` equals `development`, the processed response will look like:

```
{
  "feature_01": true
}
```

If `NODE_ENV` equals `production`, the processed response will look like:

```
{
  "feature_01": false
}
```

### `PORT`

> Defaults to `3000`.

Defines the port which Janus should listen on.

### `PIVOTAL_TRACKER_API_KEY`

> Defaults to `undefined`.

Defines the Pivotal Tracker API key. **Pivotal integrations will fail when this is `undefined`**.

## Other Ways To Deploy Janus

For a direct deployment, clone this repository to a directory of your choice:

```
cd /var/www/deployments
git clone https://github.com/zephinzer/janus.git
```

Next, add your feature manifests to `./data/features`.

Finally, install dependencies by running `yarn install --production`.

A `pm2` configuration exists in the `./provisioning` directory as `ecosystem.yaml`. If you haven't, install `pm2` by running:

```
npm i -g pm2
```

Run Janus using `pm2` in production:

```
pm2 startOrReload ./provisioning/ecosystem.yaml --only janus
```

Run Janus using `pm2` in development:

```
pm2 startOrReload ./provisioning/ecosystem.yaml --only janus-development
```

To specify your own environment, change `NODE_ENV` inside the `ecosystem.yaml`. You might want to create your own version of the file so that the version-controlled `ecosystem.yaml` does not get overwritten on application update.

## Currently Supported Acceptance Toggles

We currently only accept Pivotal Tracker stories. Feel free to add on more if you'd like!

## Contribution

Feel free to fork this repo, make changes and submit a pull request!

## Licensing

Usage of Janus via container images is licensed under the GPLv3 license.

## Trivia

Janus
