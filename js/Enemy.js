var imgEnemy= new Image();
var imgViewRad= new Image();
var goToImg = new Image();

var Enemy=function (){
	this.interX=0;//used to display thir position on the screen radar.
	this.interY =0;
	
	this.centreX =0;
	this.centreY =0;
	this.width = 50;
	this.height = 50;
	this.angle = 2.87;
	this.xVel = 0;
	this.yVel = 0;
	this.alive = false;
	this.xDirect = 0;
	this.yDirect = 0;
	this.speed = 1.5;
	this.viewRadius = 40;
	this.hitRadius =25;
	//AI States
	this.state = "wander";
	this.drawLast = false;

	//bullets and crap
	this.bullets = [];
	this.reset();

	//triangle variables
	this.aX=0,this.aY=0,this.bX=0,this.bY=0,this.cX=0,this.cY=0;
};


Enemy.prototype.reset = function(){
	this.moveDirection;
	this.targetPosX= 0;
	this.targetPosY =0;
	this.lastX;
	this.lastY;
	this.timeSinceDirectChange = 0;
	this.x = 200;
	this.y = 100;
	this.numBullets = 4;
	this.reloadTimer = 80;
	this.startReload = false; 
}

Enemy.prototype.spawnEnemy = function(x,y){
	this.alive = true;
	this.angle = Math.random()*(8-1) +1;
	//Math.floor(Math.random()*(this.max-this.min) +this.min);
	this.x =x;
	this.y = y;
}

Enemy.prototype.targetPos = function(px,py){
	this.targetPosX = px;
	this.targetPosY = py;
}


Enemy.prototype.update = function(){
 	if(this.alive){
 		this.xDirect = Math.cos(this.angle);
		this.yDirect = Math.sin(this.angle);
		if(this.angle<0){
		this.angle = 6;
		}
		if(this.angle>6.3){
			this.angle = 0;
		}
		//State Control
		if(this.state === "wander"){
			this.moveBasic();
		}
		else if(this.state === "attack"){
			this.drawLast = true;//shows the dot which represents the enemies view of the player.
			this.turnTowardPlayer();
		}
		else if(this.state === "moveToPos"){
			this.goToPos(this.targetPosX,this.targetPosY);
		}
		//end state control

		for(var i = 0; i <this.bullets.length; i++){
			if(this.bullets[i].alive){
				this.bullets[i].update();
			}
		}
		//the magic numbers are used to resemble the rotation and translation of the enemy.
        this.aX=rotate_point(this.x,this.y,this.x,this.y,this.angle).x,this.aY = rotate_point(this.x,this.y,this.x,this.y,this.angle).y;
    	this.bX=rotate_point(this.x+350,this.y+160,this.x,this.y,this.angle).x, this.bY =rotate_point(this.x+350,this.y+160,this.x,this.y,this.angle).y;
    	this.cX=rotate_point(this.x+350,this.y-140,this.x,this.y,this.angle).x,this.cY=rotate_point(this.x+350,this.y-140,this.x,this.y,this.angle).y;

    	if(this.x>1060){
			this.x = 1060;
		}
		else if(this.x<-764){
			this.x = -764;
		}
		else if(this.y<-604){
			this.y = -604;
		}
		else if(this.y>590){
			this.y = 590;
		}
		this.x+= this.xVel;
		this.y+= this.yVel;
		this.xVel = 0;
		this.yVel = 0;

		//this.centreX = this.x +this.width/2;
		//this.centreY = this.y+this.height/2;
	}
}

Enemy.prototype.debugDraw = function(){
	ctx.drawImage(imgViewRad,this.x- this.viewRadius, this.y - this.viewRadius, this.viewRadius*2, this.viewRadius*2);
	if(this.drawLast){
		ctx.drawImage(imgBullet,this.targetPosX, this.targetPosY, 8, 8);
	}
		ctx.beginPath();
    	ctx.moveTo(rotate_point(this.x,this.y,this.x,this.y,this.angle).x,rotate_point(this.x,this.y,this.x,this.y,this.angle).y);//a
    	ctx.lineTo(rotate_point(this.x+350,this.y+160,this.x,this.y,this.angle).x,rotate_point(this.x+350,this.y+160,this.x,this.y,this.angle).y);//b
    	ctx.lineTo(rotate_point(this.x+350,this.y-140,this.x,this.y,this.angle).x,rotate_point(this.x+350,this.y-140,this.x,this.y,this.angle).y);//c
    	ctx.lineTo(rotate_point(this.x,this.y,this.x,this.y,this.angle).x,rotate_point(this.x,this.y,this.x,this.y,this.angle).y);
    	ctx.stroke();
}

