KISSY.add(function (S, Base, EVENT, DOM, NODE) {

	"use strict";

	function Caption(con, player, cfg) {
		if (this instanceof Caption) {

			this.con = con;
			this.player = player;

			Caption.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new Caption(con, player, cfg);
		}
	}
	
	Caption.ATTRS = {
		className: {
			value: 'dev-control-caption'
		},

		innerHTML: {
			value: '<div class="dev-control-content"><select class="dev-caption-select"></select></div>'
		}
	}

	S.extend(Caption, S.Base, {

		init: function() {
			// your code here
			this.renderUI();
			this.bindUI();
		},

		destory: function(){

		},
		
		renderUI: function() {
			var dom = DOM.create('<div class="' + this.get('className') + '">' + this.get('innerHTML') + '</div>');
			this.con.append(dom);
			this.node = this.con.one('.' + this.get('className'));

			this._updateSelectList();
		},

		bindUI: function() {
			var that = this;

			this.player.on('loadedmetadata', function() {
				// 保证在player.textTracklist更新后执行
				//setTimeout(function() {
				//	that._updateSelectList();
				//}, 0);
			});

			EVENT.delegate(this.node, 'change', '.dev-caption-select', function() {
				var selectNode = that.node.one('.dev-caption-select'),
					selectedIndex = parseInt(selectNode.val());

				// 关闭字幕
				if (selectedIndex === -1) {
					that.player.hideTextTrackControl();
					return;
				}

				that.player.loadTextTrackAt(selectedIndex);
				that.player.showTextTrackControl();
			});

			this.player.on('loadedtexttrack', function() {
				that._updateSelectList();
			});
		
		},

		_updateSelectList: function() {
			var that = this;

			this.tracklist = this.player.getTracklist();

			// 如果当前视频没有字幕，直接隐藏整个模块
			if (this.tracklist.length === 0) {
				this.hide();
				return;
			}

			var selectInner = '<option value="-1">关闭</option>';
			S.each(this.tracklist, function(track, i) {
				var selected = that.player.getTracklistIndex() == i? 'selected': '';
				selectInner += '<option value="' + i + '" ' + selected + '>' + track.label + '</option>';
			});

			this.node.one('.dev-caption-select').html(selectInner);
			this.show();
		},

		hide: function() {
			this.node.hide();
		},

		show: function() {
			this.node.show();
		}
	});

	return Caption;

}, {
	requires: ['base', 'event', 'dom', 'node']
});
