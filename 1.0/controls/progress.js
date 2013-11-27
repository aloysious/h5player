/**
   @fileoverview 进度条模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE, Tip) {

	"use strict";

	function Progress(con, player, cfg) {
		if (this instanceof Progress) {

			this.con = con;
			this.player = player;

			Progress.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new Progress(con, player, cfg);
		}
	}

	Progress.ATTRS = {
		className: {
			value: 'dev-control-progress'
		},

		innerHTML: {
			value: '<div class="dev-progress-wrap">' + 
				   		'<div class="dev-progress-loaded"></div>' + 
						'<div class="dev-progress-played"></div>' + 
				   '</div>'
		}
	}

	S.extend(Progress, S.Base, {

		init: function() {
			// your code here
			this.renderUI();
			this.bindUI();
		},
		
		destory: function(){
			
		},

		renderUI: function() {
			var progressDom = DOM.create('<div class="' + this.get('className') + '">' + this.get('innerHTML') + '</div>');
			this.con.append(progressDom);
			this.node = this.con.one('.' + this.get('className'));
			this.loadedNode = this.node.one('.dev-progress-loaded');
			this.playedNode = this.node.one('.dev-progress-played');
		},

		bindUI: function() {
			EVENT.on(this.node, 'mousedown', this._onMouseDown, this);
			EVENT.on(this.node, 'touchstart', this._onMouseDown, this);


			EVENT.on(this.node, 'mousemove', function(e) {
				var distance = e.pageX - this.node.offset().left,
					width = this.node.width(),
					sec = (this.player.getDuration()) ? distance / width * this.player.getDuration(): 0,
					currSrc = this.player.getPlaylist()[this.player.getPlaylistIndex()];
				
				if (currSrc && currSrc.story) {
					this.story = currSrc.story;
					var content = this._getStoryAt(sec);
					Tip.update(content, e);
					Tip.show();
				}
			}, this);
			EVENT.on(this.node, 'mouseout', function(e) {
				Tip.hide();
			});

			
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('timeupdate', this._onTimeupdate, this);
			this.player.on('progress', this._onProgress, this);
		},

		_onMouseDown: function(e) {
			e.halt();
			EVENT.on(this.node, 'mousemove', this._onMouseMove, this);
			EVENT.on(this.node, 'mouseup', this._onMouseUp, this);
			EVENT.on(this.node, 'touchmove', this._onMouseMove, this);
			EVENT.on(this.node, 'touchend', this._onMouseUp, this);

			this._onMouseMove(e);
		},

		_onMouseUp: function(e) {
			e.halt();
			EVENT.detach(this.node, 'mousemove', this._onMouseMove, this);
			EVENT.detach(this.node, 'mouseup', this._onMouseUp, this);
			EVENT.detach(this.node, 'touchmove', this._onMouseMove, this);
			EVENT.detach(this.node, 'touchend', this._onMouseUp, this);

			Tip.hide();

			this.player.play();
		},

		_onMouseMove: function(e) {
			var distance = e.pageX - this.node.offset().left,
				width = this.node.width(),
				sec = (this.player.getDuration()) ? distance / width * this.player.getDuration(): 0;

			this.player.pause();
			this.player.seekTo(sec);
		},

		_onTimeupdate: function(e) {
			this.playedNode.css({
				width: (this._playedPercent() * 100) + '%'
			});
		},

		_playedPercent: function() {
			return (this.player.getDuration()) ? this.player.getCurrentTime() / this.player.getDuration(): 0;	
		},

		_onProgress: function(e) {
			this.loadedNode.css({
				width: (this._bufferedPercent() * 100) + '%'
			});	
		},

		_bufferedPercent: function() {
			return (this.player.getDuration()) ? this.player.getBuffered().end(0) / this.player.getDuration(): 0;	
		},

		/**
		 * TODO: 如何获取段数???
		 */
		_getStoryAt: function(sec) {
			var index = Math.floor(25 * sec / this.player.getDuration()),
				offsetY = Math.floor(index / 5) * 60,
				offsetX = (index % 5) * 80,
				styleHtml = 'background-image:url(' + this.story + ');' +
							'width:80px;' +
							'height:60px;' +
							'background-position:-' + offsetX + 'px -' + offsetY + 'px'

			var rtDom = '<div style="' + styleHtml + '"></div>';
			
			return rtDom;
		}
	});

	return Progress;

}, {
	requires: ['base', 'event', 'dom', 'node', '../utils/tip']
});
