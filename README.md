# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot of URLs Page"](https://github.com/eyoa/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["screenshot of Registration Page"](https://github.com/eyoa/tinyapp/blob/master/docs/urls-register.png?raw=true)
!["screenshot of specific url page"](https://github.com/eyoa/tinyapp/blob/master/docs/urls-edit.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- morgan 

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.


## Features
-Gives a tiny url (from a random generated string) that will redirect you to the original site.
- Allows editing of the tiny URL once created.
- Allows deleting of links via a button. 
- Keeps track of the date the link was created. 
- Also keeps a count of how many times the link was used (not necessarily unique).
- Registers Users
- Displays email of logged in user
- Has logout button that will clear the session cookie
- Checks for authentication (login system) with email and password. 
- Uses encrypted session cookies.
- Uses hashed passwords for security. 
- Users can only see a list of, edit and delete their own links.
- Error messages are displayed in alert messages. 
