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
			value: '<div class="dev-control-content"><div class="iconfont" data-status="play">&#13786</div></div>'
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
			var that = this;

			EVENT.on(this.node, 'click', this._onPlayToggle, this);

			/*
			if (this.get('hasTip')) {
				EVENT.on(this.node, 'mousemove', function(e) {
					var content = that.node.hasClass('dev-playing')? '暂停': '播放';
					Tip.show(content, e.pageX, e.pageY);
				});
				EVENT.on(this.node, 'mouseout', function() {
					Tip.hide();
				});
			}
			*/
			
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('play', this._onPlay, this);
			this.player.on('pause', this._onPause, this);
		},

		_onPlayToggle: function(e) {
			e.halt();

			if (this.player.paused()) {
				this.player.play();
			} else {
				this.player.pause();
			}
		},

		_onPlay: function() {
			this.node.removeClass('dev-paused');
			this.node.addClass('dev-playing');
			this.node.one('.dev-control-content').html('<div class="iconfont" data-status="pause">&#13743</div>');
		},

		_onPause: function() {
			this.node.removeClass('dev-playing');
			this.node.addClass('dev-paused');
			this.node.one('.dev-control-content').html('<div class="iconfont" data-status="play">&#13786</div>');
		}
	});

	return PlayToggle;

}, {
	requires: ['base', 'event', 'dom', 'node']
});
