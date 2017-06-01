FROM node:8.0.0

ARG NPM_AUTH_TOKEN
RUN echo "//registry.npmjs.org/:_authToken="$NPM_AUTH_TOKEN"" >> ~/.npmrc

ENV BUILD_DIR=/build
COPY .whalify $BUILD_DIR
WORKDIR $BUILD_DIR
RUN ./install.sh
