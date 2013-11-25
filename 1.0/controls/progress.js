/**
   @fileoverview 播放按钮模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE) {

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
						'<div class="dev-progress-pointer"></div>' +
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
			//EVENT.on(this.node, 'click', this._onPlayToggle, this);
			
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('timeupdate', this._onTimeupdate, this);
			this.player.on('progress', this._onProgress, this);
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
		}
	});

	return Progress;

}, {
	requires: ['base', 'event', 'dom', 'node']
});
