/*jshint esversion: 6 */

module.exports = {
    add: function (a, b) {
        return a + b;
    }
};

// initializations
const pg = require("pg");
const express = require("express");
const path = require("path");
const port = process.env.PORT || 10000;
const bodyParser = require("body-parser");
const session = require("express-session");
const formidable = require('formidable');

const fs = require("fs");

var app = express();
var pF = path.resolve(__dirname, "public");
var imgFolder = path.resolve(__dirname, "images");

const server = require("http").createServer(app);
const io = require("socket.io")(server);

var dbURL = process.env.DATABASE_URL || "postgres://postgres:REBELHANGER@localhost:5432/kitchen";

var usernameRegex = /[a-zA-Z0-9\-_]{4,20}/;
var nameRegex = /^[a-zA-Z]{1,15}$/;
var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
var passwordRegex = /^[^ \s]{4,15}$/;

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret:"this is our kitchen",
    resave:true,
    saveUninitialized:true
}));

pg.defaults.poolSize = 20;

var client = new pg.Client(dbURL);
//client.on("drain", client.end.bind(client));
client.connect();

//----------------Constraints------------------------//


var maxOrderNumber = 10;
var maxItemNumber = 10;
var maxQuantity = 6;
var cookDelay = 5000;
var tossFood = 1200000;
var shopStatus = 1;



//----------------Constraints Ends-------------------//


// ajax response
app.post("/register", function(req, resp) {
    if (nameRegex.test(req.body.fname) && nameRegex.test(req.body.lname) && passwordRegex.test(req.body.password) && emailRegex.test(req.body.email) && usernameRegex.test(req.body.uname)) {
        //pg.connect(dbURL, function(err, client, done) {
            client.query("INSERT INTO hoth_users (first_name, last_name, password, email, username) VALUES ($1, $2, $3, $4, $5)", [req.body.fname, req.body.lname, req.body.password, req.body.email, req.body.uname], function(err, result) {
                //done();

                if (err) {
                    console.log(err);
                    reps.send("Account exists");
                } else {
                    resp.redirect("/created");
                }
            });
        //});
    } else {
        resp.send("Wrong Format");
    }
});

app.post("/login", function(req, resp) {
    if (emailRegex.test(req.body.email) && passwordRegex.test(req.body.password)) {
        //pg.connect(dbURL, function(err, client, done) {
            client.query("SELECT * FROM hoth_users WHERE email = $1 AND password = $2", [req.body.email, req.body.password], function(err, result) {
                //done();
                if (err) {
                    console.log(err);
                }

                if (result != undefined && result.rows.length > 0) {
                    req.session.username = result.rows[0].username;
                    req.session.email = result.rows[0].email;
                    req.session.loginid = result.rows[0].user_id;
                    req.session.auth = result.rows[0].auth_level;
                    req.session.fname = result.rows[0].first_name;

                    resp.redirect("/");
                } else {
                    resp.send("Wrong login information");
                }
            });
        //});
    } else {
        resp.send("Wrong format");
    }
});

app.post("/appetizers", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT * FROM hoth_items WHERE category = 'a'", function(err, result) {
            //done();
            
            resp.send(result.rows);
        });
    //});
});

app.post("/drinks", function(req, resp) {
   // //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT * FROM hoth_items WHERE category = 'b'", function(err, result) {
            //done();
            
            resp.send(result.rows);
        });
    //});
});

app.post("/desserts", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT * FROM hoth_items WHERE category = 'd'", function(err, result) {
            //done();
            
            resp.send(result.rows);
        });
   // });
});

app.post("/meals", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT * FROM hoth_items WHERE category = 'm'", function(err, result) {
            //done();
            
            resp.send(result.rows);
        });
    //});
});

app.post("/user-cp", function(req, resp) {
        if (req.session.auth == "C") {
           resp.send("customer");
        } else if (req.session.auth == "E" || req.session.auth == "A") {
            resp.send("ea");
        }
});

