<div width="100%" align="center">

<a href="http://nodearch.io/">
  <img src="https://raw.githubusercontent.com/nodearch/arch/master/resources/nodearch-logo.png" alt="NodeArch Logo" />
</a>

manage and generate a powerful fully organized and customizable node.js server of your choice
build, generate, edit, and share your project design and flow with your team
prebuilt extensions and tools to help you focus on your business idea

Maintainer: [Ahmed Ali](https://github.com/AhmedAli7O1)

![build](https://travis-ci.org/nodearch/arch.svg?branch=master)
![npm](https://img.shields.io/npm/v/nodearch.svg)

</div>

<hr><br>


## Content
  * [Introduction](#introduction)
  * [Differences](#differences)
  * [How it Works](#how-it-works)
  * [Getting Started](#getting-started)
  * [Configuration](#configuration)
  * [Extensions](#extensions)
    * [Install Extensions](#install-extensions)
    * [Available Extensions](#available-extensions)
  * [Main Project](#main-project)
  * [index.js](#index)
  * [nodearch.json](#nodearch.json)
  * [Other Features](#other-features)
  * [CLI](#cli)
    * [Console](#console)

------


## Introduction:

nodearch is a set of libraries, that help you not just getting up and running fast, but also helping to manage your application structure, environment specific configurations, prebuilt set of extensions to help you using tools and third parties out of the box, and you gotta break down your business irrelevant logic into your own defined extensions that register themselves on nodearch load flow, and of course break down your business logic code into separate plugins, and each plugin consist of a collection of components.

-----

## Differences:

* express, hapi, koa...etc

  those are node.js frameworks, designed to create a node web server/application, on the other side nodearch is architecture/structure manager and server organizer, that works with any of the mentioned frameworks to organize the environment for the developer.

  so it doesn't by any mean replace or cover the node webserver framework.

* sails.js, hapiarch

  sails.js is a layer on top of express, hapi-arch is the first version of the arch framework and it's also a layer on top  of hapi.js, both frameworks does cover the underlying node server framework (express/hapi) and exposes their own APIs to help organize and structure the code, and provide some functionalities out of the box.

  on the other side, nodearch is not bound to any node server framework, and does not cover any of their APIs, it does lay  in the same level as your node server framework (express/hapi/koa...etc) to provide it's own functionalites e.g (extensions, environment configs, plugins...etc) leaving you with a full control over your node server framework. it's not even aware of your framework and that's to achieve a full decoupled management tool for your project.

-----

## How it Works


### what is what?

  * Plugins
    pluggable user code, let's assume every feature in the app could be a plugin itself, for the seek of separation and reusability.

  * Extensions
    modules that contain some code which is not related directly to the app business logic e.g ( connect to mongoose, integrate with mocha for testing...etc )also extensions could be a user defined modules or predefined nodearch extensions that you can directly add, using the nodearch CLI tool.

  * Env Config
    environment configurations are the way that you define your app configurations for each environment.

  * Server Handler
    it's where the user put his code to start the web server using his favorite framework, i.e express, hapi, koa...etc

### the flow

- nodearch start loading and initiating its defaults.
- loading user environment specific configurations, according to what the `NODE_ENV` set.
- load extensions from disk.
- execute `before` event from all loaded extensions.
- start loading plugins one by one.
- execute component events from all extensions on each loaded component on each loaded plugin.
- start the user Server Handler.
- execute `after` event from all loaded extensions.

the image below describes it as well:

<div width="100%" align="center">

![NodeArch Flow](https://raw.githubusercontent.com/nodearch/arch/master/resources/nodearch-flow.png)

</div>

-----


## Getting Started
let's start by installing the NodeArch CLI tool by
```bash
npm i -g nodearch
```
now it's simple as generating a full example project by
```bash
nodearch g
```
then choose your prefered nodejs framework,
press enter and the CLI tool will start preparing a new project for you,
by creating your folders structure, downloading the required modules to integrate your chosen framework,
and finally runs `npm install` for you, once all this done,
you can safely go to your new project folder and run `npm start` or `npm test`

### Available Examples
* hapi.js
    currently we have a full `hapi.js` server example, with MongoDB and auto-generated Swagger Documentations using Joi validations.

    Requirements:
    * running MongoDB local instance, or you'll have to disable the mongoose extenstion using `nodearch remove mongoose` and removing
    it from the `nodearch.json` file too.

    Features:
    * auto generated [Swagger](https://github.com/glennjones/hapi-swagger) API documentations on http://localhost:3000/documentation
    * [Joi](https://github.com/hapijs/joi) Validation
    * MongoDB integration using [Mongoose](http://mongoosejs.com/)
    * Testing integration and example using [Mocha](https://mochajs.org/)
    * Controller -> Service -> Model Flow Example
        * Model: contains Mongoose Schema
        * Service: contains your business logic, separated as multiple services.
        * Controller: to control the data flow, e.g a controller could aggregate on many services to respond on client requests for a specific endpoint.
    * example for multiple plugins.

* express.js
  a full express server with MongoDB and most of the setup that comes with the express generator

  Requirements:
    * running MongoDB local instance, or you'll have to disable the mongoose extenstion using `nodearch remove mongoose` and removing
    it from the `nodearch.json` file too.

  Features:
  * MongoDB integration using [Mongoose](http://mongoosejs.com/)
  * Testing integration and example using [Mocha](https://mochajs.org/)
  * Controller -> Service -> Model Flow Example
      * Model: contains Mongoose Schema
      * Service: contains your business logic, separated as multiple services.
      * Controller: to control the data flow, e.g a controller could aggregate on many services to respond on client requests for a specific endpoint.
  * example for multiple plugins.

  for more info about how to use the CLI tool, please read [CLI](#cli)
-----

### Configuration

- It should contain folders based on the node environment.

​       example: if `NODE_ENV = "develpoment"`, then the configuration folder should contain a  `development` folder.

- Files that are not in any environment folder are loaded by default in all environments.
- Files inside the environment folders override the default ones.
- To Access the configuration within the project, see the [Main Project](#to-access-any-file-within-the-project)

------

### Extensions

- Extensions act as a middle-ware to be able to use different modules within any project.

- For example you can use **Mongo** or **MySql**, you can use for testing **Mocha** or **Lab**.

- You can find some or our pre-defined extensions [here](https://github.com/nodearch).

- You can use our [CLI Tool](#extensions-generators) to directly add the extensions.

- Extensions should expose one (or more) of the three functions **Before**, **Component**, **After**.

  - **Before:** Executed before the framework tries to load any of the files of the project (except for the configuration).

  - **Component:** Executed after the loading of each single file.

    **N.B.** The component function takes 2 arguments **Component** & **Component Name**.

    **Component** is all files found in a certain directory (e.g. services, models, ...).

    **Component Name** is the folder name.

  - **After:** Executed after all the project files are loaded.

Example for a **before** function to use mongoose to initialize database connection.

```javascript
'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const { config, log } = require('nodearch');


module.exports = {

  before: function () {
    return new Promise((resolve, reject) => {

      if (!config || !config.mongoose) {
        return reject(new Error('mongoose configurations not found!'));
      }

      const { url, options } = config.mongoose;

      if (!url) {
        return reject(new Error('mongo url not found in the mongoose configuration file!'));
      }

      mongoose.connect(url, options);

      const db = mongoose.connection;
      db.on('error', (err) => reject(err));

      db.once('open', () => {
        log.info('Connected To MongoDB');
        return resolve(db);
      });

    });
  }
};
```

------

### Install Extensions

```shell
nodearch add
```

- This will list all extensions available on our [repository](https://github.com/nodearch)
- Select the available extensions then the tool will list the version for each extension found.
- Select the version for each extension and the extensions will be added by default to the `extensions` folder.
- If (for each extension) dependencies are found, the tool will only add the node modules that are not already installed. It'll also list if any dependencies conflict

		**Ex.** If the extension requires lodash V3 while you have V4, it will **NOT** add lodash, however it'll display a warning that there are conflicts in this module and list the versions.



- add certain extension directly without listing all available extensions

  ```shell
  nodarch add mocha
  ```



- Repeat as many extensions as you want

  ```shell
  nodearch add mocha mngoose
  ```



- You can also specify the versions for the extensions.

  ```shell
  nodearch add mongoose@1.0.2
  ```

  If the version does not exist it'll display a warning and ask you to choose an existing version.



- You can specify the versions for some extensions only

  ```shell
  nodearch add mongoose@1.0.2 mocha
  ```

  In this case, the tool will ask only about **mocha** version while adding mongoose version 1.0.2 directly

------

### Available Extensions

* [mocha](https://github.com/nodearch/mocha) : JavaScript test framework
* [mongoose](https://github.com/nodearch/mongoose) : MongoDB object modeling tool
* [memwatch](https://github.com/nodearch/memwatch) : Leak Detection and Heap Diffing

------

### Share Your Extensions
if you already wrote an extension, and you'd like to share it with us, publish it as npm module on npmjs and add **nodearch-extension** in the keywords list so we can find it within the nodearch cli
------

### Main Project

- Main project is structured inside the `api` folder.

- Inside the api folder there will be plugins, where each plugin is a folder.

- Each plugin can be structured as the user want.

- **spec.json**

  - It specifies the order of loading of files.

  - It's used to determine the order of loading of plugins or the order of loading of each item inside each plugin (depending on the directory it's found in).

  - Example for spec.json inside a plugin

    ```json
    [
      {
        "name": "models",
        "type": "component"
      },
      {
        "name": "schema",
        "type": "component"
      },
      {
        "name": "services",
        "type": "component",
        "modules": [
        ]
      },
      {
        "name": "controllers",
        "type": "component",
        "modules":[
        ]
      },
      {
        "name": "routes.js",
        "type": "module"
      },
      {
        "name": "test",
        "type": "component",
        "disable": true
      }
    ]

    ```

    - Each JSON object is either a **module** (file) or a **component** (folder)
    - For each component, you can specify the order of loading of its **modules** (files) through the modules array.
    - `disable` prevents loading of file/folder (useful in testing)

- #### To access any file within the project

  use the `deps` object on `nodearch` module.

- Example: If inside your api, we have `pluginOne`, `pluginTwo`, each plugin contains `services`.

  ```javascript
  var nodearch = require('nodearch');
  var services = nodearch.deps.pluginOne.services; //services in pluginOne
  var config = nodearch.config; //configuration based on node environment
  ```

------

### Index

- Contains the start of the server framework you use (hapi, express, ..etc).

- Example for start for **hapi:**

  ```javascript
  'use strict';

  const ERROR_CODE = 1;

  const Hapi = require('hapi');
  const NodeArch = require('nodearch');
  const _ = require('lodash');
  const hapiPlugins = require('./thirdParties');

  async function serverHandler (arch) {
    const server = Hapi.server(arch.config.connection);

    const routes = _.flatten(_.map(arch.deps, plugin => plugin.routes));

    server.route(routes);

    process.on('unhandledRejection', (err) => {
      console.log(err);
      process.exit(1);
    });

    await server.register(hapiPlugins);

    await server.start();
    arch.log.info(`Server running at: ${server.info.uri}`);
    return server;

  }

  NodeArch.start(serverHandler);
  ```

  ​

------

### nodearch.json

- Contains the extensions for your project

- Only the extensions written will be loaded

- The extensions will be loaded in the same order as they are written

  ```json
  {
    "extensions": [
      "mocha-arcjs-ext",
      "mongoose-arcjs-ext"
    ]
  }
  ```

------

### Other Features

- **Pipelines:**
  - Takes functions as arguments & executes them in sequence.
  - If any function throws an error, pipeline stops.
  - Each function takes arguments initialized in the pipeline
  - The pipeline returns the result of the last function in the pipeline.

  call: `nodearch.pipeline([Functions])`

- **getList**
  - return a list of either modules or components from all plugins.

  call: `nodearch.getList(type, itemName)`
  usage:
    - `nodearch.getList('module', 'routes')`
    - `nodearch.getList('component', 'controllers')`

------

## CLI

Install Node Arch globally

```shell
npm i -g nodearch
```

Commands:

```shell
start     # alias (s) # start server that exist in the current or parent directory
console   # alias (c) # start server that exist in the current or parent directory in interactive mode
add       # alias (a) # add nodearch extension
remove    # alias (r) # remove nodearch extension
generate  # alias (g) # generate full and ready to go nodearch example
```

Example: `nodearch console`

### Console
nodearch console does actually run your app in an interactive console [Node.js Repl](https://nodejs.org/api/repl.html)
and exposes a global reference `nodearch` identical to the resulting object from `const nodearch = require('nodearch');`
which contains all your project dependencies, extensions...etc

this means your app will still functional and listen for incoming connections as usual the only difference is the terminal
will be interactive, think of it as the Google Chrome's console, where you can interact live with your application scope while running.

`nodearch console` can be used from the root app directory or any sub/nested directory in your app.

Usage Examples:

running specific function in your project for testing purposes
```shell
# run console
nodearch console
# execute any function in your app
nodearch> nodearch.deps.userPlugin.services.UserService.find().then(res => console.log(res));
# here is the result
nodearch> [ { _id: 5ae4cea2f9d3d23b724eb125,
    name: 'user one',
    age: 20} ]
```

try to log your current loaded configurations
```shell
nodearch console
nodearch> nodearch.config
```

* NOTE: use the tab key to autocomplete when typying anything to easily find your dependencies,functions...etc

<hr>
<br>
<b>sponsored by:</b><br>
<a href="https://www.trufla.com/"><img src="https://www.trufla.com/img/logo.png" alt="Trufla" width="200"/></a>