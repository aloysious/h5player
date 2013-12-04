/**
 * 播放器模块
 *
 * @module player
 * @author aloysious.ld@taobao.com
 */
KISSY.add(function (S, Base, EVENT, DOM, NODE, ControlsPanel, TextTrackControl) {

	"use strict";

	/**
	 * @class Player
	 * @constructor
	 */
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
		/**
		 * 是否预加载
		 *
		 * @property preload
		 * @type Boolean
		 * @default false
		 */
		preload: {
			value: false
		},

		/**
		 * 是否自动播放
		 *
		 * @property autoplay
		 * @type Boolean
		 * @default false
		 */
		autoplay: {
			value: false
		},

		/**
		 * 是否循环播放
		 *
		 * @property loop
		 * @type Boolean
		 * @default false
		 */
		loop: {
			value: false
		},

		/**
		 * 控制面板配置。
		 * null为不使用控制面板，'default'为使用浏览器自带的控制面板，{}为使用自定义的控制面板。
		 * 自定义控制面板的默认基础功能有：播放按钮，时间进度，静音按钮，音量条，全屏按钮，进度条。
		 * 可配置filters，屏蔽默认的基础功能；
		 * 可配置plugins，扩展控制面板功能，此时cfg作为扩展模块的第三个入参传入扩展模块实例，
		 * 前两个参数约定为控制面板的Node对象实例，和player对象实例。
		 * 例如：
		 * controls: {
		 *     fitlers: ['timedisplay', 'volume'],
		 *     plugins: [
		 *         {
		 *             fn: Collect,
		 *             cfg: {XXXX}
		 *         }
		 *     ]
		 * }
		 *
		 * @property controls
		 * @type Object 
		 * @default null
		 */
		controls: {
			value: null
		},

		/**
		 * 播放器宽度
		 *
		 * @property width
		 * @type String
		 * @default 'auto'
		 */
		width: {
			value: 'auto'
		},

		/**
		 * 播放器高度
		 *
		 * @property height
		 * @type [String|Number]
		 * @default 200
		 */
		height: {
			value: 200
		},

		/**
		 * 播放列表数组
		 * 数组的每个元素为一个媒体源的对象
		 * 例如：
		 * playlist: [
		 *     {
		 *          src: 'path/to/mp4',
		 *          type: 'video/mp4',
		 *          poster: 'path/to/poster',    // 媒体源的封面静态图片地址
		 *          story: 'path/to/story'       // 媒体源的进度缩略图
		 *     }
		 * ]
		 *
		 * @property playlist
		 * @type Array
		 * @default []
		 */
		playlist: {
			value: []
		},

		/**
		 * 初始化的播放源
		 * 优先级低于playlist，即如果playlist中存在元素，则优先使用playlist中的元素作为初始化源
		 * source为一个媒体源对象
		 * 例如：
		 * source: {
		 *     src: 'path/to/mp4',
		 *     type: 'video/mp4',
		 *     poster: 'path/to/poster',
		 *     story: 'path/to/story'
		 * }
		 *
		 * @property source
		 * @type Object
		 * @default null
		 */
		source: {
			value: null
		},

		/**
		 * 首次播放的播放列表序号
		 *
		 * @property playlistIndex
		 * @type Number
		 * @default 0
		 */
		playlistIndex: {
			value: 0
		},

		/**
		 * 播放器的皮肤钩子类名
		 *
		 * @property defaultSkin
		 * @type String
		 * @default 'dev-default-skin'
		 */
		defaultSkin: {
			value: 'dev-default-skin'
		}
	};

	var EVENTS = {
		/**
		 * 开始寻找媒体数据时触发
		 * @event loadstart
		 */
		LOAD_START: 'loadstart',

		/**
		 * 临时停止抓取媒体数据时触发
		 * @event suspend
		 */
		SUSPEND: 'suspend',

		/**
		 * 终止抓取媒体数据时触发
		 * @event abort
		 */
		ABORT: 'abort',

		/**
		 * 抓取过程中发生错误时触发
		 * @event error
		 */
		ERROR: 'error',

		/**
		 * 当网络状态从其他状态切换至NETWORK_EMPTY时触发
		 * @event emptied
		 */
		EMPTIED: 'emptied',

		/**
		 * 尝试去抓取媒体数据，但数据无法如期而至时触发
		 * @event stalled
		 */
		STALLED: 'stalled',

		/**
		 * 当媒体时长、播放器尺寸、文本轨道数据准备好时触发
		 * @event loadedmetadata
		 */
		LOADED_METADATA: 'loadedmetadata',

		/**
		 * 首次在当前播放位置可以渲染媒体数据时触发
		 * @event loadeddata
		 */
		LOADED_DATA: 'loadeddata',

		/**
		 * 当可以恢复媒体播放，但估计以当期速率无法持续播放至结束点时触发
		 * @event canplay
		 */
		CAN_PLAY: 'canplay',
		
		/**
		 * 当可以恢复媒体播放，但估计以当期速率可以持续播放至结束点时触发
		 * @event canplaythrough
		 */
		CAN_PLAY_THROUGH: 'canplaythrough',

		/**
		 * 当播放重新启动时触发
		 * @event playing
		 */
		PLAYING: 'playing',

		/**
		 * 当播放由于没有下一帧而停止，并且可预知下一帧能够到来时触发
		 * @event waiting
		 */
		WAITING: 'waiting',

		/**
		 * 探寻开始时触发
		 * @event seeking
		 */
		SEEKING: 'seeking',

		/**
		 * 探寻结束时触发
		 * @event seeked
		 */
		SEEKED: 'seeked',

		/**
		 * 播放到达结束点时触发
		 * @event ended
		 */
		ENDED: 'ended',

		/**
		 * duration属性更新时触发
		 * @event durationchange
		 */
		DURATION_CHANGE: 'durationchange',

		/**
		 * 当前播放时间更新时触发
		 * @event timeupdate
		 */
		TIME_UPDATE: 'timeupdate',
		
		/**
		 * 在抓取媒体数据过程中连续触发
		 * @event progress
		 */
		PROGRESS: 'progress',

		/**
		 * 媒体不再暂停时触发，发生在play()返回后，或autoplay引起播放时
		 * @event play
		 */
		PLAY: 'play',

		/**
		 * 媒体暂停时触发，发生在pause()返回后
		 * @event pause
		 */
		PAUSE: 'pause',

		/**
		 * 播放速率更新后触发
		 * @event ratechange
		 */
		RATE_CHANGE: 'ratechange',

		/**
		 * 音量更新或静音时触发
		 * @event volumechange
		 */
		VOLUME_CHANGE: 'volumechange',

		/**
		 * 全屏或取消全屏时触发
		 * @event fullscreenchange
		 */
		FULLSCREEN_CHANGE: 'fullscreenchange',
		
		/**
		 * 读取当前选中的字幕完成时触发
		 * @event loadedtexttrack
		 */
		LOADED_TEXT_TRACK: 'loadedtexttrack',
		
		/**
		 * 读取当前选中的字幕错误时触发
		 * @event loadedtexttrack
		 */
		ERROR_TEXT_TRACK: 'errortexttrack'
	
	};

	S.extend(Player, Base, {

		init: function() {
			this.controls = this.get('controls');
			this.playlist = this.get('playlist');
			this.playlistIndex = this.get('playlistIndex');
			this.textTracklist = [];
			this.textTracklistIndex = -1;
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
				mediaEvents = [];

			S.each(EVENTS, function(v, k) {
				mediaEvents.push(v);
			});
			
			// 用player模拟media element的事件响应
			S.each(mediaEvents, function(eventName) {
				EVENT.on(that.videoTag, eventName, function(e) {
					// 将原生的事件对象传递给player的自定义事件，
					// 便于后续处理
					that.fire(eventName, {rawEvent: e});
				});
			});

			// 处理全屏事件响应
			this.on(EVENTS.FULLSCREEN_CHANGE, function() {
				if (that.isFullScreen) {
					that.con.addClass('dev-fullscreen');
				} else {
					that.con.removeClass('dev-fullscreen');
				}
			});

			this.on(EVENTS.ENDED, function() {
				// 如果存在播放列表，并且不进行单个媒体源的循环播放，则播放下一个视频
				if (that.playlist.length > 0 && that.get('loop') !== true) {
					that.nextVideo();
				}
			
			});

			// 在metadata准备好时开始读取字幕
			this.on(EVENTS.LOADED_METADATA, function() {
				var currSrc = this.playlist[this.playlistIndex];
				that.loadTextTracklist(S.isArray(currSrc.textTracks)? currSrc.textTracks: []); 
			});
		},

		/**
		 * 创建video标签，如果初始化的页面中已存在video标签，则js配置信息无效
		 *
		 * @method _createVideoTag
		 * @private
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
			}

			// 获取video标签的原生media element对象
			this.videoTag = videoNode.getDOMNode();
		},

		/**
		 * 创建用户自定义的控制面板
		 *
		 * @method _createControlsPanel
		 * @private
		 */
		_createControlsPanel: function() {
			this.controlsPanel = new ControlsPanel(this.id, this, this.controls);
		},

		/**
		 * 检测fullscreen的支持情况，即时函数
		 *
		 * @method _supportFullscreen
		 * @private
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
		 *
		 * @method _enterFullWindow
		 * @private
		 */
		_enterFullWindow: function() {
			console.log('into fullwindow');
			this.isFullWindow = true;

			this.docOrigOverflow = document.documentElement.style.overflow;

			EVENT.on(document, 'keydown', this._onFullWindowKeyDown, this);

			document.documentElement.style.overflow = 'hidden';

			NODE.one('body').addClass('dev-full-window');
			this.fire('enterfullwindow');
		},

		/**
		 * 进入全屏后的keydown事件监听
		 *
		 * @method _onFullWindowKeyDown
		 * @param e {Object} 事件对象
		 * @private
		 */
		_onFullWindowKeyDown: function(e) {
			if (e.keyCode === 27) {
				if (this.isFullScreen === true) {
					this.cancelFullScreen();
				} else {
					this._exitFullWindow();
				}
			}
		},
		
		/**
		 * TODO
		 * 不支持fullscreenAPI时的取消全屏模拟
		 *
		 * @method _exitFullWindow
		 * @private
		 */
		_exitFullWindow: function() {
			this.isFullWindow = false;
			EVENT.detach(document, this._onFullWindowKeyDown);

			document.documentElement.style.overflow = this.docOrigOverflow;

			NODE.one('body').removeClass('dev-full-window');
			this.fire('exitfullwindow');
		},
	
		////////////////////////////////////////////////////////////////
		//                                                            //
		// 数字娱乐 - 视频 - html5播放器 - API                        //
		//                                                            //
		////////////////////////////////////////////////////////////////
		
		// ******************** 视频读取和队列相关 *********************
		/**
		 * TODO
		 * 通过id读取视频
		 *
		 * @method loadById
		 * @param vid       {String} video ID
		 * @param startTime {Number} 开始的时刻，以秒为单位
		 * @param quality   {String} 视频质量，暂时未实现
		 */
		loadById: function(vid, startTime, quality) {},

		/**
		 * 通过url读取视频
		 *
		 * @method loadByUrl
		 * @param url       {String} 视频源的地址
		 * @param startTime {Number} 开始的时刻，以秒为单位
		 * @param quality   {String} 视频质量，暂时未实现
		 */
		loadByUrl: function(url, startTime, quality) {
			this.videoTag.src = url;
			this.videoTag.load();
		},

		/**
		 * 读取视频列表
		 *
		 * @method loadPlaylist
		 * @param list       {Array}  视频列表数组，数组元素的结构参考playlist
		 * @param firstIndex {Number} 第一个播放的视频序号
		 * @param startTime  {Number} 第一个视频的开始时刻，以秒为单位
		 * @param quality    {String} 视频质量，暂时未实现
		 */
		loadPlaylist: function(list, firstIndex, startTime, quality) {
			this.playlist = list;
			this.playVideoAt(firstIndex);
		},

		/**
		 * 读取特定序号的字幕
		 *
		 * @method loadTextTrackAt
		 * @param index {Number} 当前字幕列表中的特定序号
		 */
		loadTextTrackAt: function(index) {
			if (index === undefined || index === null) {
				index = 0;
			}
			this.textTracklistIndex = index;
			this.textTrackControl && this.textTrackControl.load(index);
		},

		/**
		 * 保存字幕列表，并加载默认字幕
		 * 
		 * @method loadTextTracklist
		 * @param list {Array} 字幕列表
		 * @param firstIndex {Number} 开始的字幕序号
		 */
		loadTextTracklist: function(list, firstIndex) {
			this.textTracklist = list;

			// 如果没有字幕同步模块，创建之
			if (!this.textTrackControl) {
				this.textTrackControl = new TextTrackControl(this.id, this, {textTracklist:this.textTracklist});
			} else {
				this.textTrackControl.setTextTracklist(this.textTracklist);				
			}

			this.loadTextTrackAt(firstIndex);
		},
		
		// ******************** 视频控制和配置相关 *********************
		/**
		 * 播放视频
		 *
		 * @method play
		 */
		play: function() {
			this.videoTag.play();
		},

		/**
		 * 暂停视频
		 *
		 * @method pause
		 */
		pause: function() {
			this.videoTag.pause();
		},

		/**
		 * 视频是否暂停
		 *
		 * @method paused
		 * @return {Boolean} 当前视频是否处于暂停状态
		 */
		paused: function() {
			return this.videoTag.paused;
		},

		/**
		 * TODO
		 * 终止视频
		 *
		 * @method stop
		 */
		stop: function() {},

		/**
		 * 推进视频到特定的时刻，开启搜寻
		 *
		 * @method seekTo
		 * @param time {Number} 开始搜寻的时刻，单位为秒
		 */
		seekTo: function(time) {
			this.videoTag.currentTime = time;
		},

		/**
		 * 播放列表中的下一个视频
		 *
		 * @method nextVideo
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
		 *
		 * @method prevVideo
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
		 *
		 * @method playVideoAt
		 * @param index {Number} 视频序号
		 * @return {Boolean} 是否存在视频源
		 */
		playVideoAt: function(index) {
			if (index === undefined || index === null) {
				index = 0;
			}
			this.playlistIndex = index;

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
		 *
		 * @method mute
		 */
		mute: function() {
			this.videoTag.muted = true;
		},

		/**
		 * 取消静音
		 *
		 * @method unmute
		 */
		unmute: function() {
			this.videoTag.muted = false;
		},

		/**
		 * 当前是否为静音
		 *
		 * @method isMuted
		 * @return {Boolean} 是否为静音
		 */
		isMuted: function() {
			return this.videoTag.muted;
		},

		/**
		 * 设置音量
		 *
		 * @method setVolume
		 * @param vol {Number} 音量值，可选值为0.0至1.0
		 */
		setVolume: function(vol) {
			this.videoTag.volume = vol;
		},

		/**
		 * 获取音量
		 *
		 * @method getVolume
		 * @return {Number} 音量值，0.0至1.0
		 */
		getVolume: function() {
			return this.videoTag.volume;
		},

		/**
		 * 设置播放速率
		 *
		 * @method setPlaybackRate
		 * @param rate {Number} 播放速率
		 */
		setPlaybackRate: function(rate) {
			this.videoTag.playbackRate = rate;
		},

		/**
		 * 获取播放速率
		 *
		 * @method getPlaybackRate
		 * @return {Number} 播放速率
		 */
		getPlaybackRate: function() {
			return this.videoTag.playbackRate;
		},

		/**
		 * 设置播放器静态占位图片
		 *
		 * @method setPoster
		 * @param posterUrl {String} 图片地址
		 */
		setPoster: function(posterUrl) {
			this.videoTag.poster = posterUrl;
		},
		
		/**
		 * 获取播放器静态占位图片
		 *
		 * @method getPoster
		 * @return {String} 图片地址
		 */
		getPoster: function() {
			return this.videoTag.poster;
		},

		/**
		 * 设置全屏
		 *
		 * @method requestFullScreen
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
					
					that.fire(EVENTS.FULLSCREEN_CHANGE);
				});

				conTag[requestFullScreen.requestFn]();
			
			// 如果不支持全屏接口，则模拟实现
			} else {
				this._enterFullWindow();
				this.fire(EVENTS.FULLSCREEN_CHANGE);
			}
		},

		/**
		 * 取消全屏
		 *
		 * @method cancelFullScreen
		 */
		cancelFullScreen: function() {
			var requestFullScreen = this._supportFullscreen;

			this.isFullScreen = false;

			if (requestFullScreen) {
				document[requestFullScreen.cancelFn]();
			
			} else {
				this._exitFullWindow();
				this.fire(EVENTS.FULLSCREEN_CHANGE);
			}
		},

		/**
		 * 是否处于全屏
		 *
		 * @method getIsFullScreen
		 * @return {Boolean} 是否为全屏
		 */
		getIsFullScreen: function() {
			return this.isFullScreen;
		},

		/**
		 * 隐藏字幕同步
		 *
		 * @method hideTextTrackControl
		 */
		hideTextTrackControl: function() {
			this.textTrackControl.hide();
		},

		/**
		 * 显示字幕同步
		 *
		 * @method showTextTrackControl
		 */
		showTextTrackControl: function() {
			this.textTrackControl.show();
		},

		// ****************** 播放状态相关 **********************
		
		/**
		 * 获取当前播放时间
		 *
		 * @method getCurrentTime
		 * @return {Number} 当前播放时间，单位为秒
		 */
		getCurrentTime: function() {
			return this.videoTag.currentTime;
		},

		/**
		 * 获取总播放时间
		 *
		 * @method getDuration
		 * @return {Number} 总播放时间，单位为秒
		 */
		getDuration: function() {
			return this.videoTag.duration;
		},

		/**
		 * 获取已经缓存的时间区间
		 *
		 * @method getBuffered
		 * @return {Array} 时间区间数组timeRanges
		 */
		getBuffered: function() {
			return this.videoTag.buffered;
		},

		/**
		 * TODO
		 * 设置播放质量
		 *
		 * @method setPlaybackQuality
		 * @param quality {String} 视频播放质量字符串 
		 */
		setPlaybackQuality: function(quality) {},

		/**
		 * TODO
		 * 获取播放质量
		 *
		 * @method getPlaybackQuality
		 * @return {String} 视频播放质量字符串
		 */
		getPlaybackQuality: function() {},

		/**
		 * 获取播放列表
		 *
		 * @method getPlaylist
		 * @return {Array} 播放列表数组，元素结构参考playlist
		 */
		getPlaylist: function() {
			return this.playlist;
		},

		/**
		 * 获取当前播放的视频在列表中的序号
		 *
		 * @method getPlaylistIndex
		 * @return {Number} 当前播放序号
		 */
		getPlaylistIndex: function() {
			return this.playlistIndex;
		},

		/**
		 * 获取当前的字幕列表
		 *
		 * @method getTracklist
		 * @return {Array} 字幕列表数组
		 */
		getTracklist: function() {
			return this.textTracklist;
		},

		/**
		 * 获取当前字幕在列表中的序号
		 *
		 * @method getTracklistIndex
		 * @return {Number} 当前字幕序号
		 */
		getTracklistIndex: function() {
			return this.textTracklistIndex;
		},
		
		/**
		 * 设置当前字幕在列表中的序号
		 *
		 * @method setTracklistIndex
		 * @param index {Number} 当前字幕序号
		 */
		setTracklistIndex: function(index) {
			return this.textTracklistIndex = index;
		}

	});

	return Player;

}, {
	requires: [
		'base', 
		'event', 
		'dom', 
		'node', 
		'gallery/h5player/1.0/controls/index', 
		'gallery/h5player/1.0/tracks/index', 
		'./index.css']
});
