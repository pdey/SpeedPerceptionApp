// Setting up routes

// Router configuration
Router.configure({
  // global layout
  layoutTemplate: 'appLayout'
});

// Home route
Router.route('/', {
	action: function() {
		this.render('home');
	}       
});

// Admin route
Router.route('/admin', {
	action: function() {
		this.render('admin');
	}
});


// People page
Router.route('/people', {
	action: function(){
		this.render('people');
	}
});

// About page
Router.route('/about', {
	action: function() {
		this.render('about');
	}
});