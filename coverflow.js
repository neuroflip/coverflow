/*
	Coverflow js+css3 demo
	----------------------
	Use the horizontal scroll or the left / right keys

	* This code can be more parametrized to adjust values as coverImage angles, animation speed and timming, etc.

	* Creates DOM content dinamically: <div><ul> [ <li><img></li> ]* </ul> 
	* Uses css3d transforms to rotate and animate rotation
	* Uses scroll animations with variable speed via js using RequestAnimationFrame

	jaanguita @t gmail
	Bcn'2013
*/

"use strict";

var _KEY_LEFT  = 37;
var _KEY_RIGHT = 39;
var _DEFCOVER_SIZE = 500;

function coverflow(data)
{
	this.coverSize = Number(data.coverSize) || _DEFCOVER_SIZE;
	this.indexSelection = 0;
	this.container = null;
	this.placeHolders = [];

	this.scrollSpeed = 0.0;
	this.startTimeStamp = new Date();
	this.requestAnimationFrameID = null;

	//create the DOM elements and prepare the initial state
	this.createDOMCoverflow(data.data);
	this.assignEventHandlers();
}

/* Scroll Methods ********************************************************************************************************/

coverflow.prototype.beginScrollToIndex = function()
{
	//to get no scroll animation: set the scrollLeft directly
	this.startTimeStamp = new Date();
	this.scrollSpeed = (this.indexSelection*this.coverSize-this.container.scrollLeft)/150;
	
	//to avoid multiple animationFrames, the new animation speed is just modified
	if(!this.requestAnimationFrameID) 
		this.scrollAnimation();
};

coverflow.prototype.scrollAnimation = function()
{
	var timeStamp = new Date(),
	    t = timeStamp.getTime() - this.startTimeStamp.getTime();
	
	this.startTimeStamp = new Date();

	if(Math.abs(this.scrollSpeed)>=0.1)
	{
		this.container.scrollLeft += t*this.scrollSpeed;
		this.scrollSpeed = (this.indexSelection*this.coverSize-this.container.scrollLeft)/150;
		this.requestAnimationFrameID = window.requestAnimationFrame(this.scrollAnimation.bind(this));
	}
	else
	{
		this.scrollSpeed = 0.0;
		this.requestAnimationFrameID = null;
	}
};

coverflow.prototype.moveRight = function()
{
	this.indexSelection = Math.min(this.indexSelection+1,this.placeHolders.length-1);
	this.scrollSpeed = (this.indexSelection*this.coverSize-this.container.scrollLeft)/150;
	this.recalcCoverRotation();

	this.beginScrollToIndex();	
};

coverflow.prototype.moveLeft = function()
{
	this.indexSelection = Math.max(this.indexSelection-1,0);
	this.scrollSpeed = (this.indexSelection*this.coverSize-this.container.scrollLeft)/150;
	this.recalcCoverRotation();

	this.beginScrollToIndex();
};

/* Event Handlers ************************************************************************************************/

coverflow.prototype.assignEventHandlers = function()
{
	//Event Handlers
	this.container.onscroll = this.onScrollHandler.bind(this);
	document.onkeydown = this.onKeyDownHandler.bind(this);
	document.onkeyup = this.onKeyUpHandler.bind(this);
};

coverflow.prototype.onScrollHandler = function()
{
	if(this.requestAnimationFrameID) return;

	//scrollLeft+(this.coverSize-thisR_SIZE/2) offset: center the area to fire cover anim
	var x = Math.floor((this.container.scrollLeft+(this.coverSize/2))/this.coverSize);
	
	if(x!=this.indexSelection)
	{
		this.indexSelection=x;
		this.recalcCoverRotation();
	}
};

coverflow.prototype.onKeyDownHandler = function(e)
{
	/* to avoid fire the scroll event with keys */
	e.preventDefault();
	e.stopPropagation();
};
coverflow.prototype.onKeyUpHandler = function(e)
{
	e.preventDefault();
	e.stopPropagation();
	switch(e.keyCode)
	{
		case _KEY_LEFT:
			this.moveLeft();
		break;
		case _KEY_RIGHT:
			this.moveRight();
		break;			
	}
};


/*** DOM Methods ********************************************************************************************************/

coverflow.prototype.createDOMCoverflow = function(data)
{
	var div = document.createElement('div'), 
		ul = document.createElement('ul'),
		img=null, li = null;

	this.container = div;
	this.container.style.left = window.innerWidth/2-this.coverSize;
	this.container.style.top = 10;
	this.container.classList.add('container');
	this.container.style.width = (2*this.coverSize) + "px";
	this.container.style.height = (this.coverSize+(this.coverSize/2)) + "px";
	ul.style.height = (this.coverSize+(this.coverSize/2)) + "px";
	ul.style.paddingLeft = (this.coverSize/2) + "px";
	ul.style.paddingRight = (this.coverSize/2) + "px";

	for(var i=0;i<data.length;i++)
	{
		img = new Image();
		img.src = data[i].img;
		img.width=this.coverSize;
		img.height=this.coverSize;
		li = document.createElement('li');
		this.setCoverAngleAndScale(li,i);

		li.appendChild(img);
		ul.appendChild(li);

		this.placeHolders.push(li);
	}

	ul.style.width = (this.placeHolders.length*this.coverSize) + "px";
	this.container.appendChild(ul);
	document.body.appendChild(this.container);
};

coverflow.prototype.setCoverAngleAndScale = function(li,i)
{
	var deg = (i<this.indexSelection?45:(i==this.indexSelection?0:-45));

	if(i==this.indexSelection)
		li.style.webkitTransform = "rotateY(" + deg + "deg) scale(1.1)";
	else
		li.style.webkitTransform = "rotateY(" + deg + "deg) scale(0.7)";
};

coverflow.prototype.recalcCoverRotation = function()
{
	var li, ul = this.container.firstChild;

	for(var i=0;i<this.placeHolders.length;i++)
	{
		li = this.placeHolders[i];
		this.setCoverAngleAndScale(li,i);
	}
};