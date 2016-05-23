// Js helpers for the main AB testing templates.

function getRandomVideoPair() {
  var pairs = VideoPairs.find().fetch();
  var randomPair = _.chain(pairs).shuffle().sample().value();
  return randomPair;
};

function getVideoURL(wptId) {
  var videoData = VideoData.findOne({wptId: wptId});
  var fs = GifUploads.findOne({_id: videoData.fileId});
  return fs.url();
};

function preloadGifs(url1, url2) {
  console.log("Preloading:", url1, url2);
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
    console.log("gif load callback");
    numLoaded++;
    if(numLoaded == 2) {
      console.log("Appending");
      $(firstGif).attr('id', 'gifVideo1');
      $(secondGif).attr('id', 'gifVideo2');
      $('.first-gif').append($(firstGif));
      $('.second-gif').append($(secondGif));
      numLoaded = 0;
    }
  }
};

Template.abTest.events({
  'click .show-next': function(e, t) {
    e.preventDefault();
    // remove current gifs
    $('.gif').attr('src', '');
    var newPair = getRandomVideoPair();
    $('#gifVideo1').attr('src', getVideoURL(newPair.wptId_1));
    $('#gifVideo2').attr('src', getVideoURL(newPair.wptId_2));
  },

  'click .replay-btn': function(e, t) {
    e.preventDefault();
    console.log("Replay");
    var first = $('#gifVideo1').attr('src');
    var second = $('#gifVideo2').attr('src');

    // Reset
    preloadGifs(first, second);
  }
});

Template.gifView.onCreated(function(){
  console.log('rendered');
  Meteor.setTimeout(function(){
    var pair = getRandomVideoPair();
    console.log(pair);
    preloadGifs(getVideoURL(pair.wptId_1), getVideoURL(pair.wptId_2));
  }, 2000);
});