app.post("/changeEmail", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
    if(emailRegex.test(req.body.email)) {
        client.query("UPDATE hoth_users SET email = $1 WHERE user_id = $2", [req.body.email, req.session.loginid], function(err, result) {
            //done();
            
            resp.send("Email has been changed");
            resp.end();
        });
    //});
    }
});

app.post("/changePassword", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("UPDATE hoth_users SET password = $1 WHERE user_id = $2", [req.body.password, req.session.loginid], function(err, result) {
            //done();
            
            resp.send("Password has been changed");
            resp.end();
        });
    //});
});

//---------------------------Order page --------------------//

app.post("/orders",function(req,resp){
	req.session.orders = []
    while(req.session.orders.length > 0){
        req.session.orders.pop();
    }
    if(shopStatus == 0){
        resp.send({
            status:"faile",
            message:"Sorry we are closed, please come back later"
        })
    } else{
        req.session.orders.push(req.body.orders)
        resp.send({status:"success"})
    }
    
});

app.post("/get/orders",function(req,resp){
    resp.send({
        status:"success",
        orders:req.session.orders,
        username: req.session.username,
        fname:req.session.fname,
        email:req.session.email
    })
}); 

app.post("/get/price",function(req,resp){
    //pg.connect(dbURL,function(err,client,done){
        /*if(err){
            console.log(err);
            resp.send({
                status:"fail"
            });
        }*/
        client.query("SELECT item_name,price FROM hoth_items WHERE item_code = $1",[req.body.item],function(err,result){
            //done();
            
            if(err){
                console.log(err);
                resp.sent({
                    status:"faile",
                });
            }

            console.log(result.rows);

            if (result != undefined && result.rows.length > 0) {
                resp.send({
                    status:"success",
                    price:result.rows[0].price,
                    name:result.rows[0].item_name
                });
            }
        });
    //});
});

app.post("/save/order",function(req,resp){
    console.log(req.body)
    //pg.connect(dbURL,function(err,client,done){
        /*if(err){
            console.log(err);
            resp.send({
                status:"fail",
                message:"database connection err"});
        }*/
        client.query("INSERT INTO hoth_orders (customer,total_price) VALUES ($1,$2) RETURNING order_id",[req.session.username,req.body.totalPrice],function(err,result){
            //done();
            if(err){
                console.log(err);
                resp.sent({
                    status:"faile"
                });
            } else {
                resp.send({
                    status:"success",
                    id:result.rows[0].order_id
                });
            }
            
            
        });
    //});
});

app.post("/order/detailes",function(req,resp){
    //pg.connect(dbURL,function(err,client,done){
        /*if(err){
            console.log(err);
            resp.send({
                status:"fail"
            });
        }*/

        client.query("INSERT INTO hoth_order_details (item_name,quantity,order_id, price) VALUES ($1,$2,$3, $4)",[req.body.name,req.body.quantity,req.body.id,req.body.quantity*req.body.price],function(err,result){
            //done();

            if(err){
                console.log(err);
                resp.send({
                    status:"fail"
                });
            }

            resp.send({
                status:"success"
            });

        });
    //});
    
});

app.post("/submit/order", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT * FROM hoth_order_details INNER JOIN hoth_items ON hoth_order_details.item_name = hoth_items.item_name WHERE hoth_order_details.order_id = $1", [req.session.orderid], function(err, result) {
            //done();

            if (err) {
                console.log(err);
            }

            var obj = {}

            console.log(result);

            if (result != undefined && result.rows.length > 0) {
                obj["0"] = {
                    order_id: result.rows[0].order_id,
                    items: {},
                    item_code: {}
                }

                for (var i = 0; i < result.rows.length; i++) {
                    obj["0"].items[result.rows[i].item_name] = result.rows[i].quantity;
                    obj["0"].item_code[result.rows[i].item_name] = result.rows[i].item_code;
                }

                resp.send(obj);
            }
        });
    //});
});

