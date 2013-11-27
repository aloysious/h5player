/**
 * @fileoverview 设置静音按钮模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE) {

	"use strict";

	function MuteToggle(con, player, cfg) {
		if (this instanceof MuteToggle) {

			this.con = con;
			this.player = player;

			MuteToggle.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new MuteToggle(con, player, cfg);
		}
	}

	MuteToggle.ATTRS = {
		className: {
			value: 'dev-control-mute'
		},

		innerHTML: {
			value: '<div class="dev-control-content"><div class="iconfont" data-status="mute">&#13442</div></div>'
		}
	}

	S.extend(MuteToggle, S.Base, {

		init: function() {
			// your code here
			this.renderUI();
			this.bindUI();
		},
		
		destory: function(){
			
		},

		renderUI: function() {
			var muteToggleDom = DOM.create('<div class="' + this.get('className') + '">' + this.get('innerHTML') + '</div>');
			this.con.append(muteToggleDom);
			this.node = this.con.one('.' + this.get('className'));

			this._onVolumeChange();
		},

		bindUI: function() {
			EVENT.on(this.node, 'click', this._onMuteToggle, this);
			
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('volumechange', this._onVolumeChange, this);
		},

		_onMuteToggle: function(e) {
			e.halt();

			if (this.player.isMuted()) {
				this.player.unmute();

			} else {
				this.player.mute();
			}
		},

		_onVolumeChange: function() {
			if (this.player.isMuted()) {
				this.node.removeClass('dev-unmute');
				this.node.addClass('dev-mute');
				this.node.one('.dev-control-content').html('<div class="iconfont" data-status="unmute">&#13442</div>');
			
			} else {
				this.node.removeClass('dev-mute');
				this.node.addClass('dev-unmute');
				this.node.one('.dev-control-content').html('<div class="iconfont" data-status="mute">&#13442</div>');
			}
		}
	});

	return MuteToggle;

}, {
	requires: ['base', 'event', 'dom', 'node']
});
