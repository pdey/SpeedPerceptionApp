// Storage for HAR files.
var harStorage = new FS.Store.GridFS("harUploads");

FS.config.uploadChunkSize = 2 * 1024 * 1024; // Setting 2MB as chunk size
HarUploads = new FS.Collection("harUploads", {
	stores: [harStorage]
});

HarUploads.deny({
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

HarUploads.allow({
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


// Storage for video files in gif format.
var gifStorage = new FS.Store.GridFS("gifUploads");

FS.config.uploadChunkSize = 2 * 1024 * 1024; // Setting 2MB as chunk size
GifUploads = new FS.Collection("gifUploads", {
	stores: [gifStorage]
});

GifUploads.deny({
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

GifUploads.allow({
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

// Test video pairs for validating consistent users (selected from a dataset).
ValidationVideoPairs = new Meteor.Collection('validationVideoPairs');

// Video pairs curated from a dataset.
TestVideoPairs = new Meteor.Collection('testVideoPairs');

// Results of experiment.
TestResults = new Meteor.Collection('testResults');