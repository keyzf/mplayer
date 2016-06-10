/**
 * 创建mplayer播放器
 * @param {array} songList 歌曲列表
 * @param {number} playMode 播放模式(0->列表循环,1->单曲循环,2->随机,可选,默认为0)
 * @param {number} playList 第一首播放的歌的列表(可选,默认为0)
 * @param {number} playSong 第一首播放的歌在列表中的的索引(不算basic,可选,默认为0)
 */
function Mplayer(songList,playMode,playList,playSong) {
	playMode = playMode !== undefined ? playMode : 0;
	playList = playList !== undefined ? playList : 0;
	playSong = playSong !== undefined ? playSong : 0;
	var cls = this;
	var timeArr = [];
	var currentLrc = 0;
	// 处理播放模式
	if (playMode > 2) {
		playmode = 2;
	} else if (playMode < 0) {
		playMode = 0;
	}
	cls.doms = {
		lrc:$('#mplayer-lrc-wrap'),
		listtitle:$('#mplayer-list-select h3'),
		title:$('#mplayer-playing-name'),
		list:$('#mplayer-list-select-ul'),
		musicList:$('#mplayer-list'),
		audio:cls.audiodom,
		process:$('#mplayer-play-process-current'),
		bufferProcess:$('#mplayer-play-process-buffer'),
		totalProcess:$('#mplayer-play-process-total'),
		cover:$('#mplayer-cover-img'),
		coverBox:$('#mplayer-cover'),
		playbutton:$('#mplayer-control-button-play'),
		prevbutton:$('#mplayer-control-button-prev'),
		nextbutton:$('#mplayer-control-button-next'),
		modebuttons:$('#mplayer-control-modebox a')
	};
	// 设置播放模式
	cls.doms.modebuttons.eq(playMode).addClass('mplayer-deep-green');
	/**
	 * 播放指定音乐
	 * @param  {number} list 列表id
	 * @param  {number} song 歌曲id
	 * @return {void}
	 */
	cls.play = function (list,song) {
		var thissong = cls.songArr[list][song];
		cls.audiodom.attr({
			src: thissong.src,
			'data-currentsong': song,
			'data-currentlist':list
		});
		$('#mplayer-lrcbox').scrollTop(0);
		cls.doms.cover.attr('src', thissong.image);
		cls.doms.title.html('<h2>'+ thissong.name + '<small>'+ thissong.singer +'</small></h2>');
		cls.changeList(list);
		timeArr = cls.setLrc(thissong.lrc);
		currentLrc = 0;
	};
	cls.changeList = function (list) {
		cls.doms.listtitle.html(cls.songArr[list].listName);
		cls.doms.musicList.html('');
		for (var i = 0; i < cls.songArr[list].length; i++) {
			cls.doms.musicList.append($('<li>').html(cls.songArr[list][i].name + ' - ' + cls.songArr[list][i].singer).addClass('mplayer-list-song'));
		}
		var lis = $('#mplayer-list li');
		lis.each(function(index, el) {
			$(el).on('click', function() {
				cls.play(list,index);
			});
		});
		if (parseInt(cls.audiodom.attr('data-currentlist')) === list) {
			var song = cls.audiodom.attr('data-currentsong');
			lis.eq(song).addClass('mplayer-list-song-current');
		}
	};
	cls.setTime = function (time,ele) {
		var min = fillByZero(parseInt(time/60),2);
		time -= min*60;
		var second = fillByZero(Math.round(time),2);
		$('#'+ele).html(min+':'+second);
	};
	cls.setLrc = function (lrc) {
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
		cls.doms.lrc.html('');
		for (var ctime in lrcObj) {
			cls.doms.lrc.append($('<li>').html(lrcObj[ctime] || " ").addClass('mplayer-lrc').attr('id', 'mplayer-lrc-'+ctime));
			timeArr.push(parseInt(ctime));
		}
		return timeArr;
	};

	cls.audiodom = $('<audio>').attr({
		'preload':'preload',
		'data-playmode':playMode,
		'data-currentlist':playList,
		'data-currentsong':playSong,
		'data-currentLrc':0
	}).bind('canplay', function () {
		$(this).get(0).play();
		cls.setTime($(this).get(0).duration,'mplayer-play-process-alltime');
	}).bind('play', function() {
		cls.doms.coverBox.addClass('mplayer-cover-animate');
		cls.doms.playbutton.html('&#xe909;');
	}).bind('pause', function() {
		cls.doms.coverBox.removeClass('mplayer-cover-animate');
		cls.doms.playbutton.html('&#xe908;');
	}).bind('ended', function() {
		cls.toNext();
	}).bind('timeupdate', function(event) {
		var currentTime = Math.round($(this).get(0).currentTime*1000);
		// 更新歌词
		for (var i = 0; i < timeArr.length; i++) {
			if (currentTime <= timeArr[i]) {
				break;
			}
		}
		i--;
		if (currentLrc !== i) {
			currentLrc = i;
			$('#mplayer-lrcbox').scrollTop(i*32);
			$('#mplayer-lrc-wrap .mplayer-lrc-current').removeClass('mplayer-lrc-current');
			$('#mplayer-lrc-'+timeArr[i]).addClass('mplayer-lrc-current');
		}
		// 更新进度条
		cls.doms.process.css('width', $(this).get(0).currentTime/$(this).get(0).duration*100+'%');
		// 更新显示时间
		cls.setTime($(this).get(0).currentTime,'mplayer-play-process-currenttime');
	});
	// 播放按钮
	cls.doms.playbutton.on('click', function() {
		if (cls.audiodom.get(0).paused) {
			cls.audiodom.get(0).play();
		} else {
			cls.audiodom.get(0).pause();
		}
	});
	cls.doms.prevbutton.on('click', function() {
		var mode = parseInt(cls.audiodom.attr('data-playmode'));
		var s = parseInt(cls.audiodom.attr('data-currentsong'));
		var l = parseInt(cls.audiodom.attr('data-currentlist'));
		if (mode == 2) {
			cls.rand(l,s);
		} else {
			cls.prev(l,s);
		}
	});
	cls.doms.nextbutton.on('click', function() {
		var mode = parseInt(cls.audiodom.attr('data-playmode'));
		var s = parseInt(cls.audiodom.attr('data-currentsong'));
		var l = parseInt(cls.audiodom.attr('data-currentlist'));
		if (mode == 2) {
			cls.rand(l,s);
		} else {
			cls.next(l,s);
		}
	});
	// 切换播放模式
	cls.doms.modebuttons.each(function(index, el) {
		$(el).on('click', function() {
			cls.doms.modebuttons.removeClass('mplayer-deep-green');
			$(el).addClass('mplayer-deep-green');
			cls.audiodom.attr('data-playmode', index);
		});
	});
	// 上一曲
	cls.prev = function (l,s) {
		s--;
		if (s < 0) {
			s = cls.songArr[l].length-1;
		}
		cls.play(l,s);
	};
	// 下一曲
	cls.next = function (l,s) {
		s++;
		if (s >= cls.songArr[l].length) {
			s = 0;
		}
		cls.play(l,s);
	};
	// 随机播放
	cls.rand = function (l,s) {
		var ss = s;
		do{
			s = rand(cls.songArr[l].length-1);
		} while (s === ss);
		
		cls.play(l,s);
	};
	// 单曲循环
	cls.repeat = function (l,s) {
		cls.play(l,s);
	};
	// 正常下一首
	cls.toNext = function () {
		var mode = parseInt(cls.audiodom.attr('data-playmode'));
		var s = parseInt(cls.audiodom.attr('data-currentsong'));
		var l = parseInt(cls.audiodom.attr('data-currentlist'));
		switch (mode) {
			case 1:
				cls.repeat(l,s);
				break;
			case 2:
				cls.rand(l,s);
				break;
			default:
				cls.next(l,s);
				break;
		}
	};
	// 时间跳转
	cls.doms.totalProcess.get(0).onclick = function (event) {
		event = event || window.event;
		var x = event.layerX;
		var percent = x/400;
		var alltime = cls.audiodom.get(0).duration;
		cls.audiodom.get(0).currentTime = alltime * percent;
	};
	// 音量调节
	$('#mplayer-control-vol-range').on('change', function() {
		var vol = $(this).val()/100;
		cls.audiodom.get(0).volume = vol;
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
	cls.doms.listtitle.on('click', function() {
		$('#mplayer-list-select').toggleClass('mplayer-list-select-on');
	});

	// 格式化数据
	cls.songArr = [];
	for (var i = 0; i < songList.length; i++) {
		var basicSinger = '',
			basicImage = '';
			cls.songArr.push([]);
		for (var j = 0; j < songList[i].length; j++) {
			if (songList[i][j].basic) {
				// 添加列表
				var listName = songList[i][j].name;
				cls.doms.list.append($('<li>').html(listName));
				basicSinger = songList[i][j].singer || '';
				basicImage = songList[i][j].img || '';
				cls.songArr[i].listName = listName;
			} else {
				var singerName = songList[i][j].singer || basicSinger,
					songImg = songList[i][j].img || basicImage,
					songName = songList[i][j].name;
				cls.songArr[i].push({
					'singer':singerName,
					'image':songImg,
					'name':songName,
					'src':songList[i][j].src,
					'lrc':songList[i][j].lrc
				});
			}
		}
	}
	// 切换列表
	$('#mplayer-list-select-ul li').each(function(index, el) {
		$(el).on('click', function() {
			cls.changeList(index);
			$(el).parent().parent().removeClass('mplayer-list-select-on');
		});
	});
	cls.play(playList,playSong);
}
function fillByZero (num,digit) {
	num = String(num);
	for (var i = num.length; i < digit; i++) {
		num = '0' + num;
	}
	return num;
}

function rand (min,max) {
	if (!max) {
		max = min;
		min = 0;
	}
	var r = 0;
	do {
		r = Math.round(Math.random() * max);
	} while(r < min);
	return r;
}