$(document).ready(function() {
    var orderNum = document.getElementById("order_num");
    var orderList = document.getElementById("order_list");
	var table = document.getElementById("table");
    var socket = io();
    var oid;
    var currentOrdersDiv = document.getElementById("current_orders");
    
    $.ajax({
        url:"/submit/order",
        type:"post",
        success:function(resp) {
            
            orderNum.innerHTML = resp["0"].order_id;
            oid = resp["0"].order_id;
            console.log(oid);
            
            for (key in resp) {
                for (items in resp[key].items) {
                    var row = table.insertRow();
                    var cel0 = row.insertCell(0);
                    var cel1 = row.insertCell(1);
                    cel0.innerHTML = items;
                    cel1.innerHTML = resp[key].items[items];
                    table.appendChild(row);
    //                var ndiv = document.createElement("div");
    //                ndiv.innerHTML = resp[i].item_name + " x " + resp[i].quantity;
    //                orderList.appendChild(ndiv)
                }
            }
            
            socket.emit("send message", resp);
        },
        async: true
    });
    
    // populate the order processing div
    $.ajax({
        url:"/submit/getOrdersNums",
        type:"get",
        success:function(resp) {
            for (var i = 0; i < resp.orders.length; i++) {
                var orderWrapper = document.createElement("div");
                var orderIdDiv = document.createElement("div");
                var confirmDiv = document.createElement("div");
                confirmDiv.id = "order-confirm-" + resp.orders[i].order_id;

                orderWrapper.id = "order-div-" + resp.orders[i].order_id;

                if (resp.orders[i].order_id == oid) {
                    orderWrapper.className = "order-wrapper alert alert-info";
                    confirmDiv.innerHTML = "Your order is being processed...";
                } else {
                    orderWrapper.className = "order-wrapper alert alert-danger";
                    confirmDiv.innerHTML = "Processing...";
                }
                
                orderIdDiv.innerHTML = "#" + resp.orders[i].order_id;

                var timerDiv = document.createElement("div");
                timerDiv.id = "order-timer-" + resp.orders[i].order_id;

                orderWrapper.appendChild(orderIdDiv);
                orderWrapper.appendChild(confirmDiv);
                orderWrapper.appendChild(timerDiv);
                currentOrdersDiv.appendChild(orderWrapper);
            }
        },
        async: true
    });

    // listen to incoming orders
    socket.on("create order", function(id) {
        var orderWrapper = document.createElement("div");
        var orderIdDiv = document.createElement("div");
        var confirmDiv = document.createElement("div");
        confirmDiv.id = "order-confirm-" + id;

        orderWrapper.id = "order-div-" + id;

        if (id == oid) {
            orderWrapper.className = "order-wrapper alert alert-info";
            confirmDiv.innerHTML = "Your order is being processed...";
        } else {
            orderWrapper.className = "order-wrapper alert alert-danger";
            confirmDiv.innerHTML = "Processing...";
        }
        
        orderIdDiv.innerHTML = "#" + id;

        var timerDiv = document.createElement("div");
        timerDiv.id = "order-timer-" + id;

        orderWrapper.appendChild(orderIdDiv);
        orderWrapper.appendChild(confirmDiv);
        orderWrapper.appendChild(timerDiv);
        currentOrdersDiv.appendChild(orderWrapper);
    });

    // orders filled by kitchen
    socket.on("confirmation received", function(orderid) {
        var orderDiv = document.getElementById("order-div-" + orderid);
        var confirmDiv = document.getElementById("order-confirm-" + orderid);
        var timerDiv = document.getElementById("order-timer-" + orderid);
        var duration = 5;
        orderDiv.className = "order-wrapper alert alert-success";

        function dismiss() {
            duration--;

            timerDiv.innerHTML = "Closing ... " + duration + "s";

            if (duration == 0) {
                clearInterval(timer);

                orderDiv.parentNode.removeChild(orderDiv);
            }
        }

        if (orderid == oid) {
            confirmDiv.innerHTML = "Your order is complete!";

            var timer = setInterval(dismiss, 1000);
            console.log(timer);
        } else {
            confirmDiv.innerHTML = "Completed";

            var timer = setInterval(dismiss, 1000);
            console.log(timer);
        }
    });

    /*socket.on("order up", function(id) {
        for (var i = 0; i < id.length; i++) {
            if (id[i] == getId()) {
                alert("Your order is ready");
            }
        }
    });
    
    socket.on("new order", createCurrentOrders(document.getElementById("current_orders"), order_num));
    
//    This function is for getting the current orders
    $.ajax({
        url: "/submit/getOrdersNums",
        type: "get",
        success: function(resp) {
            getCurrentOrders(document.getElementById("current_orders"), resp);
        }
    });
    
    function createCurrentOrders(div, message) {
        var ndiv = document.createElement("div");
        ndiv.className = "num";
        ndiv.innerHTML = "Order #"+message;

        div.appendChild(ndiv);
    }
    
    function getCurrentOrders(div, arr) {
        for (var i = 0; i < arr.length; i++) {
            var ndiv = document.createElement("div");
            ndiv.className = "num";
            ndiv.innerHTML = "Order #"+arr.orders[i].id;

            div.appendChild(ndiv);
        }
    }
        
    function getId() {
        var id = 0;
        
        $.ajax({
            url: "/getId",
            type: "get",
            success: function(gottenId) {
                id = gottenId;
            }
        });
        
        return id;
    }*/
});