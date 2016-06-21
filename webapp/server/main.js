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
  }

});