//kitchen
app.post("/start-kitchen", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT hoth_order_details.*, hoth_items.item_code FROM hoth_order_details INNER JOIN hoth_items ON hoth_order_details.item_name = hoth_items.item_name WHERE hoth_order_details.status = 'N' AND hoth_order_details.order_id IN (SELECT order_id FROM hoth_orders WHERE status = 'N' ORDER BY order_id LIMIT $1) ORDER BY hoth_order_details.order_id", [req.body.count], function(err, result) {
            //done();

            console.log(req.body.count);

            var index = 0;
            var lastItem = 0;
            var obj = {};
            
            if (result != undefined && result.rows.length > 0) {
                while (index < result.rows.length) {
                    if (result.rows[index].order_id != lastItem) {
                        lastItem = result.rows[index].order_id;
                        
                        obj[lastItem] = {
                            order_id: result.rows[index].order_id,
                            items: {},
                            item_code: {},
                        };
                        
                        obj[lastItem].items[result.rows[index].item_name] = result.rows[index].quantity;
                        obj[lastItem].item_code[result.rows[index].item_name] = result.rows[index].item_code;
                        
                        index++;
                    } else {
                        obj[lastItem].items[result.rows[index].item_name] = result.rows[index].quantity;
                        obj[lastItem].item_code[result.rows[index].item_name] = result.rows[index].item_code;
                        index++
                    }
                }
            
                resp.send(obj);
            }
        });
    //});
});

app.post("/update/status", function(req, resp) {
    var orderids = req.body.orderids;
    var oid = orderids.toString();

    //pg.connect(dbURL, function(err, client, done) {
        client.query("WITH twotables AS (UPDATE hoth_orders SET status = 'P' WHERE order_id IN (" + oid + ") RETURNING *) UPDATE hoth_order_details SET status = 'P' WHERE order_id IN (SELECT order_id FROM twotables)", function(err, result) {
            //done();

            if (err) {
                console.log(err);
            }

            if (result != undefined && result.rows.length > 0) {
                console.log(result.rows);
            }
        })
    //})
})

app.post("/order/complete", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("WITH twotables AS (UPDATE hoth_orders SET status = 'F' WHERE order_id = $1 RETURNING *) UPDATE hoth_order_details SET status = 'F' WHERE order_id IN (SELECT order_id FROM twotables)", [req.body.orderid], function(err, result) {
            //done();

            var obj = {
                orderid: req.body.orderid
            };

            resp.send(obj);
        });
    //});
});

// -----------------------Order page end ------------------//
// -----------------------Admin operation---------------//
app.post("/change/price",function(req,resp){
    //pg.connect(dbURL,function(err,client,done){
        if(err){
            console.log(err)
        }
        client.query("UPDATE hoth_items SET price = $1 WHERE item_code = $2",[req.body.price,req.body.item],function(err,result){
            //done();

            if(err){
                console.log(err);
            }else {
                resp.send({status:"success"})

            }
        });
    //});
});

app.post("/adminItems", function(req,resp){
    //pg.connect(dbURL,function(err,client,done){
        if(err){
            console.log(err)
        }
        client.query("INSERT INTO hoth_items (item_code,category,description,item_name,filename,price) VALUES($1,$2,$3,$4,$5,$6)",[req.body.itemCode,req.body.category,req.body.desc,req.body.name,req.body.fileName,req.body.price],function(err,result){
            //done();
            if(err){
                console.log(err);
            }else {
                resp.send({
                    status:"success",
                    name: req.body.name,
                    item_code:req.body.itemCode,
                    filename:req.body.fileName,
                    desc:req.body.desc,
                    price:req.body.price
                });

            }
        });
    //});
});

app.post("/get/items", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT * FROM hoth_items ORDER BY item_name", function(err, result) {
            //done();
            resp.send({result: result.rows});
        });
    //});
});

