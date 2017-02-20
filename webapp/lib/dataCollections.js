// Storage for video files in mp4 format.

var videoStorage = new FS.Store.GridFS("videoUploads");

FS.config.uploadChunkSize = 4 * 1024 * 1024; // Setting 4MB as chunk size.
VideoUploads = new FS.Collection("videoUploads", {
	stores: [videoStorage]
});

VideoUploads.deny({
 insert: function(){
 return false;
 },
 update: function(){
 return false;
 },
 remove: function(){
 return false;
 },
 download: function(){
 return false;
 }
});

VideoUploads.allow({
 insert: function(){
   return true;
 },
 update: function(){
 return true;
 },
 remove: function(){
 return true;
 },
 download: function(){
 return true;
 }
});

// DataSet loaded from csv files
DataSets = new Meteor.Collection('datasets');

// Video meta-data
VideoData = new Meteor.Collection('videos');

// Video pairs curated from a dataset.
VideoPairs = new Meteor.Collection('videoPairs');

// Results of experiment.
TestResults = new Meteor.Collection('testResults');

// Visual response timer
VisualResponse = new Meteor.Collection('visualResponse');

// User feedback.
UserFeedbacks = new Meteor.Collection('userFeedbacks');

// Expert comments on video pairs.
ExpertComments = new Meteor.Collection('expertComments');