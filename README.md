# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot of URLs Page"](https://github.com/eyoa/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["screenshot of specific url page"](https://github.com/eyoa/tinyapp/blob/master/docs/urls-show.png?raw=true)
!["screenshot of login page with error message"](https://github.com/eyoa/tinyapp/blob/master/docs/CheckCredentials.png?raw=true)
!["screenshot of urls_new page checking for blank entry"](https://github.com/eyoa/tinyapp/blob/master/docs/urls-new.png?raw=true)
!["screenshot of urls page if not logged in as user"](https://github.com/eyoa/tinyapp/blob/master/docs/error-messaging.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session 
- method-override

## Dev-Dependencies
- morgan
- mocha
- chai
- nodemon

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.


## Features
-Gives a tiny url (from a random generated string) that will redirect you to the original site.
- Allows editing of the tiny URL once created.
- Allows deleting of links via a button. 
- Keeps track of the date the link was created. 
- Keeps a count of how many times the link was used.
- Keeps a timestamp of the visits using short URL.
- Shows the number of unique visitors for the short URL
- Registers Users
- Displays email of logged in user
- Has logout button that will clear the session cookie
- Checks for authentication (login system) with email and password. 
- Uses encrypted session cookies.
- Uses hashed passwords for security. 
- Users can only see a list of, edit and delete their own links.
- Error messages are displayed in alert messages. 