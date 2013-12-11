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
controls|_Object/String_|_null_|控制面板配置|具体配置说明
width|_Number/String_|_'auto'_|播放器宽度|
height|_Number/String_|_200_|播放器高度|
playlist|_Object_|_[]_|播放列表|具体配置说明
playlistIndex|_Number_|_0_|播放列表初始序号|
source|_Object_|_null_|初始化的媒体源对象|具体配置说明
defaultSkin|_String_|_'dev-default-skin'_|默认的皮肤钩子类名|
doCover|_Boolean_|_false_|是否设置播放器的封面|具体配置说明

#### controls配置说明
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
    }
    
#### playlist配置说明
播放器支持多个视频的连续播放，此时需配置playlist



## 定制皮肤

## 扩展控制面板

## 扩展独立的功能模块

## TODO list

## Changelog
