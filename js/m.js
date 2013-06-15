
var DEFAULT_MATRIX_TYPE = Int32Array;

function checkType(type, def){
  if ( type === undefined && def === undefined ) {
    type = DEFAULT_MATRIX_TYPE;
  } else if ( type === undefined ) {
    type = def;
  }
  
  return type;
}

function Algebros(){}

function Matrix(obj){
    this.cols = obj.cols;
    this.rows = obj.rows;

    if ( obj.data !== undefined ) {
        this.data = obj.data;
        this.type = obj.data.constructor;
    } else {
        if ( obj.type === undefined ) {
            this.type = DEFAULT_MATRIX_TYPE;
        } else {
            this.type = obj.type;
        }
        this.data = new this.type(this.cols * this.rows);
    }
  
}

/** create new identity matrix */
Matrix.identity = function(rows,cols,type) {
    type = checkType(type);
    
    var m = new type(rows * cols);
    var i = 0;
    for ( var r = 0; r < rows; r++ ){
        for ( var c = 0; c < cols; c++ ){
          console.log("i: " + i);
          m[i++] = 0;  
        }
        console.log(cols * r + r);
        m[cols * r + r] = 1;
        console.log(m);
    }
    return new Matrix({rows : rows, cols : cols, data : m});
};

/** create a new zero matrix */
Matrix.zero = function(rows,cols,type) {
  type = checkType(type);
  var data = new type(rows * cols);
  for ( var i = 0; i < data.length; i++){
    data[i] = 0;
  }
  return new Matrix({rows : rows, cols : cols, data : data });
};

/** return matrix of set size with uninitialized values. */
Matrix.empty = function( rows, cols, type) {
  type = checkType(type);
  var data = new type(rows * cols);
  return new Matrix({rows : rows, cols : cols, data : data });
};

/** 2d rotational matrix */
Matrix.rot2d = function(radians, type) {
  type = checkType(type, Float32Array);
  var data = new type(4);
  data[0] = Math.cos(radians);
  data[1] = 0 - Math.sin(radians);
  data[2] = Math.sin(radians);
  data[3] = Math.cos(radians);
  return new Matrix({rows: 2, cols: 2, data :data});
};

/** 3d rotational matrix around x axis */
Matrix.rot3dX = function(radians, type){
  type = checkType(type, Float32Array);
  var data = new type(9);
  data[0] = 1;
  data[1] = 0;
  data[2] = 0;
  data[3] = 0;
  data[4] = Math.cos(radians);
  data[5] = 0 - Math.sin(radians);
  data[6] = 0;
  data[7] = Math.sin(radians);
  data[8] = Math.cos(radians);
  return new Matrix({rows: 3, cols: 3, data :data});
};

/** 3d rotational matrix around y axis */
Matrix.rot3dY = function(radians, type){
  type = checkType(type, Float32Array);
  var data = new type(9);
  data[0] = Math.cos(radians);
  data[1] = 0;
  data[2] = Math.sin(radians);
  data[3] = 0;
  data[4] = 1;
  data[5] = 0;
  data[6] = 0 - Math.sin(radians);
  data[7] = 0;
  data[8] = Math.cos(radians);
  return new Matrix({rows: 3, cols: 3, data :data});
};

/** 3d rotational matrix around z axis */
Matrix.rot3dZ = function(radians, type){
  type = checkType(type, Float32Array);
  var data = new type(9);
  data[0] = Math.cos(radians);
  data[1] = 0 - Math.sin(radians);
  data[2] = 0;
  data[3] = Math.sin(radians);
  data[4] = Math.cos(radians);
  data[5] = 0;
  data[6] = 0;
  data[7] = 0;
  data[8] = 1;
  return new Matrix({rows: 3, cols: 3, data :data});
};

/** transpose a matrix.. rows become columns.. columns become rows */
Matrix.transpose = function(m1, out) {
  if ( out === undefined ) {
    out = Matrix.empty(m1.cols, m1.rows, m1.type);
  }
  
  for ( var r = 0; r < m1.rows; r++ ) {
    for ( var c = 0; c < m1.cols; c++ ) {
      out.set(c,r, m1.get(r,c));
    }
  }
  return out;
}

/** multiply two matricies or multiply a matrix and a scalar. The second param
 *  should be the scalar value 
 */
Matrix.mult = function(f, s, out){
  if ( typeof(s) === "number" ) {
    // scalar multiplication
    if ( out === undefined ) {
      out = Matrix.zero(f.rows,f.cols,f.type);
    }
    for ( var i = 0; i < f.data.length; i++ ) {
      out.data[i] = f.data[i] * s;
    }
    return out;
  } else {
    // matrix multiplication
    // ( m x n ) * ( n x p ) = ( m x p ) 
    // ( row x col ) .. col of first must match rows of second
    // outsize will be f.rows x s.cols
    if ( f.cols !== s.rows ) {
      throw "Cols of first " + f.cols + " doesn't match row cound " + s.rows + " of second.";
    } 
    
    if ( out === undefined ) {
      out = Matrix.zero(f.rows, s.cols, f.type);
    }

    for ( var fr = 0; fr < f.rows; fr++ ) {
      for ( var fc = 0; fc < s.cols; fc++ ) {
        for ( var com = 0;  com < f.cols; com++) {
          out.set(fr, fc, out.get(fr,fc) + (f.get(fr,com) * s.get(com,fc) ));
        }
      }
    }
    
    return out;
  }
};

