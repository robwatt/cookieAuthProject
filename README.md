# cookieAuth
Example of cookie based authentication using NodeJS

Based on the work by https://medium.com/@evangow/server-authentication-basics-express-sessions-passport-and-curl-359b7456003d

## Purpose

The point of this project is to show how cookie based authentication works in a CORS environment.  There are 2 different clients:
* Web client
* Outlook add-in

Outlook add-in by necessity run in a different origin than the server so it was a perfect client to use.  The web client makes it easy to test without the setup of the Outlook add-in.

## Details

This project builds out the example to include
* CORS support
* A seperate web application
* An Outlook add-in which has support for desktop and mobile

There are 4 project in total - each needs to started individually
* cookieAuthServer - this is the core server
* cookieDB - this provides rudemtary user authentication support.  There are only 2 users stored in the 'database'
  - test@test.com
  - user2@example.com
* cookieWeb - web based implementation that uses the server
* cookieAddin - Outlook add-in.  This is identical to the web implementation except it runs in Outlook

To start each server go into the respective project and start via node:
* cookieAuthServer: node server.js
* cookieDB: node server.js
* cookieWeb: node www.js
* cookieAddin: npm run dev-server

## cookieAuthServer
cookieAuthServer relies on process.env.PORT being set, otherwise it will default to port 4000
cookieAuthServer relies on process.env.DBSERVER being set, otherwise it will default to http://localhost:5000
* If you need to run the server locally using HTTPS, you will need to uncomment the https code at the bottom of server.js
* You will also need to create your own key.pem and cert.pem.  Instructions can be found here https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/

## cookieDB
cookieDB relies on process.env.PORT being set, otherwise it will default to port 5000.

## cookieWeb
cookieWeb listens on port 8080.  This was designed mainly around being deployed locally.

## cookieAddin
cookieAddin run on default ports as per Outlook add-in implementation.  That is port 3000 for local deployment
