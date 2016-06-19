/*
 *This program is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *This program is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// The MIT License (MIT)

// Copyright (c) 2015 Stephen Howell, stephenhowell@outlook.com

//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.
 
(function(ext) {

  ext.latestUserTweet = function(name, callback) {
    $.ajax({
      method: "GET",
      url: "http://scratchx-twitter.herokuapp.com/1.1/statuses/user_timeline.json",
      data: {
        screen_name: name,
        count: 1
      },
      dataType: "json",
      success: function(data) {
        if (data.length > 0) {
          callback(data[0].text);
          return;
        }
        callback("No tweets found");
      },
      error: function(xhr, textStatus, error) {
        console.log(error);
        callback();
      }
    });
  };

  ext.getTopTweet = function(sort, str, callback) {
    //If searching popluar, remove # and @ symbols from query
    if (sort == "popular") {
      str = str.replace('#','').replace('@','');
    }
    $.ajax({
      method: "GET",
      url: "http://scratchx-twitter.herokuapp.com/1.1/search/tweets.json",
      data: {
        q: encodeURIComponent(str),
        result_type: sort,
        count: 1
      },
      dataType: "json",
      success: function(data) {
        if (data.statuses.length > 0) {
          callback(data.statuses[0].text);
          return;
        }
        callback("No tweets found");
      },
      error: function(xhr, textStatus, error) {
        console.log(error);
        callback();
      }
    });
  };


    ext.speak_text = function (text, callback) {
        var u = new SpeechSynthesisUtterance(text.toString());
        u.onend = function(event) {
            if (typeof callback=="function") callback();
        };
        
        speechSynthesis.speak(u);
    };

 var recognized_speech = '';

    ext.recognize_speech = function (callback) {
        var recognition = new webkitSpeechRecognition();
        recognition.onresult = function(event) {
            if (event.results.length > 0) {
                recognized_speech = event.results[0][0].transcript;
                if (typeof callback=="function") callback();
            }
        };
        recognition.start();
    };

    ext.recognized_speech = function () {return recognized_speech;};

/*** for Kinect V1 ***/
    var jointData = { "HipCenter": null, "Spine": null, "ShoulderCenter": null, "Head": null, "ShoulderLeft": null, "ElbowLeft": null, "WristLeft": null, "HandLeft": null, "ShoulderRight": null, "ElbowRight": null, "WristRight": null, "HandRight": null, "HipLeft": null, "KneeLeft": null, "AnkleLeft": null, "FootLeft": null, "HipRight": null, "KneeRight": null, "AnkleRight": null, "FootRight": null };

    var connection = new WebSocket('ws://localhost:8181/');

    connection.onopen = function () {
        //console.log('Connection open!');
    }

    connection.onclose = function () {
        //console.log('Connection closed');
    }

    connection.onerror = function (error) {
        console.log('Error detected: ' + error.toString());
    }

    connection.onmessage = function (e) {
        console.log(e.data);
        var obj = JSON.parse(e.data);        
        jointData[obj.joint] = obj;
    }

/*** for all blocks **/
    //Å@ext._shutdown = function() {}; // for blocks other than Kinect 
    // Cleanup function when the extension is unloaded
    ext._shutdown = function () { if (connection.socket.connected) { connection.socket.disconnect(); } };

/*** for all blocks **/
   ext._getStatus = function() {
        // for speech synthesis
        if (window.SpeechSynthesisUtterance === undefined) {
            return {status: 1, msg: 'Your browser does not support text to speech. Try using Google Chrome or Safari.'};
        }
        // for speech recoginition
        if (window.webkitSpeechRecognition === undefined) {
            return {status: 1, msg: 'Your browser does not support speech recognition. Try using Google Chrome.'};
        }
        // Status reporting code for Kinect
        // Use this to report missing hardware, plugin or unsupported browser
        if (connection.readyState == 1) {
            return { status: 2, msg: 'Connected' };
        } 
        else {               
            return { status: 1, msg: 'Not connected, attempting reconnection...' };                
        }    
        return {status: 2, msg: 'Ready'};  // in case connection is not working correctly.
    };

    
    ext.Disconnect = function (callback) {
        if (!(connection === null)) {
            if (connection.readyState == 1) {
                //console.log("disconnecting from server");
                connection.close();
            } else { console.log("Disconnect: socket already disconnected"); }
        }
    };

    ext.getValue = function (coordinate, bodyPart) {
        var j = jointData[bodyPart];
        //console.log("Requested: " + coordinate + " of " + bodyPart + " = " + j[coordinate]);
        return JSON.stringify(j[coordinate]);
    };
    
  var descriptor = {
    blocks: [
      ['R', 'latest tweet from @%s', 'latestUserTweet', 'scratch'],
      ['R', 'most %m.sort tweet containing %s', 'getTopTweet', 'recent', '#scratch'],
      ['w', 'speak %s', 'speak_text', 'Hello!'], 
      ['w', 'wait and recognize speech', 'recognize_speech'],
      ['r', 'recognized speech', 'recognized_speech'],
      // for Kinect V1
       ['r', 'get %m.coordinate position of %m.bodyPart', 'getValue', 'x', 'HandRight'],

    ],
   menus: {
     	 sort: ["popular", "recent"]
         coordinate: ["x", "y", "z"],
         bodyPart: [ "HipCenter", "Spine", "ShoulderCenter", "Head", "ShoulderLeft", "ElbowLeft", "WristLeft", "HandLeft", "ShoulderRight", "ElbowRight", 
								"WristRight", "HandRight", "HipLeft", "KneeLeft", "AnkleLeft", "FootLeft", "HipRight", "KneeRight", "AnkleRight", "FootRight" ]
    },
    url: 'http://howell.azurewebsites.net/kinect2scratch'
    // url: 'https://dev.twitter.com/overview/documentation'
  };

  ScratchExtensions.register('blocks for ws@tsuda', descriptor, ext);

})({});



