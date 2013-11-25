/**
 * @fileoverview 播放器控制面板模块
 *               默认的基础功能有：播放按钮，时间进度，静音按钮，音量条，全屏按钮，进度条
 *               可以通过配置exclude来屏蔽基本功能，配置include来扩展控制面板功能
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
		exclude: {
			value: []
		},

		// 扩展功能列表，以模块名（具体项目的模块名，需自行包配置，否则会找不到）标识
		// 如扩展收藏功能：'projectName/1.0.0/util/collect'
		include: {
			value: []
		}
		
	};

	S.extend(ControlsPanel, S.Base, {

		init: function() {
			// your code here
			this.exclude = this.get('exclude');
			this.include = this.get('include');
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
				controlsDom = DOM.create('<div class="' + className + '"></div>');
			this.con.append(controlsDom);
			this.controlsNode = this.con.one('.' + className);

			this.playToggle = 'playtoggle' in this.exclude? null: new PlayToggle(this.controlsNode, this.player);
			this.timeDisplay = 'timedisplay' in this.exclude? null: new TimeDisplay(this.controlsNode, this.player);
			this.progress = 'progress' in this.exclude? null: new Progress(this.controlsNode, this.player);
			this.volume = 'volume' in this.exclude? null: new Volume(this.controlsNode, this.player);
			this.muteToggle = 'mutetoggle' in this.exclude? null: new MuteToggle(this.controlsNode, this.player);
			//this.fullscreen = 'fullscreen' in this.exclude? null: new Fullscreen(this.controlsNode, this.player);
		},

		bindUI: function() {}
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
		'./mutetoggle'/*, 
		'./fullscreen'*/
	]
});
