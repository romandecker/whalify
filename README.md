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
whalify generate-installer                                  # will whalify the current module into a folder `.whalify`
whalify generate-installer ../path/to/my/module             # will whalify module at path to ../path/to/my/module/.whalify
whalify generate-installer ../path/to/my/module destination # will whalify module at path to the given destination directory
```


## Usage (node)

``` javascript
const whalify = require('whalify');

whalify.generateInstaller( 'path/to/source', 'path/to/dest' )
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

ENV BUILD_DIR=/whalify
COPY .whalify $BUILD_DIR   # copy the .whalify directory into the image
WORKDIR $BUILD_DIR
RUN ./install.sh           # run the whalify-generated installer


# At this point your module will be installed globally in the image
# All binaries it provides are now available in your $PATH
```

Note that you can generate a sample dockerfile using `whalify generate-dockerfile`.

You can then build the image using docker, or using `whalify build` (which will just call docker
behind the scenes and provide it with some build args automatically).

## Documentation

### generateInstaller(source, dest)

Generate the necessary whalify-installer for use in a `Dockerfile`.

Arguments:

* `source` (default=`process.cwd`): Path to the module to whalify. Should point to a folder containing a `package.json` file.
* `dest` (default=`<source>/.whalify`): Path to put the installation files.


### build(path, imageName, options)

Take a path to a module containing a Dockerfile and build it using docker. Requires the `docker`
executable to be available on your `PATH`.

* `source`: Path to the module directory to build using docker. A `Dockerfile` should reside in this directory.
* `imageName`: The image will be built under this name (this is passed to `docker build` using the `-t` option)
* `options`: Additional options
 * `authToken`: An additional NPM auth token to use when building, will be passed as `--build-arg
                NPM_AUTH_TOKEN` to `docker build`
 * `silent` (default=`false`): Set to true to not output anything to stdout
 
Arguments:

* `source` (default=`process.cwd`): Path to the module to whalify. Should point to a folder containing a `package.json` file.
* `dest` (default=`<source>/.whalify`): Path to put the installation files.



