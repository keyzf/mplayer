if ($this.settings.useDefaultStyle) {
	// 设置style
	var lrcHeight = $this.settings.lrcHeight;
	$this.doms.lrcBox.height(lrcHeight);
	var mpHeight = 160 + lrcHeight;
	$this.doms.mp.height(mpHeight);
	var margin = Math.max((lrcHeight - 40) / 2,0);
	$this.doms.lrc.css({
		marginTop:margin,
		marginBottom:margin
	});
	var listHeight = Math.min(mpHeight - 100,400);
	$('head').append('<style>.mp-list-on .mp-listbox{height:' + listHeight + 'px}</style>');
	$this.doms.musicList.height(listHeight - 40);
}