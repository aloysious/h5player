/**
 * @fileoverview 字幕同步模块，字幕文件的读取，解析，同步显示
 */
KISSY.add(function (S, Base, NODE, IO) {

	"use strict";

	function TextTrackControl(id, player, cfg) {
		if (this instanceof TextTrackControl) {

			this.con = NODE.one(id);
			this.player = player;

			TextTrackControl.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new TextTrackControl(id, player, cfg);
		}
	}

	TextTrackControl.ATTRS = {
		textTracklist: {
			value: []
		}
	};

	S.extend(TextTrackControl, Base, {

		init: function() {
			this.textTracklist = this.get('textTracklist');
			this.cues = [];
			this.render();

		},

		destory: function(){

		},

		render: function() {
			this.renderUI();
			this.bindUI();
		},

		renderUI: function() {
			this.con.append('<div class="dev-vtt-control"></div>');
			this.node = this.con.one('.dev-vtt-control');
		},

		bindUI: function() {
			this.player.on('timeupdate', this._onTimeUpdate, this);
		},

		/**
		 * 在列表中寻找相应的字幕轨道，
		 * 如果index没有越界，直接取this.textTracklist[index],
		 * 如果越界，或者没有传入index，取第一个设置有default的字幕轨道，
		 * 如果没有default轨道，返回null
		 */
		_findTrackAt: function(index) {
			var rtTrack = null;

			if (index === undefined || index === null || 
					index < 0 || index > (this.textTracklist.length - 1)) {
				S.each(this.textTracklist, function(track) {
					if (track.default === true) {
						rtTrack = track;
						return false;
					}
				});

			
			} else {
				rtTrack = this.textTracklist[index];
			}

			return rtTrack;
		},

		/**
		 * 解析字幕文件中的轨道信息保存到this.cues中
		 */
		_parseCues: function(vttContent) {
			var cue, time, text,
				lines = vttContent.split('\n'),
				line = '', 
				id;

			for (var i = 1, j = lines.length; i < j; i++) {
				//0行为'WEBVTT'，直接忽略，从1开始

				line = S.trim(lines[i]);

				if (line) {
					if (line.indexOf('-->') == -1) {
						id = line;
						line = S.trim(lines[++i]);
					
					} else {
						id = this.cues.length;
					}

					cue = {
						id: id,
						index: this.cues.length
					};

					time = line.split(' --> ');
					cue.startTime = this._parseCueTime(time[0]);
					cue.endTime = this._parseCueTime(time[1]);

					text = [];

					while (lines[++i] && (line = S.trim(lines[i]))) {
						text.push(line);
					}
					cue.text = text.join('<br/>');

					this.cues.push(cue);
				}
			}
		},

		/**
		 * 解析VTT文件中的时间至秒数
		 */
		_parseCueTime: function(timeText) {
			var parts = timeText.split(':'),
				time = 0,
				hours, minutes, other, seconds, ms;

			// 如果包含小时
			if (parts.length === 3) {
				hours = parts[0];
				minutes = parts[1];
				other = parts[2];
			
			} else {
				hours = 0;
				minutes = parts[0];
				other = parts[1];
			}

			other = other.split(/\s+/);
			seconds = other.splice(0, 1)[0];
			seconds = seconds.split(/\.|,/);
			ms = parseFloat(seconds[1]);
			seconds = seconds[0];

			time += parseFloat(hours) * 3600;
			time += parseFloat(minutes) * 60;
			time += parseFloat(seconds);
			if (ms) {
				time += ms / 1000;
			}

			return time;
		},

		_onTimeUpdate: function() {
			if (this.cues.length <= 0) {
				return;
			}

			var time = this.player.getCurrentTime();

			if (this.prevChange === undefined || time < this.prevChange || this.nextChange <= time) {
				var cues = this.cues,

					//
					newNextChange = this.player.getDuration(),
					newPrevChange = 0,

					reverse = false,
					newCues = [],
					firstActiveIndex, lastActiveIndex,
					cue, i;

				if (time >= this.nextChange || this.nextChange === undefined) {
					i = (this.firstActiveIndex !== undefined)? this.firstActiveIndex: 0;
				} else {
					reverse = true;
					i = (this.lastActiveIndex !== undefined)? this.lastActiveIndex: cues.length - 1;
				}

				while (true) {
					cue = cues[i];

					if (cue.endTime <= time) {
						newPrevChange = Math.max(newPrevChange, cue.endTime);
				
						if (cue.active) {
							cue.active = false;
						}
					
					} else if (time < cue.startTime) {
						newNextChange = Math.min(newNextChange, cue.startTime);

						if (cue.active) {
							cue.active = false;
						}

						if (!reverse) {
							break;
						}
					
					} else {
						if (reverse) {
							newCues.splice(0, 0, cue);

							if (lastActiveIndex === undefined) {
								lastActiveIndex = i;
							}
							firstActiveIndex = i;
						
						} else {
							newCues.push(cue);

							if (firstActiveIndex === undefined) {
								firstActiveIndex = i;
							}
							lastActiveIndex = i;
						}

						newNextChange = Math.min(newNextChange, cue.endTime);
						newPrevChange = Math.max(newPrevChange, cue.startTime);

						cue.active = true;
					}

					if (reverse) {
						if (i === 0) {
							break;
						} else {
							i--;
						}
					
					} else {
						if (i === cues.length - 1) {
							break;
						} else {
							i++;
						}
					}

				}

				this.activeCues = newCues;
				this.nextChange = newNextChange;
				this.prevChange = newPrevChange;
				this.firstActiveIndex = firstActiveIndex;
				this.lastActiveIndex = lastActiveIndex;

				this._updateDisplay();
			}
		},

		_updateDisplay: function() {
			var cues = this.activeCues,
				html = '',
				i = 0,
				j = cues.length;

			for (;i < j; i++) {
				html += '<span class="dev-vtt-cue">' + cues[i].text + '</span>';	
			}

			this.node.html(html);
		},

		load: function(index) {
			var currTrack = this._findTrackAt(index),
				that = this;

			// 清空cues数组
			this.cues = [];
			
			// 如果找不到字幕轨道信息
			if (!currTrack) {
				this.hide();
				return;
			}

			new IO({
				type: 'get',
				url: currTrack.src,
				success: function(data) {
					that._parseCues(data);
					that.show();
					that.player.fire('loadedtexttrack');
				},
				error: function() {
					that.hide();
				}
			});

		},

		setTextTracklist: function(list) {
			this.textTracklist = list;
		},

		show: function() {
			this.node.show();
		},

		hide: function() {
			this.node.hide();
		}
	});

	return TextTrackControl;

}, {
	requires: ['base','node', 'ajax']
});
