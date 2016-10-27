/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes bEarth.
function bEarth() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.userPicLi = document.getElementById('user-pic-li');
  this.userNameLi = document.getElementById('user-name-li');
  this.signOutButton = document.getElementById('sign-out');
  this.signInLi = document.getElementById('sign-in-li');
  this.signOutLi = document.getElementById('sign-out-li');

  // Add EventListeners
  this.signOutButton.addEventListener('click', this.signOut.bind(this));

  // Initialize Firebase
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
bEarth.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.messagesRef = this.database.ref('messages');
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Signs-out of Friendly Chat.
bEarth.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
bEarth.prototype.onAuthStateChanged = function(user) {
  if (user) { 
    // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL; // Only change these two lines!
    var userName = user.displayName;   // Only change these two lines!

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userPicLi.style.display = "inline-block"
    this.userNameLi.style.display = "inline-block"
    this.signOutLi.style.display = "inline"
    this.signInLi.style.display = "none"

    // We load currently existing chant messages.
    this.loadMessages();    

  } else { 
    // User is signed out!

    // User is signed out!
    window.location.href = "./login.html";

    // Hide user's profile and sign-out button.
    this.userPicLi.style.display = "none"
    this.userNameLi.style.display = "none"
    this.signOutLi.style.display = "none"
    this.signInLi.style.display = "inline"
    
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
bEarth.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // // Display a message to the user using a Toast.
  // var data = {
  //   message: 'You must sign-in first',
  //   timeout: 2000
  // };
  // this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Checks that the Firebase SDK has been correctly setup and configured.
bEarth.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  }
};

function changeCommentsUrl(newUrl){
  // should refresh fb comments plugin for the "newUrl" variable
  document.getElementById('fbcomments').innerHTML='';
  var parser=document.getElementById('fbcomments');
  parser.innerHTML='<div style="background-color: #ffffff"" id="fbcomments" class="fb-comments" data-href="'+newUrl+'" data-num-posts="5" data-width="390"></div>';
  FB.XFBML.parse(parser);
}

// Loads chat messages history and listens for upcoming ones.
bEarth.prototype.loadMessages = function() {
  // Realitime load snapshot, loop through, print specific values
  this.messagesRef.once('value', function(snapshot) {
    // Remove clustered markers to map
    markers.clearLayers();
    snapshot.forEach(function(childSnapshot) {
      // Parse Data
      var key = childSnapshot.key;
      var title = childSnapshot.child("properties/title").val();
      var description = childSnapshot.child("properties/description").val();
      var user = childSnapshot.child("properties/name").val();
      var photoUrl = childSnapshot.child("properties/photoUrl").val();
      var imageUrl = childSnapshot.child("properties/imageUrl").val();
      var coordinates = childSnapshot.child("geometry/coordinates").val();
      var vote = childSnapshot.child("properties/vote").val();
      // Print Console
      console.log(title+": "+coordinates[0]+","+coordinates[1]);
      // Retrieve imageURL and update markers
      firebase.storage().refFromURL(imageUrl).getDownloadURL().then(function(url) {
        var content = '<h2 style="color:#807f7f;">' + title + '</h2><img src="' + url + '" alt="" width="100%">';
        var marker = L.marker([coordinates[0], coordinates[1]]);
        // Following creates a popup for marker
        // marker.bindPopup(content, {minWidth: 200});
        // Following calls function() on every marker click
        marker.on('click', function(){
          var datahref = "http://localhost:5000/summary.html?id="+key;
          changeCommentsUrl(datahref);
          document.getElementById("marker_pic").src = url;
          document.getElementById("marker_title").innerHTML = title;
          document.getElementById("description").innerHTML = description;
          document.getElementById("marker_uploader").innerHTML = "Uploaded by:  "+user;
          document.getElementById("vote").innerHTML = vote;
          document.getElementById('marker_key').value = key;
        });
        markers.addLayer(marker);
      }).catch(function(error) {
        console.log("Fetching: "+title);
        console.log("ImageFetchError: "+error);
      })
    });
    // Add clustered markers to map
    mapLeaflet.addLayer(markers)
  });
};

window.onload = function() {
  window.bearth = new bEarth();
};

// Specify access token
L.mapbox.accessToken = 'pk.eyJ1IjoibWRtb2Jhc2hpciIsImEiOiJjaXU2YzV0cG4waWUxMnZscGhjNmVyOHpnIn0.zdg6n-slN37PMGXGbdzc2A';

// Specify map bounds
var bounds = new L.LatLngBounds(new L.LatLng(85, 179.9), new L.LatLng(-85, -179.9));

// Leaflet
var mapLeaflet = L.mapbox.map('map','mapbox.streets',{minZoom: 2, maxBounds: bounds, maxBoundsViscosity: 1.0, zoomControl: false})
  .fitWorld()
  .setView([37.8, -96], 2)
  .addLayer(L.mapbox.styleLayer('mapbox://styles/mdmobashir/ciuc9i2ka006w2imw8uititvx'));

// Navigation control position
new L.Control.Zoom({ position: 'bottomright' }).addTo(mapLeaflet);

// Clustered Markers
var markers = L.markerClusterGroup();

// Onclick anywhere on map except markers
mapLeaflet.on('click', function(e) {
  closeNav();
}); 