Enemy.prototype.draw = function(){
	if(this.alive){
		
		ctx.save();//save the state of canvas before rotation wrecks the place.
		for(var i = 0; i <this.bullets.length; i++){
			this.bullets[i].draw();
		}
		ctx.translate(this.x, this.y); //let's translate
		ctx.rotate(this.angle); //increment the angle and rotate the image 
		ctx.drawImage(imgEnemy,-this.width/2, -this.height/2, this.width, this.height);

		ctx.restore(); //restore the state of canvas

		this.lastX = this.x;
		this.lastY = this.y;
	}
};

function rotate_point(pointX, pointY, originX, originY, angle) {
	//angle = angle * Math.PI / 180.0;
	return {
		x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
		y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
	};
}


Enemy.prototype.turnTowardPlayer = function(){
	if (this.alive == true){
		if(this.rotateToDirection(this.targetPosX,this.targetPosY,0.03,0.04)){
			this.shoot();
			if(this.startReload){
				this.reload();
			}
		}
	}
}

Enemy.prototype.reload = function(){
	this.reloadTimer--;

	if(this.reloadTimer<=0){
		this.reloadTimer = 80;
		this.numBullets = 4;
		this.startReload = false;
	}
}

Enemy.prototype.shoot = function(){
	if(this.numBullets>0){
			var bullet = new Bullet();
			bullet.spawnBullet(this.xDirect,this.yDirect,this.x,this.y,this.angle);
			this.shot = true;
			this.bullets.push(bullet);
			this.numBullets--;
		}
		else{
			//console.log(this.numBullets);
			this.startReload = true;
		}

	//end Space
		/*if(this.numBullets<=0){
			console.log("Press R To Reload");
		}*/
	for (var i = 0; i < this.bullets.length; ++i) {
    	if (!this.bullets[i].alive) {
    		var index = this.bullets.indexOf(i);
    		this.bullets.splice(i, 1);
    		i--;
   		}
	}
}

Enemy.prototype.rotateToDirection = function(targX,targY,speed,leeWay){
	var posDifferenceX = targX - this.x; // finds the vector for the difference in positions
	var posDifferenceY = targY - this.y;
	var rotation = Math.atan2(posDifferenceY, posDifferenceX);
	//checks which direction of rotation is the correct one
	if(((this.angle* (180/Math.PI))-(rotation* (180/Math.PI))+360)%360>180){
		this.angle += speed;//0.08
	}
	else{
		this.angle -= speed;
	}
	//stop the arrow vibrating when its close to perfect.
	if(((this.angle* (180/Math.PI))-(rotation* (180/Math.PI))+360)%360>180 >-leeWay&&
		((this.angle* (180/Math.PI))-(rotation* (180/Math.PI))+360)%360>180 <leeWay){
		this.angle = rotation;
		return true;
	}
	return false;
}


Enemy.prototype.goToPos = function(xPos,yPos){
	this.rotateToDirection(xPos,yPos,0.08,0.01);
	
	//turn to face a specific point
	this.xDirect = Math.cos(this.angle);
	this.yDirect = Math.sin(this.angle);
	this.xVel = this.xDirect*this.speed;
	this.yVel = this.yDirect*this.speed;
	if(this.closeToPos(xPos,yPos)){
		this.state = fsm.stateControl(this.state,"complete");
		this.drawLast = false;
	}
}

Enemy.prototype.closeToPos = function(xPos,yPos){

	var marginGap = 8;
	if(this.x > xPos -marginGap &&this.x < xPos +marginGap){
		if(this.y > yPos -marginGap &&this.y < yPos +marginGap){
			return true;
		}
	}
	return false;
}


Enemy.prototype.kill = function(){
	this.alive = false;
	var rand= Math.floor(Math.random()*(10-1) +1);
	if(rand === 2){
		return 1;
	}
	return 0;
}


Enemy.prototype.moveBasic = function(){
	this.moveDirection = "forward";
	//causes regular changes in direction
	if(this.timeSinceDirectChange>40){
		this.angle = Math.random()*(8-1) +1;
		this.timeSinceDirectChange = 0;
	}
	if(this.moveDirection == "forward"){
		this.xVel = this.xDirect*this.speed;
		this.yVel = this.yDirect*this.speed;
	}
	this.timeSinceDirectChange++;
};

Enemy.prototype.collision = function(e)
{

};


