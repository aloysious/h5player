/*! h5player - v1.0 - 2013-12-02 9:10:51 PM
* Copyright (c) 2013 shouzuo; Licensed  */
KISSY.add("gallery/h5player/1.0/index",function(a,b,c,d,e,f,g){"use strict";function h(a,b){return this instanceof h?(this.id=a,this.con=e.one(a),h.superclass.constructor.call(this,b),this.init(),void 0):new h(a,b)}h.ATTRS={preload:{value:!1},autoplay:{value:!1},loop:{value:!1},controls:{value:null},width:{value:"auto"},height:{value:200},playlist:{value:[]},source:{value:null},playlistIndex:{value:0},defaultSkin:{value:"dev-default-skin"}};var i={LOAD_START:"loadstart",SUSPEND:"suspend",ABORT:"abort",ERROR:"error",EMPTIED:"emptied",STALLED:"stalled",LOADED_METADATA:"loadedmetadata",LOADED_DATA:"loadeddata",CAN_PLAY:"canplay",CAN_PLAY_THROUGH:"canplaythrough",PLAYING:"playing",WAITING:"waiting",SEEKING:"seeking",SEEKED:"seeked",ENDED:"ended",DURATION_CHANGE:"durationchange",TIME_UPDATE:"timeupdate",PROGRESS:"progress",PLAY:"play",PAUSE:"pause",RATE_CHANGE:"ratechange",VOLUME_CHANGE:"volumechange",FULLSCREEN_CHANGE:"fullscreenchange",LOADED_TEXT_TRACK:"loadedtexttrack",ERROR_TEXT_TRACK:"errortexttrack"};return a.extend(h,b,{init:function(){this.controls=this.get("controls"),this.playlist=this.get("playlist"),this.playlistIndex=this.get("playlistIndex"),this.textTracklist=[],this.textTracklistIndex=-1,this.render()},destory:function(){},render:function(){this.renderUI(),this.bindUI()},renderUI:function(){this.con.addClass(this.get("defaultSkin")),this.con.css({width:this.get("width"),height:this.get("height")}),this._createVideoTag(),null!==this.controls&&"default"!==this.controls&&this._createControlsPanel()},bindUI:function(){var b=this,d=[];a.each(i,function(a){d.push(a)}),a.each(d,function(a){c.on(b.videoTag,a,function(c){b.fire(a,{rawEvent:c})})}),this.on(i.FULLSCREEN_CHANGE,function(){b.isFullScreen?b.con.addClass("dev-fullscreen"):b.con.removeClass("dev-fullscreen")}),this.on(i.ENDED,function(){b.playlist.length>0&&b.get("loop")!==!0&&b.nextVideo()}),this.on(i.LOADED_METADATA,function(){var c=this.playlist[this.playlistIndex];b.loadTextTracklist(a.isArray(c.textTracks)?c.textTracks:[])}),c.on(this.con,"click",function(){b.hasCustomedControls()&&(b.isControlsShown()?b.hideControls():b.activeControls())}),c.on(this.con,"touchmove",function(){b.hasCustomedControls()&&b.activeControls()})},_createVideoTag:function(){var a=this.con.one("video");if(!a){var b=this.playlist.length>0?this.playlist[this.playlistIndex]:this.get("source")?this.get("source"):{},c="default"===this.controls?!0:!1,e=d.create("<video>",{src:b.src||"",poster:b.poster||"",preload:this.get("preload"),autoplay:this.get("autoplay"),loop:this.get("loop"),controls:c,width:"100%",height:"100%"});this.con.append(e),a=this.con.one("video")}this.videoTag=a.getDOMNode()},_createControlsPanel:function(){this.controlsPanel=new f(this.id,this,this.controls),this.activeControls()},_supportFullscreen:function(){var a,b,c;return c=d.create("<div></div>"),b={},void 0!==c.cancelFullscreen?(b.requestFn="requestFullscreen",b.cancelFn="cancelFullscreen",b.eventName="fullscreenchange",b.isFullScreen="fullScreen"):(document.mozCancelFullScreen?(a="moz",b.isFullScreen=a+"FullScreen"):(a="webkit",b.isFullScreen=a+"IsFullScreen"),c[a+"RequestFullScreen"]&&(b.requestFn=a+"RequestFullScreen",b.cancelFn=a+"CancelFullScreen"),b.eventName=a+"fullscreenchange"),document[b.cancelFn]?b:null}(),_enterFullWindow:function(){},_exitFullWindow:function(){},loadById:function(){},loadByUrl:function(a){this.videoTag.src=a,this.videoTag.load()},loadPlaylist:function(a,b){this.playlist=a,this.playlistIndex=b,this.playVideoAt(this.playlistIndex)},loadTextTrackAt:function(a){this.textTrackControl.load(a)},loadTextTracklist:function(a){this.textTracklist=a,this.textTrackControl?this.textTrackControl.setTextTracklist(a):this.textTrackControl=new g(this.id,this,{textTracklist:this.textTracklist}),this.textTrackControl.load()},play:function(){this.videoTag.play()},pause:function(){this.videoTag.pause()},paused:function(){return this.videoTag.paused},stop:function(){},seekTo:function(a){this.videoTag.currentTime=a},nextVideo:function(){return this.playlistIndex<this.playlist.length-1?this.playVideoAt(++this.playlistIndex):!1},prevVideo:function(){return this.playlistIndex>0?this.playVideoAt(--this.playlistIndex):!1},playVideoAt:function(a){var b=this.playlist[a];return b?(this.setPoster(b.poster),this.loadByUrl(b.src),!0):!1},mute:function(){this.videoTag.muted=!0},unmute:function(){this.videoTag.muted=!1},isMuted:function(){return this.videoTag.muted},setVolume:function(a){this.videoTag.volume=a},getVolume:function(){return this.videoTag.volume},setPlaybackRate:function(a){this.videoTag.playbackRate=a},getPlaybackRate:function(){return this.videoTag.playbackRate},setPoster:function(a){this.videoTag.poster=a},requestFullScreen:function(){var a=this._supportFullscreen,b=this.con.getDOMNode(),d=this;this.isFullScreen=!0,a?(c.on(document,a.eventName,function(){d.isFullScreen=document[a.isFullScreen],d.isFullScreen===!1&&c.detach(document,a.eventName),d.fire(i.FULLSCREEN_CHANGE)}),b[a.requestFn]()):(this._enterFullWindow(),this.fire(i.FULLSCREEN_CHANGE))},cancelFullScreen:function(){var a=this._supportFullscreen;this.isFullScreen=!1,a?document[a.cancelFn]():(this._exitFullWindow(),this.fire(i.FULLSCREEN_CHANGE))},getIsFullScreen:function(){return this.isFullScreen},hasCustomedControls:function(){return!!this.controlsPanel},isControlsShown:function(){return this.controlsPanel&&this.controlsPanel.isShown()},showControls:function(){this.controlsPanel&&this.controlsPanel.show()},hideControls:function(){this.controlsPanel&&this.controlsPanel.hide()},activeControls:function(){var a=this;this.controlsTimeout&&clearTimeout(this.controlsTimeout),this.showControls(),this.controlsTimeout=setTimeout(function(){a.hideControls()},3e3)},deactiveControls:function(){this.controlsTimeout&&clearTimeout(this.controlsTimeout)},hideTextTrackControl:function(){this.textTrackControl.hide()},showTextTrackControl:function(){this.textTrackControl.show()},getCurrentTime:function(){return this.videoTag.currentTime},getDuration:function(){return this.videoTag.duration},getBuffered:function(){return this.videoTag.buffered},setPlaybackQuality:function(){},getPlaybackQuality:function(){},getPlaylist:function(){return this.playlist},getPlaylistIndex:function(){return this.playlistIndex},getTracklist:function(){return this.textTracklist},getTracklistIndex:function(){return this.textTracklistIndex},setTracklistIndex:function(a){return this.textTracklistIndex=a}}),h},{requires:["base","event","dom","node","gallery/gallery/h5player/1.0/controls/controlspanel","gallery/gallery/h5player/1.0/tracks/index","./index.css"]});