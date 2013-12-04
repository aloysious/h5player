/**
 * @fileoverview 播放器控制面板模块
 *               默认的基础功能有：播放按钮，时间进度，静音按钮，音量条，全屏按钮，进度条
 *               可以通过配置filters来屏蔽基本功能，配置plugins来扩展控制面板功能
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE, PlayToggle, TimeDisplay,  Progress, Volume, MuteToggle, Fullscreen) {

	"use strict";

	function Controls(id, player, cfg) {
		if (this instanceof Controls) {

			this.con = NODE.one(id);
			this.player = player;

			Controls.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new ControlsPanel(id, player, cfg);
		}
	}

	Controls.ATTRS = {
		
		// 屏蔽的基本功能列表，以内部模块名标识
		// 内部模块名有: 'playtoggle', 'timedisplay', 'progress', 'mutetoggle', 'volume', 'fullscreen'
		filters: {
			value: []
		},

		// 扩展功能列表，
		// 如扩展收藏功能：[{fn: Collect, cfg: {XXXXX}}]
		plugins: {
			value: []
		}
	};

	S.extend(Controls, S.Base, {

		init: function() {
			// your code here
			this.filters = this.get('filters');
			this.include = this.get('include');
			this.plugins = this.get('plugins');
			this.children = [];
			this.render();
		},

		destory: function(){

		},

		render: function() {
			this.renderUI();
			this.bindUI();
		},

		renderUI: function() {
			var wrapName = 'dev-controls-wrap',
				className = 'dev-controls-panel',
				controlsDom = DOM.create('<div class="' + wrapName + '"><div class="' + className + '"></div></div>'),
				that = this;

			this.con.append(controlsDom);
			this.controlsWrap = this.con.one('.' + wrapName);
			this.controlsNode = this.con.one('.' + className);
			
			// 播放按钮
			this.playToggle = S.inArray('playtoggle', this.filters)? null: new PlayToggle(this.controlsNode, this.player);
			this.children.push(this.PlayToggle);

			// 时间进度
			this.timeDisplay = S.inArray('timedisplay', this.filters)? null: new TimeDisplay(this.controlsNode, this.player);
			this.children.push(this.timeDisplay);

			// 进度条
			this.progress = S.inArray('progress', this.filters)? null: new Progress(this.controlsNode, this.player);
			// 拖动进度条时禁止隐藏控制面板，拖动结束后激活隐藏控制面板
			this.progress.on('dragmove', this.deactive, this);
			this.progress.on('dragend', this.active, this);
			this.children.push(this.progress);

			// 全屏
			this.fullscreen = S.inArray('fullscreen', this.filters)? null: new Fullscreen(this.controlsNode, this.player);
			this.children.push(this.fullscreen);

			// 音量调节
			this.volume = S.inArray('volume', this.filters)? null: new Volume(this.controlsNode, this.player);
			this.children.push(this.volume);

			// 静音
			this.muteToggle = S.inArray('mutetoggle', this.filters)? null: new MuteToggle(this.controlsNode, this.player);
			this.children.push(this.muteToggle);

			// 插件
			S.each(this.plugins, function(plugin) {
				var plg = new plugin.fn(that.controlsNode, that.player, plugin.cfg);
				that.children.push(plg);
			});

			this.active();

		},

		// 防止控制面板的点击事件冒泡
		bindUI: function() {
			var that = this;
			
			EVENT.on(this.controlsWrap, 'click', function(e) {
				e.halt();

				if (that.isShown()) {
					that.hide();
				} else {
					that.active();
				}
			});
			
			EVENT.on(this.controlsNode, 'click', function(e) {
				e.halt();
			});
		},

		isShown: function() {
			return !(this.controlsNode.css('display') === 'none');
		},

		show: function() {
			this.controlsNode.show();
		},

		hide: function() {
			this.controlsNode.hide();
		},
		
		active: function() {
			var that = this;

			// 激活时先重置计时器
			if (this.controlsTimeout) {
				clearTimeout(this.controlsTimeout);
			}

			this.show();
			this.controlsTimeout = setTimeout(function() {
				that.hide();
			}, 3000);
		},

		deactive: function() {
			// 激活时先重置计时器
			if (this.controlsTimeout) {
				clearTimeout(this.controlsTimeout);
			}
		}
	});

	return Controls;

}, {
	requires: [
		'base', 
		'event', 
		'dom', 
		'node', 
		'./playtoggle', 
		'./timedisplay', 
		'./progress', 
		'./volume', 
		'./mutetoggle', 
		'./fullscreen'
	]
});
