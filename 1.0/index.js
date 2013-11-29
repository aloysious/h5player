/**
 * @fileoverview 播放器模块
 * @author       aloysious.ld@taobao.com
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE, ControlsPanel, TextTrackControl) {

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

		// 控制面板配置。
		// 默认的基础功能有：播放按钮，时间进度，静音按钮，音量条，全屏按钮，进度条。
		// 可配置filters，屏蔽默认的基础功能；
		// 可配置plugins，扩展控制面板功能，此时cfg作为扩展模块的第三个入参传入扩展模块实例，
		// 前两个参数约定为控制面板的Node对象实例，和player对象实例。
		// 例如：
		// controls: {
		//     fitlers: ['timedisplay', 'volume'],
		//     plugins: [
		//         {
		//             fn: Collect,
		//             cfg: {XXXX}
		//         }
		//     ]
		// }
		controls: {
			value: null
		},

		// 播放器宽度
		width: {
			value: 'auto'
		},

		// 播放器高度
		height: {
			value: '200px'
		},

		// 播放列表数组
		// 数组的每个元素为一个媒体源的对象
		// 例如：
		// playlist: [
		//     {
		//          src: 'path/to/mp4',
		//          type: 'video/mp4',
		//          poster: 'path/to/poster',    // 媒体源的封面静态图片地址
		//          story: 'path/to/story'       // 媒体源的进度缩略图
		//     }
		// ]
		playlist: {
			value: []
		},

		// 初始化的播放源
		// 优先级低于playlist，即如果playlist中存在元素，则优先使用playlist中的元素作为初始化源
		// source为一个媒体源对象
		// 例如：
		// source: {
		//     src: 'path/to/mp4',
		//     type: 'video/mp4',
		//     poster: 'path/to/poster',
		//     story: 'path/to/story'
		// }
		source: {
			value: null
		},

		// 首次播放的播放列表序号
		playlistIndex: {
			value: 0
		},

		// 播放器的皮肤钩子类名
		defaultSkin: {
			value: 'dev-default-skin'
		}
	};

	S.extend(Player, Base, {

		init: function() {
			this.controls = this.get('controls');
			this.playlist = this.get('playlist');
			this.playlistIndex = this.get('playlistIndex');
			this.tracklist = this.get('tracklist');
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
			
			this.con.css({
				width: this.get('width'),
				height: this.get('height')
			});
			
			// 创建video标签
			this._createVideoTag();
			
			// 如果需要使用用户自定义的控制面板，则创建之
			if (this.controls !== null && this.controls !== 'default') {
				this._createControlsPanel();
			}

		},

		bindUI: function() {
			var that = this,
				// html5 media element API提供的事件列表
				mediaEvents = 'loadstart,suspend,abort,error,emptied,stalled,' +
							  'loadedmetadata,loadeddata,canplay,canplaythrough,' +
							  'playing,waiting,seeking,seeked,ended,durationchange,' +
							  'timeupdate,progress,play,pause,ratechange,volumechange';

			mediaEvents = mediaEvents.split(',');
			
			// 用player模拟media element的事件响应
			S.each(mediaEvents, function(eventName) {
				EVENT.on(that.videoTag, eventName, function(e) {
					// 将原生的事件对象传递给player的自定义事件，
					// 便于后续处理
					that.fire(eventName, {rawEvent: e});
				});
			});

			// 处理全屏事件响应
			this.on('fullscreenchange', function() {
				if (that.isFullScreen) {
					that.con.addClass('dev-fullscreen');
				} else {
					that.con.removeClass('dev-fullscreen');
				}
			});

			this.on('ended', function() {
				// 如果存在播放列表，并且不进行单个媒体源的循环播放，则播放下一个视频
				if (that.playlist.length > 0 && that.get('loop') !== true) {
					that.nextVideo();
				}
			
				// 读取字幕
				var currSrc = this.playlist[this.playlistIndex];
				that.loadTextTracklist(S.isArray(currSrc.textTracks)? currSrc.textTracks: []); 
			});

			// 主要针对移动设备，
			// 第一次触碰屏幕时激活控制面板，
			// 激活后再触碰屏幕才能暂停或继续播放
			/*
			EVENT.on(this.con, 'click', function() {
				if (!that.hasCustomedControls()) {
					return;
				}	

				if (that.isControlsShown()) {
					if (that.paused()) {
						that.play();
					} else {
						that.pause();
					}
				
				} else {
					that.activeControls();
				}
			});
			*/

			EVENT.on(this.con, 'click', function() {
				if (!that.hasCustomedControls()) {
					return;
				}	

				if (that.isControlsShown()) {
					that.hideControls();
				} else {
					that.activeControls();
				}
			});

			EVENT.on(this.con, 'touchmove', function() {
				if (that.hasCustomedControls()) {
					that.activeControls();
				}
			});

		},

		/**
		 * 创建video标签，如果初始化的页面中已存在video标签，则js配置信息无效
		 * @return undefined
		 */
		_createVideoTag: function() {
			var videoNode = this.con.one('video');

			// 如果初始化的页面中没有video标签，则创建之
			if (!videoNode) {
				var source = this.playlist.length > 0? this.playlist[this.playlistIndex]: (this.get('source')? this.get('source'): {}),
					controls = this.controls === 'default'? true: false,
					videoDom = DOM.create('<video>', {
						src: source.src || '',
						poster: source.poster || '',
						preload: this.get('preload'),
						autoplay: this.get('autoplay'),
						loop: this.get('loop'),
						controls: controls,
						width: '100%',
						height: '100%',
				});

				this.con.append(videoDom);
				videoNode = this.con.one('video');

				// 读取字幕
				this.loadTextTracklist(S.isArray(source.textTracks)? source.textTracks: []); 
			}

			// 获取video标签的原生media element对象
			this.videoTag = videoNode.getDOMNode();
		},

		/**
		 * 创建用户自定义的控制面板
		 * @return undefined
		 */
		_createControlsPanel: function() {
			this.controlsPanel = new ControlsPanel(this.id, this, this.controls);
			
			// 初始状态下需激活控制面板
			this.activeControls();
		},

		/**
		 * 检测fullscreen的支持情况，即时函数
		 * @return undefined
		 */
		_supportFullscreen: (function() {
			var prefix, requestFS, div;

			div = DOM.create('<div></div>');
			requestFS = {};

			// 如果浏览器实现了W3C标准的定义
			if (div.cancelFullscreen !== undefined) {
				requestFS.requestFn = 'requestFullscreen';
				requestFS.cancelFn = 'cancelFullscreen';
				requestFS.eventName = 'fullscreenchange';
				requestFS.isFullScreen = 'fullScreen';
			
			// 如果是webkit和mozilla内核，调用全屏接口时需要带前缀
			} else {
				if (document.mozCancelFullScreen) {
					prefix = 'moz';
					requestFS.isFullScreen = prefix + 'FullScreen';
				} else {
					prefix = 'webkit';
					requestFS.isFullScreen = prefix + 'IsFullScreen';
				}

				if (div[prefix + 'RequestFullScreen']) {
					requestFS.requestFn = prefix + 'RequestFullScreen';
					requestFS.cancelFn = prefix + 'CancelFullScreen';
				}
				requestFS.eventName = prefix + 'fullscreenchange';
			}

			if (document[requestFS.cancelFn]) {
				return requestFS;
			}

			// 如果浏览器不支持全屏接口，返回null
			return null;
		})(),   // 注意，即时函数

		/**
		 * TODO
		 * 不支持fullscreenAPI时的全屏模拟
		 * @return undefined
		 */
		_enterFullWindow: function() {},
		
		/**
		 * TODO
		 * 不支持fullscreenAPI时的取消全屏模拟
		 * @return undefined
		 */
		_exitFullWindow: function() {},
	
		////////////////////////////////////////////////////////////////
		//                                                            //
		// 数字娱乐 - 视频 - html5播放器 - API                        //
		//                                                            //
		// loadById                                                   //
		// loadByUrl                                                  //
		// loadPlaylist                                               //
		// loadTextTrackAt                                            //
		// loadTextTracklist                                          //
		// play                                                       //
		// pause                                                      //
		// paused                                                     //
		// stop                                                       //
		// seekTo                                                     //
		// nextVideo                                                  //
		// prevVideo                                                  //
		// playVideoAt                                                //
		// mute                                                       //
		// unmute                                                     //
		// ismuted                                                    //
		// setVolume                                                  //
		// getVolume                                                  //
		// setPlaybackRate                                            //
		// getPlaybackRate                                            //
		// setPoster                                                  //
		// requestFullScreen                                          //
		// cancelFullScreen                                           //
		// getIsFullScreen                                            //
		// hasCustomedControls                                        //
		// isControlsShown                                            //
		// showControls                                               //
		// hideControls                                               //
		// activeControls                                             //
		// deactiveControls                                           //
		// getCurrentTime                                             //
		// getDuration                                                //
		// getBuffered                                                //
		// setPlaybackQuality                                         //
		// getPlaybackQuality                                         //
		// getPlaylist                                                //
		// getPlaylistIndex                                           //
		//                                                            //
		////////////////////////////////////////////////////////////////
		
		// ******************** 视频读取和队列相关 *********************
		/**
		 * TODO
		 * 通过id读取视频
		 * @param vid       {String} video ID
		 * @param startTime {Number} 开始的时刻，以秒为单位
		 * @param quality   {String} 视频质量，暂时未实现
		 * @return undefined
		 */
		loadById: function(vid, startTime, quality) {},

		/**
		 * 通过url读取视频
		 * @param url       {String} 视频源的地址
		 * @param startTime {Number} 开始的时刻，以秒为单位
		 * @param quality   {String} 视频质量，暂时未实现
		 * @return undefined
		 */
		loadByUrl: function(url, startTime, quality) {
			this.videoTag.src = url;
			this.videoTag.load();
		},

		/**
		 * 读取视频列表
		 * @param list       {Array}  视频列表数组，数组元素的结构参考playlist
		 * @param firstIndex {Number} 第一个播放的视频序号
		 * @param startTime  {Number} 第一个视频的开始时刻，以秒为单位
		 * @param quality    {String} 视频质量，暂时未实现
		 * @return undefined
		 */
		loadPlaylist: function(list, firstIndex, startTime, quality) {
			this.playlist = list;
			this.playlistIndex = firstIndex;
			this.playVideoAt(this.playlistIndex);
		},

		/**
		 * TODO
		 * 读取特定序号的字幕
		 */
		loadTextTrackAt: function(index) {
			this.textTrackControl.load(index);
		},

		/**
		 * TODO
		 */
		loadTextTracklist: function(list) {
			this.textTracklist = list;
			if (!this.textTrackControl) {
				this.textTrackControl = new TextTrackControl(this.id, this, {textTracklist:this.textTracklist});
			} else {
				this.textTrackControl.setTextTracklist(list);
			}
			this.textTrackControl.load();
		},



		
		// ******************** 视频控制和配置相关 *********************
		/**
		 * 播放视频
		 * @return undefined
		 */
		play: function() {
			this.videoTag.play();
		},

		/**
		 * 暂停视频
		 * @return undefined
		 */
		pause: function() {
			this.videoTag.pause();
		},

		/**
		 * 视频是否暂停
		 * @return undefined
		 */
		paused: function() {
			return this.videoTag.paused;
		},

		/**
		 * TODO
		 * 终止视频
		 * @return undefined
		 */
		stop: function() {},

		/**
		 * 推进视频到特定的时刻，开启搜寻
		 * @return undefined
		 */
		seekTo: function(time) {
			this.videoTag.currentTime = time;
		},

		/**
		 * 播放列表中的下一个视频
		 * @return {Boolean} 是否存在下一个可以播放的视频源
		 */
		nextVideo: function() {
			if (this.playlistIndex < (this.playlist.length - 1)) {
				return this.playVideoAt(++this.playlistIndex);
			}

			return false;
		},

		/**
		 * 播放列表中的前一个视频
		 * @return {Boolean} 是否存在前一个可以播放的视频源
		 */
		prevVideo: function() {
			if (this.playlistIndex > 0) {
				return this.playVideoAt(--this.playlistIndex);
			}

			return false;
		},

		/**
		 * 播放列表中特定的一个视频
		 * @return {Boolean} 是否存在视频源
		 */
		playVideoAt: function(index) {
			var source = this.playlist[index];

			if (!source) {
				return false;
			}

			this.setPoster(source.poster);
			this.loadByUrl(source.src);
			return true;
		},

		/**
		 * 设置为静音
		 * @return undefined
		 */
		mute: function() {
			this.videoTag.muted = true;
		},

		/**
		 * 取消静音
		 * @return undefined
		 */
		unmute: function() {
			this.videoTag.muted = false;
		},

		/**
		 * 当前是否为静音
		 * @return {Boolean} 是否为静音
		 */
		isMuted: function() {
			return this.videoTag.muted;
		},

		/**
		 * 设置音量
		 * @param vol {Number} 音量值，可选值为0.0至1.0
		 * @return undefined
		 */
		setVolume: function(vol) {
			this.videoTag.volume = vol;
		},

		/**
		 * 获取音量
		 * @return {Number} 音量值，0.0至1.0
		 */
		getVolume: function() {
			return this.videoTag.volume;
		},

		/**
		 * 设置播放速率
		 * @param rate {Number} 播放速率
		 * @return undefined
		 */
		setPlaybackRate: function(rate) {
			this.videoTag.playbackRate = rate;
		},

		/**
		 * 获取播放速率
		 * @return {Number} 播放速率
		 */
		getPlaybackRate: function() {
			return this.videoTag.playbackRate;
		},

		/**
		 * 设置播放器静态占位图片
		 * @param posterUrl {String} 图片地址
		 * @return undefined
		 */
		setPoster: function(posterUrl) {
			this.videoTag.poster = posterUrl;
		},

		/**
		 * 设置全屏
		 * @return undefined
		 */
		requestFullScreen: function() {
			var requestFullScreen = this._supportFullscreen,
				conTag = this.con.getDOMNode(),
				that = this;

			this.isFullScreen = true;

			// 如果浏览器支持全屏接口
			if (requestFullScreen) {
				EVENT.on(document, requestFullScreen.eventName, function(e) {
					that.isFullScreen = document[requestFullScreen.isFullScreen];
					
					if (that.isFullScreen === false) {
						EVENT.detach(document, requestFullScreen.eventName);
					}
					
					that.fire('fullscreenchange');
				});

				conTag[requestFullScreen.requestFn]();
			
			// 如果不支持全屏接口，则模拟实现
			} else {
				this._enterFullWindow();
				this.fire('fullscreenchange');
			}
		},

		/**
		 * 取消全屏
		 * @return undefined
		 */
		cancelFullScreen: function() {
			var requestFullScreen = this._supportFullscreen;

			this.isFullScreen = false;

			if (requestFullScreen) {
				document[requestFullScreen.cancelFn]();
			
			} else {
				this._exitFullWindow();
				this.fire('fullscreenchange');
			}
		},

		/**
		 * 是否处于全屏
		 * @return {Boolean} 是否为全屏
		 */
		getIsFullScreen: function() {
			return this.isFullScreen;
		},

		/**
		 * 是否自定义控制面板
		 * @return {Boolean} 是否自定义
		 */
		hasCustomedControls: function() {
			return !!this.controlsPanel;
		},

		/**
		 * 控制面板是否显示
		 * @return {Boolean} 是否显示
		 */
		isControlsShown: function() {
			return this.controlsPanel && this.controlsPanel.isShown();
		},

		/**
		 * 显示控制面板
		 * @return undefined
		 */
		showControls: function() {
			this.controlsPanel && this.controlsPanel.show();
		},

		/**
		 * 隐藏控制面板
		 * @return undefined
		 */
		hideControls: function() {
			this.controlsPanel && this.controlsPanel.hide();
		},

		/**
		 * 激活控制面板，先显示控制面板，再启动自动隐藏的倒计时
		 * 3秒后自动隐藏面板
		 * @return undefined
		 */
		activeControls: function() {
			var that = this;

			// 激活时先重置计时器
			if (this.controlsTimeout) {
				clearTimeout(this.controlsTimeout);
			}

			this.showControls();
			this.controlsTimeout = setTimeout(function() {
				that.hideControls();
			}, 3000);
		},

		/**
		 * 使控制面板不会自动隐藏
		 * @return undefined
		 */
		deactiveControls: function() {
			// 激活时先重置计时器
			if (this.controlsTimeout) {
				clearTimeout(this.controlsTimeout);
			}
		},

		// ****************** 播放状态相关 **********************
		/**
		 * 获取当前播放时间
		 * @return {Number} 当前播放时间，单位为秒
		 */
		getCurrentTime: function() {
			return this.videoTag.currentTime;
		},

		/**
		 * 获取总播放时间
		 * @return {Number} 总播放时间，单位为秒
		 */
		getDuration: function() {
			return this.videoTag.duration;
		},

		/**
		 * 获取已经缓存的时间区间
		 * @return {Array} 时间区间数组timeRanges
		 */
		getBuffered: function() {
			return this.videoTag.buffered;
		},

		/**
		 * TODO
		 * 设置播放质量
		 */
		setPlaybackQuality: function(quality) {},

		/**
		 * TODO
		 * 获取播放质量
		 */
		getPlaybackQuality: function() {},

		/**
		 * 获取播放列表
		 * @return {Array} 播放列表数组，元素结构参考playlist
		 */
		getPlaylist: function() {
			return this.playlist;
		},

		/**
		 * 获取当前播放的视频在列表中的序号
		 * @return {Number} 当前播放序号
		 */
		getPlaylistIndex: function() {
			return this.playlistIndex;
		}

	});

	return Player;

}, {
	requires: [
		'base', 
		'event', 
		'dom', 
		'node', 
		'gallery/h5player/1.0/controls/controlspanel', 
		'gallery/h5player/1.0/tracks/index', 
		'./index.css']
});