Matrix.add = function(m1, m2, out) {
  if ( m1.data.length !== m2.data.length ) {
    throw "M1 size " + m1.data.length + " does not equal M2 " + m2.data.length;
  }
  
  if ( out === undefined ) {
    out = Matrix.empty(m1.rows, m1.cols);
  }
  
  for ( var i = 0; i < m1.data.length; i++ ) {
    out[i] = m1.data[i] + m1.data[i];  
  }
  
  return out;
};

Matrix.minus = function(m1, m2, out) {
  if ( m1.data.length !== m2.data.length ) {
    throw "M1 size " + m1.data.length + " does not equal M2 " + m2.data.length;
  }
  
  if ( out === undefined ) {
    out = Matrix.empty(m1.rows, m1.cols, m1.type);
  }
  
  for ( var i = 0; i < m1.data.length; i++ ) {
    out[i] = m1.data[i] - m1.data[i];  
  }
  
  return out;
};

/** calculate the determinant of matrix m1. */
Matrix.det = function(m1) {
  if ( ! m1.isSquare() ) {
    throw "Cannot calculate determinant of non-square matrix";
  }
  
  if ( m1.rows === 2 ) {
    return ( m1.data[0] * m1.data[3] ) - ( m1.data[1] * m1.data[2] );  
  } else {
    var agg = 0;
    var temp = Matrix.empty(m1.rows - 1, m1.cols - 1, m1.type);
    for ( var c = 0; c < m1.cols; c++ ) {
      if ( c % 2 === 0 ) {
        agg = agg + ( m1.get(0,c) * Matrix.det( Matrix.sub(m1,0,c,temp) ) );  
      } else {
        agg = agg - ( m1.get(0,c) * Matrix.det( Matrix.sub(m1,0,c,temp) ) );  
      }
    }
    return agg;
  }
};

/** return the submatrix of m1 by removing row and column. This will return a matrix
 * of size ( m1.rows - 1 X m1.cols -1 )
 */
Matrix.sub = function(m1, row, col, out) {
  if ( out === undefined ) {
    out = Matrix.empty(m1.rows - 1, m1.cols - 1, m1.type);
  }
  
  var i = 0;
  var o = 0;
  for ( var r = 0; r < m1.rows; r++ ) {
    for ( var c = 0; c < m1.cols; c++ ) {
      if ( ! ( r === row || c === col ) ) {
        out.data[o++] = m1.data[i];
      }
      i++;
    }
  }
  return out;
};

Matrix.invert = function(m1, out) {
  if ( ! m1.isSquare() ) {
    throw "You cannot invert a nonsquare matrix";
  }
  
  if ( out === undefined ) {
    out = Matrix.empty(m1.rows, m1.cols, m1.type);
  }
  
  var d = 1 / Matrix.det(m1);
  
  if ( m1.rows === 2 ) {
    
  } else {
    var d = 1 / Matrix.det(m1);
  }

};

Matrix.echelon = function( m, out ) {
    var lead = 0;
    for ( var r = 0; r = m.rows; r++ ) {
        if ( m.cols <= lead ) {
            return "FUCK"
        } else {
            var i = r;
            while ( m.get(r,lead) === 0 ) {
                if ( m.rows === i ) {
                    i = r;
                    lead = lead + 1;
                    if ( m.cols === lead ) {
                        return "fuuuck"
                    }
                }
            }
        }
    }
};

Matrix.prototype = {
    
    mult : function(other, out) {
      return Matrix.mult(this, other, out);
    },
    
    add : function(other, out) {
      return Matrix.add(this,other,out);
    },
    
    minus : function(other, out){
      return Matrix.minus(this,other,out);
    },
    
    transpose : function(out) {
      return Matrix.transpose(this,out);
    },
    
    isSquare : function() {
      return this.cols === this.rows;
    },
    
    sub : function(row,col,out){
      return Matrix.sub(this,row,col,out);
    },
    
    toString : function(){
        var str = "";
        var i = 0;
        for ( var r = 0; r < this.rows; r++ ) {
            str = str + "|";
            for ( var c = 0; c < this.cols; c ++ ) {
              str = str + " " + this.data[i++] + " ";
            }
            str = str + "|\n";
        }
        return str;
    },
    
    /** return the value at a given row and col idx. if just a single value
      * is given the value of idx of the underlying array is given          */
    get : function(rowIdx,colIdx) {
      if ( colIdx === undefined) {
        return this.data[rowIdx];
      } else {
        return this.data[(this.cols * rowIdx ) + colIdx];
      }
    },
    
    set : function(rowIdx, colIdx, value) {
      if ( value === undefined ) {
        console.log("undif");
        this.data[rowIdx] = colIdx;
      } else {
        console.log((this.cols * rowIdx) + colIdx + " - " + value);
        this.data[(this.cols * rowIdx) + colIdx] = value;
      }
      return this;
    }
};

var Utils = {};

Utils.pad = function(str, len) {
    
};

