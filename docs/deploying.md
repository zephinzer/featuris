# Deploying
The recommended way of deploying Janus is via a Docker image on Kubernetes (k8s) since that's how we're deploying it. The following deployment methods are covered:

- Kubernetes
- Docker Compose
- Docker
- PM2


## Via Kubernetes
The Docker image for Janus resides at https://hub.docker.com/r/zephinzer/janus/.

The [`k8s-janus.yaml`](example/k8s-janus.yaml) assume you've already got a k8s cluster up and running with your credentials saved into `kubectl`. Replace the variable names denoted by `__double_underscores__` before and after, with your own values and run `kubectl apply -n %NAMESPACE% -f ./path/to/k8s-janus.yaml`.

## Via Docker
The Docker image for Janus resides at https://hub.docker.com/r/zephinzer/janus/.

The [`Dockerfile`](example/Dockerfile) contains a Dockerfile which you can run by building and then starting:

```bash
docker build -f ./example/Dockerfile -t janusserver:latest .;
docker run \
  -e "NODE_ENV=production"
  -e "LOGS_DISABLED=false"
  -v "$(pwd)"/data/features:/app/data/features
  -p 3000:3000
  janusserver:latest;
```

## Via Docker Compose
The Docker image for Janus resides at https://hub.docker.com/r/zephinzer/janus/.

The [`docker-compose.yaml`](example/docker-compose.yml) contains what you need to run Janus via Compose.

## Via PM2
Clone this repository into a server of your choice.

Run `yarn install` to install the dependencies.

Two template configurations for running Janus are available at [`provisioning/ecosystem.yaml`](../provisioning/ecosystem.yaml). If you need your own, make a copy of the template configurations and add your environment variables in them.

Start Janus by running:

`pm2 start ./provisioning/ecosystem.yaml --only __APP_NAME_IN_ECOSYSTEM_FILE__`.

Read more on pm2 at [their official documentation](http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/).
