/* testcase 1: Testing Sign in page
    usename: fan.cbest@gmail.com
    password: fanzhang

*/
module.exports = {
  tags: ['testcase1'],
  'test RebelHanger Signin page' : function (client) {
    client
      .url('https://rebel-hanger.herokuapp.com/signin')
      .waitForElementVisible('body', 1000)
      .assert.title('Sign in')
      .maximizeWindow()
      .pause(1000)
      .assert.visible('input[name="email"]', "Check if email box is visible, if yes type in fan.cbest@gmail.com")
      .setValue('input[name="email"]', 'fan.cbest@gmail.com')
      .pause(1000)
      .assert.visible('input[name="password"]', "Check if password box is visible, if yes type in fanzhang")
      .setValue('input[name="password"]', 'fanzhang')
      .pause(1000)
      .assert.visible('input[id="subs"]',  "Check if submit button is visible, if yes, click")
      
      .click('#subs', function (clickStatus) {
        console.log("---- (0 pass, -1 fail) clicking submit status:" + clickStatus.status);
      })
      .pause(100)
      
      .pause(1000)
      .assert.title('Main Page')
      .assert.elementPresent('[id="profile_link"]')
      .assert.elementPresent('[id="logout_link"]')
    client.end();
  }
};