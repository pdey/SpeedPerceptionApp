Accounts.registerLoginHandler(function(loginRequest){
  console.log(loginRequest);
  if(! loginRequest.admin) {
    return undefined;
  }

  if(loginRequest.password != Meteor.settings.admin_secret) {
    return null;
  }

  var userId = null;
  var user = Meteor.users.findOne({username: 'admin'});
  if(! user) {
    userId = Meteor.users.insert({username: 'admin'});
  } else {
    userId = user._id;
  }

  console.log(user);

  var stampedToken = Accounts._generateStampedLoginToken();
  var hashStampedToken = Accounts._hashStampedToken(stampedToken);

  Meteor.users.update(userId,
    {$push: {'services.resume.loginTokens': hashStampedToken}}
  );

  return {
    userId : userId,
    token: stampedToken.token
  }
});

