#!/usr/bin/env node

'use strict';

require('yargs').commandDir('commands').strict().help().argv;
