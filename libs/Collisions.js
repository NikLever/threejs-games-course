

//Adapted from https://github.com/bytezeroseven/AA.js

function boxIntersectsBox( aminx, aminy, aminz, amaxx, amaxy, amaxz, bminx, bminy, bminz, bmaxx, bmaxy, bmaxz ) {

	var overlapX = Math.min( amaxx, bmaxx ) - Math.max( aminx, bminx );

	if ( overlapX < 0 ) return false;

	var overlapY = Math.min( amaxy, bmaxy ) - Math.max( aminy, bminy );

	if ( overlapY < 0 ) return false;

	var overlapZ = Math.min( amaxz, bmaxz ) - Math.max( aminz, bminz );

	if ( overlapZ < 0 ) return false;

	var minOverlap = Math.min( overlapX, overlapY, overlapZ );
	var x = y = z = 0;

	switch ( minOverlap ) {

		case overlapX:

			x = Math.sign( aminx + amaxx - bminx - bmaxx );
			break;

		case overlapY:

			y = Math.sign( aminy + amaxy - bminy - bmaxy );
			break;

		case overlapZ:

			z = Math.sign( aminz + amaxz - bminz - bmaxz );
			break;


	}

	return {

		minOverlap: minOverlap,
		mtvX: x,
		mtvY: y,
		mtvZ: z,

	};

}

function boxIntersectsSphere( minx, miny, minz, maxx, maxy, maxz, sx, sy, sz, sr ) {

	var x = Math.max( minx, Math.min( maxx, sx ) ) - sx;
	var y = Math.max( miny, Math.min( maxy, sy ) ) - sy;
	var z = Math.max( minz, Math.min( maxz, sz ) ) - sz;

	var distance = Math.hypot( x, y, z );

	if ( distance > sr ) return false;

	var overlap = sr - distance;

	if ( distance > 0 ) {

		x /= distance;
		y /= distance;
		z /= distance;

	} else {

		x = 1;
		y = 0;
		z = 0;

	}

	return {

		minOverlap: overlap,
		mtvX: x,
		mtvY: y,
		mtvZ: z,

	};

}

function boxIntersectsCylinder( minx, miny, minz, maxx, maxy, maxz, cx, cy, cz, ch, cr ) {
	
	var ch2 = ch / 2;

	var overlapY = Math.min( maxy, cy + ch2 ) - Math.max( miny, cy - ch2 );

	if ( overlapY < 0 ) return false;

	var x = Math.max( minx, Math.min( maxx, cx ) ) - cx;
	var z = Math.max( minz, Math.min( maxz, cz ) ) - cz;

	var distance = Math.hypot( x, z );

	if ( distance > cr ) return false;

	var overlapXZ = cr - distance;

	var minOverlap, y;

	if ( overlapY < overlapXZ ) {

		minOverlap = overlapY;

		y = Math.sign( ( miny + maxy ) / 2 - cy );
		x = 0;
		z = 0;

	} else {

		minOverlap = overlapXZ;

		y = 0;

		if ( distance > 0 ) {

			x /= distance;
			z /= distance;

		} else {

			x = 1;
			z = 0;

		}

	}

	return {

		minOverlap: minOverlap,
		mtvX: x,
		mtvY: y,
		mtvZ: z,

	};

}

function sphereIntersectsSphere( ax, ay, az, ar, bx, by, bz, br ) {

	var x = ax - bx;
	var y = ay - by;
	var z = az - bz;

	var distance = Math.hypot( x, y, z );

	if ( distance > ar + br ) return false;

	var overlap = ar + br - distance;

	if ( distance > 0 ) {

		x /= distance;
		y /= distance;
		z /= distance;

	} else {

		x = 1;
		y = 0;
		z = 0;

	}

	return {

		minOverlap: overlap,
		mtvX: x,
		mtvY: y,
		mtvZ: z,

	};

}