app.post("/delete/item",function(req,resp){
	pg.connect(dbURL, function(err, client, done) {
        client.query("DELETE FROM hoth_items WHERE item_code = $1",[req.body.item], function(err, result) {
            //done();
            resp.send("success");
        });
    });
})

var imageName;
app.post("/filename",function(req,resp){
    imageName = req.body.fileName
})

app.post('/upload', function(req, resp){
  var form = new formidable.IncomingForm();
 
  form.multiples = true;

  form.uploadDir = path.join(__dirname, '/images');

  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, imageName));
  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('end', function() {
    resp.end('success');
  });

  form.parse(req);

});

app.post('/get/shopstatus',function(req,resp){
    resp.send({shopStatus:shopStatus});
});

app.post("/open/close",function(req,resp){
    shopStatus = req.body.shopStatus;
	if(req.body.shopStatus == 0){
		pg.connect(dbURL,function(err,client,done){
			client.query("UPDATE hoth_order_details SET status = 'C' WHERE status IN ('P', 'N')"),function(err,result){
                //done();
				if(err){
					console.log(err)
				}
			}
			client.query("UPDATE hoth_orders SET STATUS = 'C' WHERE status IN ('P', 'N')"),function(err,result){
				done();
				if(err){
					console.log(err)
				} else {
					resp.send("success")
				}
			}
		})
	}
    resp.send({status:"success"})
    
});

app.post("/get/accounts",function(req,resp){
    //pg.connect(dbURL,function(err,client,done){
        client.query("SELECT user_id,username, email, first_name, last_name FROM hoth_users WHERE auth_level = $1",[req.body.id],function(err,result){
            //done();
            if(err){
                console.log(err)
            } else if (result != undefined && result.rows.length > 0) {
                resp.send(result.rows)
            }
        })
    //})
});

app.post("/auth",function(req,resp){
    //pg.connect(dbURL,function(err,client,done){
        client.query("UPDATE hoth_users SET auth_level = $1 WHERE user_id = $2",[req.body.auth,req.body.user],function(err,result){
            //done();
            if(err){
                console.log(err)
            } else {
                resp.send("success")
            }
            
        })
    //})
    
});

/*app.post("/order/summary",function(req,resp){
    var totalOrderNum;
    var totalIncome;
   
    //pg.connect(dbURL,function(err,client,done){
         
        client.query("SELECT SUM(total_price) totalPrice, COUNT(order_id) ordernumber FROM hoth_orders WHERE STATUS = 'F';",function(err,result){
            //done();
            if(err){
                console.log(err)
            }
            
            totalIncome = result.rows[0].totalprice;
            totalOrderNum = result.rows[0].ordernumber;
        })
        
        client.query("SELECT * FROM hoth_orders WHERE status = 'F';",function(err,result){
            //done();
            if(err){
                console.log(err)
            } else {
                resp.send({
                totalIncome: totalIncome,
                orderNumber:totalOrderNum,
                rows:result.rows
            })
            }
            
            
        })
    })
})

app.post("/discard",function(req,resp){
	pg.connect(dbURL,function(err,client,done){
        client.query("SELECT item_name,SUM(quantity) numbers FROM hoth_prepared WHERE discarded = 'Y' GROUP BY item_name;",function(err,result){
            //done();
            if(err){
                console.log(err)
            } else {
                resp.send(result.rows)
            }
            
        })
    })
	
}) */

//------------------------Admin operation end-----------//


app.post("/prepare/item", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("INSERT INTO hoth_prepared (item_name, quantity, item_code) VALUES ($1, $2, $3) RETURNING *", [req.body.item, req.body.quantity, req.body.item_id], function(err, result) {
            //done();
    
            if (result != undefined && result.rows.length > 0) {
                resp.send({
                    prep_id: result.rows[0].prep_id,
                    item: result.rows[0].item_name,
                    quantity: result.rows[0].quantity,
                    item_code: result.rows[0].item_code
                });
            }
        });
    //});
});

