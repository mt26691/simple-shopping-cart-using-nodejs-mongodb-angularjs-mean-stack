#A Simple blog using nodejs expressjs angularjs and mongodb

## Installation

**Prerequisites**
 - [Git - how to install](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
 - [Nodejs](https://nodejs.org/en/)
 - [Mongodb](https://www.mongodb.org/)
 - [GraphicsMagick](http://www.graphicsmagick.org/download.html)
 
**Clone repository**
```
git clone https://github.com/mt26691/simple-blog-using-nodejs-angularjs-and-mongodb
```

##Install dependencies

**1/ After installing nodejs open cmd/terminal and run this command**
```
npm install -g gulp
```
- This command will install gulp into your computer. Gulp is a task/build runner for developement.
In this project it helps:
```
1. Inject css, js files to layout.
2. Minify css, js files and concentrate it to one big file
3. Help restart node if code is changed.
```
See gulpfile.js for more details

**2/ Open cmd/terminal and navigate to project, and install project's dependencies**
```
npm install
```
- This command will install all dependencies belonging to this project (see package.js file)

## Starting
Open cmd/terminal and run this command

**Start by npm**
```
npm start
```
**Start by gulp**
```
gulp
```
If you start by gulp default task by the command above, the server will restart everytime you change the code.
So you will always get the lastest version.

##Testing
This project use [SuperTest](https://github.com/visionmedia/supertest) 

**Test api**
```
npm test
```
See package.config to change test file or use this pattern *.test.js to test all files

##Code flows
```
1. When start server, it will run bin/www file.
2. www file will load app.js file, this is the main file of this project.
3. App js will load route, layout, email settings and connect to mongodb server.
4. Every request from client will be catched by route settings, located in /api/routes folder.
```
To understand more about the code flows, please read the test api files, located in /test folder
##Support
**If you have any question, please send email to nguyenmanhtung848@gmail.com**