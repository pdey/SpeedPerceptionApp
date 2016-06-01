// Js helpers for the main AB testing templates.

var currentPair = null;
var curIndex = 0;

function getRandomVideoPair() {
  var pairs = VideoPairs.find().fetch();
  var randomPair = _.chain(pairs).shuffle().sample().value();
  return randomPair;
};

function getNextVideoPair() {
  var cursor = VideoPairs.find();
  var total = cursor.count();
  console.log(`total: ${total}, at index: ${curIndex})`);

  if(curIndex == total) {
    curIndex = 0;
    return null;
  }

  var pair = cursor.fetch()[curIndex];
  curIndex += 1;
  return pair;  
};

function getVideoURL(wptId) {
  var videoData = VideoData.findOne({wptId: wptId});
  var fs = GifUploads.findOne({_id: videoData.fileId});
  return fs.url();
};

function saveResult(comp) {
  console.log(currentPair, comp);
  TestResults.insert({
    pairId: currentPair._id,
    session: Session.get('userSessionKey'),
    result: comp
  });
}

function preloadGifs(url1, url2) {
  // Remove existing gif images.
  if($('#gifVideo1')) {
    $('#gifVideo1').attr('src', '');
  }
  if($('#gifVideo2')) {
    $('#gifVideo2').attr('src', '');
  }

  $('.first-gif').empty();
  $('.second-gif').empty();
  var firstGif = new Image();
  var secondGif = new Image();

  firstGif.src = url1;
  secondGif.src = url2;

  var numLoaded = 0;

  firstGif.onload = function() {syncGifLoad(firstGif);};
  secondGif.onload = function() {syncGifLoad(secondGif);};

  function syncGifLoad(imgElem) {
    numLoaded++;
    if(numLoaded == 2) {
      $(firstGif).attr('id', 'gifVideo1');
      $(secondGif).attr('id', 'gifVideo2');
      $('.first-gif').append($(firstGif));
      $('.second-gif').append($(secondGif));
      numLoaded = 0;
    }
  }
};

function conclude() {
  $('#thanksModal').modal('show');  
};

Template.abTest.events({
  'click .show-next': function(e, t) {
    t.$('.btn-decision').prop('disabled', false);
    t.$('.show-next').prop('disabled', true);
    e.preventDefault();
    // remove current gifs
    //currentPair = getRandomVideoPair();
    currentPair = getNextVideoPair();
    if(_.isNull(currentPair)) {
      // Done showing all pairs.
      conclude();
      return;
    }
    preloadGifs(
      getVideoURL(currentPair.wptId_1),
      getVideoURL(currentPair.wptId_2)
      );
  },

  'click .replay-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', false);
    t.$('.show-next').prop('disabled', true);
    e.preventDefault();
    var first = $('#gifVideo1').attr('src');
    var second = $('#gifVideo2').attr('src');

    // Reset
    preloadGifs(first, second);
  },

  // Results
  'click .mid-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    e.preventDefault();
    saveResult(0);
  },

  'click .left-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    e.preventDefault();
    saveResult(1);
  },

  'click .right-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    e.preventDefault();
    saveResult(2);
  }

});

Template.abTest.onRendered(function(){
  $('#guideModal').modal('show');
  $('.show-next').prop('disabled', true);
  // Generate a random hash for this user and store in session
  Session.set('userSessionKey', Random.id());

  // Reset session every 10 minutes.
  this.refresh_session = setInterval(function(){
    Session.set('userSessionKey', Random.id());
  }, 60*1000);
});

Template.abTest.onDestroyed(function(){
  clearInterval(this.refresh_session);
});


/* Template: modal dialogs */
Template.guide_modal.events({
  'click .start-play': function(e, t) {
    e.preventDefault();
    console.log('start playing videos');
    t.$('#guideModal').modal('hide');

    Meteor.setTimeout(function(){
      // currentPair = getRandomVideoPair();
      curIndex = 0;
      currentPair = getNextVideoPair();
      preloadGifs(
        getVideoURL(currentPair.wptId_1),
        getVideoURL(currentPair.wptId_2));
    }, 2000);
  }
});

Template.thanks_modal.events({
  'click .stop-play': function(e, t) {
    e.preventDefault();
    t.$('#thanksModal').modal('hide');
  }
});

Template.thanks_modal.onRendered(function() {
  $('#thanksModal').on('hidden.bs.modal', function() {
    Router.go('/');
  });
});

