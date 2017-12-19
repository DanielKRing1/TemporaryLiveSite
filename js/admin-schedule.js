(function(){
  var app = angular.module('site-schedule', []);

  app.directive('scheduleTab', function() {
    return {
      restrict: 'E',
      templateUrl: '/html/tabs/schedule-tab.html',
      controller: function($scope, $rootScope, $firebaseArray, ScheduleService) {

      ScheduleService.updateSchedule(function() {
        console.log("hi callback called me");
        //console.log("ScheduleService.getSchedule()=" + ScheduleService.getSchedule());
        $scope.$apply(function() {
          $rootScope.schedule = ScheduleService.getSchedule();
        });
        //console.log($scope.schedule);
      });
      //ScheduleService.addScheduleCallback(updateSchedule);

      console.log("outside admin" + $scope.schedule);


      $scope.uploadFile = function() {
        console.log("upload");
        var f = document.getElementById('file').files[0],
            r = new FileReader();

          //console.log(JSON.stringify(json)); // this will show the info it in firebug console
        //console.log(r.readAsBinaryString(f));

        r.onload = (function (f) {
        return function (e) {
            json = JSON.parse(e.target.result);
            console.log(JSON.stringify(json));
            firebase.database().ref('schedule/').set(JSON.stringify(json));
        }
        })(f);
        r.readAsText(f);
      };
      },
      controllerAs: 'scheduleTab'
    };
  });
})();
