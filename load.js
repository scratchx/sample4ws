(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.loadex = function(url) {
    ScratchExtensions.loadExternalJS(url)
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', 'load extension from url: %s', 'loadex', ''],
        ]
    };

    // Register the extension
    ScratchExtensions.register('Extension Loader', descriptor, ext);
})({});