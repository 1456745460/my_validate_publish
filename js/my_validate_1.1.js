if(typeof(jQuery) == "undefined") {
	alert("表单校验插件基于jquery.js,请先引入..");
};
(function($) { // 开启沙箱模式
	$(function() {

		var CanSubmit = true; // 是否可以提交开关

		$.fn.my_validate = function(obj) {
			var DeveloperMode = obj["DeveloperMode"] != undefined ? obj["DeveloperMode"] : false;
			var subId = obj["subId"];
			var formId = obj["formId"];
			var ifAjax = obj["ifAjax"] != undefined ? obj["ifAjax"] : false;
			var realTime = obj["realTime"] != undefined ? obj["realTime"] : true;
			var ifLayer = obj["ifLayer"] != undefined ? obj["ifLayer"] : false;
			var ifImg = obj["ifImg"] != undefined ? obj["ifImg"] : false;
			var ImgUrl = obj["ImgUrl"] != undefined ? obj["ImgUrl"] : false;
			var submitSpecialData = obj["submitSpecialData"] != undefined ? obj["submitSpecialData"] : false;
			var AutoScroll = obj["AutoScroll"] != undefined ? obj["AutoScroll"] : [false, 0];

			if(DeveloperMode) {
				console.log("已经启用开发者模式...");
				if(document.getElementById(subId) == null) {
					alert("subId配置错误!!!未找到配置的提交按钮id");
					return false;
				} else if(document.getElementById(formId) == null) {
					alert("formId配置错误!!未找到配置的form表单id!");
					return false;
				} else if($("#" + formId).attr("method") == undefined || $("#" + formId).attr("method") == "") {
					alert("form 表单没有配置method，数据传送方法post/get");
					return false;
				} else if($("#" + formId).attr("action") == undefined || $("#" + formId).attr("action") == "") {
					alert("form 表单没有配置action，请求URL");
					return false;
				} else if(typeof checkJson === "undefined") {
					alert("请配置一个方法名为 checkJson() 的 校验配置");
					return false;
				} else if(submitSpecialData) {
					if(typeof specialData === "undefined") {
						alert("请配置一个方法名为 specialData() 用于 除表单参数以外添加的特殊参数");
						return false;
					}
				} else if(ifLayer) {
					if(typeof(layer) == "undefined") {
						alert("没有引入弹出层layer.js,请引入或关闭ifLayer:false");
						return false;
					}
				} else if(typeof(AutoScroll) != 'object') {
					alert("AutoScroll 参数是一个数组 例如:  AutoScroll:[false,0] ");
					return false;
				}
			}

			var myJSON = checkJson();

			if(realTime) { // 实时的校验
				var nowTime = new Date().getTime();
				$("#" + formId).addClass('myValidateForm_' + nowTime);
				for(var i = 0; i < myJSON.length; i++) {
					$("#" + myJSON[i].id).addClass("vali_" + nowTime);
				}
				$(".myValidateForm_" + nowTime + " .vali_" + nowTime).on('blur', function() {
					var t = $(this);
					if(ifLayer) {
						layer.closeAll();
					}
					for(var i = 0; i < myJSON.length; i++) {
						if(t.attr("id") == myJSON[i].id && myJSON[i].realTime != false) {
							var getId = t.attr("id");
							var val = $("#" + getId).val();
							eachVali(val, i);
						}
					}
				})
			}

			// 检验函数
			function eachVali(val, i) {
				var ScrollCount = 0;
				for(var j = 0; j < myJSON[i].rules.length; j++) {

					// 校验不通过提示函数
					function errorTips(str) {
						if(ifLayer) {
							layer.tips(str, "#" + myJSON[i].id, {
								tipsMore: true
							});
						} else {
							if(ifImg) {
								$("#" + myJSON[i].tid).html("<img src='" + ImgUrl + "'>" + str);
							} else {
								$("#" + myJSON[i].tid).html(str);
							}
						}
						if(AutoScroll && ScrollCount == 0) {
							$("html, body").animate({
								scrollTop: $("#" + myJSON[i].id).offset().top - obj["AutoScroll"][1]
							}, 0);
							ScrollCount++;
						}
						CanSubmit = false;
					}

					// 校验通过,如果没用layer 提示,置空校验错误提示
					function removeHtml() {
						$("#" + myJSON[i].tid).html("");
					}

					// 第一种,正则校验
					if(typeof(myJSON[i].rules[j].reg) != 'undefined') {
						// 在判断是否为空
						if(myJSON[i].rules[j].reg.toString() == "/^.+$/") {
							if(myJSON[i].rules[j].reg.test(val)) {
								removeHtml();
							} else {
								errorTips(myJSON[i].rules[j].tips);
								break;
							}
						} else {
							if(myJSON[i].rules[j].reg.test(val) && val != "") {
								removeHtml();
							} else {
								errorTips(myJSON[i].rules[j].tips);
								break;
							}
						}

					}
					// 第二种,长度校验
					else if(typeof(myJSON[i].rules[j].longest) != 'undefined') {
						if(val.length > parseInt(myJSON[i].rules[j].longest) || val.length < parseInt(myJSON[i].rules[j].shortest)) {
							errorTips(myJSON[i].rules[j].tips);
							break;
						} else {
							removeHtml();
						}
					}
					// 第三种,自定义校验
					else if(typeof(myJSON[i].rules[j].custom) != 'undefined') {
						if(!myJSON[i].rules[j].custom()) {
							errorTips(myJSON[i].rules[j].tips);
							break;
						} else {
							removeHtml();
						}
					}
					// 以上情况都不存在,书写有误
					else {
						CanSubmit = false;
						alert("校验json配置错误!!!");
						break;
					}
				}
			}

			// 点击提交按钮
			$("#" + subId).on('click', function() {
				CanSubmit = true;
				if(ifLayer) {
					layer.closeAll();
				}
				for(var i = 0; i < myJSON.length; i++) {
					var getId = myJSON[i].id;
					var val = $("#" + getId).val();
					eachVali(val, i);
				}

				if(CanSubmit) {
					// ajax 提交
					if(ifAjax) {
						var mydata = '';
						if(submitSpecialData) {
							mydata = $.param(specialData()) + '&' + $("#" + formId).serialize();
						} else {
							mydata = $("#" + formId).serialize();
						}
						$.ajax({
							url: $("#" + formId).attr("action"),
							type: $("#" + formId).attr("method"),
							data: mydata,
							dataType: "json",
							async: false,
							success: function(data) {
								getAjax(data);
							},
							error: function(XMLHttpRequest, textStatus, errorThrown) {
								console.log("ajax 提交表单报错了! 错误代码:" + XMLHttpRequest.status);
							}
						});
					}
					// 表单 提交
					else if(ifAjax == false) {
						$("#" + formId).submit();
					}
					// 跨域ajax 提交
					else if(ifAjax == 'jsonp') {
						$.ajax({
							url: $("#" + formId).attr("action"),
							type: "get",
							data: $("#" + formId).serialize(),
							dataType: "jsonp",
							jsonp: "jsoncallback",
							success: function(data) {
								getAjax(data);
							},
							error: function(XMLHttpRequest, textStatus, errorThrown) {
								console.log("ajax 跨域 提交表单报错了! 错误代码:" + XMLHttpRequest.status);
							}
						});
					}
				}
			});

		}
	});

	// 快捷调用常用正则
	zz = { // 定义一个 名为 zz 的方法,在这里添加常用正则, 例如 zz.notNull()  调用

		notNull: function() {
			return /^.+$/;
		},
		// 不能为空
		chinese: function() {
			return /^[\u4e00-\u9fa5]+$/;
		}, // 中文
		email: function() {
			return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
		}, // 邮箱
		post: function() {
			return /^[1-9][0-9]{0,}$/;
		}, //邮政编码
		num: function() {
			return /^[0-9]*$/;
		}, // 数字
		ffzs: function() {
			return /^\d+$/;
		}, // 非负整数
		aBc123: function() {
			return /^[A-Za-z0-9]+$/;
		}, //数字和英文
		mobile: function() {
			return /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
		}, //手机号
		tel: function() {
			return /^1[0-9]{10}$/;
		}, // 手机号
		fax: function() {
			return /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/;
		} //传真

	}
})(jQuery);
// @且听风吟