// Update the vote count
function updateVote(key, value) {
  var tempStr = "messages/"+key+"/properties/vote";
  var tempRef = firebase.database().ref(tempStr);
  tempRef.once('value', function(snapshot) {
    var newVote = snapshot.val() + value;
    var newTempStr = "messages/"+key+"/properties";
    var newTempRef = firebase.database().ref(newTempStr);
    newTempRef.child('vote').set(newVote);
    document.getElementById("vote").innerHTML = newVote;
  });
}

// Open/Close Overlay
function openNav() {
  var upvoteIcon = document.getElementById('upvote');
  var downvoteIcon = document.getElementById('downvote');
  var key = document.getElementById('marker_key').value;
  var uid = firebase.auth().currentUser.uid;
  var tempStr = "messages/"+key+"/properties/voters/"+uid+"/value";
  var tempRef = firebase.database().ref(tempStr);
  tempRef.once('value', function(snapshot) {
    if(snapshot.val()==1) {
      upvoteIcon.style.backgroundImage="url('images/icons/upvotedone.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvote.png')";
    } else if(snapshot.val()==-1) {
      upvoteIcon.style.backgroundImage="url('images/icons/upvote.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvotedone.png')";
    } else {
      upvoteIcon.style.backgroundImage="url('images/icons/upvote.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvote.png')";
    }
  });
  document.getElementById("myNav").style.width = "410px";
}
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

// Upvote/Downvote votes
function upvote() {
  var upvoteIcon = document.getElementById('upvote');
  var downvoteIcon = document.getElementById('downvote');
  var key = document.getElementById('marker_key').value;
  var uid = firebase.auth().currentUser.uid;
  
  var tempStr = "messages/"+key+"/properties/voters/"+uid+"/value";
  var tempRef = firebase.database().ref(tempStr);
  tempRef.once('value', function(snapshot) {
    if(snapshot.val()==0) {
      console.log("Vote removed. Upvoting again.");
      // Remove vote
      var newTempStr = "messages/"+key+"/properties/voters/"+uid;
      var newTempRef = firebase.database().ref(newTempStr);
      newTempRef.child('value').set(1);
      updateVote(key,1);
      upvoteIcon.style.backgroundImage="url('images/icons/upvotedone.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvote.png')";
    } else if(snapshot.val()==1) {
      console.log("Voted already. Unset vote.");
      // Remove vote
      var newTempStr = "messages/"+key+"/properties/voters/"+uid;
      var newTempRef = firebase.database().ref(newTempStr);
      newTempRef.child('value').set(0);
      updateVote(key,-1);
      upvoteIcon.style.backgroundImage="url('images/icons/upvote.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvote.png')";
    } else if (snapshot.val()==-1) {
      console.log("Downvoted earlier. Upvoting");
      // Change vote
      var newTempStr = "messages/"+key+"/properties/voters/"+uid;
      var newTempRef = firebase.database().ref(newTempStr);
      newTempRef.child('value').set(1);
      updateVote(key,2);
      upvoteIcon.style.backgroundImage="url('images/icons/upvotedone.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvote.png')";
    } else {
      console.log("Didn't vote. Upvoting");
      // Create entry and vote
      var newTempStr = "messages/"+key+"/properties/voters/"+uid;
      var newTempRef = firebase.database().ref(newTempStr);
      newTempRef.child('value').set(1);
      updateVote(key,1);
      upvoteIcon.style.backgroundImage="url('images/icons/upvotedone.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvote.png')";
    }
  });
}
function downvote() {
  var upvoteIcon = document.getElementById('upvote');
  var downvoteIcon = document.getElementById('downvote');
  var key = document.getElementById('marker_key').value;
  var uid = firebase.auth().currentUser.uid;
  
  var tempStr = "messages/"+key+"/properties/voters/"+uid+"/value";
  var tempRef = firebase.database().ref(tempStr);
  tempRef.once('value', function(snapshot) {
    if(snapshot.val()==0) {
      console.log("Vote removed. Downvoting again.");
      // Remove vote
      var newTempStr = "messages/"+key+"/properties/voters/"+uid;
      var newTempRef = firebase.database().ref(newTempStr);
      newTempRef.child('value').set(-1);
      updateVote(key,-1);
      upvoteIcon.style.backgroundImage="url('images/icons/upvote.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvotedone.png')";
    } else if(snapshot.val()==-1) {
      console.log("Voted already. Unset vote.");
      // Remove vote
      var newTempStr = "messages/"+key+"/properties/voters/"+uid;
      var newTempRef = firebase.database().ref(newTempStr);
      newTempRef.child('value').set(0);
      updateVote(key,1);
      upvoteIcon.style.backgroundImage="url('images/icons/upvote.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvote.png')";
    } else if (snapshot.val()==1) {
      console.log("Upvoted earlier. Downvoting");
      // Change vote
      var newTempStr = "messages/"+key+"/properties/voters/"+uid;
      var newTempRef = firebase.database().ref(newTempStr);
      newTempRef.child('value').set(-1);
      updateVote(key,-2);
      upvoteIcon.style.backgroundImage="url('images/icons/upvote.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvotedone.png')";
    } else {
      console.log("Didn't vote. Downvoting");
      // Create entry and vote
      var newTempStr = "messages/"+key+"/properties/voters/"+uid;
      var newTempRef = firebase.database().ref(newTempStr);
      newTempRef.child('value').set(-1);
      upvoteIcon.style.backgroundImage="url('images/icons/upvote.png')";
      downvoteIcon.style.backgroundImage="url('images/icons/downvotedone.png')";
    }
  });
}