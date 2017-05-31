Whalify
=======

Easily package a node app into a docker container, while preserving links to other npm-modules.

This project has arisen from the need to quickly build a docker container for a node-app which might
have several dependencies npm-linked on the local machine.

`whalify` creates a folder which can be mounted into a docker-build that will install a node-app and
all its dependencies in a smart way, so that modules you have currently `npm link`-ed to your module
are correctly installed into the system as well.

## Usage (cli)

``` shell
whalify                                  # will whalify the current module into a folder `.whalify`
whalify ../path/to/my/module             # will whalify module at path to ../path/to/my/module/.whalify
whalify ../path/to/my/module destination # will whalify module at path to the given destination directory
```


## Usage (node)

``` javascript
const whalify = require('whalify');

whalify( 'path/to/source', 'path/to/dest' )
```

## Using the created files

Whalify will call `npm pack` for the destination module (and all it's linked dependencies
recursively) and then create an installation script at the base of the destination folder
that will install all of the required packages in the correct order globally and link
them just like they are in your current development environment.

Here's an example `Dockerfile`:
``` dockerfile
FROM node:latest

RUN apt-get update

# Enable use of custom npm tokens for private registries
ARG NPM_AUTH_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=\"$NPM_AUTH_TOKEN\"" >> ~/.npmrc

ENV BUILD_DIR=/whalify
COPY .whalify $BUILD_DIR   # copy the .whalify directory into the image
WORKDIR $BUILD_DIR
RUN ./install.sh           # run the whalify-generated installer


# At this point your module will be installed globally in the image
# All binaries it provides are now available in your $PATH
```

## Documentation

### whalify(source, dest)

Arguments:

* `source` (default=`process.cwd`): Path to the module to whalify. Should point to a folder containing a `package.json` file.
* `dest` (default=`<source>/.whalify`): Path to put the installation files.



