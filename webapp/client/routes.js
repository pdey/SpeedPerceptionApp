// Setting up routes

// Router configuration
Router.configure({
  // global layout
  layoutTemplate: 'appLayout'
});

// Home route
Router.route('/', {
	action: function() {
		if (Meteor.settings.public.expt_expired) {
			this.render('experiment_expired');
			return;
		}
		this.render('about');
	}       
});

// SpeedPerception experiment page.
Router.route('/challenge', {
	loadingTemplate: 'loading',

	waitOn: function() {
		return [
		Meteor.subscribe('videoPairs'),
		Meteor.subscribe('videos'),
		Meteor.subscribe('videoUploads')
		];
	},

	action: function() {
		if (Meteor.settings.public.expt_expired) {
			this.render('experiment_expired');
			return;
		}

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
				company_name: 'Instart Logic',
				company_website: 'https://www.instartlogic.com/'
			}
			],
			coMembers:
			[
			{
				name: 'Estelle Weyl',
				website: 'https://www.linkedin.com/in/estellevw',
				photo: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/005/0b1/383/3eed648.jpg',
				designation: 'Open Web Evangelist',
				company_name: 'Instart Logic',
				company_website: 'https://www.instartlogic.com/'
			},

			{
				name: 'Patrick Meenan',
				website: 'https://www.linkedin.com/in/patrickmeenan',
				photo: 'https://media.licdn.com/media/AAEAAQAAAAAAAAOtAAAAJDhlN2FhZTczLTE3NWYtNDQyYi05NGNmLTBiNjBmODM1NDM5Mw.jpg',
				designation: 'Staff Engineer at Google',
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
	loadingTemplate: 'loading',

	waitOn: function() {
		return [
		Meteor.subscribe('datasets'),
		Meteor.subscribe('videos'),
		Meteor.subscribe('videoPairs'),
		Meteor.subscribe('videoUploads'),
		Meteor.subscribe('testResults')
		];
	},

	action: function() {
		this.render('admin');
	}
});

// Stats page
Router.route('/stats', {
	loadingTemplate: 'loading',

	waitOn: function() {
		return [
			Meteor.subscribe('datasets'),
			Meteor.subscribe('videos'),
			Meteor.subscribe('videoPairs'),
			Meteor.subscribe('videoUploads'),
			Meteor.subscribe('expertComments')
		];
	},

	action: function() {
		this.render('stats')
	}
});
