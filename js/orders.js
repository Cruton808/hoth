$(document).ready(function(){    
    var orderDispaly = document.getElementById("order-div");
    var submitButton = document.getElementById("checkout-but"),
        cancelButton = document.getElementById("cancel-but"),
        fname = document.getElementById("f-name"),
        userName = document.getElementById("u-name"),
        email = document.getElementById("e-mail"),
        foodTotal = document.getElementById("fb-t"),
        taxCost = document.getElementById("fb-ta"),
        orderTotal = document.getElementById("fb-ot") 
	var im_credit = document.getElementById("im-credit");
	var	gcs = document.getElementById("gcs");
	var	wupi = document.getElementById("wupi");
	var table = document.getElementById("table");
    
    var orders = {};
    var itemName = [];
    var itemPrice = [];
    var itemQuantity = [];
    var totalPrice = 0;
    var tax;
    var socket = io();

	//to round to 2 dec places
	function round2Fixed(value) {
  		value = +value;
		
  	if (isNaN(value))
    	return NaN;

  	// Shift
  	value = value.toString().split('e');
  	value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + 2) : 2)));

  	// Shift back
  	value = value.toString().split('e');
	return (+(value[0] + 'e' + (value[1] ? (+value[1] - 2) : -2))).toFixed(2);
	}
	

    $.ajax({
        url:"/get/orders",
        type:"post",
        success:function(resp){
            orders = resp.orders[0];
            getOrderItems(orders);
            
            for(var i=0; i<itemQuantity.length;i++){
                var itemTotalPrice = itemPrice[i] * itemQuantity[i];

				var row = table.insertRow();
				var cel0 = row.insertCell(0);
				var cel1 = row.insertCell(1);
				var cel2 = row.insertCell(2);
				cel0.innerHTML = itemName[i];
				cel1.innerHTML = itemQuantity[i];
				cel2.innerHTML = " $" + round2Fixed(itemTotalPrice);
				
                table.appendChild(row);
                totalPrice = totalPrice + itemTotalPrice;
            }
            tax = totalPrice * 0.1;
            
            if (resp.username == "guest") {
                fname.style.display = "none";
                email.style.display = "none";
            }

            fname.innerHTML = fname.innerHTML + ' ' + resp.fname;
            userName.innerHTML = userName.innerHTML + ' ' + resp.username;
            email.innerHTML = email.innerHTML + ' '+ resp.email;
            foodTotal.innerHTML = foodTotal.innerHTML + " " + round2Fixed(totalPrice);
            taxCost.innerHTML = taxCost.innerHTML + " " + round2Fixed(tax);
            orderTotal.innerHTML = orderTotal.innerHTML + " " + round2Fixed(tax + totalPrice);
        },
        async: false
    });
    
   
    function getOrderItems(orders){
        Object.keys(orders).forEach(function(key){
            var orderItem = key;
            var quantity = parseInt(orders[key]);

            itemQuantity.push(quantity)

            $.ajax({
                url:"/get/price",
                type:"post",
                data: {
                    item:orderItem
                },
                success:function(resp){
                    console.log(resp);
                    itemName.push(resp.name);
                    itemPrice.push(parseFloat(resp.price));
                },
                async:false
            });
        });
    };
    
    submitButton.addEventListener("click",function(){
        
        $.ajax({
            url:"/save/order",
            type:"post",
            data:{
                totalPrice:totalPrice + tax
            },
            success:function(resp){
				console.log(orderId)
                var orderId = resp.id;

                socket.emit("send order", orderId);
                
                for(var i=0; i<itemName.length;i++){
                    $.ajax({
                        url:"/order/detailes",
                        type:"post",
                        data:{
                            name:itemName[i],
                            quantity:itemQuantity[i],
                            id:orderId,
                            price:itemPrice[i]
                        },
                        success:function(res){
                            if (res.status == "success") {
                                location.href = "/order/submitted/" + orderId;
                            }
                        }
                    });
                }
            },
        async: false
        });
    });
    
    cancelButton.addEventListener("click",function(){
        location.href = "/"
    });
});