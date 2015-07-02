Topo = function () 
{	
	var mId;
	var mImage;
	var mRenderImage;
	var mThumb;
	var mImageId;
	var mRoute;
	var mDifficulty;
	var mName;
	var mExif;
	//TODO: finde Lösung für den Fall, dass keine GPS-Koordinaten gegeben werden.
	var mGPS= {"lat": 0, "lng": 0};
	var mDescription;
	var mComments;
	var mDrawingResolution;
	var mCanvas;
	var mStrokeIndex = 0;
	var mCurrentStroke;
	var mIsBoulder;
	var mImageResolution;
	var mCreatedAt;
	
//GET IMAGE PART 	
	this.loadImage = function (event, data,callback)
	{
		var lDomObject = event.target;
		mCanvas = new Canvas(0,0);
		mImage = new Image();
		if(!data){
			
			var lImageFile = lDomObject.files[0];
			var url = window.URL ? window.URL : window.webkitURL;
			mImage.onload = function(e) 
			{
				url.revokeObjectURL(e.target.src);	
				$(lDomObject).fileExif(callbackExif);
					function callbackExif(aExif)
					{	
						mExif = aExif;
						imagePositioning(callback); 
					}						
					console.log("onload--via--Upload");
			};
			mImage.src = url.createObjectURL(lImageFile);
		}else{
			mImage.onload = function(){
				console.log("onload--direct--from--camera");
				mExif=[];
				renderCurrentImage(callback);
			};
			mImage.src = data;
		}
	};

//IMAGE PART
	var renderCurrentImage = function(callback)
	{	
//		mImage -> mRenderImage
		mCanvas.setWidth(mRenderImage.width*fit2Screen(mRenderImage));
		mCanvas.setHeight(mRenderImage.height*fit2Screen(mRenderImage));
		mCanvas.setBackground(mRenderImage.src);	
		console.log(mRenderImage.width);
		if(callback)callback();
	};

	var imagePositioning = function(callback)
	{	
		var lImage = new Image();
		lImage.onload=function () {
			setThumb(lImage);
			console.log("Image is loaded.");
			renderCurrentImage(callback);
			//mImage.src=lImage.src;
		};
		var lThumb = new Image();
		lThumb.onload=function(){
			console.log("thumb Image is loaded.");
		};
		
		if( mExif.Orientation === 8 ) 		{ lImage.src = rotateAndResize(270);} //left 
		else if( mExif.Orientation === 6 ) 	{ lImage.src = rotateAndResize(90); } //right			
		else if( mExif.Orientation === 3 ) 	{ lImage.src = rotateAndResize(180);} //flip
		else								{ lImage.src = rotateAndResize(0); } //no Rotation
	};
	var setThumb = function (aRotatedImage){
		mThumb = new Image();
		var lResizeScale = getResizeScale(aRotatedImage, 100);
		var lWidth = aRotatedImage.width * lResizeScale;
		var lHeight = aRotatedImage.height * lResizeScale;
		var offscreenCanvas = document.createElement('canvas');
		offscreenCanvas.width = lWidth;
		offscreenCanvas.height = lHeight;
		var offscreenCtx = offscreenCanvas.getContext('2d');
		offscreenCtx.drawImage( aRotatedImage, 0, 0, lWidth, lHeight);
		mThumb.src = offscreenCanvas.toDataURL('image/jpeg',0.5);
	};

	//rotate and resize and rotate image to fit in 
	//screen and to show it correctly (orientation)
	var rotateAndResize = function rotateAndResize(angle)
	{
		//experimental
		mRenderImage = new Image();
		var lResizeScale = getResizeScale(mImage, 600);//TODO 900?
		var lWidth = mImage.width * lResizeScale;
		var lHeight = mImage.height * lResizeScale;
		
		var offscreenCanvas = document.createElement('canvas');
		offscreenCanvas.width = lWidth;
		offscreenCanvas.height = lHeight;
		var offscreenCtx = offscreenCanvas.getContext('2d');
		var lTranslateX, lTranslateY;
		switch (angle){
			case 270:
				console.log("TRANSLATION: left");
				offscreenCanvas.width = lHeight;
				offscreenCanvas.height = lWidth;
				
				
				lTranslateX = 0;
				lTranslateY = offscreenCanvas.height;
			break;
			case 180:
				console.log("TRANSLATION: flip");
				lTranslateX = offscreenCanvas.width;
				lTranslateY = offscreenCanvas.height;		
			break;
			case 90:
				console.log("TRANSLATION: right");
				//offscreenCanvas.width = aImage.height;
				//offscreenCanvas.height = aImage.width;
				offscreenCanvas.width = lHeight;
				offscreenCanvas.height = lWidth;
				
				lTranslateX = offscreenCanvas.width;
				lTranslateY = 0;
			break;
			case 0:
				console.log("TRANSLATION: no rotation");
				lTranslateX = 0;
				lTranslateY = 0;
			break;
			default:
				console.log("Something went wrong in TRANSLATION of CANVAS -> No ANGLE");
		}
		
		offscreenCtx.translate(lTranslateX, lTranslateY);
		offscreenCtx.rotate((Math.PI/180)*angle);
		offscreenCtx.drawImage( mImage, 0, 0, lWidth, lHeight);
		mRenderImage.src = offscreenCanvas.toDataURL('image/jpeg',0.5);
		return mRenderImage.src;
	};
			

	/*var resizeImage = function (aImage, callback)
	{
		console.log("aImage Width before"+aImage.width);
		var lScaleFactor;
		var lMaxImageSize = 400;
		
		if(Math.max(aImage.width, aImage.height) >  lMaxImageSize){			
			if( aImage.width < aImage.height )
			{
				lScaleFactor = lMaxImageSize / aImage.height;
			}else if ( aImage.widht > aImage.height )
			{
				lScaleFactor = lMaxImageSize / aImage.width;
			}else
			{//in that case the image is square
				lScaleFactor = lMaxImageSize / aImage.width;
			}
			//set new Image size:
			var lOffScreenCanvas = document.createElement('canvas');
			lOffScreenCanvas.width = aImage.width * lScaleFactor;
			lOffScreenCanvas.height = aImage.height * lScaleFactor;
			var offscreenCtx = lOffScreenCanvas.getContext('2d');
			offscreenCtx.drawImage(aImage, 0, 0, lOffScreenCanvas.width,lOffScreenCanvas.height);
			
			//TODO proof.
			//mImage = new Image();
			//console.log(lOffScreenCanvas);
			aImage.src = lOffScreenCanvas.toDataURL();
		}
		mImage = new Image();
		mImage = aImage;
		console.log("aImage Width after"+aImage.width);
		if(callback){
			callback();
		}
	}*/
	
	
	var getResizeScale = function(aImage, aMaxImageSize)
	{
		var lScaleFactor = 1;
		var lMaxImageSize = aMaxImageSize;
		
		if(Math.max(aImage.width, aImage.height) >  lMaxImageSize){			
			if( aImage.width < aImage.height )
			{
				lScaleFactor = lMaxImageSize / aImage.height;
			}else if ( aImage.widht > aImage.height )
			{
				lScaleFactor = lMaxImageSize / aImage.width;
			}else
			{//in that case the image is square
				lScaleFactor = lMaxImageSize / aImage.width;
			}
		}
		return lScaleFactor;
			
	}


	var fit2Screen = function (aImage2)
	{
		var ultimoRatio, lNewWidth, lNewHeight;
		var lWidth = aImage2.width;
		var lHeight = aImage2.height;
		var maxScreenWidth = $("#content").width();
		var maxScreenHeight = $("#content").height();
		

		if( aImage2.width > aImage2.height )
		{
			lNewWidth = maxScreenWidth;
			ultimoRatio = (maxScreenWidth / lWidth );
			lNewHeight =  ultimoRatio * lHeight;
			if( lNewHeight > maxScreenHeight ) {
				lNewHeight = maxScreenHeight;
				ultimoRatio = (maxScreenHeight / lHeight );
				lNewWidth =  ultimoRatio * lWidth;
			}
		}
		else if( aImage2.width < aImage2.height )
		{
			lNewHeight = maxScreenHeight;
			ultimoRatio = (maxScreenHeight / lHeight );
			lNewWidth =  ultimoRatio * lWidth;
			if( lNewWidth > maxScreenWidth ) {
				lNewWidth = maxScreenWidth;
				ultimoRatio = (maxScreenWidth / lWidth );
				lNewHeight =  ultimoRatio * lHeight;					
			}
		}
		else
		{
			lNewWidth = maxScreenWidth;
			lNewHeight = maxScreenHeight;
			//TODO proof!
			ultimoRatio = lNewWidth / aImage2.width;
		}
		return ultimoRatio;
	}
	

//GET LOCATION PART
	this.calcLocation = function (){
		navigator.geolocation.getCurrentPosition(handle_geolocation_query,handle_errors);
	};
	
   var handle_errors = function(error)
	{
		switch(error.code)
		{
			case error.PERMISSION_DENIED: console.log("user did not share geolocation data");
			mGPS = {"lat": 0, "lng": 0};
			break;

			case error.POSITION_UNAVAILABLE: console.log("could not detect current position");
			mGPS = {"lat": 0, "lng": 0};
			break;

			case error.TIMEOUT: console.log("retrieving position timed out");
			mGPS = {"lat": 0, "lng": 0};
			break;

			default: console.log("unknown error");
			mGPS = {"lat": 0, "lng": 0};
			break;
		}
	};

	var handle_geolocation_query = function (position){
	   mGPS = {"lat": 0, "lng": 0};
	   console.log('Lat: ' + position.coords.latitude +
			' Lon: ' + position.coords.longitude);
			mGPS = {"lat": position.coords.latitude, "lng": position.coords.longitude};
	};
		
	
	
//GET ROUTE STROKE PART

	this.startStroke = function (){
		mCurrentStroke = new Array();
		return mCurrentStroke;	
	};
	this.addDotToStroke = function (aDot){
		mCurrentStroke.push(aDot);
		//mCanvas.drawDot(aDot.x, aDot.y);
		mCanvas.draw(mCurrentStroke);
	};

	this.saveStroke = function(){	
		//var strokeId = -1;
		if( mRoute == null )
		{
			mRoute = new Array();
		}/*else{
			strokeId = mRoute[mRoute.length-1].currentStrokeId
		}*/
		mCanvas.draw(mCurrentStroke);
		mRoute.push(mCurrentStroke);
		/*{
			currentStrokeId: ++strokeId,
			coordinateMap: data,
		});*/
		this.startStroke();
	};

	this.drawStroke = function (data){
		mCanvas.draw(data);
	};
	
	this.removeLastStroke = function (){
		mCanvas.clearStrokes();
		mRoute = mRoute.slice(0,mRoute.length-1);
		$.each(mRoute,function(i,v){
			mCanvas.draw(v);
		});
	};
	
	
	//GET MANUAL ROUTE DATA
	this.saveTopoData = function(aDataArray){
		$.each(aDataArray, function(index, value){
			switch (value.name){
				case 'mName':
				mName = value.value;
				break;
				case 'mDifficulty':
				mDifficulty = value.value;
				break;
				case 'mIsBoulder':
				mIsBoulder = value.value;
				break;
				case 'mDescription':
				mDescription = value.value;
				break;
				default:
				console.log("something went wrong in saveTopoData-("+value.name+")");
				return false;
			}
		});
		return true;
	};

	//dbCollection To TopoObject
	this.setTopoCollectionToObject = function(aCollectionArray){
		if(aCollectionArray.image) {
			mImage = new Image();
			mImage.src = aCollectionArray.image;
		}
		if(aCollectionArray.name ) mName = aCollectionArray.name;
		if(aCollectionArray.gps ) mGPS = aCollectionArray.gps;		
		if(aCollectionArray.difficulty ) mDifficulty = aCollectionArray.difficulty;
		if(aCollectionArray.description ) mDescription = aCollectionArray.description;
		if(aCollectionArray.route) mRoute = aCollectionArray.route;
		if(aCollectionArray.comments) mComments = aCollectionArray.comments;//TODO-Check: [0]!
		if(aCollectionArray.isboulder) mIsBoulder = aCollectionArray.isboulder;
		if(aCollectionArray.imgDrawingResolution) mDrawingResolution = aCollectionArray.imgDrawingResolution;
		if(aCollectionArray.imageResolution) mImageResolution = aCollectionArray.imageResolution;
		if(aCollectionArray.thumb ) mThumb = aCollectionArray.thumb;

		if(aCollectionArray.createdAt ) mThumb = aCollectionArray.createdAt;
		
	};
	
	//setter
	this.setImageId = function (aImgId){mImageId = aImgId;};
	this.clearCanvas = function(){mCanvas.clear();};
	this.setDrawingResolution = function (){
		mDrawingResolution= {width: mCanvas.getWidth(), height: mCanvas.getHeight()};
		console.log(mDrawingResolution);
	};
	this.setImageResolution = function (){
		mImageResolution= {width: mImage.width, height: mImage.height};
	};
	
	//getter
	this.getImage = function(){ return mImage;	};
	this.getRenderImage = function(){return mRenderImage;};
	this.getImageId = function() { return mImageId; };
	this.getGPS = function(){ return mGPS; };
	this.getRoute = function(){ return mRoute;	};
	this.getDescription = function(){ return mDescription; };
	this.getDifficulty = function(){ return $.getDifficulty(mDifficulty, mIsBoulder);	};
	this.getName = function(){ return mName;	};
	this.getExif = function(){ return mExif;	};
	this.getIsBoulder = function(){ return mIsBoulder;};
	this.getDrawingResolution = function (){ return mDrawingResolution;};
	this.getComments= function(){ return mComments; };
	this.getCanvas= function(){ return mCanvas; };
	this.getThumb = function(){ return mThumb; };
	this.getImageResolution = function(){return mImageResolution;};
	this.getCreatedAt = function (){ return mCreatedAt; };
	
	
};
(function($) {

	$.getScale4ScreenSize = function( aContentSize, aImageResolution ) {
	{
		var ultimoRatio, lNewWidth, lNewHeight;
		lWidth = aImageResolution.width;
		lHeight = aImageResolution.height;
		maxScreenWidth = aContentSize.curValue.x;
		maxScreenHeight = aContentSize.curValue.y;

//		maxScreenWidth = $(window).width();
//		maxScreenHeight = $(window).height();

		if( aImageResolution.width > aImageResolution.height )
		{
			lNewWidth = maxScreenWidth;
			ultimoRatio = (maxScreenWidth / lWidth );
			lNewHeight =  ultimoRatio * lHeight;
			if( lNewHeight > maxScreenHeight ) {
				lNewHeight = maxScreenHeight;
				ultimoRatio = (maxScreenHeight / lHeight );
				lNewWidth =  ultimoRatio * lWidth;
			}
		}
		else if( aImageResolution.width < aImageResolution.height )
		{
			lNewHeight = maxScreenHeight;
			ultimoRatio = (maxScreenHeight / lHeight );
			lNewWidth =  ultimoRatio * lWidth;
			if( lNewWidth > maxScreenWidth ) {
				lNewWidth = maxScreenWidth;
				ultimoRatio = (maxScreenWidth / lWidth );
				lNewHeight =  ultimoRatio * lHeight;					
			}
		}
		else
		{
			lNewWidth = maxScreenWidth;
			lNewHeight = maxScreenHeight;
			//TODO proof!
			ultimoRatio = lNewWidth / aImageResolution.width;
		}
		return ultimoRatio;
	}
	};
	$.getDifficulty = function (aValue, isBoulder){
		var lLevelMap;
		var lIntValue;

		var lUIAALevels={
			0: "1",
			3: "2",
			6: "3",
			9: "4",
			12: "5-",
			15: "5",
			18: "5+",
			21: "6-",
			24: "6",
			27: "6+",
			30: "7-",
			33: "7",			
			36: "7+",
			39: "7+/8-",
			42: "8-",
			45: "8",
			48: "8+",
			51: "9-",
			54: "9",			
			57: "9+",
			60: "9+/10-",
			63: "10-",
			66: "10",
			69: "10+",
			72: "10+/11-",
			75: "11-",
			78: "11",
			81: "11+",
			84: "11+/12-",
			87: "12-",
			90: "k.A.",
			93: "k.A.",
			96: "k.A.",
			99: "k.A.",
			100: "k.A.",
			"scalename": "UIAA"
			};
		var lFbLevels={
			0: "k.A.",
			4: 	"2",
			8:	"3",
			12: "4a",
			16:	"4b",
			20: "4c",
			24: "5a",
			28: "5b",
			32: "5c",
			36:	"6a",
			40:	"6b",
			44:	"6c",
			48:	"7a",
			52:	"7a+",
			56:	"7b",
			60:	"7b+",
			64:	"7c",
			68:	"7c+",
			72:	"8a",
			76:	"8a+",
			80:	"8b",
			84:	"8b+",
			86:	"8c",
			90:	"8c+",
			94:	"k.A.",
			98: "k.A.",
			"scalename": "FB"
		};
		

		if(isBoulder){
			lIntValue = aValue - (aValue%4);
			lLevelMap = lFbLevels;
		}else{
			lIntValue = aValue - (aValue%3);
			lLevelMap = lUIAALevels;
		}
		
		return {difficultyvalue: lLevelMap[lIntValue], difficultyscalename: lLevelMap["scalename"]};
	};
})(jQuery);