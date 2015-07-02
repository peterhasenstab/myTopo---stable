Router.map(function() {
  this.route('map', {
    path: '/',
    data: function () {
      Session.set("currentPhoto", null);
	  Session.set("currentHeaderName","defaultHeader");
	  Session.set("siteName","map");
    }
  });
  this.route("mapWithPhoto", {
    template: "map",
    path: 'map/:_id',
    data: function () {
      Session.set("currentPhoto", this.params._id);
	  Session.set("currentHeaderName","defaultHeader");
	  Session.set("siteName","map");
	  }
  });
  this.route("topodetail", {
    template: "topodetail",
    path: 'topodetail/:_id',
    data: function () {
	  Session.set("currentTopoName", "topodetail");
	  Session.set("currentTopo", this.params._id);
	  Session.set("currentHeaderName","topodetailheader");
	  Session.set("siteName","topodetail");
	  }
  });  
  this.route("fav",{
	path: '/fav',
	data: function (){
		Session.set("currentHeaderName", "defaultHeader");
		Session.set("siteName","fav");
	}
  });
  this.route("topo",{
	path: '/topo',
	data: function(){
		Session.set("currentTopoName", "topoimage");
		Session.set("currentHeaderName","defaultHeader");
		  Session.set("siteName","topo");
	}
  });
});

Router.configure({
  layoutTemplate: "layout"
});