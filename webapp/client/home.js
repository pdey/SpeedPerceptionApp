// Js helpers for the main AB testing templates.
var videosForCurrentSession = null;
var currentPair = null;
var curIndex = 0;

// randomly select one video from each condition and all training videos for a  user.
function selectVideosForUser() {
  var selectedVideos = VideoPairs.find({type: "train"}).fetch();

  var testVideos = VideoPairs.find({type:"test"}).fetch();
  var videoGroups = _.groupBy(testVideos, "criteria");
  _.each(_.keys(videoGroups), function(condition){
    var videosByCondition = videoGroups[condition];
    var randomPair = _.chain(videosByCondition).shuffle().sample().value();
    if(randomPair) {
      selectedVideos.push(randomPair);
    }
  });
  return _.chain(selectedVideos).shuffle().value();
};

function getNextVideoPair() {
  if(! videosForCurrentSession) {
    videosForCurrentSession = selectVideosForUser();
    console.log("Selected Videos:");
    console.log(videosForCurrentSession);
  }
  var total = _.size(videosForCurrentSession);
  console.log(`total: ${total}, at index: ${curIndex})`);

  if(curIndex == total) {
    curIndex = 0;
    currentPair = null;
    videosForCurrentSession = null;
    return null;
  }

  var pair = videosForCurrentSession[curIndex];
  curIndex += 1;
  return pair;  
};

function getVideoURL(wptId) {
  var videoData = VideoData.findOne({wptId: wptId});
  console.log(wptId, videoData);
  var fs = VideoUploads.findOne({_id: videoData.fileId});
  console.log(fs);
  return fs.url();
};

function addEffect(comp) {
  $('.first-gif').prepend('<div id="overlay1" class="pagination-centered"></div>');
  var overlay1 = $('#overlay1');
  var img1 = $('#gifVideo1');  
  
  $('.second-gif').prepend('<div id="overlay2" class="pagination-centered"></div>');
  var overlay2 = $('#overlay2');
  var img2 = $('#gifVideo2');
   
  switch(comp) {
    case 0:
      overlay1.addClass("green-overlay");
      overlay2.addClass("green-overlay");
      break;
    case 1:
      overlay1.addClass("green-overlay");
      overlay2.addClass("red-overlay");
      break;
    case 2:
      overlay1.addClass("red-overlay");
      overlay2.addClass("green-overlay");
      break;
  }

  overlay1.width(img1.css("width"));
  overlay1.height(img1.css("height"));

  overlay2.width(img1.css("width"));
  overlay2.height(img1.css("height"));
};

function saveResult(comp) {
  console.log(currentPair, comp);
  Meteor.call('testResults.insert',
    {
      pairId: currentPair._id,
      session: Session.get('userSessionKey'),
      result: comp  
    });
};

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

  function syncGifLoad(video) {
    console.log('loaded video');
    console.log(video);
    numLoaded++;
    
    if(numLoaded == 2) {
      console.log("Both loaded");
      $(firstGif).attr('id', 'gifVideo1').addClass('img-responsive');
      $(secondGif).attr('id', 'gifVideo2').addClass('img-responsive');
      $('.first-gif').append($(firstGif));
      $('.second-gif').append($(secondGif));
      numLoaded = 0;
    }
  };
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
    console.log(first, second);
    // Reset
    preloadGifs(first, second);
  },

  // Results
  'click .mid-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    e.preventDefault();
    addEffect(0);
    saveResult(0);
  },

  'click .left-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    e.preventDefault();
    addEffect(1);
    saveResult(1);
  },

  'click .right-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    e.preventDefault();
    addEffect(2);
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
  }, 15*60*1000);
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

