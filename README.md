# Hoth Rebel-Hanger [![Build Status](https://travis-ci.org/ACIT2910-HOTH/hoth.svg?branch=develop)](https://travis-ci.org/ACIT2910-HOTH/hoth)
**DISCLAIMER**: This website is for a BCIT ACIT-2910 Summer 2017 project course. 
A food ordering web application for the Star Wars Rebel base, on Planet Hoth. 

## Team Hoth
R.Chin, 
R.Guo, 
C.Lee, 
A.Mori, F.Zhang

For support, please contact us by email <fan.cbest@gmail.com>, <clee565@my.bcit.ca>, or comment on our github page [Hoth](https://github.com/ACIT2910-HOTH/hoth)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.
### Prerequisites
[Node.Js](https://nodejs.org/en/)
[PostGres](https://www.postgresql.org/)

### Build

A step by step guide for building the environment:
	
1. Clone the repository: ```https://github.com/ACIT2910-HOTH/hoth.git```

2. Start SQL Shell(psql) use default settings press enter unitl you are prompt to enter your  password, enter your password.
3. Type ```CREATE DATABASE kitchen;```
4. In cmd prompt type ```psql -U -f (filename) -d (database name)``` *NOTE: OUR DB file can be found in our Hoth Trello board under Database.* 
5. Open command prompt and change directory to the repository folder.
6. Type ```npm init``` (creates the package.json file)
7. Type ```npm install body-parser express express-session formidable jquery jshint mocha pg socket.io webpack -- install ``` (adds the dependencies)
8. In the server.js file find the line ```var dbURL = process.env.DATABASE_URL || "postgres://postgres:REBELHANGER@localhost:5432/kitchen"``` *(Change REBELHANGER to your postgres password)*
9. In command prompt type ```node server.js``` *Note: the server will be using port 10000*
10. Type ```http://localhost:10000``` in a browser to get the server running locally.


## Running the tests

A step by step guide for running tests:

1.Run server.js locally on window prompt

2. Clone to local repo
```git clone https://github.com/ACIT2910-HOTH/hoth.git```

3. cd into hoth directory
```cd hoth```

4. Install all other required packages
    ```npm install ```
5. Open a new window prompt and run all functional tests:
    ```npm test```
## Functional test cases

Testcase 1: Testing Sign in page with following information
    usename: fan.cbest@gmail.com
    password: fanzhang
    Click on "SUBMIT" button and look for main page
    
Testcase 2: Testing Full order 1 - no updates in cart
    1 x han_burger
    1 x hoth_salad
    1 x han_froyo
    
    Total: $ 18.15
    
    Options:
    eat-in
    im-credit 
 Testcase 3: Testing Full order 2 - updates in cart

    Initial Order:   
    1 x han_burger
    1 x hoth_salad
    1 x han_froyo
    
   Updates in Cart:
    2 x han_burger
    2 x hoth_salad
    2 x han_froyo
    
    Total: $ 105.60
    
    Options:
    eat-in
    im-credit 

Testcase 4: Testing Full order 3 - updates in cart then cancel

initial Order:   
    1 x han_burger
    1 x hoth_salad
    1 x han_froyo
    
Updates in Cart:
    5 x han_burger
    5 x hoth_salad
    5 x han_froyo
    
    Total: $ 264.00
    
    Options:
    eat-in
    im-credit 
    
    Cancel in the end

## Built With

* [HTML](https://en.wikipedia.org/wiki/HTML5) - The template markup language.
* [CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets) - Style sheet language.
* [Node.Js](https://nodejs.org/en/) - JavaScript server-side.
* [PostGres](https://www.postgresql.org/) - Open source database.
* [Github](https://github.com/) - Version Control Repository.
* [Heroku](https://www.heroku.com/) - Cloud Application Platform.

## License

No License

## Acknowledgments

* Jim Parry & Pope Kim
* BCIT CIT 2A
