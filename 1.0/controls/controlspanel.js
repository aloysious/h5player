/**
 * @fileoverview 播放器控制面板模块
 *               默认的基础功能有：播放按钮，时间进度，静音按钮，音量条，全屏按钮，进度条
 *               可以通过配置filters来屏蔽基本功能，配置plugins来扩展控制面板功能
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE, PlayToggle, TimeDisplay,  Progress, Volume, MuteToggle, Fullscreen) {

	"use strict";

	function ControlsPanel(id, player, cfg) {
		if (this instanceof ControlsPanel) {

			this.con = NODE.one(id);
			this.player = player;

			ControlsPanel.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new ControlsPanel(id, player, cfg);
		}
	}

	ControlsPanel.ATTRS = {
		
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

	S.extend(ControlsPanel, S.Base, {

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
			var className = 'dev-controls-panel',
				controlsDom = DOM.create('<div class="' + className + '"></div>'),
				that = this;

			this.con.append(controlsDom);
			this.controlsNode = this.con.one('.' + className);
			
			// 默认功能模块
			this.playToggle = 'playtoggle' in this.filters? null: new PlayToggle(this.controlsNode, this.player);
			this.children.push(this.PlayToggle);
			this.timeDisplay = 'timedisplay' in this.filters? null: new TimeDisplay(this.controlsNode, this.player);
			this.children.push(this.timeDisplay);
			this.progress = 'progress' in this.filters? null: new Progress(this.controlsNode, this.player);
			this.children.push(this.progress);
			this.fullscreen = 'fullscreen' in this.filters? null: new Fullscreen(this.controlsNode, this.player);
			this.children.push(this.fullscreen);
			this.volume = 'volume' in this.filters? null: new Volume(this.controlsNode, this.player);
			this.children.push(this.volume);
			this.muteToggle = 'mutetoggle' in this.filters? null: new MuteToggle(this.controlsNode, this.player);
			this.children.push(this.muteToggle);

			// 插件
			S.each(this.plugins, function(plugin) {
				var plg = new plugin.fn(that.controlsNode, that.player, plugin.cfg);
				that.children.push(plg);
			});

		},

		// 防止控制面板的点击事件冒泡
		bindUI: function() {
			EVENT.on(this.controlsNode, 'click', function(e) {
				e.halt();
			});
		},

		isShown: function() {
			return !(this.controlsNode.css('display') === 'none')
		},

		show: function() {
			this.controlsNode.show();
		},

		hide: function() {
			this.controlsNode.hide();
		}
	});

	return ControlsPanel;

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
