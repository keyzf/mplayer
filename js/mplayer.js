/**
 * 创建mplayer播放器
 * @param {object} settings 设置信息
 */

function Mplayer(settings) {
	$this = this;
	$this.init(settings);
	$this.dataList();
	$this.bindEvents();
	$this.play($this.settings.playList,$this.settings.playSong);
}

// 格式化数据
Mplayer.prototype.dataList = function(){
	$this.songArr = [];
	for (var i = 0; i < $this.settings.list.length; i++) {
		var basicSinger = '',
			basicImage = '';
			$this.songArr.push([]);
		for (var j = 0; j < $this.settings.list[i].length; j++) {
			if ($this.settings.list[i][j].basic) {
				// 添加列表到页面
				var listName = $this.settings.list[i][j].name;
				$this.doms.list.append($('<li>').html(listName));
				basicSinger = $this.settings.list[i][j].singer || '';
				basicImage = $this.settings.list[i][j].img || '';
				$this.songArr[i].listName = listName;
			} else {
				var singerName = $this.settings.list[i][j].singer || basicSinger,
					songImg = $this.settings.list[i][j].img || basicImage,
					songName = $this.settings.list[i][j].name;
				$this.songArr[i].push({
					'singer':singerName,
					'image':songImg,
					'name':songName,
					'src':$this.settings.list[i][j].src,
					'lrc':$this.settings.list[i][j].lrc
				});
			}
		}
	}
};

// 初始化
Mplayer.prototype.init = function(settings){
	var playMode = settings.playMode !== undefined ? settings.playMode : 0;
	var playList = settings.playList !== undefined ? settings.playList : 0;
	var playSong = settings.playSong !== undefined ? settings.playSong : 0;
	var autoPlay = settings.autoPlay !== undefined ? Boolean(settings.autoPlay) : true;
	var $this = this;
	var timeArr = [];
	// 处理播放模式
	if (playMode > 2) {
		playmode = 2;
	} else if (playMode < 0) {
		playMode = 0;
	}
	// 存储设置
	$this.settings = {
		playMode:playMode,
		playList:playList,
		playSong:playSong,
		autoPlay:autoPlay,
		list:settings.songList
	};
	// 初始化dom元素
	$this.doms = {
		lrc:$('#mplayer-lrc-wrap'),
		listtitle:$('#mplayer-list-select h3'),
		title:$('#mplayer-playing-name'),
		list:$('#mplayer-list-select-ul'),
		musicList:$('#mplayer-list'),
		process:$('#mplayer-play-process-current'),
		bufferProcess:$('#mplayer-play-process-buffer'),
		totalProcess:$('#mplayer-play-process-total'),
		cover:$('#mplayer-cover-img'),
		coverBox:$('#mplayer-cover'),
		playbutton:$('#mplayer-control-button-play'),
		prevbutton:$('#mplayer-control-button-prev'),
		nextbutton:$('#mplayer-control-button-next'),
		modebox:$('#mplayer-control-modebox'),
		modebuttons:$('#mplayer-control-modebox').find('a'),
		listSelect:$('#mplayer-list-select-ul')
	};

	// 设置播放模式
	$this.doms.modebuttons.eq(playMode).addClass('mplayer-deep-green');
	// 创建audio标签
	$this.audiodom = $('<audio></audio>').attr({
		'preload':'preload',
		'data-playmode':playMode,
		'data-currentlist':playList,
		'data-currentsong':playSong,
		'data-currentLrc':0,
		'data-displayList':0
	});
	$this.tools = {
		rand:function (min,max) {
			if (!max) {
				max = min;
				min = 0;
			}
			var r = 0;
			do {
				r = Math.round(Math.random() * max);
			} while(r < min);
			return r;
		},
		fillByZero:function (num,digit) {
			num = String(num);
			for (var i = num.length; i < digit; i++) {
				num = '0' + num;
			}
			return num;
		}
	};
};



