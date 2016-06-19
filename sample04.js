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


    ext._shutdown = function() {};


   ext._getStatus = function() {
        if (window.SpeechSynthesisUtterance === undefined) {
            return {status: 1, msg: 'Your browser does not support text to speech. Try using Google Chrome or Safari.'};
        }
        if (window.webkitSpeechRecognition === undefined) {
            return {status: 1, msg: 'Your browser does not support speech recognition. Try using Google Chrome.'};
        }
        return {status: 2, msg: 'Ready'};
    };


  var descriptor = {
    blocks: [
      ['R', 'latest tweet from @%s', 'latestUserTweet', 'scratch'],
      ['R', 'most %m.sort tweet containing %s', 'getTopTweet', 'recent', '#scratch'],
      ['w', 'speak %s', 'speak_text', 'Hello!'], 
      ['w', 'wait and recognize speech', 'recognize_speech'],
      ['r', 'recognized speech', 'recognized_speech']

    ],
    menus: {
      sort: ["popular", "recent"]
    },
    url: 'https://dev.twitter.com/overview/documentation'
  };

  ScratchExtensions.register('Twitter,Text2Speech,Speech2Text', descriptor, ext);

})({});



