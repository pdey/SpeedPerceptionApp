// Admin page access

Meteor.loginAsAdmin = function(password, callback) {
  var loginRequest = {admin: true, password: password};

  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
};