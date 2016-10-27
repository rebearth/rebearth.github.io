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

// Global variable to store file
var file = null;

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
  this.title = document.getElementById('title');
  this.hashtag = document.getElementById('hashtag');
  this.description = document.getElementById('description');
  this.coordinates = document.getElementById('coordinates');
  this.submitButton = document.getElementById('submit');
  this.messageForm = document.getElementById('message-form');
  this.mediaCapture = document.getElementById('mediaCapture');

  // Add EventListeners
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.mediaCapture.addEventListener('change', this.mediaSelected.bind(this));

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

// Saves a new message on the Firebase DB.
bEarth.prototype.saveMessage = function(e) {
  console.log(file);
  e.preventDefault();
  var currentUser = this.auth.currentUser;
  // Load Image
  // if (!file.type.match('image.*')) {
    //var data = {
    //  message: 'You can only share images',
    //  timeout: 2000
    //};
    //this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    // return;
  // }
  // Add a new GeoJSON entry to the Firebase Database
  this.messagesRef.push({
    type: "Issue",
    geometry: {
      type: "Point",
      coordinates: [
        lat,
        lng        
      ]
    },
    properties: {
      name: currentUser.displayName,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png',
      title: this.title.value,
      hashtag: this.hashtag.value,
      description: this.description.value,
      imageUrl: bEarth.LOADING_IMAGE_URL
    }
  }).then(function(data) {
    // Upload the image to Firebase Storage.
    this.storage.ref(currentUser.uid + '/' + Date.now() + '/' + file.name)
      .put(file, {contentType: file.type})
      .then(function(snapshot) {
        // Get the file's Storage URI and update LOADING_IMAGE_URL
        var filePath = snapshot.metadata.fullPath;
        // Update the imageURL inside properties
        var dataRef = data.child("properties");
        dataRef.update({imageUrl: this.storage.ref(filePath).toString()});
        // Redirect to a different URL upon completion
        window.location.href = "./summary.html";
    }.bind(this)).catch(function(error) {
      console.error('There was an error uploading a file to Firebase Storage:', error);
    });
  }.bind(this)).catch(function(error) {
    console.error('Error writing new message to Firebase Database', error);
  });
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

    this.submitButton.disabled = false;
  } else { 
    // User is signed out!
    window.location.href = "./login.html"; 
    // Hide user's profile and sign-out button.
    this.userPicLi.style.display = "none"
    this.userNameLi.style.display = "none"
    this.signOutLi.style.display = "none"
    this.signInLi.style.display = "inline"

    this.submitButton.disabled = true;
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
bEarth.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }
  return false;
};

// Update the image file name
bEarth.prototype.mediaSelected = function(event) {
  // Retrieve file info
  file = event.target.files[0];
  // Get full image path
  var fullPath = mediaCapture.value;
  if (fullPath) {
    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
    var filename = fullPath.substring(startIndex);
    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
    }
    document.getElementById('image-url').value = filename;
  }
};

// A loading image URL.
bEarth.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

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

window.onload = function() {
  window.bearth = new bEarth();
};