Mplayer.prototype.bindEvents = function(){
	$this.audiodom.bind('canplay', function () {
		if ($this.settings.autoPlay) {
			$(this).get(0).play();
		}
		$this.settings.autoPlay = true;
		$this.setTime($(this).prop('duration'),'mplayer-play-process-alltime');
	}).bind('play', function() {
		$this.doms.coverBox.addClass('mplayer-cover-animate');
		$this.doms.playbutton.html('&#xe909;');
	}).bind('pause', function() {
		$this.doms.coverBox.removeClass('mplayer-cover-animate');
		$this.doms.playbutton.html('&#xe908;');
	}).bind('ended', function() {
		$this.toNext();
	}).bind('timeupdate', function(event) {
		var currentTime = Math.round($(this).prop('currentTime')*1000);
		// 更新歌词
		for (var i = 0; i < timeArr.length; i++) {
			if (currentTime <= timeArr[i]) {
				break;
			}
		}
		i--;
		if (parseInt($this.audiodom.attr('data-currentLrc')) !== i) {
			$this.audiodom.attr('data-currentLrc', i);
			$('#mplayer-lrcbox').animate({scrollTop: i*32}, 500);
			$('#mplayer-lrc-wrap .mplayer-lrc-current').removeClass('mplayer-lrc-current');
			$('#mplayer-lrc-'+timeArr[i]).addClass('mplayer-lrc-current');
		}
		// 更新进度条
		$this.doms.process.css('width', $(this).prop('currentTime')/$(this).prop('duration')*100+'%');
		// 更新显示时间
		$this.setTime($(this).prop('currentTime'),'mplayer-play-process-currenttime');
	});
	// 播放按钮
	$this.doms.playbutton.on('click', function() {
		if ($this.audiodom.get(0).paused) {
			$this.audiodom.get(0).play();
		} else {
			$this.audiodom.get(0).pause();
		}
	});
	// 上一首
	$this.doms.prevbutton.on('click', function() {
		var mode = parseInt($this.audiodom.attr('data-playmode'));
		var s = parseInt($this.audiodom.attr('data-currentsong'));
		var l = parseInt($this.audiodom.attr('data-currentlist'));
		if (mode == 2) {
			$this.rand(l,s);
		} else {
			$this.prev(l,s);
		}
	});
	// 下一首
	$this.doms.nextbutton.on('click', function() {
		var mode = parseInt($this.audiodom.attr('data-playmode'));
		var s = parseInt($this.audiodom.attr('data-currentsong'));
		var l = parseInt($this.audiodom.attr('data-currentlist'));
		if (mode == 2) {
			$this.rand(l,s);
		} else {
			$this.next(l,s);
		}
	});
	// 切换模式
	$this.doms.modebox.on('click', 'a', function() {
		$this.doms.modebuttons.removeClass('mplayer-deep-green');
		$(this).addClass('mplayer-deep-green');
		$this.audiodom.attr('data-playmode', $(this).index());
	});
	// 调整进度
	$this.doms.totalProcess.click(function(event) {
		var x = event.offsetX;
		var percent = x/$(this).width();
		percent = percent > 100 ? 100 : percent;
		var alltime = $this.audiodom.prop('duration');
		$this.audiodom.prop('currentTime', alltime * percent);
	});
	// 音量调节
	$('#mplayer-control-vol-range').on('change', function() {
		var vol = $(this).val()/100;
		$this.audiodom.prop('volume', vol);
		if (vol >= 0.8) {
			ico = '&#xe903';
		} else if (vol >= 0.3 && vol < 0.8) {
			ico = '&#xe904';
		} else if (vol > 0 && vol < 0.3) {
			ico = '&#xe905';
		} else if (vol === 0) {
			ico = '&#xe906';
		}
		$('#mplayer-control-vol-mute').html(ico);
	});
	// 列表开关
	$('#mplayer-menu-switch').on('click', function() {
		$('#mplayer-container').toggleClass('mplayer-play-list-on');
	});
	// 显示列表
	$this.doms.listtitle.on('click', function() {
		$('#mplayer-list-select').toggleClass('mplayer-list-select-on');
	});
	// 切换列表
	$this.doms.listSelect.on('click', 'li', function() {
		$this.changeList($(this).index());
		$(this).parent().parent().removeClass('mplayer-list-select-on');
	});
	// 切换歌曲
	$this.doms.musicList.on('click', 'li', function() {
		console.log($(this).index());
		$this.play(parseInt($this.audiodom.attr('data-displayList')),$(this).index());
	});
};


