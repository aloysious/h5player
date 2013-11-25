/**
   @fileoverview 时间进度显示模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE) {

	"use strict";

	function TimeDisplay(con, player, cfg) {
		if (this instanceof TimeDisplay) {

			this.con = con;
			this.player = player;

			TimeDisplay.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new TimeDisplay(con, player, cfg);
		}
	}

	TimeDisplay.ATTRS = {
		className: {
			value: 'dev-control-time'
		},

		innerHTML: {
			value: '<div class="dev-control-content"><span class="dev-current-time">00:00:00</span> / <span class="dev-duration">00:00:00</span></div>'
		}
	}

	S.extend(TimeDisplay, S.Base, {

		init: function() {
			// your code here
			this.renderUI();
			this.bindUI();
		},
		
		destory: function(){
			
		},

		renderUI: function() {
			var timeDisplayDom = DOM.create('<div class="' + this.get('className') + '">' + this.get('innerHTML') + '</div>');
			this.con.append(timeDisplayDom);
			this.node = this.con.one('.' + this.get('className'));
		},

		bindUI: function() {
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('durationchange', this._onDurationChange, this);
			this.player.on('timeupdate', this._onTimeUpdate, this);
		},

		_onDurationChange: function() {
			this.node.one('.dev-duration').html(this._formatTime(this.player.getDuration()));
		},

		_onTimeUpdate: function() {
			this.node.one('.dev-current-time').html(this._formatTime(this.player.getCurrentTime()));
		},

		_formatTime: function(seconds) {
			var raw = Math.round(seconds),
				hour, min, sec;

			hour = Math.floor(raw / 3600);
			raw = raw % 3600;
			min = Math.floor(raw / 60);
			sec = raw % 60;

			hour = hour > 10? hour: '0' + hour;
			min = min > 10? min: '0' + min;
			sec = sec > 10? sec: '0' + sec;

			return hour + ':' + min + ':' + sec;
		}

	});

	return TimeDisplay;

}, {
	requires: ['base', 'event', 'dom', 'node']
});
