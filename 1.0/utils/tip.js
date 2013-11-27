/**
 * @fileoverview 提示控件
 */
KISSY.add(function (S, Base, NODE) {

	"use strict";

	function Tip(cfg) {
		if (this instanceof Tip) {
			Tip.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new Tip(cfg);
		}
	}

	S.extend(Tip, S.Base, {

		init: function() {
			// your code here
			this.renderUI();
			this.bindUI();
		},

		destory: function() {},

		renderUI: function() {
			var con = NODE.one('body');
			con.append('<div class="dev-control-tip"><div class="dev-tip-content"></div></div>');
			this.node = con.one('.dev-control-tip');
		},

		bindUI: function() {},

		show: function(content, posX, posY) {
			this.node.show();
		},

		hide: function() {
			this.node.hide();
		},

		isShown: function() {
			return !(this.node.css('display') === 'none')
		},

		// 更新内容，更新位置
		update: function(content, e) {
			var contentNode = this.node.one('.dev-tip-content');
			contentNode.html(content);

			var moveNode = NODE.one(e.currentTarget),
				offset = moveNode.offset(),
				minX = offset.left,
				maxX = offset.left + moveNode.width() - this.node.width() - 4,
				x = e.pageX - this.node.width() / 2,
				y = offset.top - this.node.height() - 10;

			console.log(minX);

			x = x < minX? minX: (x > maxX? maxX: x);
			this.node.css({
				top: y + 'px',
				left: x + 'px'
			});
		}
	});

	return new Tip();

}, {
	requires: ['base','node']
});
