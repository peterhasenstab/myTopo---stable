//var Photos = new Meteor.Collection("photos");
var Topos = new Meteor.Collection("topos");

if(Meteor.isServer) {
	/*Meteor.publish("photos", function() {
        return Photos.find({});
    });
	*/
	Meteor.publish("topos", function() {
        return Topos.find({});
    });
	
	Meteor.users.allow({update: function () { return true; }});
	Meteor.publish("userData", function () {
	  if (this.userId) {
	    return Meteor.users.find({});
	  } else {
	    this.ready();
	  }
	});
}

if (Meteor.isClient) {
	var currentTopo;
	var data = new Array();
	var i = 0;
	var mCanvas = new Canvas(0,0);
	var selectedMarkerId = new Blaze.ReactiveVar(null);
	var contentSize = new Blaze.ReactiveVar(null);
	var currentSliderVal = new Blaze.ReactiveVar(null);
	var curIsBoulderVal = new Blaze.ReactiveVar(null);
	var curDifficultyVal = new Blaze.ReactiveVar(null);
	var curDifficultyScaleName = new Blaze.ReactiveVar(null);
  Deps.autorun(function () {
		curDifficultyVal.set(Session.get("curDifficultyVal"));
		curDifficultyScaleName.set(Session.get("curDifficultyScaleName"));
		selectedMarkerId.set(Session.get("currentPhoto"));
		contentSize.set({x: $("#content").width(), y: $("#content").height()});
		Meteor.subscribe("topos");
		Meteor.subscribe("userData");
    });
	
	

  Tracker.autorun(function () {
    if (Reload.isWaitingForResume()) {
      alert("Close and reopen this app to get the new version!");
    }
  });
  

  var upSertTopo = function (aCurrentTopo)
	{	
		var cbFunction = function(error, result){
		console.log("upsert callback!");
		if( error ){console.log( error );}
		if( result ){
			console.log( "Insert of _id: " + result + " successful");
			console.log(Session.get("currentTopo"));
			console.log(result);
			Session.set("currentTopoName", "topodetail");

		}};
			Topos.upsert(Session.get("currentTopo"),{$set:{ 
				name: aCurrentTopo.getName(), 
				gps: aCurrentTopo.getGPS(), 
				difficulty: aCurrentTopo.getDifficulty(), 
				description: aCurrentTopo.getDescription(), 
				route: aCurrentTopo.getRoute(), 
				comments: aCurrentTopo.getComments(), 
				isboulder: aCurrentTopo.getIsBoulder(),
				imgDrawingResolution: aCurrentTopo.getDrawingResolution(),
				imageResolution: aCurrentTopo.getImageResolution(),
				createdAt: new Date(),
				marker: {
						lat: aCurrentTopo.getGPS().lat,
						lng: aCurrentTopo.getGPS().lng,
						infoWindowContent: "<a href='/topodetail/" + Session.get("currentTopo") + "' ><img src='" + aCurrentTopo.getThumb().src + "' /></br>"+aCurrentTopo.getName()+"("+ aCurrentTopo.getDifficulty().difficultyvalue+")</a>"
				}
			}}, function(error, result){cbFunction(error,result);});
		return null;
	};
 var insertTopo = function (aCurrentTopo)
	{	
		var cbFunction = function(error, result){
		if( error ) console.log( error );
		if( result ){
		console.log(result);
			console.log( "Insert of _id: " + result + " successful");
			Session.set("currentTopo", result);
			Session.set("currentTopoName", "topodetail");
			return result;
		}};
		console.log("Session_CurrentPhoto: "+Session.get("currentPhoto"));
			Topos.insert({ 
				name: aCurrentTopo.getName(), 
				//imageid: aCurrentTopo.getImageId(), 
				gps: aCurrentTopo.getGPS(), 
				difficulty: aCurrentTopo.getDifficulty(), 
				description: aCurrentTopo.getDescription(), 
				route: aCurrentTopo.getRoute(), 
				comments: aCurrentTopo.getComments(), 
				isboulder: aCurrentTopo.getIsBoulder(),
				imgDrawingResolution: aCurrentTopo.getDrawingResolution(),
				createdAt: new Date() 
			}, function(error, result){cbFunction(error,result);});
		return null;
	};
 
 
  var onSuccess = function () {
    var latLng ;//= Geolocation.latLng();
    if (!latLng) {latLng = currentTopo.getGPS();}
	var lImage = currentTopo.getRenderImage().src;
	var lThumb = currentTopo.getThumb().src;
	Topos.insert({
      image: lImage,
	  thumb: lThumb,
	  owner: Meteor.userId(),
	  username: Meteor.user().username
    }, function(error, result){
		if( error ) console.log( error );
		if( result ){
			currentTopo.setImageId(result);
			Session.set("currentTopo",result);
			Session.set("currentPhoto",result);
			console.log( "Insert of _id: " + currentTopo.getImageId() + " successful");
		}
	});
  };
			
	var takePicture = function(){
		currentTopo = new Topo();
		currentTopo.calcLocation();
		$('#PhotoPicker').trigger('click');
		return false;
	};
	
		
	Template.layout.events({
		"change #PhotoPicker": function(event, template) {
			event.preventDefault();
			currentTopo.loadImage(event, null,onSuccess);	
		}
	});

	var markPoint = function(event) {
	  var offset = $('#canvas').offset();
	  var dot = {
		  _id: ++i,
		  x: (event.pageX - offset.left),
		  y: (event.pageY - offset.top)};
		  currentTopo.addDotToStroke(dot);
		  currentTopo.getCanvas().draw(dot);
	};
	
	Template.topodraw.events({
		'click': function (event){
			if(Session.get("drawallowed")==="true"){
				event.preventDefault();
				}
		},		
		'touchstart': function (event){
			if(Session.get("drawallowed")==="true"){
				event.preventDefault();
				Session.set('draw', true);
				currentTopo.startStroke();
			}
		},
		'touchmove': function (event) {
			event.preventDefault();
			if(Session.get("drawallowed")==="true"){
				if (Session.get('draw')) {
					markPoint(event.originalEvent.touches[0]);
				}
			}
		},
		'touchend': function(event){
			if(Session.get("drawallowed")==="true"){
				event.preventDefault();
				Session.set('draw', false);
				currentTopo.saveStroke();
			}
		},
		'mousedown': function (event) {
			if(Session.get("drawallowed")==="true"){
				Session.set('draw', true);
				currentTopo.startStroke();
			}
		},
		'mouseup': function (event) {
			if(Session.get("drawallowed")==="true"){
				Session.set('draw', false);
				currentTopo.saveStroke();
			}
		},
		'mousemove': function (event) {
			if(Session.get("drawallowed")==="true"){
				if (Session.get('draw')) {
					markPoint(event);
				}
			}
		}
	});
	Template.topodetailheader.events({
		"click #backtofavbutton": function () {
			Router.go("/fav");
		},
		"click #addtofavbutton": function () {
			Meteor.users.update(Meteor.userId(), {$addToSet: {favorites:  Session.get("currentTopo")}});
		}
	});
	Template.editImageheader.events({
		"click #drawDoneButton": function () {
			if( !currentTopo.getGPS()){
				alert("Please allow / activate your browser-location!");
			}
			currentTopo.calcLocation();
			if(currentTopo.getRoute()){
				currentTopo.setDrawingResolution();
				currentTopo.setImageResolution();
				Session.set("currentHeaderName","edittopoheader");
				Session.set("currentTopoName","topoeditform");
			}else{
				alert("draw a route first");
			}
		},	
		"click #replyStrokeButton": function(){ 
			if( currentTopo.getRoute().length > 0 ){
				currentTopo.removeLastStroke();
			}else{
				$("#myTabs").removeClass("tabs-item-hide");
//				Session.set("currentTopoName","topoimage");
//				Session.set("currentHeaderName","defaultHeader");
				currentTopo.clearCanvas();
				currentTopo = new Topo();
				Router.go("/topo");
			}
		}
	});
	
	Template.edittopoheader.events({
		"click #editTopoDoneButton": function () {				
			$("#topoform").trigger("submit");
			return false;			
		}
	});
	Template.topoeditform.events({
		"click #saveTopoButton": function(){
			$("#topoform").trigger("submit");
			return false;
		},
		"change #isbouldercheckbox": function (){
			curIsBoulderVal.set($("#isbouldercheckbox").is(':checked()'));
			$("#difficultyslider").val(0);
			var lDifficulty = $.getDifficulty($("#difficultyslider").val(),curIsBoulderVal.curValue);
			Session.set("curDifficultyVal",lDifficulty.difficultyvalue);
			Session.set("curDifficultyScaleName",lDifficulty.difficultyscalename);
		},
		"submit #topoform": function(){
			var lInputArray = $("#topoform").serializeArray();
			if( !$('[name="mName"]').val() ){
				$('[name="mName"]').focus();
				$('[name="mName"]').css({'background-color' : '#FF5050'})
			}else{
				if (currentTopo.saveTopoData(lInputArray) ){
					$("#myTabs").removeClass("tabs-item-hide");
					upSertTopo(currentTopo);
					Router.go("/topodetail/"+Session.get("currentTopo"));
				}
			}
			return false;
		}
	});
	Template.topodetail.events({
		"click #postcommentbutton": function(){
			Topos.update(this._id,{$push: {comments: {username:  Meteor.user().username, comment: $("#currrentcomment").val()} }});
			$("#currrentcomment").val('');
			Router.go("/topodetail/"+this._id);
			return false;
		}
	});
	Template.ownTopos.events({
		"click #deletetopobutton": function () {
			Topos.remove(this._id);
		}
	});
	Template.topodifficulty.events({
		"mousedown #difficultyslider": function(){
			Session.set("slideractive","true");
		},
		"mouseup #difficultyslider": function(){
			Session.set("slideractive","false");
		},
		"touchstart #difficultyslider": function(){
			Session.set("slideractive","true");
		},
		"touchend #difficultyslider": function(){
			Session.set("slideractive","false");	
		},
		"mousemove #difficultyslider": function () {
			if(Session.get("slideractive")==="true"){
				var lDifficulty = $.getDifficulty($("#difficultyslider").val(),curIsBoulderVal.curValue);
				Session.set("curDifficultyVal",lDifficulty.difficultyvalue);
				Session.set("curDifficultyScaleName",lDifficulty.difficultyscalename);
			}
		},
		"touchmove #difficultyslider": function () {
			if(Session.get("slideractive")==="true"){
				var lDifficulty = $.getDifficulty($("#difficultyslider").val(),curIsBoulderVal.curValue);
				Session.set("curDifficultyVal",lDifficulty.difficultyvalue);
				Session.set("curDifficultyScaleName",lDifficulty.difficultyscalename);
			}
		}
	});

	Template.topoimage.events({
		"click #takePictureButton": function(){
			$("#myTabs").addClass("tabs-item-hide");
			Session.set("currentTopoName","topodraw");
			Session.set("currentHeaderName","editImageheader");
			takePicture();
			Session.set("drawallowed","true");
		}
	});
	
	Template.map.helpers({
	markers: Topos.find(),
	//		markers: Photos.find(),
		selectedMarkerId: selectedMarkerId
	});


	Template.layout.helpers({
		onPage: function (pageName) {
			//Router.current().route.name;
		  return Session.get("siteName") === pageName;
		},
		dynamicHeader: function(){
			return Template[Session.get("currentHeaderName")];
		}
	});
	Template.topodetail.rendered = function(){
		contentSize.set({x: $("#content").width(), y: $("#content").height()});
	};
	Template.topoeditform.helpers({
		difficulty: function(){
			lDifficulty = {
				difficultyvalue:  Session.get("curDifficultyVal"),
				difficultyscalename:	Session.get("curDifficultyScaleName")
				}				
			return lDifficulty;
		}
	});
	Template.topo.helpers({
		dynamicTopoTemplate: function (){
			return Template[Session.get("currentTopoName")];
		}
	});
	var mDetailCanvas;
	var drawRouteOnDetail = function (aRoute, aImageSrc,aImageResolution, aDrawingResolution){
		mDetailCanvas = new Canvas(0,0, "myDiv");
		var lImageRatio =  $.getScale4ScreenSize(contentSize, aImageResolution);
		var lCanvasRatio = ((aImageResolution.width *lImageRatio)/aDrawingResolution.width);
		mDetailCanvas.setWidth(aImageResolution.width *lImageRatio);
		mDetailCanvas.setHeight(aImageResolution.height * lImageRatio);
		mDetailCanvas.setBackground(aImageSrc);
		$.each(aRoute, function(ind, val){
			var lhelp = $.resizeDrawing(aRoute[ind], lCanvasRatio);		
			mDetailCanvas.draw(lhelp);
		});
	};
	
	Template.topodetail.helpers({
		topo: function (){
			var lTopo = Topos.find({_id: Session.get("currentTopo")}).fetch()[0];
			if(lTopo){
				if(!currentTopo){
					console.log("make a new Topo object");
					//vll. generell currentTopo löschen bevor hier neue geladen werden?
					currentTopo = new Topo();
				}
					currentTopo.setTopoCollectionToObject(lTopo);
					console.log(lTopo);
//								drawRouteOnDetail(lTopo.route,lTopo.image, lTopo.imageResolution, lTopo.imgDrawingResolution);
//								drawRouteOnDetail(currentTopo.getRoute(),currentTopo.getImage(), currentTopo.getImageResolution(), currentTopo.getImgDrawingResolution());
				return lTopo;
			}
		}
	});	
	Template.topocanvas.rendered = function (){
			if( currentTopo ){
				drawRouteOnDetail(currentTopo.getRoute(),currentTopo.getImage().src, currentTopo.getDrawingResolution(), currentTopo.getDrawingResolution());
			}
	};

	Template.topofavorites.helpers({
		favorites: function(){
			var lTopoIdArray = Meteor.users.find({_id: Meteor.userId()},{"favorites": 1}).fetch()[0];	
			if(lTopoIdArray.favorites)
			{
				return Topos.find({_id: {$in: lTopoIdArray.favorites}},{sort: {"createdAt": -1}});
			}
		}
	});
	Template.ownTopos.helpers({
		topos: function(){
			return Topos.find({"owner": Meteor.userId()}, {sort: {"createdAt": -1}});
		}
	});
	Template.fav.helpers({
	topos: function () {
			return Topos.find({}, {sort: {"createdAt": -1}});
		}
	});
	
	
	Accounts.ui.config({
	  passwordSignupFields: "USERNAME_ONLY"
	});
}