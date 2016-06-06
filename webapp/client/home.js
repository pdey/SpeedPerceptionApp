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
  var fs = VideoUploads.findOne({_id: videoData.fileId});
  return fs.url();
};

function saveResult(comp) {
  console.log(currentPair, comp);
  Meteor.call('testResults.insert',
    {
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
  
  var firstGif = document.createElement('video');
  $(firstGif).attr('id', 'gifVideo1');
  $('.first-gif').append($(firstGif));


  var secondGif = document.createElement('video');
  $(secondGif).attr('id', 'gifVideo2');
  $('.second-gif').append($(secondGif));


  addSourceToVideo(firstGif, url1, "video/mp4");
  addSourceToVideo(secondGif, url2, "video/mp4");

  var numLoaded = 0;

  
  firstGif.addEventListener("loadeddata", function(){syncGifLoad(firstGif);}, false);
  secondGif.addEventListener("loadeddata", function(){syncGifLoad(secondGif);}, false);

  firstGif.load(); secondGif.load();

  function addSourceToVideo(element, src, type) {
    var source = document.createElement('source');    
    source.src = src;    
    source.type = type;    
    element.appendChild(source); 
  };

  function syncGifLoad(video) {
    console.log('loaded video');
    console.log(video);
    numLoaded++;
    
    if(numLoaded == 2) {
      console.log("Both loaded");
      firstGif.play();
      secondGif.play();
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
    var first = $('#gifVideo1 source').attr('src');
    var second = $('#gifVideo2 source').attr('src');
    console.log(first, second);
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

