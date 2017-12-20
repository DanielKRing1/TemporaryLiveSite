(function(){
  var app = angular.module('site-announcements', []);

  app.directive('announcementTab', function() {
    return {
      restrict: 'E',
      templateUrl: '/html/tabs/announcement-tab.html',
      controller: function($scope, $firebaseArray, firebaseService) {

        // FB Data
        this.announcementList = firebaseService.getFBArray('Announcements');
        // Admin input anncmnt
        this.newAnnouncement;

        this.addAnnouncement = function(){
          console.log(this.newAnnouncement);

          if(this.newAnnouncement !== ''){
            var a = {};
            a.time = Date.now();
            a.description = this.newAnnouncement;

            firebaseService.addToFB(this.announcementList, a);

            this.newAnnouncement = '';
          }
        };

        this.deleteAnnouncement = function(key){
          var item = this.announcementList[this.announcementList.length - 1 -key];
          firebaseService.deleteFromFB(this.announcementList, item);
        };
      },
      controllerAs: 'anncmntCtrl'
    };
  });
})();
