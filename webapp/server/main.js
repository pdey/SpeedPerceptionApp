'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';



Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  'datasets.insert'(name, data) {
    check(name, String);
    if(! this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    console.log(`Inserting dataset:${name}`);
    console.log(`Accessed by: ${this.userId}`);
      
    DataSets.insert({
      name: name,
      data: data
    });
  },

  'videos.insert'(datasetName, wptId, fileId) {
    check(datasetName, String);
    check(wptId, String);
    if(! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    console.log('Inserting video');
    VideoData.insert({
      dataset: datasetName,
      wptId: wptId,
      fileId: fileId
    });
  },

  'videos.remove'(datasetName, wptId) {
    if(! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    console.log('Removing video');
    var video = VideoData.findOne({dataset: datasetName, wptId: wptId});
    if(video) {
      var fileRef = video.fileId;
      VideoUploads.remove(fileRef);
      VideoData.remove(video._id);
    }
  },

  'videoPairs.insert'(obj) {
    if(! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    console.log('Inserting test/train pairs');
    VideoPairs.insert(obj);
  },

  'videoPairs.remove'(id) {
    if(! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    console.log('Removing test/train pair');
    VideoPairs.remove(id);
  },

  'testResults.insert'(obj) {
    var conn = this.connection;
    // de-duplication
    var existing = TestResults.findOne(_.omit(obj, "result"));
    if(existing) {
      TestResults.remove({_id: existing._id});
    }
    _.extend(obj, {ip: conn.clientAddress, userAgent: conn.httpHeaders['user-agent']});
    TestResults.insert(obj);
  },

  'feedbacks.insert'(feedback, session) {
    check(feedback, String);
    check(session, String);
    if(feedback.length > 200) {
      feedback = feedback.substring(0, 200);
    }
    console.log("Storing user feedback");
    UserFeedbacks.insert(
      {
        session: session,
        feedback: feedback
      }
    );
  },

  'purge.dataset'(datasetId) {
    if(! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    console.log("Purging dataset with id: " + datasetId);

    // Remove all videoPairs
    var pairs = VideoPairs.find({datasetId: datasetId}).fetch();
    _.each(pairs, function(p) {
      // Remove all results
      var results = TestResults.find({pairId: p._id}).fetch();
      _.each(results, function(r) {
        TestResults.remove(r._id);
      });
      VideoPairs.remove(p._id);
    });

    // Remove all files.
    var dataset = DataSets.findOne({_id: datasetId});
    var videos = VideoData.find({dataset: dataset.name}).fetch();
    _.each(videos, function(video){
      var fileRef = video.fileId;
      VideoUploads.remove(fileRef);
      VideoData.remove(video._id);
    });

    // Remove dataset
    DataSets.remove(datasetId);
  }
});
