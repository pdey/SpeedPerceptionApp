// Js helpers for the main AB testing templates.
var videosForCurrentSession = null;
var currentPair = null;
var curIndex = 0;

var _scoreDeps = new Deps.Dependency;
var _progressDeps = new Deps.Dependency;
var passedTrainingData = {};
var totalTrainingData = 0;

var videoStartTime = 0;

// randomly select one video from each condition and all training videos for a  user.
function selectVideosForUser() {
  var selectedVideos = VideoPairs.find({type: "train"}).fetch();
  totalTrainingData = _.size(selectedVideos);
  console.log(`total training data: ${totalTrainingData}`);
  var testVideos = VideoPairs.find({type:"test"}).fetch();
  //var testVideos = [];
  var videoGroups = _.groupBy(testVideos, "criteria");
  _.each(_.keys(videoGroups), function(condition){
    var videosByCondition = videoGroups[condition];
    var randomPair = _.chain(videosByCondition).sample().value();
    if(randomPair) {
      selectedVideos.push(randomPair);
    }
  });
  return _.chain(selectedVideos).shuffle().value();
};

function getNextVideoPair() {
  if(! videosForCurrentSession) {
    videosForCurrentSession = selectVideosForUser();
    //console.log("Selected Videos:");
    //console.log(videosForCurrentSession);
  }
  var total = _.size(videosForCurrentSession);
  console.log(`total: ${total}, at index: ${curIndex})`);

  if(curIndex == total) {
    curIndex = 0;
    currentPair = null;
    videosForCurrentSession = null;
    passedTrainingData = {};
    totalTrainingData = 0;
    return null;
  }

  var pair = videosForCurrentSession[curIndex];
  curIndex += 1;
  return pair;  
};

function getVideoURL(wptId) {
  var videoData = VideoData.findOne({wptId: wptId});
  //console.log(wptId, videoData);
  var fs = VideoUploads.findOne({_id: videoData.fileId});
  //console.log(fs);
  return fs.url();
};

function saveResult(comp) {
  var curTime = new Date().getTime();
  var viewingDuration = curTime - videoStartTime;
  
  console.log(currentPair, comp);
  
  Meteor.call('testResults.insert',
    {
      pairId: currentPair._id,
      session: Session.get('userSessionKey'),
      result: comp,
      viewDurationInMS: viewingDuration  
    });
  if(currentPair.type == 'train'
     && currentPair.result == comp) {
    passedTrainingData[currentPair._id] =1;
    console.log('passed training data:', _.size(passedTrainingData));
    _scoreDeps.changed();
    // showProgress();
  }
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

function conclude() {
  $('#thanksModal').modal('show');  
};

// function showProgress() {
//   $('#scoreModal').modal('show');
// }

Template.abTest.events({
  'click .show-next': function(e, t) {
    t.$('.btn-decision').prop('disabled', false).show();
    t.$('.show-next').prop('disabled', true);
    e.preventDefault();

    _progressDeps.changed();

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
    t.$('.btn-decision').prop('disabled', false).show();
    t.$('.show-next').prop('disabled', true);
    e.preventDefault();
    var first = $('#gifVideo1').attr('src');
    var second = $('#gifVideo2').attr('src');
    //console.log(first, second);
    // Reset
    preloadGifs(first, second);
  },

  // Results
  'click .mid-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    t.$('.left-btn').hide();
    t.$('.right-btn').hide();
    
    e.preventDefault();
    saveResult(0);
  },

  'click .left-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    t.$('.mid-btn').hide();
    t.$('.right-btn').hide();
    
    e.preventDefault();
    saveResult(1);
  },

  'click .right-btn': function(e, t) {
    t.$('.btn-decision').prop('disabled', true);
    t.$('.show-next').prop('disabled', false);
    t.$('.mid-btn').hide();
    t.$('.left-btn').hide();
    
    e.preventDefault();
    saveResult(2);
  }
});

Template.abTest.onRendered(function(){
  $('#guideModal').modal('show');
  $('.show-next').prop('disabled', true);
  // Generate a random hash for this user and store in session
  Session.set('userSessionKey', Random.id());

  // Reset session every 15 minutes.
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
    }, 5000);
  }
});

Template.thanks_modal.helpers({
  success_percent: function() {
    _scoreDeps.depend();
    //console.log(_.size(passedTrainingData), totalTrainingData);
    return (_.size(passedTrainingData)*100)/totalTrainingData;
  }
});

Template.thanks_modal.events({
  'click .stop-play': function(e, t) {
    e.preventDefault();
    t.$('#thanksModal').modal('hide');
  },

  'click .send-feedback': function(e, t) {
    e.preventDefault();
    // feedback
    var feedback = t.$('#feedback-text').val();
    if(feedback && feedback.length > 3) {
      Meteor.call('feedbacks.insert', feedback, Session.get('userSessionKey'));      
    }
    t.$('#thanksModal').modal('hide');
  }
});

Template.thanks_modal.onRendered(function() {
  $('#thanksModal').on('hidden.bs.modal', function() {
    Router.go('/');
  });
});

Template.score_modal.helpers({
  success_percent: function() {
    _scoreDeps.depend();
    //console.log(_.size(passedTrainingData), totalTrainingData);
    return (_.size(passedTrainingData)*100)/totalTrainingData;
  }
});

Template.score_modal.events({
  'click .score-button': function(e, t) {
    e.preventDefault();
    t.$('#scoreModal').modal('hide');
  }
});

Template.score_modal.onRendered(function(){
  $('#scoreModal').on('hidden.bs.modal', function(){
    $('.show-next').trigger('click');
  });
});

Template.progressbar.helpers({
  progress: function() {
    _progressDeps.depend();
    return Math.ceil(100*(curIndex - 1) / _.size(videosForCurrentSession));
  }
});
