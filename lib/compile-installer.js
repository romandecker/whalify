'use strict';

const _ = require('lodash');

module.exports = _.template(`#!/bin/bash

set -e
<% for( module of modules ) { %>
echo "Installing <%= module.path %>"
npm install -g <%= module.path %>
pushd $(npm prefix -g)/lib/node_modules/<%= module.name %>
echo "Linking dependencies of <%= module.path %>"
  <% for( dep of module.dependencies ) { %>
npm link <%= dep %>
  <% } %>
popd
<% } %>
`);
