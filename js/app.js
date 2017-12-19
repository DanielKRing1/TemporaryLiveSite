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

// FILTER-----------------------------------------------
  var app = angular.module('site', ['firebase', 'site-announcements']);

  app.service('firebaseService', function($firebaseArray){

    // Gets Firebase ref from url
    this.getFBRef = function(path) {
      return firebase.database().ref(path);
    };

    // Calls getFBRef(), returns $firebaseArray from ref
    this.getFBArray = function(path) {
      var ref = getFBRef(path);
      return $firebaseArray(ref);
    }

    //
    this.addToFB = function(array, data) {
      //ref
      array.$add(data).then(function(ref) {
        var id = ref.key;
        console.log("added record with id " + id);
        array.$indexFor(id); // returns location in the array
      });
    };

    this.deleteFromFB = function(array, item) {
      array.$remove(item).then(function(ref) {
        if(ref.key === item.$id){ // true
          var id = ref.key;
          console.log("deleted record with id " + id);
        }
      });
    };
  });

  app.filter('pendingStatus', function() {
    return function(val) {
      if(val === true) {
        return 'pending';
      }
      return 'complete';
    };
  });

  app.filter('customReverse', function() {
    /*var newList = {};
    for(var i = 0; i < items.length; i++){
      if(i === 2){
        console.log("check this");
      }
      newList[i] = items[items.length-i-1];
    }
    return newList;*/

    return function(items) {
      return items.slice().reverse();
    };
  });

  app.controller('LiveSiteController', function($scope, $firebaseObject){

  this.firebaseMessaging = function() {
  /*
    // FIREBASE MESSAGING
    const messaging = firebase.messaging();

    // PERMISSIONS
    messaging.requestPermission()
    .then(function() {
      console.log('Notification permission granted.');
      // TODO(developer): Retrieve an Instance ID token for use with FCM.
      // ...
    })
    .catch(function(err) {
      console.log('Unable to get permission to notify.', err);
    });

    // GET TOKEN
    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messaging.getToken()
    .then(function(currentToken) {
      if (currentToken) {
        sendTokenToServer(currentToken);
        updateUIForPushEnabled(currentToken);
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
        // Show permission UI.
        updateUIForPushPermissionRequired();
        setTokenSentToServer(false);
      }
    })
    .catch(function(err) {
      console.log('An error occurred while retrieving token. ', err);
      showToken('Error retrieving Instance ID token. ', err);
      setTokenSentToServer(false);
    });

    // Refresh TOKEN
    // Callback fired if Instance ID token is updated.
  messaging.onTokenRefresh(function() {
    messaging.getToken()
    .then(function(refreshedToken) {
      console.log('Token refreshed.');
      // Indicate that the new Instance ID token has not yet been sent to the
      // app server.
      setTokenSentToServer(false);
      // Send Instance ID token to app server.
      sendTokenToServer(refreshedToken);
      // ...
    })
    .catch(function(err) {
      console.log('Unable to retrieve refreshed token ', err);
      showToken('Unable to retrieve refreshed token ', err);
    });
  });*/
  };

  //ADMIN------------------------------------------------
  this.loggedIn = false;
  this.loginKey = 'admin';
  this.enteredKey = '';

  var clickInfo = {};
  console.log("show: "+(false === clickInfo.clicked));

  this.validateLogin = function(){
    return (loginKey === enteredKey);
  };

  this.openLogin = function(){

  };

/*
  // PUSH NOTIFICATION-------------------------------------
    $scope.activeNotification = true;
    console.log($scope.activeNotification);

    this.setActiveNotification = function(val) {
      $scope.activeNotification = val;
      console.log($scope.activeNotification);
    };

  });
*/

  app.directive('generalUserView', function(){
    return {
      restrict: 'E',
      templateUrl: 'html/login-states/general-user.html',
      controller: function() {

      },
      controllerAs: 'general'
    };
  });
  app.directive('adminView', function(){
    return {
      restrict: 'E',
      templateUrl: 'html/login-states/admin.html',
      controller: function() {

      },
      controllerAs: 'admin'
    };
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

  app.directive('scrollToTop', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attr) {
        var isTop;
        //bind changes from scope to our view: set isTop variable
        //depending on what scope variable is. If scope value
        //changes to true and we aren't at top, go to top
        scope.$watch(attr.scrollToTop, function(newValue) {
          newValue = !!newValue; //to boolean
          if (!isTop && newValue) {
            elm[0].scrollTo(0,0);
          }
          isTop = newValue;
        });

        //If we are at top and we scroll down, set isTop and
        //our variable on scope to false.
        elm.bind('scroll', function() {
          if (elm[0].scrollTop !==0 && isTop) {
            //Use $apply to tell angular
            //'hey, we are gonna change something from outside angular'
            scope.$apply(function() {
              //(we should use $parse service here, but simple for example)
              scope[attr.scrollTop] = false;
              isTop = false;
            });
          }
        });

      }
    };
  });

  app.directive('mentorsTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'html/tabs/mentors-tab.html',
      controller: function($scope, $firebaseObject, $firebaseArray, $http) {

        /* Database Display */
        mentorListRef = getFBRef('Mentors/MentorsList');
        this.mentorList = $firebaseObject(mentorListRef);
        pendingMentorRequestsRef = getFBRef('Mentors/MentorRequestInfo');
        this.pendingMentorRequests = $firebaseArray(pendingMentorRequestsRef);

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
          this.requestInfo.time = Date.now();
          this.requestInfo.pending = true;

          console.log('request function');
          mentorRequestInfoRef.push(this.requestInfo);

          this.postMentorRequestToSlack();
          this.clearRequest();
          console.log('successfully submitted request');
        };

        this.clearRequest = function() {
          this.isRequesting = false;
          this.requestInfo = {};
        };

        this.getPendingStatus = function(key) {
          firebase.database().ref('Mentors/MentorRequestInfo/'+key);
        };

        this.postMentorRequestToSlack = function() {
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
      console.log("into");
      const rootRef = firebase.database().ref();
      const ref = rootRef.child(child);
      return ref;
    }

    function getTime() {
      date = new Date();
      var time = '';

      var min = '';
      if(date.getMinutes() < 10){
        min = '0'+date.getMinutes();
      }else {
        min = date.getMinutes();
      }

      if(date.getHours() === 12){
        time += '12:'+min+'pm';
      }else if(date.getHours() > 12){
        time += (date.getHours()%13+1)+':'+min+'pm';
      }else {
        time += date.getHours()+':'+min+'am';
      }
      console.log(date.getMinutes());


      return time;
    };

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
