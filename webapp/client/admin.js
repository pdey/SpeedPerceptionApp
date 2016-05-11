// Admin page access

Meteor.loginAsAdmin = function(password, callback) {
  var loginRequest = {admin: true, password: password};

  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
};

Template.adminAuth.events({
  'submit .admin-access': function(e, t) {
    e.preventDefault();
    var password = e.target.pwd.value;
    Meteor.loginAsAdmin(password, function(err, res){
      if(err) {
        console.error(err);
        return;
      }
      console.log(res);
    });
  }
});