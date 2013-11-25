/**
 * @fileoverview 播放器模块
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE, ControlsPanel) {

	"use strict";

	function Player(id, cfg) {
		if (this instanceof Player) {
			this.id = id;
			this.con = NODE.one(id);
			Player.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new Player(id, cfg);
		}
	}

	Player.ATTRS = {
		// 占位静态图片
		poster: {
			value: null
		},

	    // 是否预加载
		preload: {
			value: false
		},

		// 是否自动播放
		autoplay: {
			value: false
		},

		// 是否循环播放
		loop: {
			value: false
		},

		// TODO:控制面板配置
		controls: {
			value: null
		},

		// 播放器宽度
		width: {
			value: '100%'
		},

		// 播放器高度
		height: {
			value: '100%'
		},

		// 播放列表数组
		playlist: {
			value: []
		},

		// 初始化的播放源，优先级低于playlist
		src: {
			value: null
		},

		// 首次播放的播放列表序号
		playlistIndex: {
			value: 0
		},

		// 皮肤
		defaultSkin: {
			value: 'dev-default-skin'
		}
	};

	S.extend(Player, Base, {

		init: function() {
			// your code here
			this.controls = this.get('controls');
			this.playlist = this.get('playlist');
			this.playlistIndex = this.get('playlistIndex');
			this.render();
		},

		destory: function() {

		},

		render: function() {
			this.renderUI();
			this.bindUI();
		},

		renderUI: function() {
			// 添加默认皮肤前缀
			this.con.addClass(this.get('defaultSkin'));
			
			this._createVideoTag();
			
			// 如果需要使用用户自定义的控制面板
			if (this.controls !== null && this.controls !== 'default') {
				this._createControlsPanel();
			}
		},

		bindUI: function() {
			var that = this,
				mediaEvents = 'loadstart,suspend,abort,error,emptied,stalled,' +
							  'loadedmetadata,loadeddata,canplay,canplaythrough,' +
							  'playing,waiting,seeking,seeked,ended,durationchange,' +
							  'timeupdate,progress,play,pause,ratechange,volumechange';

			mediaEvents = mediaEvents.split(',');
			
			// 用player模拟media element的事件响应
			S.each(mediaEvents, function(eventName) {
				EVENT.on(that.videoTag, eventName, function(e) {
					that.fire(eventName, {rawEvent: e});
				});
			});

		},

		/**
		 * 创建video标签，如果初始化的页面中已存在video标签，则js配置信息无效？？？
		 */
		_createVideoTag: function() {
			var videoNode = this.con.one('video');

			// 如果初始化的页面中没有video标签，则创建之
			if (!videoNode) {
				var src = this.playlist.length > 0? this.playlist[this.playlistIndex]: (this.get('src')? this.get('src'): ''),
					controls = this.controls === 'default'? true: false,
					videoDom = DOM.create('<video>', {
						src: src,
						poster: this.get('poster'),
						preload: this.get('preload'),
						autoplay: this.get('autoplay'),
						loop: this.get('loop'),
						controls: controls,
						width: this.get('width'),
						height: this.get('height'),
				});

				this.con.append(videoDom);
				videoNode = this.con.one('video');
			}

			this.videoTag = videoNode.getDOMNode();
		},

		/**
		 * TODO:创建用户自定义的控制面板
		 */
		_createControlsPanel: function() {
			this.controlsPanel = new ControlsPanel(this.id, this, this.controls);
		},
	
		////////////////////////////////////////////////////////////////
		//                                                            //
		// 数字娱乐 - 视频 - html5播放器 - API                        //
		//                                                            //
		////////////////////////////////////////////////////////////////
		
		// ******************** 视频读取和队列相关 *********************
		/**
		 * TODO:通过id读取视频
		 */
		loadById: function(vid, startTime, quality) {},

		/**
		 * TODO:通过url读取视频
		 */
		loadByUrl: function(url, startTime, quality) {},

		/**
		 * TODO:读取视频列表
		 */
		loadPlaylist: function(list, firstIndex, startTime, quality) {},

		
		// ******************** 视频控制和配置相关 *********************
		/**
		 * TODO:播放视频
		 */
		play: function() {
			this.videoTag.play();
		},

		/**
		 * TODO:暂停视频
		 */
		pause: function() {
			this.videoTag.pause();
		},

		/**
		 * TODO:视频是否暂停
		 */
		paused: function() {
			return this.videoTag.paused;
		},

		/**
		 * TODO:终止视频
		 */
		stop: function() {},

		/**
		 * TODO:推进视频到特定的时刻
		 */
		seekTo: function(time) {},

		/**
		 * TODO:播放列表中的下一个视频
		 */
		nextVideo: function() {},

		/**
		 * TODO:播放列表中的前一个视频
		 */
		prevVideo: function() {},

		/**
		 * TODO:播放列表中特定的一个视频
		 */
		playVideoAt: function(index) {},

		/**
		 * TODO:设置为静音
		 */
		mute: function() {
			this.videoTag.muted = true;
		},

		/**
		 * TODO:取消静音
		 */
		unmute: function() {
			this.videoTag.muted = false;
		},

		/**
		 * TODO:当前是否为静音
		 */
		isMuted: function() {
			return this.videoTag.muted;
		},

		/**
		 * TODO:设置音量
		 */
		setVolume: function(vol) {
			this.videoTag.volume = vol;
		},

		/**
		 * TODO:获取音量
		 */
		getVolume: function() {
			return this.videoTag.volume;
		},

		/**
		 * TODO:设置播放速率
		 */
		setPlaybackRate: function(rate) {},

		/**
		 * TODO:获取播放速率
		 */
		getPlaybackRate: function() {},

		/**
		 * TODO:设置播放器静态占位图片
		 */
		setPoster: function(posterUrl) {},

		// ****************** 播放状态相关 **********************
		/**
		 * TODO:获取当前播放时间
		 */
		getCurrentTime: function() {
			return this.videoTag.currentTime;
		},

		/**
		 * TODO:获取总播放时间
		 */
		getDuration: function() {
			return this.videoTag.duration;
		},

		/**
		 * TODO:获取已经缓存的时间
		 */
		getBuffered: function() {
			return this.videoTag.buffered;
		},

		/**
		 * TODO:设置播放质量
		 */
		setPlaybackQuality: function(quality) {},

		/**
		 * TODO:获取播放质量
		 */
		getPlaybackQuality: function() {},

		/**
		 * TODO:获取播放列表
		 */
		getPlaylist: function() {},

		/**
		 * TODO:获取当前播放的视频在列表中的序号
		 */
		getPlaylistIndex: function() {}



	});

	return Player;

}, {
	requires: ['base', 'event', 'dom', 'node', 'gallery/h5player/1.0/controls/controlspanel', './index.css']
});
