
    function memcpy(dest, src, num) {
        dest = dest|0; src = src|0; num = num|0;
        var ret = 0;
        ret = dest|0;
        if ((dest&3) == (src&3)) {
            while (dest & 3) {
                if ((num|0) == 0) return ret|0;
                U1[(dest)]=U1[(src)];
                dest = (dest+1)|0;
                src = (src+1)|0;
                num = (num-1)|0;
            }
            while ((num|0) >= 4) {
                U4[((dest)>>2)]=U4[((src)>>2)];
                dest = (dest+4)|0;
                src = (src+4)|0;
                num = (num-4)|0;
            }
        }
        while ((num|0) > 0) {
            U1[(dest)]=U1[(src)];
            dest = (dest+1)|0;
            src = (src+1)|0;
            num = (num-1)|0;
        }
        return ret|0;
    }

    function memset(ptr, value, num) {
        ptr = ptr|0; value = value|0; num = num|0;
        var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
        stop = (ptr + num)|0;
        if ((num|0) >= 20) {
            // This is unaligned, but quite large, so work hard to get to aligned settings
            value = value & 0xff;
            unaligned = ptr & 3;
            value4 = value | (value << 8) | (value << 16) | (value << 24);
            stop4 = stop & ~3;
            if (unaligned) {
                unaligned = (ptr + 4 - unaligned)|0;
                while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
                    U1[(ptr)]=value;
                    ptr = (ptr+1)|0;
                }
            }
            while ((ptr|0) < (stop4|0)) {
                U4[((ptr)>>2)]=value4;
                ptr = (ptr+4)|0;
            }
        }
        while ((ptr|0) < (stop|0)) {
            U1[(ptr)]=value;
            ptr = (ptr+1)|0;
        }
    }

    
    
    function reset() {
      var $SP = 0;
      U4[((($SP) + 32 | 0) + 0 * 4) >> 2] = 4;
      U4[((($SP) + 32 | 0) + 1 * 4) >> 2] = totalSize >>> 0;
      base = 2 | 0;
      freep = 0;
    }
    function sbrk(nBytes) {
      nBytes = nBytes | 0;
      var nWords = 0, j = 0, address = 0, $SP = 0;
      nWords = (nBytes | 0 | 0) / 4 | 0 | 0;
      j = (U4[((($SP) + 32 | 0) + 0 * 4) >> 2] >>> 0 >>> 0) + (nWords | 0 | 0) | 0 | 0;
      if ((j | 0) > (heapSize | 0 | 0)) {
        //print(int("anull sbrk"));
        return 0;
      }
      address = U4[((($SP) + 32 | 0) + 0 * 4) >> 2] | 0;
      U4[((($SP) + 32 | 0) + 0 * 4) >> 2] = ((U4[((($SP) + 32 | 0) + 0 * 4) >> 2] >>> 0) + (nWords | 0) | 0) >>> 0;
      //print("address = " + address);
      return address | 0;
    }
    function morecore(nUnits) {
      nUnits = nUnits | 0;
      var buffer = 0, header = 0, $SP = 0;
      if (nUnits >>> 0 < nUnitsMin >>> 0) {
        nUnits = nUnitsMin;
      }
      buffer = sbrk(imul(nUnits >>> 0, 8)) | 0;
      if ((~~buffer | 0) == 0) {
        return 0;
      }
      header = buffer | 0 | 0;
      U4[((header) + 4 | 0) >> 2] = nUnits;
      free(header + 1 * 8 | 0 | 0);
      return freep | 0;
    }
    function malloc(nBytes) {
      nBytes = nBytes | 0;
      var _ = 0, p = 0, prevp = 0, nUnits = 0, i = 0, $SP = 0;
      nUnits = (((((nBytes | 0 | 0) + 8 | 0 | 0 | 0 | 0) - 1 | 0 | 0 | 0 | 0) / 8 | 0 | 0 | 0 | 0) + 1 | 0 | 0) >>> 0;
      if ((prevp = freep | 0) == 0) {
        U4[(base) >> 2] = (freep = (prevp = base | 0) | 0) | 0;
        U4[((base) + 4 | 0) >> 2] = 0;
      }
      i = 0;
      for (p = U4[(prevp) >> 2] | 0 | 0; (i | 0) < 10; prevp = p | 0, p = U4[(p) >> 2] | 0 | 0, (_ = i, i = (i | 0) + 1 | 0, _)) {
        //print("hue with psize = " + p->size + " and nUnits = " + nUnits );
        if (U4[((p) + 4 | 0) >> 2] >>> 0 >>> 0 >= nUnits >>> 0) {
          if (U4[((p) + 4 | 0) >> 2] >>> 0 >>> 0 == nUnits >>> 0) {
            U4[(prevp) >> 2] = U4[(p) >> 2] | 0;
          } else {
            U4[((p) + 4 | 0) >> 2] = ((U4[((p) + 4 | 0) >> 2] >>> 0) - (nUnits >>> 0) | 0) >>> 0;
            //console.log(" p pre-resize = " + p + " as uint " + uint(p) + " as double " + double(p) )
            //p + (U4[((p) + 4 | 0) >> 2] | 0) * 8
            p = (~~p | 0) + (imul(U4[((p) + 4 | 0) >> 2] >>> 0, 8) | 0) | 0 | 0;
            U4[((p) + 4 | 0) >> 2] = nUnits;
          }
          freep = prevp | 0;
          //print(" about to return p = " + p);
          //print("     returning " + (byte*)(p + 1));
          return p + 1 * 8 | 0 | 0;
        }
        if (~~p >>> 0 == ~~freep >>> 0) {
          //print("grabbing morecore");
          if ((p = morecore(nUnits) | 0) == 0) {
            return 0;
          }
        }
      }
      return 0;
    }
    function free(ap) {
      ap = ap | 0;
      var bp = 0, p = 0, comp1 = 0, comp2 = 0, i = 0, $SP = 0;
      bp = (ap | 0) - 1 * 8 | 0 | 0;
      i = 0;
      for (p = freep | 0; (i | 0) == 0; p = U4[(p) >> 2] | 0 | 0) {
        if (~~bp >>> 0 > ~~p >>> 0) {
          if (~~bp >>> 0 < ~~(U4[(p) >> 2] | 0) >>> 0) {
            break;
          }
        }
        //!(bp > p && bp < p->next)
        if (~~p >>> 0 >= ~~(U4[(p) >> 2] | 0) >>> 0) {
          if (~~bp >>> 0 > ~~p >>> 0) {
            break;
          } else if (~~bp >>> 0 < ~~(U4[(p) >> 2] | 0) >>> 0) {
            break;
          }
        }
      }
      comp1 = (~~bp | 0) + (imul(U4[((bp) + 4 | 0) >> 2] >>> 0, 8) | 0) | 0 | 0;
      comp2 = (~~p | 0) + (imul(U4[((p) + 4 | 0) >> 2] >>> 0, 8) | 0) | 0 | 0;
      if (~~comp1 >>> 0 == ~~(U4[(p) >> 2] | 0) >>> 0) {
        U4[((bp) + 4 | 0) >> 2] = ((U4[((bp) + 4 | 0) >> 2] >>> 0) + (U4[((U4[(p) >> 2] | 0) + 4 | 0) >> 2] >>> 0 >>> 0) | 0) >>> 0;
        U4[(bp) >> 2] = U4[(U4[(p) >> 2] | 0) >> 2] | 0;
      } else {
        U4[(bp) >> 2] = U4[(p) >> 2] | 0;
      }
      if (~~comp2 >>> 0 == ~~bp >>> 0) {
        U4[((p) + 4 | 0) >> 2] = ((U4[((p) + 4 | 0) >> 2] >>> 0) + (U4[((bp) + 4 | 0) >> 2] >>> 0 >>> 0) | 0) >>> 0;
        U4[(p) >> 2] = U4[(bp) >> 2] | 0;
      } else {
        U4[(p) >> 2] = bp | 0;
      }
      freep = p | 0;
    }

    return { {% exports %} };

})({ Uint8Array: Uint8Array,
     Int8Array: Int8Array,
     Uint16Array: Uint16Array,
     Int16Array: Int16Array,
     Uint32Array: Uint32Array,
     Int32Array: Int32Array,
     Float32Array: Float32Array,
     Float64Array: Float64Array,
     Math: Math },
   { /*{% externs %}*/
     HEAP_SIZE: HEAP_SIZE,
     STACK_SIZE: STACK_SIZE,
     TOTAL_SIZE: SIZE },
   buffer);

function assertEqual(val1, val2) {
  var err = true;
  var msg;
  if(val1 | 0 !== val1) {
    if(Math.abs(val1 - val2) < .00000001) {
      err = false;
    }
    else {
      msg = 'eps';
    }
  }
  else if(val1 === val2) {
    err = false;
  }

  if(err) {
    throw new Error(val1 + ' does not equal ' + val2);
  }
}

function _print(/* arg1, arg2, ..., argN */) {
    var func = ((typeof console !== 'undefined' && console.log) || print);
    func.apply(null, arguments);
}

var _time;
function start() {
  _time = Date.now();
}

function end() {
  return Date.now() - _time;
}

{% finalize %}
//})();
