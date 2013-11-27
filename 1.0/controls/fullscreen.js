/**
   @fileoverview 全屏按钮模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE) {

	"use strict";

	function Fullscreen(con, player, cfg) {
		if (this instanceof Fullscreen) {

			this.con = con;
			this.player = player;

			Fullscreen.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new Fullscreen(con, player, cfg);
		}
	}

	Fullscreen.ATTRS = {
		className: {
			value: 'dev-control-fullscreen'
		},

		innerHTML: {
			value: '<div class="dev-control-content"><div class="iconfont" data-status="fullscreen">&#13800</div></div>'
		}
	}

	S.extend(Fullscreen, S.Base, {

		init: function() {
			// your code here
			this.renderUI();
			this.bindUI();
		},
		
		destory: function(){
			
		},

		renderUI: function() {
			var fullscreenDom = DOM.create('<div class="' + this.get('className') + '">' + this.get('innerHTML') + '</div>');
			this.con.append(fullscreenDom);
			this.node = this.con.one('.' + this.get('className'));
		},

		bindUI: function() {
			EVENT.on(this.node, 'click', this._onFullscreen, this);
			
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('fullscreenchange', this._onFullscreenChange, this);
		},

		_onFullscreen: function(e) {
			e.halt();

			if (!this.player.getIsFullScreen()) {
				this.player.requestFullScreen();	
			} else {
				this.player.cancelFullScreen();
			}
		},

		_onFullscreenChange: function() {
			console.log(this.player.getIsFullScreen());
			if (!this.player.getIsFullScreen()) {
				this.node.removeClass('dev-non-fullscreen');
				this.node.addClass('dev-fullscreen');
				this.node.one('.dev-control-content').html('<div class="iconfont" data-status="fullscreen">&#13800</div>');
			
			} else {
				this.node.removeClass('dev-fullscreen');
				this.node.addClass('dev-non-fullscreen');
				this.node.one('.dev-control-content').html('<div class="iconfont" data-status="non-fullscreen">&#13796</div>');
			}
		}
	});

	return Fullscreen;

}, {
	requires: ['base', 'event', 'dom', 'node']
});