app.post("/discard/item", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("UPDATE hoth_prepared SET discarded = 'Y' WHERE prep_id = $1", [req.body.item], function(err, result) {
            //done();

            if (err) {
                console.log(err);
            }

            resp.send("success");
        });
    //});
});

app.post("/bag/item", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT * FROM hoth_prepared WHERE item_name = $1 AND discarded = 'N' AND quantity >= $2", [req.body.item, req.body.quantity], function(err, result) {
            //done();

            if (result != undefined && result.rows.length > 0) {
                client.query("WITH cte AS (SELECT prep_id FROM hoth_prepared WHERE quantity >= $1 AND item_name = $2 AND discarded = 'N' ORDER BY prep_id LIMIT 1) UPDATE hoth_prepared s SET quantity = quantity - $1 FROM cte WHERE s.prep_id = cte.prep_id RETURNING cte.prep_id, s.item_code, s.quantity", [req.body.quantity, req.body.item], function(err, result) {
                    //done();

                    if (err) {
                        console.log(err);
                    }

                    var obj = {
                        status: "success",
                        prep_id: result.rows[0].prep_id,
                        item_code: result.rows[0].item_code,
                        quantity: result.rows[0].quantity
                    }

                    resp.send(obj);
                }); 
            } else {
                resp.send({
                    status: "fail"
                });
            }
        });
    //});
});

app.post("/item/complete", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("UPDATE hoth_order_details SET status = 'F' WHERE item_name = $1 and order_id = $2", [req.body.item, req.body.orderid], function(err, result) {
            //done();

            client.query("SELECT * FROM hoth_order_details WHERE order_id = $1 AND status = 'P'", [req.body.orderid], function(err, result) {
                //done();

                if (result != undefined && result.rows.length == 0) {
                    resp.send({
                        status: "success",
                        orderid: req.body.orderid
                    });
                } else {
                    resp.send({
                        status: "fail"
                    });
                }
            });
        });
    //});
});

app.post("/complete/order", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("UPDATE hoth_orders SET status = 'F' WHERE order_id = $1 RETURNING order_id", [req.body.orderid], function(err, result) {
            //done();

            if (result != undefined && result.rows.length) {
                resp.send({
                    orderid: result.rows[0].order_id
                });
            }
        });
    //});
});


app.post("/report", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        if (req.body.type == "order") {
            client.query("WITH cte AS (SELECT SUM(total_price) FROM hoth_orders) SELECT * FROM hoth_orders s CROSS JOIN cte WHERE s.status = 'F' ORDER BY s.order_id", function(err, result) {
                //done();

                if (result != undefined && result.rows.length > 0) {
                    resp.send({
                        result: result.rows
                    });
                }
            });
        } else if (req.body.type == "item") {
            client.query("SELECT item_name, sum(quantity) AS quantity, sum(price) AS price FROM (SELECT * FROM hoth_order_details) AS s WHERE s.status = 'F' GROUP BY item_name ORDER BY item_name", function(err, result) {
                //done();

                if (result != undefined && result.rows.length > 0) {
                    resp.send(result.rows);
                }
            }) ;
        } else if (req.body.type == "discarded") {
            client.query("WITH cte AS (SELECT p.item_name AS item_name, SUM(p.quantity) AS quantity, i.price AS price FROM hoth_prepared p LEFT JOIN hoth_items i ON p.item_name = i.item_name WHERE discarded = 'Y' AND quantity > 0 GROUP BY p.item_name, price, quantity ORDER BY p.item_name) SELECT cte.item_name, SUM(cte.quantity) AS quantity, SUM(cte.price) AS price FROM cte GROUP BY cte.item_name", function(err, result) {
                //done();

                if (result != undefined && result.rows.length > 0) {
                    resp.send(result.rows);
                }
            });
        }
    //});
});

