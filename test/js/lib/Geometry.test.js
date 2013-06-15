

define(["lib/Geometry"], function( Geometry ) {
    var G = new Geometry(12);
    console.log(G)
    module("Geometry");

    test("Point", function(){
        expect(2);

        equal( 1, 1, "A trivial test");
        ok( true, "Another trivial test");
    });
});