/* Extension using the JavaScript Speech API for text to speech */
/* Sayamindu Dasgupta <sayamindu@media.mit.edu>, April 2014 */

new (function() {
    var ext = this;

    ext.speak_text = function (text, callback) {
        var u = new SpeechSynthesisUtterance(text.toString());
        u.onend = function(event) {
            if (typeof callback=="function") callback();
        };
        
        speechSynthesis.speak(u);
    };

    ext._shutdown = function() {};

    ext._getStatus = function() {
        if (window.SpeechSynthesisUtterance === undefined) {
            return {status: 1, msg: 'Your browser does not support text to speech. Try using Google Chrome or Safari.'};
        }
        return {status: 2, msg: 'Ready'};
    };

    var descriptor = {
        blocks: [
            //['', 'set voice to %m.voices', 'set_voice', ''],
            ['w', 'speak %s', 'speak_text', 'Hello!'],
            ['w',  'ì«Ç›è„Ç∞ÇÈ %s', 'speak_text', 'Hello!'],]
        ],
        /*menus: {
            voices: _get_voices(),
        },*/
    };

    ScratchExtensions.register('Text to Speech', descriptor, ext);
})();
