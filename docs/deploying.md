# Deploying
The recommended way of deploying Featuris is via a Docker image on Kubernetes (k8s) since that's how we're deploying it. The following deployment methods are covered:

- Kubernetes
- Docker Compose
- Docker Image Pull
- Docker Image Build
- PM2

The Docker image for Featuris resides at https://hub.docker.com/r/zephinzer/featuris/.

## Via Kubernetes
The Docker image for Featuris resides at https://hub.docker.com/r/zephinzer/featuris/.

The [`k8s-featuris.yaml`](example/k8s-featuris.yaml) assumes you've already got a k8s cluster up and running with your credentials saved into `kubectl`.

Replace the variable names denoted by `__double_underscores__` before and after, with your own values and run `kubectl apply -n %NAMESPACE% -f ./path/to/k8s-featuris.yaml`.

## Via Docker Compose
Create a new directory and place your feature manifests in it. In the same directory, create a `docker-compose.yml` and add the following contents:

```yaml
version: "3"
services:
  # ...
  # other services
  # ...
  Featuris:
    image: zephinzer/featuris:latest
    volumes:
      - ./:/app/data/features
    expose:
      - "3000"
    ports:
      - 3000:3000
    environment:
      - NODE_ENV=production
      - LOGS_DISABLED="false"
      - LOGS_FORMAT="json"
  # ...
```

Then run:

```bash
docker-compose -f ./docker-compose.yml up
```

## Via Docker Image Pull
Create a new directory and place your feature manifests in it. Run the following from the directory, which pulls in the Docker image from Docker Hub and uses it to instantiate a container that is running in `"production"` with logs enabled. The `-v` flag indicates that the folder you are at, should be used as the directory for `/app/data/features`, which means the current directory you are at with feature manifests will be mapped to the container's `/app/data/features`. Lastly the `-p` flag indicates to expose port 3000 on the host (first '3000') from the container's port 3000 (second '3000')

```bash
docker pull zephinzer/featuris:latest
docker run \
  -e "NODE_ENV=production"
  -e "LOGS_DISABLED=false"
  -v "$(pwd)":/app/data/features
  -p 3000:3000
  zephinzer/featuris:latest;
```

You should be able to check Featuris is up by running:

```bash
docker ps
```

## Via Docker Image Build
Sometimes it is nice to be able to bundle your configuration into an image which you can deploy.

Like usage via pulling from Docker Hub, create a directory and place your feature manifests into it. Next, create a new Dockerfile with the following contents:

```Dockerfile
FROM zephinzer/featuris:latest
ENV NODE_ENV=__preffered_environment__ \
    LOGS_FORMAT=__format_of_logs__
COPY . /app/data/features
EXPOSE 3000
VOLUME ["/app/data/features"]
ENTRYPOINT ["npm", "start"]
```

Replace all variables (surrounded by double underscores `__like_this__`) with your own configurations. You can build and push your own application to a private registry using:

```bash
REPO_PATH="your_org/featuris";
VERSION=__version__;
docker build -f ./Dockerfile -t ${REPO_PATH}:${VERSION} .
docker login nexus-docker.yourdomain.com -uusername -ppassword;
docker tag ${REPO_PATH}:${VERSION} ${REPO_PATH}:latest;
docker push ${REPO_PATH}:${VERSION};
docker push ${REPO_PATH}:latest;;
docker logout
```

## Via PM2
Clone this repository into a server of your choice.

Run `yarn install` to install the dependencies.

Two template configurations for running Featuris are available at [`provisioning/ecosystem.yaml`](../provisioning/ecosystem.yaml). If you need your own, make a copy of the template configurations and add your environment variables in them.

Start Featuris by running:

`pm2 start ./provisioning/ecosystem.yaml --only __APP_NAME_IN_ECOSYSTEM_FILE__`.

Read more on pm2 at [their official documentation](http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/).
