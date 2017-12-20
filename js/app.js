(function(){

  // Initialize Firebase
  // Copy and Pasted from Firebase Console, allows use of firebase
  var config = {
  		apiKey: "AIzaSyAif6z5dFWTN2KdRgT60e6fkczE9qC2-Gw",
  		authDomain: "angulardemo-17478.firebaseapp.com",
  		databaseURL: "https://angulardemo-17478.firebaseio.com",
  		storageBucket: "angulardemo-17478.appspot.com",
  		messagingSenderId: "449211195314"
  	};
  firebase.initializeApp(config);

  // Creates AngularJS application, including firebase dependencies
  var app = angular.module('site', ['firebase']);

  // SERVICES--
  // Handles getting, adding, and removing with $firebaseArray
  app.service('firebaseService', function($firebaseArray){

    // Gets Firebase ref from path
    // Takes in path to specific branch of database
    this.getFBRef = function(path) {
      return firebase.database().ref(path);
    };

    // Calls getFBRef(), returns $firebaseArray from ref
    // Takes in path to specific branch of database
    this.getFBArray = function(path) {
      var rootRef = firebase.database().ref();
      var ref = rootRef.child(path);
      return $firebaseArray(ref);
    }

    // Adds data to $firebaseArray
    // Takes in $firebaseArray and an array element
    this.addToFB = function(array, data) {
      array.$add(data).then(function(ref) {
        var id = ref.key;
        console.log("added record with id " + id);
        array.$indexFor(id); // returns location in the array
      });
    };

    // Deletes an item from $firebaseArray
    // Takes in $firebaseArray and an array element
    this.deleteFromFB = function(array, item) {
      array.$remove(item).then(function(ref) {
        if(ref.key === item.$id){ // true
          var id = ref.key;
          console.log("deleted record with id " + id);
        }
      });
    };
  });

  //ScheduleService gets the schedule from the Firebase database so the one on the website is
  //the most updated version
  app.service('ScheduleService', function() {
    var schedule = null;
    var schedule_callbacks = [];

    //returns schedule as a JSON string
    var getSchedule = function () {
       return schedule;
     }

     //sets schedule and calls the callbacks array to update the scope variable in the controller
    firebase.database().ref('/schedule').on("value", function(snapshot) {
      schedule = JSON.parse(snapshot.val());
      //console.log(schedule);
      for (var i = 0; i < schedule_callbacks.length; i++)
      {
          schedule_callbacks[i]();
      }
    });

    //sets service methods to register so when service is injected into controller, ScheduleService
    //comes with these methods
    var service = {getSchedule: getSchedule,
                   updateSchedule: function(_callback){schedule_callbacks.push(_callback)}};
    return service;
  });

  // CUSTOM FILTERS (Used in HTML)--
  // Converts firebase mentorRequestInfo.pending from boolean value
  // to String 'pending' for true and 'complete' for false
  app.filter('pendingStatus', function() {
    return function(val) {
      if(val === true) {
        return 'pending';
      }
      return 'complete';
    };
  });

  // Reverses an array (to be displayed backwards)
  app.filter('customReverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  });

  // Basic Admin Login Funcitonality
  // Will include tighter security features with Firebase Auth in future versions
  app.controller('LoginController', function($scope, $firebaseObject){
    this.loggedIn = false;
    this.showLogin = false;
    this.loginKey = 'admin';
    this.enteredKey = '';

    // Called in HTML, Shows login elements
    this.openLogin = function(){
      this.showLogin = true;
    };

    // Called in HTML, Hides login elements
    this.cancelLogin = function() {
      this.showLogin = false;
    };

    // Called in HTML
    // Checks entered login against loginKey
    // If true, logs in user, allows display of admin tabs
    this.validateLogin = function() {
      if(this.loginKey === this.enteredKey) {
        this.loggedIn = true;
        console.log("logged in");
      }
      this.enteredKey = '';
    };
    // Called in HTML
    // Logs out user, once again hides admin tabs and hides login elemnts
    this.logOut = function() {
      this.loggedIn = false;
      this.cancelLogin();
    };
  });

  // Custom directive allows for tab selection
  app.directive('tabNav', function(){
    return {
      restrict: 'E',
      templateUrl: 'html/tab-nav.html',
      controller: function() {
        this.tab = 1;

        // Called in HTML
        // Changes the selected tab in order to display different tabs when navbar clicked
        this.selectTab = function(setTab) {
          this.tab = setTab;
        };

        // Called in HTML
        // Checks if a tab is selected and returns true if it should be shown
        this.isSelected = function(checkTab) {
          return (this.tab === checkTab);
        };
      },
      controllerAs: 'panel'
    };
  });

  // Custom directive for announcement tab
  app.directive('announcementTab', function() {
    return {
      restrict: 'E',
      templateUrl: '/html/tabs/announcement-tab.html',
      controller: function($scope, $firebaseArray, firebaseService) {

        // FB Data
        this.announcementList = firebaseService.getFBArray('Announcements');
        // Admin input anncmnt
        this.newAnnouncement;

        // Called in HTML AnnouncementsTab Admin
        // Uses firebaseService to add new Announcement to Firebase database
        // Compiles all data into a throw away variable 'a', pushes 'a' to firebase
        this.addAnnouncement = function(){
          if(this.newAnnouncement !== ''){
            var a = {};
            a.time = Date.now();
            a.description = this.newAnnouncement;

            firebaseService.addToFB(this.announcementList, a);

            this.newAnnouncement = '';
          }
        };

        // Called in HTML AnnouncementsTab Admin
        // Uses firebaseService to delete Announcement from firebase database
        // Gets Announcement to delete by accessing an index provided by ng-repeat in the html
        this.deleteAnnouncement = function(key){
          // customReverse filter reverses array, so key is flipped
          var item = this.announcementList[this.announcementList.length - 1 -key];
          firebaseService.deleteFromFB(this.announcementList, item);
        };
      },
      controllerAs: 'anncmntCtrl'
    };
  });

  // Custom directive for schedule tab
  app.directive('scheduleTab', function() {
    return {
      restrict: 'E',
      templateUrl: '/html/tabs/schedule-tab.html',
      controller: function($scope, $rootScope, $firebaseArray, ScheduleService) {

      //Service callback called when the database is updated to re-set $rootScope.schedule
      ScheduleService.updateSchedule(function() {
        $scope.$apply(function() {
          $rootScope.schedule = ScheduleService.getSchedule();
        });
      });

      //called from HTML when button is clicked. parses uploaded JSON file into firebase database
      $scope.uploadFile = function() {
        console.log("upload");
        var f = document.getElementById('file').files[0],
            r = new FileReader();

        r.onload = (function (f) {
        return function (e) {
            json = JSON.parse(e.target.result);
            firebase.database().ref('schedule/').set(JSON.stringify(json));
        }
        })(f);
        r.readAsText(f);
      };
      },
      controllerAs: 'scheduleTab'
    };
  });

  // Custom directive for map tab
  app.directive('mapsTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'html/tabs/maps-tab.html',
      controller: function() {
        this.selectedMap = 'campus';

        // Called in HTML in MapsTab
        // Changes the selected map
        this.selectMap = function(map) {
          this.selectedMap = map;
        };
      },
      controllerAs: 'mapTab'
    };
  });

  // Custom directive for mentors tab
  app.directive('mentorsTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'html/tabs/mentors-tab.html',
      controller: function($scope, $firebaseObject, $firebaseArray, $http, firebaseService) {

        // MENTORS SECTION
        // $firebaseArray's used to handle Mentors data
        this.mentorList = firebaseService.getFBArray('Mentors/MentorsList');
        this.newMentor = '';

        // Called in HTML in MentorsTab Admin
        // Uses firebaseService to add new Mentor to Firebase database
        // Compiles all data into a throw away variable 'a', pushes 'a' to firebase
        this.addMentor = function(){
          if(this.newMentor !== ''){
            var a = {};

            a.name = this.newMentor;
            a.available = true;
            firebaseService.addToFB(this.mentorList, a);
            this.newMentor = '';
          }
        };

        // Called in HTML in MentorsTab Admin
        // Uses firebaseService to delete Mentor from firebase database
        // Gets Mentor to delete by accessing an index provided by ng-repeat in the html
        this.deleteMentor = function(mentorKey) {
          var item = this.mentorList[mentorKey];
          firebaseService.deleteFromFB(this.mentorList, item)
        };

        // Called in HTML in MentorsTab Admin
        // Changes the .available attribute of a mentorList element and saves value to firebase
        this.setAvailability = function(i, availability) {
            this.mentorList[i].available = availability;
            this.mentorList.$save(i).then(function(ref) {
              //ref.key === this.mentorList[i].$id; // true
            });
        };

        // REQUEST SECTION
        // Firebase array data for mentor requests
        this.mentorRequestList = firebaseService.getFBArray('Mentors/MentorRequestInfo');
        // values for 'tech' portion of mentor request
        $scope.tech = ['web', 'iOS', 'Android', 'VR', 'Hardware', 'Other'];
        this.isRequesting = false;
        this.requestInfo = {};

        // Called in HTML in MentorsTab by General User
        // Unhides Mentor Request elements
        this.startRequest = function(key) {
          this.isRequesting = true;
        };

        // Called in HTML in MentorsTab by General User
        // Uses firebaseService to push new mentor request to firebase
        // Records the current time and pending status in this.requestInfo
        // Calls this.postMentorRequestToSlack();
        // Clears this.requestInfo after firease push and Slack post
        this.submitRequest = function(key) {
          this.requestInfo.time = Date.now();
          this.requestInfo.pending = true;

          firebaseService.addToFB(this.mentorRequestList, this.requestInfo);

          this.postMentorRequestToSlack();
          this.clearRequest();
        };

        // Called in HTML in MentorsTab Admin
        // Uses firebaseService to delete request from firebase database
        // Gets Request to delete by accessing an index provided by ng-repeat in the html
        this.deleteRequest = function(key){
          var item = this.mentorRequestList[this.mentorRequestList.length - 1 -key];
          firebaseService.deleteFromFB(this.mentorRequestList, item);
        };

        // Called in HTML in MentorsTab and in app.js
        // Hides Mentor Request form and clears this.requestInfo
        this.clearRequest = function() {
          this.isRequesting = false;
          this.requestInfo = {};
        };

        // Makes use of $http service to makes API call to Slack webhook
        // Posts this.requestInfo data to Slack
        this.postMentorRequestToSlack = function() {
          $http({
    			  method: 'POST',
    			  url: 'https://hooks.slack.com/services/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',
            headers: {
    	   			'Content-Type': 'application/x-www-form-urlencoded'
    	 			},
    	 			data: {
              "attachments": [{
                "fallback": "The attachement isn't loading.",
                "callback_id": "mentor_request_app",
                "title": "****Mentor Request @"+this.requestInfo.time+'****',
                "color": "#9C1A22",
                "mrkdwn_in": ["text","fields"],
                "fields": [
                  {
                    "title": "Name",
                    "value": this.requestInfo.name,
                    "short": true
                  },
                  {
                    "title": "Table",
                    "value": this.requestInfo.table,
                    "short": true
                  },
                  {
                    "title": "Type of Tech",
                    "value": this.requestInfo.technology,
                    "short": true
                  },
                  {
                    "title": "Problem",
                    "value": this.requestInfo.description,
                    "short": false
                  }
                ]
              }]
            }
    			}).then(function successCallback(response) {
    			    // this callback will be called asynchronously
    			    // when the response is available
    					console.log("sent to slack");
    			  }, function errorCallback(response) {
    			    // called asynchronously if an error occurs
    			    // or server returns response with an error status.
    					console.log("failed to send to slack");
    			  });
        };
      },
      controllerAs: 'mentorsTab'
    };
  });

  // Custom directive for Hardware Tab, does not have a controller
  app.directive('hardwareTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'html/tabs/hardware-tab.html'
    };
  });

  // Custom directive for Submit Tab, does not have a controller
  app.directive('submitTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'html/tabs/submit-tab.html'
    };
  });

  // Custome directive for Songs Tab
  app.directive('songsTab', function() {
      return {
        restrict: 'E',
        templateUrl: 'html/tabs/songs-tab.html',
        controller: function($http) {

          this.songRequest = '';

          // Called after posting request to Slack
          // Used to clears user's song request from input element
          this.clearSongRequest = function() {
            this.songRequest = '';
          };
        // Called in HTML in SongsTab
          // Use Slack webhook to send song request info and time to Slack SongRequest channel
          // Clears this.songRequest after posting
          this.postSongRequestToSlack = function() {
            if(this.songRequest !== ''){
              $http({
                method: 'POST',
                url: 'https://hooks.slack.com/services/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',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                  "attachments": [{
                    "fallback": "The attachement isn't loading.",
                    "callback_id": "mentor_request_app",
                    "title": "****Song Request @"+Date.now()+'****',
                    "color": "#9C1A22",
                    "mrkdwn_in": ["text","fields"],
                    "fields": [
                      {
                        "title": "Song Name",
                        "value": this.songRequest,
                        "short": true
                      }
                    ],
                  }]
                }
              }).then(function successCallback(response) {
                  // this callback will be called asynchronously
                  // when the response is available
                  console.log("sent to slack");
                }, function errorCallback(response) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
                  console.log("failed to send to slack");
                });
              };
            this.clearSongRequest();
          };

        },
        controllerAs: 'songsTab'
      };
    });
})();
