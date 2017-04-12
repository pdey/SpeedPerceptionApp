import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

//===========================================================================
// Loading template
Template.loading.rendered = function () {
  var message = '<p class="loading-message">The application is loading ..</p>';
  var spinner = '<div class="sk-cube-grid">'+
        '<div class="sk-cube sk-cube1"></div>'+
        '<div class="sk-cube sk-cube2"></div>'+
        '<div class="sk-cube sk-cube3"></div>'+
        '<div class="sk-cube sk-cube4"></div>'+
        '<div class="sk-cube sk-cube5"></div>'+
        '<div class="sk-cube sk-cube6"></div>'+
        '<div class="sk-cube sk-cube7"></div>'+
        '<div class="sk-cube sk-cube8"></div>'+
        '<div class="sk-cube sk-cube9"></div>'+
      '</div>';
    this.loading = window.pleaseWait({
      logo: null,
      backgroundColor: '#c8e4e6',
      loadingHtml: message + spinner
    });
};

Template.loading.destroyed = function () {
  if ( this.loading ) {
    this.loading.finish();
  }
};

UI.registerHelper('shareOnFacebookLink', function() {
  return 'https://www.facebook.com/sharer/sharer.php?&u=' + window.location.href;
});

UI.registerHelper('shareOnTwitterLink', function() {
  return 'https://twitter.com/intent/tweet?url=' + window.location.href + '&text=' + document.title;
});

UI.registerHelper('shareOnGooglePlusLink', function() {
  return 'https://plus.google.com/share?url=' + window.location.href;
});