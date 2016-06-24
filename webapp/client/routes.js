// Setting up routes

// Router configuration
Router.configure({
  // global layout
  layoutTemplate: 'appLayout'
});

// Home route
Router.route('/', {
	action: function() {
		this.render('about');
	}       
});

// SpeedPerception experiment page.
Router.route('/challenge', {
	action: function() {
		this.render('home');
	}
});

// Download page
Router.route('/download', {
	action: function() {
		this.render('download');
	}
});

// People page
Router.route('/people', {
	data: function() {
		return {
			teamMembers:
			[
				{
					name: 'Clark Gao',
					website: 'https://www.linkedin.com/in/clark-g-84a32530',
					photo: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAARcAAAAJDI0ZWZiMjZlLTFlYjAtNDQzYS1iYTZjLTYxN2U5NjNiZTk0Yw.jpg',
					designation: 'Data Science Engineer',
					company_name: 'Instart Logic',
					company_website: 'https://www.instartlogic.com/'
				},

				{
					name: 'Parvez Ahammad, PhD',
					website: 'https://www.linkedin.com/in/parvezahammad',
					photo: 'https://media.licdn.com/media/p/3/000/206/3ec/070cd62.jpg',
					designation: 'Head of Data Science & Machine Learning',
					company_name: 'Instart Logic',
					company_website: 'https://www.instartlogic.com/'
				},

				{
					name: 'Prasenjit Dey',
					website: 'https://www.linkedin.com/in/prasenjitdey',
					photo: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/3/005/0b6/3f9/31c2ca6.jpg',
					designation: 'Software Engineer',
					company_name: 'instart Logic',
					company_website: 'https://www.instartlogic.com/'
				}
			],
			coMembers:
			[
				{
					name: 'Patrick Meenan',
					website: 'https://www.linkedin.com/in/patrickmeenan',
					photo: 'https://media.licdn.com/media/AAEAAQAAAAAAAAOtAAAAJDhlN2FhZTczLTE3NWYtNDQyYi05NGNmLTBiNjBmODM1NDM5Mw.jpg',
					designation: 'Founder',
					company_name: 'WebPagetest LLC',
					company_website: 'http://www.webpagetest.org/'
				}
			]
		};
	},
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

// Admin route
Router.route('/admin', {
	action: function() {
		this.render('admin');
	}
});
