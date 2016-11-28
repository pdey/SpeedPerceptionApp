var curIndex = 0;
var _curIndexDeps = new Deps.Dependency;

var videoStartTime = 0;

function displayVideos() {
  var pair = VideoPairs.find({type: 'test'}).fetch()[curIndex];
  console.log(pair);
  preloadGifs(getVideoURL(pair.wptId_1), getVideoURL(pair.wptId_2));
}

function getVideoURL(wptId) {
  var videoData = VideoData.findOne({wptId: wptId});
  var fs = VideoUploads.findOne({_id: videoData.fileId});
  return fs.url();
}

function preloadGifs(url1, url2) {
  // Remove existing gif images.
  $('#loaderIcon').show();
  
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
    numLoaded++;
    
    if(numLoaded == 2) {
      console.log("Both loaded");
      $('#loaderIcon').hide();    
      $(firstGif).attr('id', 'gifVideo1').addClass('img-responsive');
      $(secondGif).attr('id', 'gifVideo2').addClass('img-responsive');
      $('.first-gif').append($(firstGif));
      $('.second-gif').append($(secondGif));

      // start timer
      videoStartTime = new Date().getTime();

      numLoaded = 0;
    }
  };
};

/* Template: showStats */

Template.showStats.helpers({
  'pairId': function() {
    _curIndexDeps.depend();
    return VideoPairs.find({type: 'test'}).fetch()[curIndex]._id;   
  }
});

Template.showStats.events({
  'click .show-videos': function(e, t) {
    e.preventDefault();
    $('#showVideos').modal('show');
  },

  'click .show-next': function(e, t) {
    curIndex++;
    _curIndexDeps.changed();
  }
});


/* Template: showVideosModal */
Template.showVideosModal.events({
  'click .replay-btn': function(e, t) {
    e.preventDefault();
    $('#timer').text('');
    var first = $('#gifVideo1').attr('src');
    var second = $('#gifVideo2').attr('src');
    preloadGifs(first, second);
  },

  'click .time-btn': function(e, t) {
    e.preventDefault();
    // show timing.
    var curTime = new Date().getTime();
    var duration = curTime - videoStartTime;
    $('#timer').text(duration + ' msec');
    console.log(duration);
  },

  'shown.bs.modal #showVideos': function(e, t) {
    console.log('showing videos');
    $('#timer').text('');
    displayVideos();
  }
});

/* Template: pairStats */
Template.pairStats.helpers({
  ttcDistImgUrl: function() {
    _curIndexDeps.depend();
    var pairId = VideoPairs.find({type: 'test'}).fetch()[curIndex]._id;
    var url = 'http://sp-app.s3.amazonaws.com/ttc_dist_pid_' + pairId + '.png';
    return url;
  }
});