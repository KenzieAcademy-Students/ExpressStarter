# Welcome to Express!
The purpose of this repository is to introduce you to the makings of an Express application.

This README will walk you through installing all dependencies, running the server, and identifying what each line of code is responsible for.

## Installing Dependencies
In order to install all of the required packages, run the following command from the project root:

```terminal
npm install
```

As is the case with React applications, this will install all dependencies (and devDependencies) declared in the `package.json` file. This is simply a functionality of `npm`, which we will be using for our Express applications as well.

## Starting the Application
This application can be started the same way our React applications can be started:

```terminal
npm start
```

However, that is not a default functionality of Node or Express.

### .babelrc
To avoid confusion, this application has been structured to maintain the same import/export syntax of the React applications you have been working with. The aforementioned syntax is, again, not a default functionality of Node or Express. In order to mimic the same syntax, this application has been set up to run with some `babel` environment settings. The `.babelrc` file is responsible for setting this up. But, again, this is not available by default.

### package.json
Notice the following in the `devDependencies` in `package.json`

```json
"devDependencies": {
  "@babel/core": "^7.18.10",
  "@babel/node": "^7.18.10",
  "@babel/preset-env": "^7.18.10",
  "nodemon": "^2.0.19"
},
```

What are those things?
**@babel/core** is responsible for allowing our Node application to use Babel properties.
**@babel/preset-env** is what allows our application to use the presets settings from the `.babelrc` file.
**@babel/node** is used in the `npm start` script to execute our Node application through `babel-node`.
**nodemon** is an extremely nifty package. By default, you would run a Node application with `node filename.js`. However, that simply runs the file and lets it continue to run until it terminates. When developing an application, you are constantly making changes to the source code. `nodemon` runs our application, but it listens to all JavaScript files in our project for any changes to be saved. If changes are detected, it will re-start the server with the new changes.

So, the script:
```json
"start": "nodemon --exec babel-node index.js"
```
Is using `nodemon`. But instead of using `nodemon`'s default behavior of running `node filename.js`, it is being instructed to instead run `babel-node index.js` via the `--exec` flag. This means it will run the app with `babel-node`, but still listen for any changes. If any changes occur, it will shut down the application and immediately run `babel-node index.js` again. This repeats until we manually shut the server down.

### index.js
Let's get into the good stuff.

**Imports: Lines 1-5**
```js
import express from 'express'
import cors from 'cors' 
import path from 'path'
import apiRoutes from './src/routes'
import { port } from './src/configs/keys.configs'
```

The first 3 of these imports are node packages being imported. In fact, if you check the `dependencies` section of `package.json`, you will see all 3 of those packages.
- `express` is, obviously, the Express framework. We import the function that is the default export of that package.
- `cors` is an acronym. It stands for **C**ross **O**rigin **R**esource **S**haring. Express can be used to build an application that functions like a traditional website. It accepts incoming requests, and as a response, sends back HTML files to be rendered by the browser. However, we will be building Express applications to receive requests from **entirely separate applications**. This could pose a security risk, as you don't want all of your resources available to any request origin. However, the `cors` package will allow us to safely accept incoming requests from outside sources.
- `path` is used to dynamically determine file paths. 

The next two imports are from files within this application.
- `apiRoutes` is the `router` being exported from `src/routes/index.js`. We'll cover that in a moment.
- `port` is being imported from `src/configs/keys.configs`. We'll see that commonly used values are often centralized in a single configuration file and imported where needed. Common data we will see used in this manner include database connection strings, port numbers, API keys, and other data that we may simply just not want to re-type multiple times throughout our applications.

**App Initialization: Line 7**
```js
const app = express()
```

Voila, you have an Express application! Well, sort of. The `express` function imported on line 1 returns an object that contains all of the methods we'll be needing to run a server. But it's not running yet.

**Global Middleware: Lines 9-12**
```js
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, './src/public')))
```

As we just learned, the `app` created on line 7 contains everything needed to configure and run our server. The `.use()` method is a dependency injection tool; it allows us to inject functions into the application. More specifically, it installs middleware. Lines 9 through 12, which call the `use` method with only one parameter, are setting middleware.

This means that certain functions will be involved in processing most incoming HTTP requests. The middleware are:
- `cors`: as discussed earlier, `cors` is used to allow requests to come in from **other** applications. The most obvious example? A React app served by `http://localhost:3000`! This server is NOT running on `http://localhost:3000`. Without `cors`, our app would never accept incoming traffic. `app.use(cors())` bypasses the `Access-Control-Allow-Origin` headers for all incoming HTTP requests, allowing anyone to request things from our API (spoilers!).
- `express.json()`: by default, our Express application will not parse `JSON` included in any incoming HTTP requests. By installing this middleware, Express will now parse `json` from all incoming HTTP requests. 
- `express.urlencoded({ extended: true })`: some incoming HTTP requests will have data encoded in the url. You may have seen this when submitting an HTML form, and seeing the browser bar url look something like `website.com/register?username=bill?email=something@gmail.com`. By installing this middleware, our Express application can handle any incoming data that is encoded in the url itself rather than the request body.
- `express.static()`: this middleware is used to declare a directory of our project to serve static files. The middleware function accepts a folder path as an argument. In return, any incoming requests with that folder path appended to the end of `http://localhost:3001/` will be directed to the files in the `public` folder within `src`. The `path.join(__dirname, ...` portion ensures that wherever that directory is in relation to the file that line is in, it will get the true file. For example, from the location of the `index.js` file, to access the `public` folder, the relative path would be `./src/public`. However, the files can be accessed at `http://localhost:3001/filenamehere`. The `path.join` when paired with `__dirname` and the relative path ensure that all incoming requests will have access to the files in that `public` folder without needing to append `src/public` to the request url.

**Routes: Lines 14 and 15**
```js
app.get('/', async (req, res, next) => res.sendFile(path.join(__dirname, './src/views/index.html')))
app.use('/api', apiRoutes)
```

Line 14 sees a new method used: `.get()`. The `.get()` method uses the Express router to match the incoming HTTP request to the correct endpoint (assuming it is a `GET` request). We will see in the next section that there are methods for each of the HTTP request methods. 

The first parameter of this method is a string `'/'`. This means any incoming HTTP `GET` request with `/` as the resource in the request line will result in Express running the callback function that is the second parameter of the `.get()` method.

Don't worry too much about the specifics involved with that method; we'll be getting into Express Routers in the next section. But this route's **endpoint** (another term we'll talk about soon) returns a file in response. That file is actually an HTML file. In fact, check it out! Open up your browser with this server running, and go to `http://localhost:3001`. Read through what you see there, as it shows off the static files being served by the middleware on line 12.

Line 15 utilizes that `.use()` method again, but this time it looks a bit different. When given a string for its first argument, and an Express Router as the second argument (we'll see what that means in a second), the `.use()` method will direct all incoming requests with a request line resource that starts with the given string to the router provided as the second argument. In this example, all incoming requests that start with `http://localhost:3001/api` will be directed to the `apiRoutes` imported on line 4. Feel free to take a look at the `index.js` file in `src/routes` to try and decode what's happening, but we'll be coming back to how that works in later sections. So for now, let's move on to the last part.

**Running the Server: Line 18**
`app.listen()` accepts 2 arguments: a `port` to run the server on, and a callback function to run when the server is up and running. In this case, the `port` key imported from our configs folder (it has a value of `3001` is used [that's why we keep saying `http://localhost:3001`]) indicates which `TCP` port to listen to for incoming requests. Then, when the server is established and running, you will see in the terminal that it prints `Server now listening on port 3001`.
