video-h5player是一个基于kissy的移动端h5播放器组件，主要实现基本的播放功能，提供皮肤定制机制、插件扩展机制。最终目标是提供一个功能完备、可灵活定制的h5播放器解决方案。

## 快速使用
    
    KISSY.config({
        packages: [
            {
                name: 'video-h5player',
                path: 'http://g.tbcdn.cn/de/video-h5player/1.0.0/',
                charset: 'utf-8',
                ignorePackageNameInUri: true
            }
        ]
    });
    
    KISSY.use('video-h5player/util/player/index', function(S, Player) {
        new Player('#container', {
            source: {
                src: 'path/to/media/source',
                type: 'video/mp4',
                poster: 'path/to/poster',
                story: 'path/to/story/image',
                textTracks: [
                    {
                        src: 'path/to/track/source',
                        srclang: 'en',
                        label: '英文'
                    }
                ]  
            },
            controls: {},
            autoplay: false,
            doCover: true,
            width: '100%',
            height: 200
        });   
    });

## API

### 属性

 属性名 | 类型 | 默认值 | 说明 | 备注 
:-----------|:------|:------|:-----|:-----
autoplay|_Boolean_|_false_|是否自动播放|
loop|_Boolean_|_false_|是否循环播放|
controls|_Object/String_|_null_|控制面板配置|[具体配置说明](#jump)
width|_Number/String_|_'auto'_|播放器宽度|
height|_Number/String_|_200_|播放器高度|
playlist|_Object_|_[]_|播放列表|具体配置说明
playlistIndex|_Number_|_0_|播放列表初始序号|
source|_Object_|_null_|初始化的媒体源对象|具体配置说明
defaultSkin|_String_|_'dev-default-skin'_|默认的皮肤钩子类名|
doCover|_Boolean_|_false_|是否设置播放器的封面|具体配置说明

#### controls配置说明
<span id="jump">sd</span>
通过controls可以对播放器的控制面板进行配置。
* 设置为_null_，播放器不使用控制面板；
* 设置为_'default'_，使用浏览器默认的播放器控制面板；
* 设置为_Object_，使用自定义的控制面板，此时控制面板的默认功能有：播放按钮（playtoggle）、时间进度（timedisplay）、静音按钮（mutetoggle）、音量调节（volume）、全屏按钮（fullscreen）、进度条（progress）。此时controls有两个配置项：
    * filters，_Array_，屏蔽列表中的默认功能；
    * plugins，_Array_，控制面板的扩展插件列表，每个插件需传入插件模块的构造函数（fn）和插件配置（cfg），具体的插件开发规范见扩展控制面板。

例如：

    controls: {
        filters: ['timedisplay', 'volume'],    // 屏蔽时间进度、音量调节功能
        plugins: [
            { 
                fn: Collect,                   // 为控制面板扩展收藏功能
                cfg: {XXX}
            }
        ]
    }
    
#### source配置说明
通过source配置初始化播放器的视频源。例如：

    source: {
        src: 'http://www.yoursite.com/media/mp4',      // 视频的url地址
        type: 'video/mp4',                             // 视频的格式，参考标准的mime类型格式
        poster: 'http://www.yoursite.com/poster.png',  // 视频的封面图片地址
        story: 'http://www.yoursite.cim/story.png',    // 视频的缩略图地址
        textTracks: [                                  // 视频的字幕列表
            {
                src: 'path/to/track/source',
                srclang: 'en',
                label: '英文'
            }
        ]  
    }
    
#### playlist配置说明
播放器支持多个视频的连续播放，此时需配置playlist列表，列表中的每个元素为一个视频源对象（参考source配置说明）。另外，需要注意的是，如果初始化播放器实例时同时配置了source和playlist，则会使用playlist中的视频源对象进行初始化，source配置视为无效。

#### doCover配置说明
由于不同的移动设备、不同的浏览器在初始化播放器时存在样式和行为差异，设置doCover为true，会使用自定义的封面组件来模拟视频封面，从而保证初始化样式的一致性。如果设置doCover为false，则使用video标签的poster配置来生成视频封面。

### 方法
 方法名 | 参数 | 返回值 | 说明 
:-----------|:------|:------|:-----
loadByUrl|url(_String_)-视频地址|-|通过url读取视频
loadPlaylist|list(_Array_)-视频列表，结构参考playlist<br/>firstIndex(_Number_)-首个播放的序号|-|读取视频列表
loadTextTracklist|list(_Array_)-字幕列表，结构参考source中的textTracks<br/>firstIndex(_Number_)-默认的字幕序号|-|保存字幕列表，并加载默认字幕
loadTextTrackAt|index(_Number_)-字幕序号|-|读取特定序号的字幕
play|-|-|播放视频
pause|-|-|暂停视频
paused|-|_Boolean_|视频是否正在播放
seekTo|time(_Number_)-进行seek的时刻，秒为单位|-|在特定时刻开始seek探寻
nextVideo|-|_Boolean_|返回是否存在下一个视频，如果存在则播放之
prevVideo|-|_Boolean_|返回是否存在上一个视频，如果存在则播放之
playVideoAt|index(_Number_)-视频在列表中序号|_Boolean_|返回是否存在制定序号的视频，如果存在则播放之
mute|-|-|设置静音
unmute|-|-|取消静音
isMuted|-|_Boolean_|当前是否为静音
setVolume|vol(_Number_)-音量值，0.0-1.0|-|设置音量大小
getVolume|-|_Number_|获取音量大小
setPlaybackRate|rate(_Number_)-播放速率|-|设置播放速率
getPlaybackRate|-|_Number_|获取播放速率
requestFullScreen|-|-|设置为全屏模式
cancelFullScreen|-|-|取消全屏模式
getIsFullScreen|-|_Boolean_|是否处于全屏模式
hideTextTrackControl|-|-|隐藏字幕
showTextTrackControl|-|-|显示字幕
hideVideo|-|-|隐藏视频播放
showVideo|-|-|显示视频播放
getCurrentTime|-|_Number_|获取当前播放时间，秒为单位
getDuration|-|_Number_|获取当期视频的播放总时长，秒为单位
getBuffered|-|_Array_|获取已经缓存的时间区间列表
getPlaylist|-|_Array_|获取播放列表
getPlaylistIndex|-|_Number_|获取当前视频在列表中的序号
getTracklist|-|_Array_|获取字幕列表
getTracklistIndex|-|_Number_|获取当前字幕在列表中的序号

### 事件
 事件名 | 说明 
:-----------|:------
loadstart|开始加载媒体数据时触发
suspend|临时停止加载媒体数据时触发
abort|终止加载媒体数据时触发
error|加载过程中发生错误时触发
emptied|当网络状态从其他状态切换至NETWORK_EMPTY时触发
stalled|尝试去加载媒体数据，当数据无法到达时触发
loadedmetadata|当媒体时长、播放器尺寸等meta信息准备好时触发
loadeddata|首次在当期时刻可以渲染媒体数据进行播放时触发
canplay|当可以恢复播放，但估计以当前速率无法持续播放至结束点时触发
canplaythrough|当可以恢复播放，并且以当前速率可以持续播放至结束点时触发
playing|当播放重新启动时触发
waiting|当播放由于没有下一帧而暂停，并且可预知下一帧能够到来时触发
seeking|seek过程开始时触发
seeked|seek过程结束时触发
ended|播放到达结束点时触发
durationchange|视频时长更新时触发
timeupdate|当期播放时间更新时触发
progress|在加载媒体数据过程中连续触发
play|媒体不再暂停时触发，发生在play()返回后，后autoplay引起播放时
pause|媒体暂停时触发，发生在pause()返回后
ratechange|播放速率更新后触发
volumechange|音量更新后触发
fullscreenchange|全屏或取消全屏时触发
loadedtexttrack|加载完字幕后触发
errortexttrack|加载字幕失败后触发

## 定制皮肤

## 扩展控制面板

## 扩展独立的功能模块

## TODO list

## Changelog
