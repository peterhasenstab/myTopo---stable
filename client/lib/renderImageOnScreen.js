(function($) {
	$.renderImage = function (exif, img)
	{
		if( exif.Orientation === 8 ) 		{ img = $.rotateAndResize(img, 270); } //left 
		else if( exif.Orientation === 6 ) 	{ img = $.rotateAndResize(img, 90); } //right			
		else if( exif.Orientation === 3 ) 	{ img = $.rotateAndResize(img,180); } //flip
		else								{ img = $.rotateAndResize(img, 0); } //no Rotation

		var canvas = new Canvas(img.width*fit2Screen(img),img.height*fit2Screen(img));	
		canvas.setBackground(img.src);
		return canvas;
	};

	/*rotate and resize and rotate image to fit in 
	screen and to show it correctly (orientation)*/
	$.rotateAndResize = function (aImage, angle)
	{
			var offscreenCanvas = document.createElement('canvas');
						offscreenCanvas.width = aImage.width;
						offscreenCanvas.height = aImage.height;
						var offscreenCtx = offscreenCanvas.getContext('2d');
						var lTranslateX, lTranslateY;
						switch (angle){
							case 270:
								console.log("TRANSLATION: left");
								offscreenCanvas.width = aImage.height;
								offscreenCanvas.height = aImage.width
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
								offscreenCanvas.width = aImage.height;
								offscreenCanvas.height = aImage.width;
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
						offscreenCtx.drawImage( aImage, 0, 0);
						
						//neu ggf. entfernen:
						var returnImage = new Image();
						returnImage.src = offscreenCanvas.toDataURL("image/png", 1);
						console.log($.type(returnImage));
						return returnImage;
						//ende neu
						//wieder unkommentieren
						//aImage.src = offscreenCanvas.toDataURL();
						//return aImage;
	};
				
	$.scaleImageToMaxSize = function(aImage)
	{
		var lScaleFactor;
						//computes a factor for every Image having the same resolution no matter which camera
						/*take larger side and compute ratio*/
						if( aImage.width < aImage.height )
						{
							lScaleFactor = maxImageSize / aImage.height;
						}else if ( aImage.widht > aImage.height )
						{
							lScaleFactor = maxImageSize / aImage.width;
						}else
						{//in that case the image is square
							lScaleFactor = maxImageSize / aImage.width;
						}
						//set new Image size:
						var lOffScreenCanvas = document.createElement('canvas');
						lOffScreenCanvas.width = aImage.width * lScaleFactor;
						lOffScreenCanvas.height = aImage.height * lScaleFactor;
						var offscreenCtx = lOffScreenCanvas.getContext('2d');
						offscreenCtx.drawImage(aImage, 0, 0, lOffScreenCanvas.width,lOffScreenCanvas.height);
						aImage = new Image();
						aImage.src = lOffScreenCanvas.toDataURL();
						return aImage;	
	};
	$.fit2Screen = function (aImage2)
	{
			var ultimoRatio, lNewWidth, lNewHeight;
						lWidth = aImage2.width;
						lHeight = aImage2.height;

						if( aImage2.width > aImage2.height )
						{
							lNewHeight = (aImage2.height / aImage2.width ) * maxScreenHeight;
							lNewWidth = maxScreenWidth;
							ultimoRatio = lNewWidth / aImage2.width;
						}
						else if( aImage2.width < aImage2.height )
						{
							lNewHeight = maxScreenHeight;
							lNewWidth = (maxScreenHeight / aImage2.height ) * aImage2.width;
							ultimoRatio = lNewWidth / aImage2.width;
						}
						else
						{
							lNewWidth = maxScreenWidth;
							lNewHeight = maxScreenHeight;
							//TODO proof!
							ultimoRatio = lNewWidth / aImage2.width;
						}
						return ultimoRatio;
	};
}
)(jQuery);