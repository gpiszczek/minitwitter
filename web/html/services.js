angular.module('myApp').factory('AuthService',
  ['$q', '$timeout', '$http',
  function ($q, $timeout, $http) {

    var user = null;

    function isLoggedIn() {
      if (user) {
        return true;
      } else {
        return false;
      }
    }

    function getUserStatus() {
      return $http.get('/api/user/status')
      .success(function (data) {
        if (data.status) {
          user = true;
        } else {
          user = false;
        }
      })
      .error(function (data) {
        user = false;
      });
    }

    function login(username, password) {
      var deferred = $q.defer();

      $http.post('/api/user/login',
        {username: username, password: password})
        .success(function (data, status) {
          if (status === 200 && data.status){
            user = true;
            deferred.resolve();
          } else {
            user = false;
            deferred.reject();
          }
        })
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      return deferred.promise;
    }

    function logout() {
      var deferred = $q.defer();

      $http.get('/api/user/logout')
        .success(function (data) {
          user = false;
          deferred.resolve();
        })
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      return deferred.promise;
    }

    function register(username, password) {
      var deferred = $q.defer();

      $http.post('/api/user/register',
        {username: username, password: password})
        .success(function (data, status) {
          if (status === 200 && data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        })
        .error(function (data) {
          deferred.reject();
        });

      return deferred.promise;
    }

    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      register: register
    });

}]);

angular.module('myApp').service('PostsService', function ($http) {
  this.fetch = function () {
    return $http.get('/api/posts');
  };
  this.create = function (post) {
    return $http.post('/api/posts', post);
  };
});