function sphereIntersectsCylinder( sx, sy, sz, sr, cx, cy, cz, ch, cr ) {

	var ch2 = ch / 2;

	var overlapY = Math.min( sy + sr, cy + ch2 ) - Math.max( sy - sr, cy - ch2 );

	if ( overlapY < 0 ) return false;

	var newRadius;

	var h1, h2;

	if ( overlapY < sr ) {

		h1 = sr - overlapY;

		newRadius = Math.sqrt( sr * sr - h1 * h1 );

	} else {

		newRadius = sr;

	}

	var x = sx - cx;
	var z = sz - cz;

	var distance = Math.hypot( x, z );
	if ( distance > newRadius + cr ) return false;

	var overlapXZ = newRadius + cr - distance;

	var minOverlap, y;

	if ( overlapY < overlapXZ ) {

		minOverlap = overlapY;
		y = Math.sign( sy - cy );
		x = 0;
		z = 0;

	} else if ( overlapY < sr ) {

		var newerRadius = newRadius - overlapXZ;

		h2 = Math.sqrt( sr * sr - newerRadius * newerRadius );
		minOverlap = h2 - h1;

		y = Math.sign( sy - cy );
		x = 0;
		z = 0;

	} else {

		minOverlap = overlapXZ;

		x /= distance;
		z /= distance;
		y = 0;

	}

	return {

		minOverlap: minOverlap,
		mtvX: x,
		mtvY: y,
		mtvZ: z,

	};

}

function cylinderIntersectsCylinder( ax, ay, az, ah, ar, bx, by, bz, bh, br ) {

	var ah2 = ah / 2;
	var bh2 = bh / 2;

	var overlapY = Math.min( ay + ah2, by + bh2 ) - Math.max( ay - ah2, by - bh2 );

	if ( overlapY < 0 ) return false;

	var x = ax - bx;
	var z = az - bz;

	var distance = Math.hypot( x, y );

	if ( distance > ar + br ) return false;

	var overlapXZ = ar + br - distance;

	var minOverlap, y;

	if ( overlapY < overlapXZ ) {

		minOverlap = overlapY;

		y = Math.sign( sy - cy );
		x = 0;
		z = 0;

	} else {

		minOverlap = overlapXZ;

		x /= distance;
		z /= distance;
		y = 0;

	}

	return {

		minOverlap: minOverlap,
		mtvX: x,
		mtvY: y,
		mtvZ: z,

	};

}

function sphereIntersectsBox( sx, sy, sz, sr, minx, miny, minz, maxx, maxy, maxz ) {

	var result = boxIntersectsSphere( minx, miny, minz, maxx, maxy, maxz, sx, sy, sz, sr );

	if ( result ) {

		result.mtvX *= - 1;
		result.mtvY *= - 1;
		result.mtvZ *= - 1;

	}

	return result;

}

function cylinderIntersectsSphere( cx, cy, cz, ch, cr, sx, sy, sz, sr ) {

	var result = sphereIntersectsCylinder( sx, sy, sz, sr, cx, cy, cz, ch, cr );

	if ( result ) {

		result.mtvX *= - 1;
		result.mtvY *= - 1;
		result.mtvZ *= - 1;

	}

	return result;

}

function cylinderIntersectsBox( cx, cy, cz, ch, cr, minx, miny, minz, maxx, maxy, maxz ) {

	var result = boxIntersectsCylinder( minx, miny, minz, maxx, maxy, maxz, cx, cy, cz, ch, cr );

	if ( result ) {

		result.mtvX *= - 1;
		result.mtvY *= - 1;
		result.mtvZ *= - 1;

	}

	return result;

}

export { 
			boxIntersectsBox, 
			boxIntersectsSphere, 
			boxIntersectsCylinder, 
			sphereIntersectsSphere, 
			sphereIntersectsBox,
			sphereIntersectsCylinder,
			cylinderIntersectsBox,
			cylinderIntersectsSphere,
			cylinderIntersectsCylinder
		}
