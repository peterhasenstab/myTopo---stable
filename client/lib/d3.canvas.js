Canvas = function (aWidth, aHeight, aDomElement) {
  var self = this;
  var svg;
  var mWidth = aWidth;
  var mHeight = aHeight;
  var mRadius = 2;
  var mColor = "red";
  var mDomElement = "canvas";

  var createSvg = function() {
	if(aDomElement){
		mDomElement = aDomElement;
	}else{
		mDomElement = "canvas";
	}
    svg = d3.select('#'+mDomElement).append('svg')
      .attr('width', mWidth)
      .attr('height', mHeight)
	 // .style("border", "5px solid red")
	  .style("margin", "auto");
  };
  createSvg();
  
  
  
  self.getHeight = function ()
  {
	return mHeight;
  };
  
  self.getWidth = function ()
  {
	return mWidth;
  };
  self.clear = function() {
    d3.select('svg').remove();
    createSvg();
  };
  
  self.clearStrokes = function(){
	svg.selectAll("path").remove();
	svg.selectAll("circle").remove();
  };

  self.setWidth = function(width){
	mWidth = width;
	d3.select('svg').attr('width', mWidth+"px");
  };
  self.setHeight = function(height){
	mHeight = height
	d3.select('svg').attr('height', mHeight+"px");
  };
  
  	var lineFunction = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("linear");
	
	self.draw = function(data) {
	if(data){
		if (data.length < 1) {
		// wenn das drin ist, verschwindet das bild bei einem click 
		//könnte sein, dass dies jedoch verhindert, dass bei einem
		//neuen Versuch das Bild sich alte daten (zeichnung) behält.
		//TODO: beobachten
		//  self.clear();
		  return;
		}
		if(svg){
			svg.append("path")
				.attr("d", lineFunction(data))
				.attr("stroke", mColor)
				.attr("stroke-width", mRadius)
				.attr("fill", "none");
		}
	//	console.log("drawingsvg: ");console.log(svg);
	}};
	self.clearBackground = function (){
		svg.selectAll("defs").remove();
		svg.selectAll("image").remove();
		svg.selectAll("rect").remove();
	};
	self.setBackground = function (aImageSrc)
	{
		d3.select('svg').append("defs").append("pattern")
		.attr("id", "bgPattern")
		.attr("patternUnits","userSpaceOnUse")
		.attr("width",d3.select('svg').style("width"))
		.attr("height", d3.select('svg').style("height"));
		
		d3.select('pattern').append("image")
		.attr("xlink:href",aImageSrc)
		.attr("width",d3.select('svg').style("width"))
		.attr("height", d3.select('svg').style("height"));
		
		d3.select('svg').append("rect")
		.attr("id","bgroundrect")
		.attr("width",d3.select('svg').style("width"))
		.attr("height",d3.select('svg').style("height"))
		.attr("fill","url(#bgPattern)");
	};
};
(function($) {
	$.resizeDrawing = function (aCoordinateArray, aRatio){
		var lRatio =aRatio;//= contentSize.curValue.x / aDrawingResolution.x;
		var lCoordinateArray = new Array();
		
		//TODO: [0]<--Correct?
		$.each(aCoordinateArray, function(ind, val){
			lCoordinateArray[ind] = {
				"_id": val._id,
				"x": (val.x * lRatio),
				"y": (val.y * lRatio)
			}
		});
		return lCoordinateArray;
	};
})(jQuery);




	/*$.getSvgOfCoordinateArray = function( aCoordinateArray, aImgDrawingResoultion, aDomId, aImageSrc) {
		
		if( d3.select('svg') ){
			console.log("remove!!!");
			d3.select('svg').remove();
		}
		var svg = d3.select('#'+aDomId).append('svg')
			.attr('width', $("#content").width())
			.attr('height', $("#content").height());
			//.attr('opacity',1.0);
		var lColor = "red";
		var lRadius = 2;
		var lCoordinateArray = new Array();
		var lRatio = $("#content").width() / aImgDrawingResoultion.x;
		$.each(aCoordinateArray[0], function(ind, val){
			lCoordinateArray[ind] = {
				"_id": val._id,
				"x": (val.x * lRatio),
				"y": (val.y * lRatio)
			}
		});
		var lineFunction = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("linear");
		if(svg){
				setBackground(aImageSrc);
				svg.append("path")
					.attr("d", lineFunction(lCoordinateArray))
					.attr("stroke", lColor)
					.attr("stroke-width", lRadius)
					//.attr("stroke-opacity",1.0)
					.attr("fill", "none");
		}
		var bvg = d3.select('#'+aDomId).append('div')
		var lTestVar = $("#"+aDomId).clone().wrap('<svg>').parent().html();
		console.log(lTestVar);
	};
	var	setBackground = function (aImageSrc)
	{
		d3.select('svg').append("defs").append("pattern")
		.attr("id", "bgPattern")
		.attr("patternUnits","userSpaceOnUse")
		.attr("width",d3.select('svg').style("width"))
		.attr("height", d3.select('svg').style("height"));
		
		d3.select('pattern').append("image")
		.attr("xlink:href",aImageSrc)
		.attr("width",d3.select('svg').style("width"))
		.attr("height", d3.select('svg').style("height"));
		
		d3.select('svg').append("rect")
		.attr("id","bgroundrect")
		.attr("width",d3.select('svg').style("width"))
		.attr("height",d3.select('svg').style("height"))
		.attr("fill","url(#bgPattern)");
	};*/