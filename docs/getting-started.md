# Getting Started
Create a new directory for the project and create an example file named `hello_world.yaml` with the following contents:

```yaml
static_feature:
  development: true
  production: true
schedule_feature:
  development: true
  production:
    type: schedule
    values:
      - from: "2017-12-11 00:00:00"
        to: "2018-12-11 00:00:00"
variant_feature:
  development: false
  production:
    type: variant
    values:
      - value: "a"
        percentage: 20
      - value: "b"
        percentage: 80
```

In the same directory, pull the latest Docker image for Featuris:

```bash
docker pull zephinzer/featuris:latest
```

Next, start Featuris using:

```bash
docker run \
  -p 3000:3000 \
  -v "$(pwd)":/app/data/features \
  zephinzer/featuris:latest
```

You should now be able to access Featuris at http://localhost:3000/hello_world.

To make Featuris display only flags related to one environment (lets assume `production`):

```bash
docker run \
  -p 3000:3000 \
  -e "NODE_ENV=production" \
  -v "$(pwd)":/app/data/features \
  zephinzer/featuris:latest
```

Acceptance feature toggles require additional configuration. Check out [the Integrations section](integrations.md) on how to do this.