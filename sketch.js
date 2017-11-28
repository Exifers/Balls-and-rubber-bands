class Join {
	constructor() {
		this.pos1 = createVector(0,0);
		this.pos2 = createVector(0,0);
		this.k = 50;
		this.refLength = 200;
		this.type = "spring"; // "string", "spring"
		this.followMouse=false;
		this.delta = 0;
	}
	getForce() {
		var body = this.pos2.copy();
		body.sub(this.pos1.copy());
		this.delta = this.refLength-body.mag();
		if (this.type == "spring") {
			body.normalize();
			return body.mult(this.k*this.delta);
		}
		else {
			if (delta < 0) {
				body.normalize();
				return body.mult(this.k*this.delta);
			}
			else {
				return createVector(0,0);
			}
		}
	}
	setTypeToSpring() {
		this.type = "spring";
	}
	setTypeToString() {
		this.type = "string";
	}
	update() {
		if (this.followMouse) {
			this.pos2 = createVector(mouseX,mouseY);
		}
	}
	display() {
		if (this.type == "string") {
			stroke(255,100,100);
		}
		else {
			stroke(constrain(100+20*this.delta,0,255),constrain(100-14*this.delta,0,255),constrain(255-14*abs(this.delta),0,255));
		}
		strokeWeight(3);
		line(this.pos1.x,this.pos1.y,this.pos2.x,this.pos2.y);
	}
}

class Mass {
	constructor() {
		this.pos = createVector(0,0);
		this.vel = createVector(0,0);
		this.mass = 1;
		this.ref = false;
		this.joins = [];
		this.sides = [];
		this.r = 25;
	}
	update() {
		if(!this.ref) {
			this.pos.add(this.vel);
			for(var i=0 ; i<this.joins.length ; i++) {
				var join = this.joins[i];
				var side = this.sides[i];
				if (side == 1) {
					join.pos2 = this.pos;
				}
				else {
					join.pos1 = this.pos;
				}
				this.vel.add(this.joins[i].getForce().mult(this.sides[i]/this.mass));
			}
			this.vel.add(createVector(0,gravity));
			this.vel.mult(friction);
		}
	}
	display() {
		noStroke();
		if (!this.ref)
			fill(255,100,100);
		else
			fill(255,50,50);
		ellipse(this.pos.x,this.pos.y,this.r,this.r);
	}
}

var masses;
var joins;

var playMode;
var massMode;
var joinMode;

var refMode;

var lastTakenMass;

var friction;
var gravity;

function setup() {
	createCanvas(500,500);

	masses = [];
	joins = [];

	playMode = false;
	massMode = true;
	joinMode = false;
	refMode = true;

	lastTakenMass = null;

	friction = 0.005;
	gravity = 100;
}

function draw() {
	background(51);

	if (playMode) {
		for (var i=0 ; i<masses.length ; i++) {
			masses[i].update();
		}
	}

	for (var i=0 ; i<joins.length ; i++) {
		joins[i].update();
		joins[i].display();
	}
	for (var i=0 ; i<masses.length ; i++) {
		masses[i].display();
	}
}

function keyPressed() {
	playMode = false;
	massMode = false;
	joinMode = false;
	if (key == "P") {
		playMode = true;
	}
	if (key == "R") {
		if (refMode) {
			refMode = false;
		}
		else {
			refMode = true;
		}
	}
	else if (key == "M") {
		massMode = true;
	}
	else if (key == "J") {
		joinMode = true;
	}
}

function mousePressed() {
	if (massMode) {
		var mass = new Mass();
		mass.pos = createVector(mouseX,mouseY);
		mass.ref = refMode;
		masses.push(mass);
	}
	if (joinMode) {
		var takenMass = getTakenMass(mouseX,mouseY);
		if (takenMass!=null) {
			var join = new Join();
			join.pos1 = takenMass.pos;
			takenMass.joins.push(join);
			takenMass.sides.push(-1);
			join.pos2 = createVector(mouseX,mouseY);
			join.followMouse = true;
			joins.push(join);
			lastTakenMass = takenMass;
		}
	}
	if (playMode) {

	}
}

function mouseReleased() {
	if (joinMode) {
		var takenMass = getTakenMass(mouseX,mouseY);
		if (takenMass!=null) {
			var join = joins[joins.length-1];
			join.pos2 = takenMass.pos;
			join.followMouse = false;
			var len = join.pos1.copy();
			len.sub(join.pos2);
			join.refLength = len.mag();
			takenMass.joins.push(join);
			takenMass.sides.push(1);
		}
		else {
			var join = joins.pop();
			lastTakenMass.joins.pop();
			lastTakenMass.sides.pop();
		}
		lastTakenMass = null;
	}
}

function getTakenMass(x,y) {
	var closestMass = null;
	var minDist = Infinity;
	for (var i=0 ; i<masses.length ; i++) {
		if (dist(masses[i].pos.x, masses[i].pos.y, x,y)<minDist) {
			closestMass = masses[i];
			minDist = dist(masses[i].pos.x, masses[i].pos.y, x,y);
		}
	}
	if (closestMass == null) {
		return null;
	}
	if (minDist <= closestMass.r) {
		return closestMass;
	}
	return null;
}