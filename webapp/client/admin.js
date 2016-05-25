// Admin page access

Meteor.loginAsAdmin = function(password, callback) {
  var loginRequest = {admin: true, password: password};

  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
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
      console.log(objArr);
      DataSets.insert({name: datasetName, data: objArr});
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
          wpt_test_id_1: pair.wptId_1,
          wpt_test_id_2: pair.wptId_2,
          type: pair.type,
          expected: (pair.result)?pair.result:'None',
          result: test.result
        });
      });
    });
    var csvStr = jsonArrToCsv(results);
    var blob = new Blob([csvStr], {type:'text/csv'});
    var objectURL = window.URL.createObjectURL(blob);
    var date = moment().format('MM-DD-YYYY');
    var filename = name + '-results-' + date + '.csv';
    dispatchDownload(objectURL, filename);
  }
});

Template.singleDomain.events({
  'submit #uploadVideo': function(e, t){
    e.preventDefault();
    var dataset_name = e.target.dataset_name.value;
    var wpt_test_id = e.target.wpt_test_id.value;
    var file = e.target.gifinput.files[0];
    GifUploads.insert(file, function(err, fileObj){
      if(err) {
        console.error(err);
        return;
      }
      // Insert into video data.
      VideoData.insert(
      {
        dataset: dataset_name,
        wptId: wpt_test_id,
        fileId: fileObj._id
      });
    });
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

  videoPairs: function() {
    return VideoPairs.find({}, {sort: {dataset: 1}});
  }
});

Template.videoPairUpload.events({
  'change #dataType': function(e, t) {
    e.preventDefault();
    var selection = t.$('form #dataType').val();
    switch(selection) {
      case 'test':
      t.$('form #expectedResult').addClass('hidden');
      break;
      case 'train':
      t.$('form #expectedResult').removeClass('hidden');
      break;
    }
  },

  'submit #addPair': function(e, t) {
    e.preventDefault();
    var datasetId = e.target.dataset.value;
    var wptId_1 = e.target.wpt_test_id_1.value;
    var wptId_2 = e.target.wpt_test_id_2.value;
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
      }  

      VideoPairs.insert(newPair);
      return true;
    }

    // form validation
    function validate() {
      var ds = DataSets.findOne({_id: datasetId});
      var data = ds.data;
      var has_id_1 = _.findWhere(data, {wpt_test_id: wptId_1});
      var has_id_2 = _.findWhere(data, {wpt_test_id: wptId_2});
      if(has_id_1 && has_id_2) {
        // Check if videos are uploaded.
        if(! VideoData.findOne({wptId: wptId_1})) {
          console.error("No vidoes found for test id: " + wptId_1);
          return false;
        }
        if(! VideoData.findOne({wptId: wptId_2})) {
          console.error("No vidoes found for test id: " + wptId_2);
          return false;  
        }
      } else {
        console.error("Invalid test ids");
        return false;
      }
      return true;
    }
  }
});

Template.sinlgeVideoPairDisplay.events({
  'submit #removeVideoPair': function(e, t) {
    e.preventDefault();
    var dbId = e.target.pairid.value;
    // Remove from db
    VideoPairs.remove({_id: dbId});
    return true;
  }
});