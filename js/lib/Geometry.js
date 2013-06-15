

/**
 * Geometry Library
 * @author AndrewH Madisonw
 */

define([
    "lib/underscore"
],function(_){
    var tolerance = 0;

    function Point(x,y){
        this.x = x;
        this.y = y;
    }

    Point.prototype = {

    }

    Point.SeatToPoint  = function(seat) {
        return new Point(seat.x,seat.y);
    }

    function Line(point1,point2){
        this.p1 = point1;
        this.p2 = point2;
    }

    Line.prototype = {
        slope :function(){
            return (this.p1.y - this.p2.y) / (this.p1.x - this.p2.x);
        },

        yIntercept : function(){
            return this.p1.y - ( this.slope() * this.p1.x );
        },

        onLine : function(point) {
            return this.yIntercept() === ( point.y - (this.slope() * point.x ) );
        },

        maxY : function() {
            return (this.p1.y >= this.p2.y) ? this.p1.y : this.p2.y ;
        },

        maxX : function() {
            return (this.p1.x >= this.p2.x) ? this.p1.x : this.p2.x ;
        },

        minY : function() {
            return (this.p1.y <= this.p2.y) ? this.p1.y : this.p2.y ;
        },

        minX : function() {
            return (this.p1.x <= this.p2.x) ? this.p1.x : this.p2.x ;
        },

        /** if no intersection return null otherwise return point. */
        intersection : function(line){
            // m1 x + b1 == m2 x + b2
            // x = ( b2 - b1 ) / ( m1 - m2 )
            if ( this.slope() === line.slope() ) {
                return null;
            }
            var intX = ( line.yIntercept() - this.yIntercept() ) / ( this.slope() - line.slope() );
            var intY = ( this.slope() * intX ) + this.yIntercept();

            return new Point(intX, intY);
        },

        inSegment : function(point) {
            if ( this.onLine(point)) {
                return ( (point.y <= this.maxY() && point.y >= this.minY()) && (point.x <= this.maxX() && point.x >= this.minX() ) )
            } else {
                return false;
            }
        },

        length : function() {
            var x = this.p2.x - this.p1.x;
            var y = this.p2.y - this.p1.y;

            Math.sqrt( Math.square(x) + Math.square(y));
        },

        midpoint : function() {
            return new Point(this.p1.x - this.p2.x, this.p1.y - this.p2.y);
        },

        /** return an array of points evenly distributed across the line where the first and last point of the line are
         * included in the distribution
         * @param cnt
         * @returns [Point]
         */
        distribute : function(cnt) {
            if ( cnt === 0 ) {
                return [];
            } else if ( cnt === 1 ) {
                return [this.midpoint()];
            } else {
                var b = this.yIntercept();
                var m = this.slope();
                var step = ( this.p2.x - this.p1.x ) / ( cnt - 1 );
                return _.times(cnt, function(i){
                    var x = this.p1.x + (i * step);
                    var y = ( m * x ) + b;
                    new Point(x,y);
                });
            }
        },

        toArc : function(height) {
            return new Arc(this.p1, this.p2, height);
        }
    }

    function Arc(point1, point2, height){
        this.p1 = point1;
        this.p2 = point2;
        this.height = height;
    }

    Arc.prototype = {

        chord : function() {
            return Math.sqrt(Math.square(this.p2.x - this.p1.x) + Math.square(this.p2.y - this.p1.y));
        },

        radius : function() {
            // r = ( H / 2 ) + ( C^2 / 8H )
            return ( this.height / 2 ) + ( Math.square( this.chord() ) / ( 8 * this.height ) );
        },

        centerToChord : function() {
            return this.radius() - this.height;
        },

        centralAngle : function() {
            return 2 * Math.acos( this.centerToChord() / this.radius() );
        },

        length : function() {
            return this.centralAngle() * this.radius();
        },

        toLine : function() {
            return new Line(this.p1, this.p2);
        }

    }

    /**  A polygon is a connected graph with one cycle and every vertex has a degree of exactly two */
    function Polygon(lines){
        this.lines = lines;
    }

    Polygon.prototype = {
        isPointInside : function(point) {
            var count = 0;
            var yLine = new Line(point, new Point(point.x + 100, point.y)); // horizontal line

            for( var i = 0; i < this.lines.length; i++ ){
                var line = this.lines[i];
                var int = line.intersection(yLine);
                if ( int != null && line.inSegment(int) ) {
                    if ( int.x < point.x ){
                        count++;
                    }
                }
            }
            return ( count % 2 !== 0 );
        },

        isPointOutside : function(point){
            return !(this.isPointInside(point));
        },

        vertices :function(){
            return _.foldl(this.lines,function(agg,line){
                if ( ! agg.contains(line.p1) ){
                    agg.push(line.p1);
                }

                if ( ! agg.contains(line.p2) ){
                    agg.push(line.p2);
                }
                return agg;
            },new Array());
        },

        centroid :function(){
            var v = this.vertices();
            var x = _.foldl(v, function(agg,point){ return agg + point.x; }) / v.length;
            var y = _.foldl(v, function(agg,point){ return agg + point.y; }) / v.length;
            new Point(x,y);
        },

        /** rotate polygon counter clockwise. angles are measured in radians */
        rotate :function(radians){
            var centroid = this.centroid();

            var rotatePoint = function(point) {
                var y = point.y - centroid.y;
                var x = point.x - centroid.x;
                var length = Math.sqrt(Math.square(y) + Math.square(x));

                var targetAngle = Math.atan(y / x) + radians;
                var newY = Math.sin(targetAngle) * length; // give change in y
                var newX = Math.cos(targetAngle) * length; // give change in x

                point.y = centroid.y + newY;
                point.x = centroid.x + newX;
                return point;
            }

            var rotateLine = function(line) {
                line.p1 = rotatePoint(line.p1);
                line.p2 = rotatePoint(line.p2);
                return line;
            }

            this.lines = _.map(this.lines, rotateLine );
            return this;
        },

        /** scale in percent.. if scaling up the scaling factor should be > 1. To scale up 25% the scaling factor
         * should be 1.25
         * @returns this
         */
        scale :function(factor) {
            var centroid = this.centroid();

            var scalePoint = function( point ){
                var x = point.x - centroid.x;
                var y = point.y - centroid.y;

                var angle = Math.atan( y / x );

                var length = Math.sqrt(Math.square(x) + Math.square(y)) * factor;

                point.x = length * Math.cos(angle) + centroid.x;
                point.y = length * Math.sin(angle) + centroid.y;

                return point;
            }

            var scaleLine = function(line){
                line.p1 = scalePoint(line.p1);
                line.p2 = scalePoint(line.p2);
                return line;
            }

            this.lines = _.map(this.lines, scaleLine );
            return this;

        }
    }

    var Geometry = function(args) {
        tolerance = args.tolerance || 0;
    }

    Geometry.prototype = {
         Line : Line
        ,Point : Point
        ,Polygon : Polygon
        ,Arc : Arc
    }

    return Geometry;
})