new Mplayer({
	// 盛放mPlayer的父容器
	containerSelector:'.container',
	// 歌曲列表
	songList:[
		[
			{
				"basic":true,
				"name":"专辑名/列表名",
				"singer":"列表公用歌手",
				"img":"列表公用图片"
			},
			{
				"name":"歌名",
				"img":"本歌曲图片",
				"src":"歌曲路径",
				"lrc":"lrc歌词,每句用'\n'隔开"
			}
			// 可以添加更多歌曲
		]
		// 可以添加更多列表
	]
});