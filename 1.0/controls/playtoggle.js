/**
   @fileoverview 播放按钮模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE) {

	"use strict";

	function PlayToggle(con, player, cfg) {
		if (this instanceof PlayToggle) {

			this.con = con;
			this.player = player;

			PlayToggle.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new PlayToggle(con, player, cfg);
		}
	}

	PlayToggle.ATTRS = {
		className: {
			value: 'dev-control-play'
		},

		innerHTML: {
			value: '<div class="dev-control-content">play</div>'
		}
	}

	S.extend(PlayToggle, S.Base, {

		init: function() {
			// your code here
			this.renderUI();
			this.bindUI();
		},
		
		destory: function(){
			
		},

		renderUI: function() {
			var playToggleDom = DOM.create('<div class="' + this.get('className') + '">' + this.get('innerHTML') + '</div>');
			this.con.append(playToggleDom);
			this.node = this.con.one('.' + this.get('className'));
		},

		bindUI: function() {
			EVENT.on(this.node, 'click', this._onPlayToggle, this);
			
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('play', this._onPlay, this);
			this.player.on('pause', this._onPause, this);
		},

		_onPlayToggle: function() {
			if (this.player.paused()) {
				this.player.play();
			} else {
				this.player.pause();
			}
		},

		_onPlay: function() {
			this.node.removeClass('dev-paused');
			this.node.addClass('dev-playing');
			this.node.one('.dev-control-content').html('pause');
		},

		_onPause: function() {
			this.node.removeClass('dev-playing');
			this.node.addClass('dev-paused');
			this.node.one('.dev-control-content').html('play');
		}
	});

	return PlayToggle;

}, {
	requires: ['base', 'event', 'dom', 'node']
});
