(function(){

  console.log('aaa');
    // Initialize Firebase
  var config = {
      apiKey: "AIzaSyAW2r9iB3R-nXELIHswj16v32LyGyUh3PI",
      authDomain: "beach-hacks-live.firebaseapp.com",
      databaseURL: "https://beach-hacks-live.firebaseio.com",
      projectId: "beach-hacks-live",
      storageBucket: "beach-hacks-live.appspot.com",
      messagingSenderId: "1057807344162"
    };
  firebase.initializeApp(config);

  var app = angular.module('beach', ['firebase']);
  app.controller('LiveSiteController', function($firebaseObject){

  });

  app.directive('tabNav', function(){
    return {
      restrict: 'E',
      templateUrl: 'html/tab-nav.html',
      controller: function() {
        this.tab = 1;

        this.selectTab = function(setTab) {
          this.tab = setTab;
        };

        this.isSelected = function(checkTab) {
          return (this.tab === checkTab);
        };
      },
      controllerAs: 'panel'
    };
  });

  app.directive('scheduleTab', function () {
    return {
      restrict: 'E',
      templateUrl: '/html/tabs/schedule-tab.html'
    };
  });

  app.directive('announcementTab', function() {
    return {
      restrict: 'E',
      templateUrl: '/html/tabs/announcement-tab.html',
      controller: function($scope, $firebaseObject) {

        // FB Database
        ref = getFBRef('Announcements');
        this.announcementList = $firebaseObject(ref);

        // New announcement
        this.newAnnouncement;

        this.addAnnouncement = function(){
          console.log(this.newAnnouncement);

          if(this.newAnnouncement !== ''){
            var a = {};
            a.time = Date.now();
            a.description = this.newAnnouncement;

            ref.push(a);

            this.newAnnouncement = '';
          }
        };

        this.deleteAnnouncement = function(key){
          console.log(key);
          firebase.database().ref('Announcements/'+key).remove();
        };
      },
      controllerAs: 'anncmntCtrl'
    };
  });

  app.directive('mapsTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'html/tabs/maps-tab.html',
      controller: function() {
        this.selectedMap = 'campus';

        this.selectMap = function(map) {
          this.selectedMap = map;
        };
      },
      controllerAs: 'mapTab'
    };
  });

  app.directive('mentorsTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'html/tabs/mentors-tab.html',
      controller: function($scope, $firebaseObject, $http) {

        /* Database Display */
        mentorListRef = getFBRef('Mentors/MentorsList');
        this.mentorList = $firebaseObject(mentorListRef);

        this.newMentor = '';

        this.addMentor = function(){
          if(this.newMentor !== ''){
            var a = {};

            a.name = this.newMentor;
            a.available = true;
            mentorListRef.push(a);
            this.newMentor = '';
          }
        };

        this.deleteMentor = function(mentorKey) {
          firebase.database().ref('Mentors/MentorsList/'+mentorKey).remove();
        };

        /* Request */
        mentorRequestInfoRef = getFBRef('Mentors/MentorRequestInfo')
        $scope.tech = ['web', 'iOS', 'Android', 'VR', 'Hardware', 'Other'];
        this.isRequesting = false;
        this.requestInfo = {};

        this.startRequest = function(key) {
          this.isRequesting = true;
        };

        this.submitRequest = function(key) {
          console.log('request function');
          mentorRequestInfoRef.push(this.requestInfo);

          this.postMentorRequestToSlack();
          this.clearRequest();
          console.log('successfully submitted request');
        };

        this.postMentorRequestToSlack = function() {
          var time = getTime();

          /*
          $http({
            method: 'POST',
            url: '',
            data: {}
          });*/

/* Webhook, no app attached
https://hooks.slack.com/services/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
*/
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
                "title": "****Mentor Request @"+time+'****',
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
                ],
                "actions": [
                {
                    "name": "recommend",
                    "text": "Recommend",
                    "type": "button",
                    "value": "recommend"
                },
                {
                    "name": "no",
                    "text": "No",
                    "type": "button",
                    "value": "bad"
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

          function getTime() {
            date = new Date();
            var time = '';

            if(date.getHours() === 12){
              time += '12:'+date.getMinutes()+'pm';
            }else if(date.getHours() > 12){
              time += (date.getHours()%13+1)+':'+date.getMinutes()+'pm';
            }else {
              time += date.getHours()+'+'+date.getMinutes()+'am';
            }

            return time;
          };


        /*            "channel": "#mentor-request",
                    "attachments": [{
                      "fallback": "The attachement isn't loading.",
                      "title": "Mentor Request",
                      "color": "#9C1A22",
                      "pretext": this.requestInfo.name+" Table "+this.requestInfo.table+" Tech: "+this.requestInfo.technology,
                      "author_name": "Slackbot",
                      "mrkdwn_in": ["text","fields"],
                      "text": this.requestInfo.description
                    }]
*/

        this.setAvailability = function(key, availability) {
          firebase.database().ref('Mentors/MentorsList/'+key+'/available').set(availability);
        };

        this.clearRequest = function() {
          this.isRequesting = false;
          this.requestInfo = {};
        };
      },
      controllerAs: 'mentorsTab'
    };
  });

  app.directive('hardwareTab', function() {
      return {
        restrict: 'E',
        templateUrl: 'html/tabs/hardware-tab.html'
      };
    });

  app.directive('submitTab', function() {
      return {
        restrict: 'E',
        templateUrl: 'html/tabs/submit-tab.html'
      };
    });

  app.directive('songsTab', function() {
      return {
        restrict: 'E',
        templateUrl: 'html/tabs/songs-tab.html'
      };
    });

    function getFBRef(child){
      const rootRef = firebase.database().ref();
      const ref = rootRef.child(child);
      return ref;
    }

})();

/*         this.checkAvailability = function(key) {
          var availability;

          var val = firebase.database().ref('Mentors/MentorsList/'+key+'/available');
          val.on('value', function(snapshot) {
            availability = snapshot.val();
            console.log(1);
          });
          val.on('child_changed', function(snapshot) {
            availability = availability | snap.val();
            console.log(2);
          });
          return availability;
        };
        */
