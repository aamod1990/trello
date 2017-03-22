var app=angular.module('userService',[]);
app.factory('userFactory', ['$http', '$q',
	function($http, $q) {
		return {
			registerUser: function(userInfo) {
				var deffered = $q.defer();
				$http.post('/signup', {
					name: userInfo.name,
					email: userInfo.email,
					password: userInfo.password
				}).
				success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					console.log(err);
					deffered.reject(err);
				})
				return deffered.promise;

			},
			loginUser: function(userInfo) {
				var deffered = $q.defer();
				$http.post('/login', {
					email: userInfo.email,
					password: userInfo.password
				}).
				success(function(data) {
					console.log(data)
					deffered.resolve(data);
				}).error(function(err) {
					console.log(err);
					deffered.reject(err);
				})
				return deffered.promise;

			},
			logoutUser: function(userInfo) {
				var deffered = $q.defer();
				$http.get('/logout').
				success(function(data) {
					console.log(data)
					deffered.resolve(data);
				}).error(function(err) {
					console.log(err);
					deffered.reject(err);
				})
				return deffered.promise;

			},
			getUserProfile: function(userInfo) {
				var deffered = $q.defer();
				$http.get('/user/profile').
				success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				})
				return deffered.promise;

			},
			 getUserEmails: function(query) {
            var deffered = $q.defer();
            $http({
                method: 'POST',
                url: '/user/email',
                data:{'query':query}
            }).success(function(data) {
                data.forEach(function(contact,index){
                   contact.text=data[index].email;     
                });
                deffered.resolve(data);
            }).error(function(err) {
                deffered.resolve(err);
            });
            return deffered.promise;
            }
		};
	}
]);