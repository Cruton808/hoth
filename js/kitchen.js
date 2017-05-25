$(document).ready(function() {
    var ordersDiv = document.getElementById("orders"),
        itemList = document.getElementById("item-list"),
        makeOne = document.getElementById("make1"),
        makeTwo = document.getElementById("make2"),
        makeSix = document.getElementById("make6"),
        controllerDiv = document.getElementById("controller"),
        loadingDiv = document.getElementById("controller_2"),
        percentageSpan = document.getElementById("percentage"),
        loadingBar = document.getElementById("timeout"),
        hotPlate = document.getElementById("hot_plate"),
        logoutButton = document.getElementById("logout"),
        perc = 0,
        orderCount = 0,
        totalOrder = 0,
        socket = io();

    // socket connection to listen to orders
    socket.on("create message", function(orders) {
        var oid = orders["0"].order_id;
        var checkDiv = document.getElementById("order-" + orders["0"].order_id);

        if (totalOrder < 10 && orderCount < 10 && checkDiv == null) {
            getItems(orders["0"].item_code, orders["0"].items, orders["0"].order_id);

            //totalOrder++;

            updateOrders(oid);
        }
    });

    startKitchen(10 - orderCount);

    // populate kitchen with pending orders
    function startKitchen(count) {
        $.ajax({
            url:"/start-kitchen",
            type:"post",
            data: {
                count: count
            },
            success:function(resp) {
                var orderids = [];

                for (key in resp) {
                    if (orderCount < 10) {
                        var oid = resp[key].order_id;

                        getItems(resp[key].item_code, resp[key].items, resp[key].order_id);

                        orderids.push(oid);
                    }
                }

                updateOrders(orderids);
            }
        });
    }

    // update orders to pending
    function updateOrders(orderids) {
        $.ajax({
            url:"/update/status",
            type:"post",
            data: {
                orderids: orderids
            }
        });
    }

    // function to create "bag" button
    function getItems(item_code, items, order_id) {
        var orderWrapper = document.createElement("div");
        orderWrapper.id = "order-" + order_id;
        orderWrapper.className = "container-fluid alert alert-danger";

        var orderNum = document.createElement("strong");
        orderNum.className = "col-lg-1 col-md-1 col-sm-1 col-xs-1";
        orderNum.innerHTML = "Order #" + order_id;
        orderWrapper.appendChild(orderNum);

        var orderItemWrapper = document.createElement("div");
        orderItemWrapper.className = "items col-lg-8 col-md-8 col-sm-9 col-xs-9";

        var completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.id = "fill-order-" + order_id;
        completeButton.disabled = true;
        completeButton.className = "col-lg-3 col-md-3 col-sm-2 col-xs-2 btn btn-success";
        completeButton.innerHTML = "Fill Order";
        orderWrapper.appendChild(orderItemWrapper);
        orderWrapper.appendChild(completeButton);

        ordersDiv.appendChild(orderWrapper);

        orderCount++

        for (key in items) {
            var itemDiv = document.createElement("div");
            itemDiv.className = "i";
            itemDiv.innerHTML = items[key] + "x " + key;
            
            var bagButton = document.createElement("button");
            bagButton.className = "btn btn-default";
            bagButton.id = "bag-" + item_code[key] + "-" + order_id;
            bagButton.type = "button";
            bagButton.innerHTML = "Bag";
            itemDiv.appendChild(bagButton);
            orderItemWrapper.appendChild(itemDiv);

            bagClick(item_code[key], order_id, items[key], key)
        }
    }

    // get more orders
    /*function getMoreOrders(count) {
        $.ajax({
            url:"/get"
        })
    }*/

    function bagClick(ic, oid, qty, name) {
        var getBagButton = document.getElementById("bag-" + ic + "-" + oid);
        var orderid = oid;
        var quantity = qty;
        var item_name = name;
        
        getBagButton.addEventListener("click", function() {
            $.ajax({
                url:"/bag/item",
                type:"post",
                data: {
                    orderid: orderid,
                    item: item_name,
                    quantity: quantity 
                },
                success:function(resp) {
                    console.log(resp);

                    if (resp.status == "fail") {
                        alert("You don't have enough");
                    } else if (resp.status == "success") {
						console.log(resp.item_code)
						console.log(resp.prep_id)
                        var qtyDiv = document.getElementById("qty-" + resp.item_code + "-" + resp.prep_id);
                        var itemDiv = document.getElementById("item-" + resp.item_code + "-" + resp.prep_id);

                        if (resp.quantity > 0) {
                            qtyDiv.innerHTML = "Quantity: " + resp.quantity;
                        } else {
							console.log("here")
                            itemDiv.parentNode.removeChild(itemDiv);
                        }

                        getBagButton.disabled = true;
                        getBagButton.innerHTML = "Completed";

                        $.ajax({
                            url:"/item/complete",
                            type:"post",
                            data: {
                                orderid: orderid,
                                item: item_name
                            },
                            success:function(res) {
                                if (res.status == "success") {
                                    var fillButton = document.getElementById("fill-order-" + res.orderid);
                                    fillButton.disabled = false;
                                    var orderid = res.orderid;

                                    fillButton.addEventListener("click", function() {
                                        orderCount--;

                                        $.ajax({
                                            url:"/complete/order",
                                            type:"post",
                                            data: {
                                                orderid: orderid
                                            },
                                            success:function(re) {
                                                socket.emit("send confirmation", orderid);
                                                var orderDiv = document.getElementById("order-" + re.orderid);
                                                orderDiv.className = "container-fluid alert alert-success alert-dismissable fade in";
                                                fillButton.disabled = true;
                                                var countdown = setInterval(buttonCountdown, 1000);

                                                console.log
                                                
                                                var cd = 5;

                                                function buttonCountdown() {
                                                    cd--;

                                                    fillButton.innerHTML = cd + "s...";

                                                    if (cd == 0) {
                                                        clearInterval(countdown);
                                                        orderDiv.parentNode.removeChild(orderDiv);
                                                        
                                                        startKitchen(10 - orderCount);
                                                    }
                                                }
                                            }
                                        })
                                    })
                                }
                            }
                        })
                    }
                },
				async: true
            });
        });
    }

    // populate the item drop down list
    $.ajax({
        url:"/get/items",
        type:"post",
        success:function(resp) {
            for (var i = 0; i < resp.result.length; i++) {
                var items = document.createElement("option");
                items.id = resp.result[i].item_code;
                items.value = resp.result[i].item_name;
                items.innerHTML = resp.result[i].item_name;

                itemList.appendChild(items);
            }
        }
    });

    makeOne.addEventListener("click", function() {
        makeItem(1);
    });

    makeTwo.addEventListener("click", function() {
        makeItem(2);
    });

    makeSix.addEventListener("click", function() {
        makeItem(6);
    })

    function makeItem(qty) {
        $.ajax({
            url:"/prepare/item",
            type:"post",
            data: {
                item: itemList.value,
                item_id: itemList.options[itemList.selectedIndex].id,
                quantity: qty
            },
            success:function(resp) {
				console.log(resp.item_code)
                controllerDiv.style.display = "none";
                loadingDiv.style.display = "inline";

                var loadingTime = setInterval(loadingAnimation, 1000);

                function loadingAnimation() {
                    perc += 20;

                    percentageSpan.innerHTML = perc + "%";
                    loadingBar.style.width = perc + "%";
                    loadingBar.setAttribute("aria-valuenow", perc);

                    if (perc == 120) {
                        clearInterval(loadingTime);

                        controllerDiv.style.display = "inline";
                        loadingDiv.style.display = "none";

                        var itemWrapper = document.createElement("div");
                        itemWrapper.className = "panel panel-warning";
                        itemWrapper.id = "item-" + resp.item_code + "-" + resp.prep_id;
                        var itemNameWrapper = document.createElement("div");
                        itemNameWrapper.className = "pos panel-heading";
                        itemNameWrapper.innerHTML = resp.item;

                        itemTimer = document.createElement("div");
                        itemTimer.className = "hot-plate-timer";
                        itemTimer.id = "timer-" + resp.item_code + "-" + resp.prep_id;
                        
                        var itemQty = document.createElement("div");
                        itemQty.innerHTML = "Quantity: " + resp.quantity;
                        itemQty.className = "hot-plate-qty";
                        itemQty.id = "qty-" + resp.item_code + "-" + resp.prep_id;

                        itemNameWrapper.appendChild(itemQty);
                        itemNameWrapper.appendChild(itemTimer);
                        itemWrapper.appendChild(itemNameWrapper);
                        hotPlate.appendChild(itemWrapper);

                        var timerDiv = document.getElementById("timer-" + resp.item_code + "-" + resp.prep_id);
                        countdownTimer(timerDiv, resp.item_code, resp.prep_id);

                        perc = 0;
                        percentageSpan.innerHTML = perc + "%";
                        loadingBar.style.width = perc + "%";
                        loadingBar.setAttribute("aria-valuenow", perc);
                    }
                }
            }
        });
    }

    function countdownTimer(timer_div, item_code, id) {
        var duration = 120;

        var cd = setInterval(function() {countdown(timer_div, item_code, id);}, 1000);

        function countdown(timer_div, item_code, id) {
            duration--;
            
            timer_div.innerHTML = "Time: " + duration + "s";

            if (duration == 0) {
                clearInterval(cd);

                $.ajax({
                    url:"/discard/item",
                    type:"post",
                    data: {
                        item: id
                    },
                    success:function(resp) {
                        if (resp == "success") {
                            timer_div.parentNode.parentNode.parentNode.removeChild(timer_div.parentNode.parentNode);
                        }
                    }
                });
            }
        }
    }

    logoutButton.addEventListener("click", function() {
        resetAll();

        location.href = "/logout";
    });

    window.onbeforeunload = resetAll;

    function resetAll() {
        $.ajax({
            url:"/reset/all",
            type:"post"
        });

        return "All prepared items will be discarded, do you wish to continue?";
    }
});