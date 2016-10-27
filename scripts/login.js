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
    window.location.href = "./index.html"; 
  } else { 
    // User is signed out!
    // Hide user's profile and sign-out button.
    this.userPicLi.style.display = "none";
    this.userNameLi.style.display = "none";
    this.signOutLi.style.display = "none";
    this.signInLi.style.display = "inline";
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