/**
 * 播放指定音乐
 * @param  {number} list 列表id
 * @param  {number} song 歌曲id
 */
Mplayer.prototype.play = function(list,song){
	$this = this;
	var thissong = $this.songArr[list][song];
	$this.audiodom.attr({
		src: thissong.src,
		'data-currentsong': song,
		'data-currentlist':list
	});
	$('#mplayer-lrcbox').animate({scrollTop: 0}, 500);
	$this.doms.cover.attr('src', thissong.image);
	$this.doms.title.html('<h2>'+ thissong.name + '<small>'+ thissong.singer +'</small></h2>');
	$this.changeList(list);
	timeArr = $this.setLrc(thissong.lrc);
	$this.audiodom.attr('data-currentLrc',  0);
};


/**
 * 更换显示列表
 * @param  {number} list 列表序号
 */
Mplayer.prototype.changeList = function (list) {
	$this = this;
	$this.doms.listtitle.html($this.songArr[list].listName);
	$this.doms.musicList.html('');
	for (var i = 0; i < $this.songArr[list].length; i++) {
		$this.doms.musicList.append($('<li>').html($this.songArr[list][i].name + ' - ' + $this.songArr[list][i].singer).addClass('mplayer-list-song'));
	}
	$this.audiodom.attr('data-displayList', list);
	if (parseInt($this.audiodom.attr('data-currentlist')) === list) {
		var song = $this.audiodom.attr('data-currentsong');
		console.log(song);
		$('#mplayer-list').find('li').eq(song).addClass('mplayer-list-song-current');
	}
};

/**
 * 设置显示时间
 * @param {float} time 时间(s)
 * @param {string} ele  显示元素id
 */
Mplayer.prototype.setTime = function (time,ele) {
	var min = $this.tools.fillByZero(parseInt(time/60),2);
	time -= min*60;
	var second = $this.tools.fillByZero(Math.round(time),2);
	$('#'+ele).html(min+':'+second);
};

/**
 * 设置显示歌词
 * @param {string} lrc 歌词字符串
 */
Mplayer.prototype.setLrc = function (lrc) {
	$this = this;
	// 匹配歌词的正则表达式
	var reg = /\[(\d{2}):(\d{2})\.(\d{2})\]([^\n\r]*)/g;
	var lrcObj = {};
	while (true) {
		var result = reg.exec(lrc);
		if (!result) {
			break;
		}
		var time = Math.round((parseInt(result[1])*60 + parseInt(result[2]) + parseInt(result[3])/100)*1000);
		lrcObj[time] = $.trim(result[4]);
	}
	var timeArr = [];
	// 将歌词输入到歌词框
	$this.doms.lrc.html('');
	for (var ctime in lrcObj) {
		$this.doms.lrc.append($('<li>').html(lrcObj[ctime] || " ").addClass('mplayer-lrc').attr('id', 'mplayer-lrc-'+ctime));
		timeArr.push(parseInt(ctime));
	}
	return timeArr;
};

// 上一曲
Mplayer.prototype.prev = function (l,s) {
	$this = this;
	s--;
	if (s < 0) {
		s = $this.songArr[l].length-1;
	}
	$this.play(l,s);
};
// 下一曲
Mplayer.prototype.next = function (l,s) {
	$this = this;
	s++;
	if (s >= $this.songArr[l].length) {
		s = 0;
	}
	$this.play(l,s);
};
// 随机播放
Mplayer.prototype.rand = function (l,s) {
	$this = this;
	var ss = s;
	do{
		s = $this.tools.rand($this.songArr[l].length-1);
	} while (s === ss);
	
	$this.play(l,s);
};
// 单曲循环
Mplayer.prototype.repeat = function (l,s) {
	$this = this;
	$this.play(l,s);
};
// 正常下一首
Mplayer.prototype.toNext = function () {
	$this = this;
	var mode = parseInt($this.audiodom.attr('data-playmode'));
	var s = parseInt($this.audiodom.attr('data-currentsong'));
	var l = parseInt($this.audiodom.attr('data-currentlist'));
	switch (mode) {
		case 1:
			$this.repeat(l,s);
			break;
		case 2:
			$this.rand(l,s);
			break;
		default:
			$this.next(l,s);
			break;
	}
};

