angular.module('myApp').controller('loginController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {
    $scope.login = function () {
      $scope.error = false;
      $scope.disabled = true;

      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
        .then(function () {
          $location.path('/');
          $scope.disabled = false;
          $scope.loginForm = {};
        })
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Zła nazwa użytkownika i/lub hasło";
          $scope.disabled = false;
          $scope.loginForm = {};
        });
    };
}]);

angular.module('myApp').controller('logoutController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {
    $scope.logout = function () {
      AuthService.logout()
        .then(function () {
          $location.path('/login');
        });
    };
}]);

angular.module('myApp').controller('registerController',
  ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {
    $scope.register = function () {
      $scope.error = false;
      $scope.disabled = true;

      AuthService.register($scope.registerForm.username, $scope.registerForm.password)
        .then(function () {
          $location.path('/');
          $scope.disabled = false;
          $scope.registerForm = {};
        })
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Podany użytkownik już istnieje! Wybierz inną nazwę";
          $scope.disabled = false;
          $scope.registerForm = {};
        });
    };
}]);

angular.module('myApp').controller('PostsController',
  ['$scope', '$location', 'PostsService',
  function ($scope, $location, PostsService) {
    PostsService.fetch()
    .success(function (posts) {
      $scope.posts = posts;
    });
}]);

angular.module('myApp').controller('addPostController',
  ['$scope', '$location', 'PostsService',
  function ($scope, $location, PostsService) {
    $scope.addPost = function () {
      PostsService.create({
        body:     $scope.postForm.body
      })
      .success(function (post) {
        $scope.posts.unshift(post);
        $scope.postForm.body = null;
      })
    }
}]);
