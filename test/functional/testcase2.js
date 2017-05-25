/* testcase 2: Testing Full order 1 - no updates in cart
    1 x han_burger
    1 x hoth_salad
    1 x han_froyo
    
    Total: $ 18.15
    
    Options:
    eat-in
    im-credit 
*/

module.exports = {
  tags: ['testcase2'],
  'test RebelHanger Full order 1' : function (client) {
    client
      .url('https://rebel-hanger.herokuapp.com/')
      .waitForElementVisible('body', 1000)
      .assert.title('Main Page')
      .maximizeWindow()
      .pause(1000)
      .assert.visible('input[id="qty-han_burger"]')
      .setValue('input[id=qty-han_burger]', '1')
      .pause(1000)
      .click('#add-han_burger', function (clickStatus) {
        console.log("---- (0 pass, -1 fail) clicking add-han_burger status:" + clickStatus.status);
      })
      .pause(100)
      
      .assert.visible('input[id="qty-hoth_salad"]')
      .setValue('input[id=qty-hoth_salad]', '1')
      .pause(1000)
      .click('#add-hoth_salad', function (clickStatus) {
        console.log("---- (0 pass, -1 fail) clicking add-hoth_salad status:" + clickStatus.status);
      })
      .pause(100)
      
      .assert.visible('input[id="qty-han_froyo"]')
      .setValue('input[id=qty-han_froyo]', '1')
      .pause(1000)
      .click('#add-han_froyo', function (clickStatus) {
        console.log("---- (0 pass, -1 fail) clicking add-han_froyo status:" + clickStatus.status);
      })
      .pause(100)
 
      //Couldnt .click on the cart dropdown, work around.
      client.execute(function() {
        document.querySelector('#cart_link').click()
      })
      .pause(1000)   
      
    client.expect.element('#cart-update-han_burger').to.be.present
    client.expect.element('#cart-update-hoth_salad').to.be.present
    client.expect.element('#cart-update-han_froyo').to.be.present
    client.expect.element('#checkout').to.be.present
        
    client.waitForElementVisible('#checkout', 1000);

    //click on checkout using xpath
    client
      .useXpath()
      .click('//*[@id="checkout"]', function (clickStatus) {
        console.log("clicking checkout status:" + clickStatus.status);
      })
      .pause(1000)
    //revert back to css selector
      .useCss() 
    
    //Check we are on order page after checkout
    client
      .pause(1000)
      .assert.title('Order Page' , "Check we are on order page after checkout.")
      .pause(1000)
      
      
      //Check the total of what we ordered is correct
      .useXpath()
      .assert.containsText('//*[@id="fb-ot"]', "Order Total: 52.80")
      .pause(1000)
      //revert back to css selector
      .useCss() 
      
      .assert.visible('input[id="eat-in"]', "Check eat-in option available.")
      
      .click('input[id=eat-in]', function (clickStatus) {
        console.log("---- (0 pass, -1 fail) clicking eat-in status:" + clickStatus.status);
      })
      .pause(1000)
      .assert.visible('input[id="im-credit"]', "Check im-credit option available.")
      .click('input[id=im-credit]', function (clickStatus) {
        console.log("---- (0 pass, -1 fail) clicking im-credit status:" + clickStatus.status);
      })
      .pause(1000)
      .assert.visible('button[id="checkout-but"]', "Check place order button available.")
      .click('button[id=checkout-but]', function (clickStatus) {
        console.log("---- (0 pass, -1 fail) clicking Place Order status:" + clickStatus.status);
      })
      .pause(1000)
      .assert.title('Thank You!', "Check we are on the Thank You page after order is placed.")
      
    client.end();
  }
};