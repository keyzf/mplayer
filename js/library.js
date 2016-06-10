/**
 * 本文件为库文件
 * 如果你的网站使用了jQuery
 * 请直接删除此文件
 * jQuery完全兼容此库
 */
function $ (name) {
	var reg = /<(.*)>/;
	if (name instanceof(DOM)) {
		return name;
	} else if (name instanceof(HTMLElement)) {
		return new DOM(name);
	} else if (reg.test(name)) {
		return new DOM(document.createElement(reg.exec(name)[1]));
	} else {
		var e = document.querySelectorAll(name);
		return new DOM(e);
	}
}
$.trim = function(str) {
	return str.replace(/(^\s*)|(\s*$)/g,'');
};
$.each = function (obj,fun) {
	for (var key in obj) {
		var value = obj[key];
		fun(key,value);
	}
};
$.get = function (path,callback) {
	var request = new XMLHttpRequest();
	request.open('GET',path);
	request.send();
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status === 200) {
				callback(JSON.parse(request.responseText));
			} else {
				alert('错误：'+request.status);
			}
		}
	};
};
function fillByZero (num,digit) {
	num = String(num);
	for (var i = num.length; i < digit; i++) {
		num = '0' + num;
	}
	return num;
}
function DOM(e) {
	if (e instanceof(NodeList) || e instanceof(Array)) {
		this[0] = e;
	} else if (e instanceof(HTMLElement)) {
		this[0] = [e];
	} else {
		console.error('Unkown argument item');
	}
}

DOM.prototype.foreachEle = function (callback) {
	for (var i = 0; i < this[0].length; i++) {
		callback(new DOM(this[0][i]));
	}
	return this;
};
DOM.prototype.val = function(text) {
	if (text === undefined) {
		return this[0][0].value;
	} else {
		this.foreachEle(function (e) {
			e.get(0).value = text;
		});
	}
};
DOM.prototype.append = function(text) {
	this.foreachEle(function (e) {
		if (text instanceof DOM) {
			text.foreachEle(function (c) {
				e.get(0).appendChild(c.get(0));
			});
		} else {
			e.get(0).appendChild(text);
		}
		
	});
};

DOM.prototype.each = function(callback) {
	var i = 0;
	this.foreachEle(function (e) {
		callback(i,e);
		i++;
	});
	return this;
};
DOM.prototype.eq = function(index) {
	return new DOM(this[0][index]);
};
DOM.prototype.parent = function() {
	var arr = [];
	this.foreachEle(function (e) {
		arr.push(e.get(0).parentNode);
	});
	return new DOM(arr);
};
DOM.prototype.removeAttr = function(name) {
	this.foreachEle(function (e) {
		e.get(0).removeAttribute(name);
		e[name] = null;
	});
	return this;
};
DOM.prototype.html = function(text){
	if (text !== undefined) {
		this.foreachEle(function (e) {
			if (text instanceof(DOM)) {
				e.html('');
				text.foreachEle(function (child) {
					e.append(child.html());
				});
			} else if (text instanceof(HTMLElement)) {
				e.html('');
				e.append(text);
			} else {
				e.get(0).innerHTML = text;
			}
		});
		return this;
	} else {
		return this[0][0].innerHTML;
	}
};

DOM.prototype.addClass = function(cls) {
	this.foreachEle(function (e) {
		if (!e.hasClass(cls)) {
			e.get(0).className += ' ' + cls;
		}
	});
	return this;
};

DOM.prototype.get = function(index){
	return this[0][index];
};
DOM.prototype.hasClass = function(cls) {
	var ret = true;
	this.foreachEle(function (e) {
		var reg = new RegExp('\\b(' + cls +')\\b');
		ret = reg.test(e.getClass()[0]) && ret;
	});
	return ret;
};
DOM.prototype.removeClass = function(cls) {
	this.foreachEle(function (e) {
		if (e.hasClass(cls)) {
			var reg = new RegExp('\\b(' + cls +')\\b');
			e.get(0).className = $.trim(e.get(0).className.replace(reg, ' '));
		}
	});
	return this;
};
DOM.prototype.attr = function(name,value) {
	if (typeof name === 'object') {
		this.foreachEle(function (e) {
			$.each(name, function(key, value) {
				e.attr(key, value);
			});
		});
		return this;
	}
	if (value !== undefined) {
		this.foreachEle(function (e) {
			e = e.get(0);
			e[name] = value;
			e.setAttribute(name, value);
		});
	} else {
		return this[0][0][name] || this[0][0].getAttribute(name);
	}
	return this;
};
DOM.prototype.css = function(name,value) {
	if (typeof name === 'object') {
		this.foreachEle(function (e) {
			$.each(name, function(key, value) {
				e.css(key, value);
			});
		});
		return this;
	}
	if (value !== undefined) {
		if (name.indexOf('-') != -1) {
			nameArr = name.split('-');
			name = nameArr[0];
			for (var i = 1; i < nameArr.length; i++) {
				name += nameArr[i].substr(0,1).toUpperCase() + nameArr[i].substr(1);
			}
		}
		if (parseFloat(value) === value && ['opacity','zIndex','lineHeight'].indexOf(name) === -1) {
			value = value + 'px';
		}
		this.foreachEle(function (e) {
			e.get(0).style[name] = value;
		});
	}else {
		return this[0][0].style[name] || document.getComputedStyle(this[0][0])[name];
	}
};
DOM.prototype.scrollTop = function(value) {
	this.foreachEle(function (e) {
		e.get(0).scrollTop = value;
	});	
};
DOM.prototype.toggleClass = function(cls) {
	this.foreachEle(function (e) {
		if (e.hasClass(cls)) {
			e.removeClass(cls);
		} else {
			e.addClass(cls);
		}
	});
	return this;
};
DOM.prototype.getClass = function() {
	var arr = [];
	this.foreachEle(function (e) {
		arr.push(e.get(0).className);
	});
	return arr;
};
DOM.prototype.bind = DOM.prototype.on = function(name,fun) {
	this.foreachEle(function (e) {
		e = e.get(0);
		if (e.addEventListener) {
			e.addEventListener(name, fun);
		} else if (e.attachEvent) {
			e.attachEvent('on'+name,fun);
		} else {
			e['on'+name] = fun;
		}
	});
	return this;
};
DOM.prototype.unbind = function(name) {
	this.foreachEle(function (e) {
		e = e.get(0);
		if (e.removeEventListener) {
			e.removeEventListener(name);
		} else if (e.detachEvent) {
			e.detachEvent('on'+name);
		} else {
			e['on'+name] = null;
		}
	});
	return this;
};