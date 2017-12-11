# Configuration

Configurations for Janus are exposed through the environment variables. Set them using a `.env` file and a single environment variable, `USE_DOTENV="true"` or use one of Docker, Docker Compose or Kubernetes to inject these environment variables. See more below at [Methods For Environment Variable Injection](#methods-for-environment-variable-injection).

## Environment Variables

### TL;DR

- `ALLOWED_ORIGINS`: when set to `"true"`, enables and sets the allowed hostnames when sending Access-Control-Allow-Origins CORS header. Disables it otherwise (returns a `"*"` value in the header). **Defaults to `"false"`.**
- `DEFAULT_DATA_SOURCE`: specifies the directory from which to read in feature manifests. **Defaults to `"data/features"`.**
- `LOGS_COLORIZE`: specifies whether the logs should be colorized. **Defaults to `"false"`.**
- `LOGS_DISABLED`: specifies whether logging should be disabled. **Defaults to `"false"`.**
- `LOGS_FORMAT`: specifies the format of the label and should be one of `"text"` or `"json"`. **Defaults to `"text"`.**
- `LOGS_SHOW_LEVEL`: specifies whether the level of logs should be displayed when logging (*ie. debug/info/warn/error*). **Defaults to `"false"`.**
- `LOGS_STRINGIFY`: specifies whether the logs should be stringified. Applicable only when `LOGS_FORMAT` is set to `"json"`. **Defaults to `"false"`.**
- `NODE_ENV`: specifies the environment in which Janus should run in. When speciifed, Janus only returns values for the environment matching `NODE_ENV` in the feature manifests. When this is not specified, Janus returns all environments defined from the feature manifest. **Defaults to `undefined`.**
- `PORT`: overrides the port on which Janus listens on. **Defaults to `3000`.**
- `PIVOTAL_TRACKER_API_KEY`: specifies your Pivotal Tracker API key for use with Pivotal Tracker acceptance flag integrations. [See more on integrations at this page](integrations.md). **Defaults to `undefined`.**
- `USE_DOTENV`: specifies whether Janus should attempt to load environment variables from a `.env` file located in the working directory from where Janus was run. **Defaults to `"false"`.**

### `ALLOWED_ORIGINS`
> Defaults to `undefined`
Is is strongly recommended to set the CORS headers for API calls. This flag allows you to set the hostnames from which the Access-Control-Allow-Origin headers should return `"*"` for. Separate individual hostnames with a comma (`,`).

When this environment variable is not set (*ie `undefined`*), all calls from all hosts will have the header `Access-Control-Allow-Origin: *` set.

#### Example
Assuming our development environment is located at http://localhost:3000 and our production deployment at https://www.mysite.com:

```bash
ALLOWED_ORIGINS="http://localhost:3000,https://www.mysite.com"
```

### `DEFAULT_DATA_SOURCE`
> Defaults to `"data/features"`
This defines the location where Janus will look for feature manifests. This can be a relative path or an absolute path. By default, we use the `data/features` directory relative to the working directory of Janus and run through all `.yaml`, `.yml` and `.json` files.

#### Example
Assuming a directory created at `/etc/janus/manifests` containing your feature manifests:

```bash
DEFAULT_DATA_SOURCE="/etc/janus/manifests"
```

### `LOGS_COLORIZE`
> Defaults to `"false"`
This defines where logs should be colorized. Useful in development.

### `LOGS_DISABLED`
> Defaults to `"false"`
This defines whether logs should be displayed.

### `LOGS_FORMAT`
> Defaults to `"text"`
This defines whether the logs should be in JSON (value: `"json"`) or plain text (value: `"text"`). JSON is useful for streaming to a centralized logs collator such as Fluentd.

### `LOGS_SHOW_LEVEL`
> Defaults to `"false"`
This defines whether an additional `level` field is added to the logs. Levels look like `debug`/`info`/`access`/`warn`/`error` and they provide an easy way to filter logs if necessary.

### `LOGS_STRINGIFY`
> Defaults to `"false"`
This defines whether the logs should be stringified and is applicable only when `LOGS_FORMAT` is set to `"json"`. For example, when this is set to `"true"`, logs will look like this:

```json
{"thisIsHardToRead":true,"becauseItsAll":"concatenated","without":"spaces"}
```

When set to `"false"`, logs will look like this:

```json
{
  "thisIsHardToRead": false,
  "becauseItsAll": "spaced out",
  "with": "pretty tabs"
}
```

### `NODE_ENV`
> Defaults to `undefined`
This sets the environment which Janus should run in and also the environment for which keys from the feature manifest will be returned. For example, given a feature manifest:

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

### `PORT`
> Defaults to `3000`
This sets the port on which Janus will listen to.

### `PIVOTAL_TRACKER_API_KEY`
> Defaults to `undefined`
This sets the Pivotal Tracker API Key for use with acceptance flags. [See more on integrations at this page](integrations.md).

## Methods For Environment Variable Injection

### Via `.env`
Create a file named `.env` in the root of Janus and pass the environment variable `USE_DOTENV=true` when running `npm start`.

### Via `Dockerfile`
You can also build another Dockerfile with the `ENV` directive specifying the environment variables:

```Dockerfile
FROM zephinzer/janus:latest
ENV NODE_ENV=production \
    LOGS_DISABLED=true
...
```

### Via `docker run`

```bash
docker run -e "NODE_ENV=production" -e "LOGS_DISABLED=true" -p 3000:3000 zephinzer/janus:latest
```

### Via `docker-compose.yaml`

```yaml
version: "3"
services:
  feature_toggle_server:
    image: zephinzer/janus:latest
    environment:
      - NODE_ENV=production
      - LOGS_DISABLED=true
    ...
```

### Via `k8s-manifest.yaml`

```yaml
kind: Deployment
apiVersion: apps/v1beta1
metadata:
  name: janus-feature-toggle-server
  labels:
    app: janus
    env: production
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: feature_toggle_server
        image: zephinzer/janus:latest
        ports:
        - containerPort: 3000
        env:
          - name: NODE_ENV
            value: production
          - name: PORT
            value: 3000
          - name: LOGS_DISABLED
            value: "true"
```