
require.config({
    paths : {
         jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min'
        ,qtip : 'lib/jquery.qtip.min'
        ,d3 : 'lib/d3.min'
        ,mustache : 'lib/mustache'
    }
    ,shim: {
        d3: {
            exports: 'd3'
        }
    }
    ,baseUrl : "../js"
    ,urlArgs: "v=" + (new Date()).getTime()
})



var test_files = [
    /*
        Add the test files here if you want them to run in the suite.
     */
    "lib/Geometry.test"
]

test_files = test_files.map(function(file){return "../test/js/"+file;})

require(test_files,function(){

    QUnit.start();
})