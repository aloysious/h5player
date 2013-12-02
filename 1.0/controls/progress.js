/**
   @fileoverview 进度条模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE, Tip) {

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
			EVENT.on(this.node, 'mousedown', this._onMouseDown, this);
			EVENT.on(this.node, 'touchstart', this._onMouseDown, this);
			
			// 按钮状态的改变可能由模块外部的事件触发
			// 因此，这部分的逻辑处理应该放在player的事件回调中
			this.player.on('timeupdate', this._onTimeupdate, this);
			this.player.on('progress', this._onProgress, this);
		},

		_onMouseDown: function(e) {
			e.halt();
			EVENT.on(this.node, 'mousemove', this._onMouseMove, this);
			EVENT.on(this.node, 'mouseup', this._onMouseUp, this);
			EVENT.on(this.node, 'touchmove', this._onMouseMove, this);
			EVENT.on(this.node, 'touchend', this._onMouseUp, this);
			// 临时停止更新当前时间进度
			this.player.detach('timeupdate', this._onTimeupdate, this);
			
			this._onMouseMove(e);
		},

		_onMouseUp: function(e) {
			e.halt();
			EVENT.detach(this.node, 'mousemove', this._onMouseMove, this);
			EVENT.detach(this.node, 'mouseup', this._onMouseUp, this);
			EVENT.detach(this.node, 'touchmove', this._onMouseMove, this);
			EVENT.detach(this.node, 'touchend', this._onMouseUp, this);
			// 重启更新当前时间进度
			this.player.on('timeupdate', this._onTimeupdate, this);
			
			// 设置当前时间，播放视频
			var sec = this.playedNode.width() / this.node.width() * this.player.getDuration();
			this.player.seekTo(sec);
			this.player.play();

			// 结束拖动时，允许控制面板隐藏
			this.player.activeControls();

			Tip.hide();
		},

		_onMouseMove: function(e) {
			e.halt();

			var pageX = e.touches? e.touches[0].pageX: e.pageX,
				distance = pageX - this.node.offset().left,
				width = this.node.width(),
				sec = (this.player.getDuration()) ? distance / width * this.player.getDuration(): 0,
				currSrc = this.player.getPlaylist()[this.player.getPlaylistIndex()];
			
			// 拖动时，控制面板禁止隐藏
			this.player.deactiveControls();

			this._updateProgressBar(this.playedNode, sec);
			
			// 显示story缩略图
			if (currSrc && currSrc.story) {
				this.story = currSrc.story;
				var content = this._getStoryAt(sec);
				Tip.update(content, e);
				Tip.show();
			}
		},

		_onTimeupdate: function(e) {
			this._updateProgressBar(this.playedNode, this.player.getCurrentTime());
		},

		_onProgress: function(e) {
			// 此时buffer可能还没有准备好
			if (this.player.getDuration()) {
				this._updateProgressBar(this.loadedNode, this.player.getBuffered().end(this.player.getBuffered().length - 1));
			}
		},

		_updateProgressBar: function(node, sec) {
			var percent = (this.player.getDuration()) ? sec / this.player.getDuration(): 0;	
			node.css({
				width: (percent * 100) + '%'
			});	
		},

		/**
		 * TODO: 如何获取段数???
		 */
		_getStoryAt: function(sec) {
			var index = Math.floor(25 * sec / this.player.getDuration()),
				offsetY = Math.floor(index / 5) * 60,
				offsetX = (index % 5) * 80,
				styleHtml = 'background-image:url(' + this.story + ');' +
							'width:80px;' +
							'height:60px;' +
							'background-position:-' + offsetX + 'px -' + offsetY + 'px';

			var rtDom = '<div style="' + styleHtml + '"></div>';
			
			return rtDom;
		}
	});

	return Progress;

}, {
	requires: ['base', 'event', 'dom', 'node', '../utils/tip']
});