app.post("/reset/all", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("UPDATE hoth_prepared SET discarded = 'Y'", function(err, result) {
            //done();
        });

        client.query("WITH twotables AS (UPDATE hoth_orders SET status = 'N' WHERE status = 'P' RETURNING *) UPDATE hoth_order_details SET status = 'N' WHERE status = 'P'", function(err, result) {
            //done();
        });
    //});
});

var imageName;
app.post("/filename",function(req,resp){
    imageName = req.body.fileName
})

app.post('/upload', function(req, resp){
  var form = new formidable.IncomingForm();
 
  form.multiples = true;

  form.uploadDir = path.join(__dirname, '/images');

  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, imageName));
  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('end', function() {
    resp.end('success');
  });

  form.parse(req);

});

app.use("/scripts", express.static("build"));

app.use("/js",express.static("js"))

app.use("/images", express.static("images"));

app.use("/css", express.static("css"));

app.get("/", function(req, resp) {
    if(req.session.username == undefined){
        req.session.username = 'guest'
    }
    console.log(req.session.username);

    if (req.session.auth == "A") {
        resp.sendFile(pF + "/admin.html");
    } else if (req.session.auth == "E") {
        resp.sendFile(pF + "/kitchen.html");
    } else {
        resp.sendFile(pF + "/main.html");
    }
});

app.get("/submit/getOrdersNums", function(req, resp) {
    //pg.connect(dbURL, function(err, client, done) {
        client.query("SELECT * FROM hoth_orders WHERE status IN ('P','N') ORDER BY order_id", function(err, result) {
            //done();

            if (err) {
                console.log(err);
            }

            if (result != undefined && result.rows.length > 0) {
                resp.send({
                    orders: result.rows
                });
            }
        });
    //});
});

app.get("/profile", function(req, resp) {
    if(req.session.auth == "C") {
        resp.sendFile(pF + "/profile.html");
    } else {
        resp.sendFile(pF + "/main.html");
    }
});

app.get("/created", function(req, resp) {
    resp.sendFile(pF + "/created.html");
});

app.get("/signin", function(req, resp) {
    resp.sendFile(pF + "/login.html");
});

app.get("/logout", function(req, resp) {
    req.session.destroy();
    resp.redirect("/");
});

app.get("/user_profile", function(req, resp) {
    if (req.session.auth == "C") {
        resp.sendFile(pF + "/profile.html");
    } else if (req.session.auth == "A"){
		resp.sendFile(pF + "/admin.html");
	} else {
        resp.redirect("/");
    }
});

app.get("/checkout", function(req, resp) {
    resp.sendFile(pF + "/orders.html");
});


app.get("/order/submitted/:orderid", function(req, resp) {
    req.session.orderid = req.params.orderid;
    
    resp.sendFile(pF + "/submitted.html");
});

app.get("/admin_page",function(req,resp){
    if(req.session.auth == "A"){
        resp.sendFile(pF + "/admin.html");
    } else{
        resp.sendFile(pF + "/main.html");
    }
});

app.get("/adminuser",function(req,resp){
    if(req.session.auth == "A"){
        resp.sendFile(pF + "/admin_user.html");
    } else{
        resp.sendFile(pF + "/main.html");
    }
});

app.get("/getId", function(req, resp) {
    resp.send(req.session.orderid);
});


//socket
var orderRecords = [];
var checkRecords = false;

io.on("connection", function(socket) {    
    socket.join("connected");
    
    socket.on("send message", function(orders) {
        io.to("connected").emit("create message", orders);
    });

    socket.on("send order", function(id) {
        io.to("connected").emit("create order", id);
    });

    socket.on("send confirmation", function(orderid) {
        io.to("connected").emit("confirmation received", orderid);
    });
});

// server
server.listen(port, function(err) {
    if (err) {
        console.log("Error: " + err);
        return false;
    }
    
    console.log("Server is running on " + port);
});
