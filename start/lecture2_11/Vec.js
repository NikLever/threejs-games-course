class Vec{
  constructor(x=0,y=0){
    this.x = x;
    this.y = y;
  }

  copy(pt){
    this.x = pt.x;
    this.y = pt.y;

    return this;
  }

  clone(){
    return new this.constructor().copy( this );
  }

  add(pt){
    this.x += pt.x;
    this.y += pt.y;

    return this;
  }

  sub(pt){
    this.x -= pt.x;
    this.y -= pt.y;

    return this;
  }

  distanceTo(pt){
    const delta = this.clone().sub(pt);

    return Math.sqrt( delta.x*delta.x + delta.y*delta.y );
  }

  angle() {
  	const theta = Math.atan2( - this.y, - this.x ) + Math.PI;

		return theta;
	}

  angleBetween(pt){
    const theta1 = this.angle();
    const theta2 = pt.angle();

    return Math.abs(theta1 - theta2) * 180 / Math.PI;
  }
}

export{Vec};