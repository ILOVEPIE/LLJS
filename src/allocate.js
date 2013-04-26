var base = 0;
var freep = 0;
var nUnitsMin = 1024;
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