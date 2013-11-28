/**
   @fileoverview 音量控制模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE) {

	"use strict";

	function Volume(con, player, cfg) {
		if (this instanceof Volume) {

			this.con = con;
			this.player = player;

			Volume.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new Volume(con, player, cfg);
		}
	}

	Volume.ATTRS = {
		className: {
			value: 'dev-control-volume'
		},

		innerHTML: {
			value: '<div class="dev-volume-wrap">' + 
						'<div class="dev-volume-current"></div>' + 
				   '</div>'
		}
	}

	S.extend(Volume, S.Base, {

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
			this.currVolNode = this.node.one('.dev-volume-current');
		},

		bindUI: function() {
			EVENT.on(this.node, 'mousedown', this._onMouseDown, this);
			EVENT.on(this.node, 'touchstart', this._onMouseDown, this);
			
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('volumechange', this._onVolumeChange, this);
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
			
			// 结束拖动时，允许控制面板隐藏
			this.player.activeControls();
		},

		_onMouseMove: function(e) {
			e.halt();

			var pageX = e.touches? e.touches[0].pageX: e.pageX,
				distance = pageX - this.node.offset().left,
				width = this.node.width(),
				vol = distance / width;
			
			// 拖动时，控制面板禁止隐藏
			this.player.deactiveControls();

			vol = vol < 0? 0: (vol > 1? 1: vol);

			this.player.setVolume(vol);
			if (this.player.isMuted()) {
				this.player.unmute();
			}

		},

		_onVolumeChange: function(e) {
			var width;

			if (this.player.isMuted()) {
				width = 0;
			} else {
				width = (this.player.getVolume() * 100) + '%';
			}

			this.currVolNode.css({
				width: width
			});
		}

	});

	return Volume;

}, {
	requires: ['base', 'event', 'dom', 'node']
});
