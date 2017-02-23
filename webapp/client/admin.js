// Admin page access

Meteor.loginAsAdmin = function(password, callback) {
  var loginRequest = {admin: true, password: password};

  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
};

// View filters
var curViewDatasetId = null;
var _curDatasetDeps = new Deps.Dependency;

//==== Video Previews
var curPairId = null;

function displayVideos() {
  var pair = VideoPairs.findOne({_id: curPairId});
  console.log(pair);
  preloadGifs(getVideoURL(pair.wptId_1), getVideoURL(pair.wptId_2));
}

function getVideoURL(wptId) {
  let url = `http://doabimqbqjo7b.cloudfront.net/${wptId}.gif`;
  return url;
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

/* Template : adminAuth */
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
//======================================================
// Helper functions for converting collection array to csv.
function jsonArrToCsv(jsonArr) {
  var headers = _.keys(_.first(jsonArr)).join(',');
  var rows = _.chain(jsonArr)
              .map(function(r) {return _.values(r).join(',');})
              .value();
  var csvStr = headers + '\n';
  _.each(rows, function(r) {
    csvStr += r + '\n';
  });
  return csvStr;
}

// This creates a link and triggers a click event on that link
function dispatchDownload(objectURL, filename) {
  var link = document.createElement('a');
  link.href = objectURL;
  link.download = filename;
  link.target = '_blank';

  var event = document.createEvent("MouseEvents");
  event.initMouseEvent(
    "click", true, false, window, 0, 0, 0, 0, 0
    , false, false, false, false, 0, null
  );
  link.dispatchEvent(event);
}

//======================================================
/* Template: datasetUploader */
Template.datasetUploader.events({
  // submit csv dataset
  'submit #uploadDataset': function(e, t){
    e.preventDefault();
    console.log('uploading file');
    var file = e.target.csvfileinput.files[0];
    var datasetName = file.name.split('.')[0];

    var reader = new FileReader();

    // load file
    reader.addEventListener('load', function(event){
      var csv = event.target.result;
      var  objArr = csv2ObjArray(csv);
      // filter object to remove all sensitive data.
      var securedObjArr = _.map(objArr, function(o) {return _.pick(o, 'domain', 'wpt_test_id')})
      // console.log(objArr);
      Meteor.call('datasets.insert', datasetName, securedObjArr);
    });

    reader.readAsText(file);

    // helper function for converting csv to json.
    function csv2ObjArray(csv) {
      var lines = _.filter(csv.split('\n'), function(l) {return ! _.isEmpty(l);});
      var headers = _.first(lines).split(',');
      var rows = _.chain(lines).rest()
      .map(
        function(line) {
          return _.chain(line.split(','))
          .map(function(v){return _.isNaN(Number(v))? v: Number(v);})
          .value();
        })
      .value();

      var obj = _.chain(rows)
      .map(
        function(row) {
          var o = {};
          _.each(_.zip(headers, row),
            function(p){
              o[p[0]] = p[1];
            });
          return o;
        })
      .value();
      return obj;
    }
  }
});
//=============================================================================

/* Dataset Viewer templates */

/* Dependency on search input */
var _deps = new Deps.Dependency;
var domainSearchCriteria = {};

Template.datasetViewer.helpers({
  datasets: function() {
    return DataSets.find();
  }
});

Template.singleDataset.helpers({
  searchData: function() {
    _deps.depend();
    var res = _.sortBy(this.data, "domain");

    if(domainSearchCriteria.input) {
      res = _.filter(res, function(d){
        return d.domain.startsWith(domainSearchCriteria.input);
      }) ;
    }

    if(domainSearchCriteria.hasVideo) {
      var dataset = this.name;
      var res = _.filter(res, function(d){
        return VideoData.findOne({dataset: dataset, wptId: d.wpt_test_id}); 
      });
    }
    return res;
  }
});

Template.singleDataset.events({
  'keyup input.search-input': function(e, t) {
    var searchInput = t.find('.search-input').value;
    domainSearchCriteria.input = searchInput;
    _deps.changed();
  },

  'change input.check-video': function(e, t) {
    var checked = e.target.checked;
    domainSearchCriteria.hasVideo = checked;
    _deps.changed();
  },

  // Download dataset
  'submit #downloadDataset': function(e, t) {
    e.preventDefault();
    var datasetId = e.target.datasetId.value;
    console.log("Downloading dataset :" + datasetId);
    var dataset = DataSets.findOne({_id: datasetId});
    var name = dataset.name;
    var data = dataset.data;
    var csvStr = jsonArrToCsv(data);
    var blob = new Blob([csvStr], {type:'text/csv'});
    var objectURL = window.URL.createObjectURL(blob);
    dispatchDownload(objectURL, name +'.csv');
  },

  // Download results
  'submit #downloadResults': function(e, t) {
    e.preventDefault();
    var datasetId = e.target.datasetId.value;
    console.log("Downloading results for dataset: " + datasetId);
    var name = DataSets.findOne({_id: datasetId}).name;
    var results = [];
    var pairs = VideoPairs.find({datasetId: datasetId}).fetch();
    _.each(pairs, function(pair) {
      var pairId = pair._id;
      var tests = TestResults.find({pairId: pairId}).fetch();
      _.each(tests, function(test) {
        results.push({
          session: test.session,
          ip: test.ip,
          userAgent: test.userAgent.replace(/,/g, ' '),
          wpt_test_id_1: pair.wptId_1,
          wpt_test_id_2: pair.wptId_2,
          type: pair.type,
          expected: (pair.result)?pair.result:'None',
          result: test.result,
          criteria: (pair.criteria)?pair.criteria:'None'
        });
      });
    });
    var csvStr = jsonArrToCsv(results);
    var blob = new Blob([csvStr], {type:'text/csv'});
    var objectURL = window.URL.createObjectURL(blob);
    var date = moment().format('MM-DD-YYYY');
    var filename = name + '-results-' + date + '.csv';
    dispatchDownload(objectURL, filename);
  },

  // Remove a dataset completely
  'submit #removeDataset': function(e, t) {
    e.preventDefault();
    var datasetId = e.target.datasetId.value;
    console.log("Removing dataset: " + datasetId);
    Meteor.call('purge.dataset', datasetId);
  }
});

Template.singleDomain.events({
  'submit #uploadVideo': function(e, t){
    e.preventDefault();
    var dataset_name = e.target.dataset_name.value;
    var wpt_test_id = e.target.wpt_test_id.value;
    var file = e.target.mp4input.files[0];
    VideoUploads.insert(file, function(err, fileObj){
      if(err) {
        console.error(err);
        return;
      }
      // Insert into video data.
      Meteor.call('videos.insert', dataset_name, wpt_test_id, fileObj._id);
    });
  },

  'submit #removeVideo': function(e, t) {
    e.preventDefault();
    var dataset_name = e.target.dataset_name.value;
    var wpt_test_id = e.target.wpt_test_id.value;
    Meteor.call('videos.remove', dataset_name, wpt_test_id);
  } 
});

Template.singleDomain.helpers({
  hasVideo: function(parentCxt) {
    var datasetName = parentCxt.name;
    var wptId = this.wpt_test_id;
    if(VideoData.findOne({dataset: datasetName, wptId: wptId})) {
      return true;
    }
    return false;
  }
});
//=====================================================================

/* Train/Test data uploader */
Template.videoPairUpload.helpers({
  datasets: function() {
    return DataSets.find();
  },

  selectionCriteria: function() {
    return _.map(_.range(1, 17, 1),
              function(i) {
                return {'condition': i};
              });
  },

  videoPairs: function() {
    _curDatasetDeps.depend();
    if(! curViewDatasetId) {
      curViewDatasetId = DataSets.findOne()._id;
    }
    return VideoPairs.find({datasetId: curViewDatasetId}, {sort: {type: -1, criteria: 1, approved: -1}});
  }
});

Template.videoPairUpload.events({
  'change #dataType': function(e, t) {
    e.preventDefault();
    var selection = t.$('form #dataType').val();
    switch(selection) {
      case 'test':
      t.$('form #expectedResult').addClass('hidden');
      t.$('form #criteria').removeClass('hidden');
      break;
      case 'train':
      t.$('form #expectedResult').removeClass('hidden');
      t.$('form #criteria').addClass('hidden');
      break;
    }
  },

  'submit #addPair': function(e, t) {
    e.preventDefault();
    var datasetId = e.target.dataset.value;
    var wptId_1 = e.target.wpt_test_id_1.value;
    var wptId_2 = e.target.wpt_test_id_2.value;
    var criteria = e.target.criteriaNo.value;
    var type = e.target.type.value;
    var result = e.target.result.value;
    console.log(datasetId, wptId_1, wptId_2, type, result);
    if(validate()) {
      var newPair = {};
      newPair.datasetId = datasetId;
      newPair.wptId_1 = wptId_1;
      newPair.wptId_2 = wptId_2;
      newPair.type = type;
      
      if(newPair.type == 'train') {
        newPair.result = result;
      } else {
        newPair.criteria = criteria;
      }  

      Meteor.call('videoPairs.insert', newPair);
      return true;
    }

    // form validation
    function validate() {
      var ds = DataSets.findOne({_id: datasetId});
      var data = ds.data;
      var has_id_1 = _.findWhere(data, {wpt_test_id: wptId_1});
      var has_id_2 = _.findWhere(data, {wpt_test_id: wptId_2});
      if(has_id_1 && has_id_2) {
        return true;
      } else {
        console.error("Invalid test ids");
        return false;
      }
    }
  },

  'change .view-dataset-filter': function(e, t) {
    curViewDatasetId = $(e.target).val();
    _curDatasetDeps.changed();
  }
});

Template.singleVideoPairDisplay.helpers({
  datasetName: function(id) {
    return DataSets.findOne({_id:id}).name;
  }
});

Template.singleVideoPairDisplay.events({

  'click .review-videos': function(e, t) {
    e.preventDefault();
    t.$('a').addClass('text-warning');
    console.log(this._id);
    curPairId = this._id;
    // var pair = VideoPairs.findOne({_id: this._id});
    $('#showVideos').modal('show');
  },

  'submit #toggleVideoPair': function(e, t) {
    e.preventDefault();
    var dbId = e.target.pairid.value;
    console.log("Toggle pair: " + dbId);
    // Remove from db
    Meteor.call('videoPairs.toggle', dbId);
    return true;
  }
});

/* Template: previewVideosModal */
Template.previewVideosModal.events({
  'click .replay-btn': function(e, t) {
    e.preventDefault();
    var first = $('#gifVideo1').attr('src');
    var second = $('#gifVideo2').attr('src');
    preloadGifs(first, second);
  },

  'shown.bs.modal #showVideos': function(e, t) {
    console.log('showing videos');
    displayVideos();
  }
});