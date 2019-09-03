if (typeof (jQuery) == "undefined") {
	console.log("%c表单校验插件基于jquery.js,请先引入..",'color:blue');
}
(function ($) { // 开启沙箱模式
	$(function () {

		var CanSubmit = true; // 是否可以提交开关

		$.fn.my_validate = function (obj) {
			var DeveloperMode = obj["DeveloperMode"] != undefined ? obj["DeveloperMode"] : false;
			var subId = obj["subId"];
			if(subId.indexOf(',')!=-1){
				var arrD=subId.split(',');
				var str='';
				for(var nn=0;nn<arrD.length;nn++){
					str+='#'+arrD[nn]+",";
				}
				str=str.substring(0,str.length-1);
				subId=str;
			}else{
				subId="#"+subId;
			}
			var formId = obj["formId"];
			var ifAjax = obj["ifAjax"] != undefined ? obj["ifAjax"] : false;
			var realTime = obj["realTime"] != undefined ? obj["realTime"] : false;
			var ifLayer = obj["ifLayer"] != undefined ? obj["ifLayer"] : false;
			var ifImg = obj["ifImg"] != undefined ? obj["ifImg"] : [false, ""];
			var submitSpecialData = obj["submitSpecialData"] != undefined ? obj["submitSpecialData"] : false;
			var AutoScroll = obj["AutoScroll"] != undefined ? obj["AutoScroll"] : [false, 0];
			var confirmSub = obj["confirmSub"] != undefined ? obj["confirmSub"] : [false, "",""];

			if (DeveloperMode) {
				console.log("%c已经启用开发者模式...",'color:blue');
				console.log("%c正式环境请关闭开发者模式...",'color:blue');
				if (document.getElementById(formId) == null) {
					alert("formId配置错误!!未找到配置的form表单id!");
					return false;
				} else if ($("#" + formId).attr("method") == undefined || $("#" + formId).attr("method") == "") {
					alert("form 表单没有配置method，数据传送方法post/get");
					return false;
				} else if ($("#" + formId).attr("action") == undefined || $("#" + formId).attr("action") == "") {
					alert("form 表单没有配置action，请求URL");
					return false;
				} else if (typeof checkJson === "undefined") {
					alert("请配置一个方法名为 checkJson() 的 校验配置");
					return false;
				} else if (submitSpecialData) {
					if (typeof specialData === "undefined") {
						alert("请配置一个方法名为 specialData() 用于 除表单参数以外添加的特殊参数");
						return false;
					}
				} else if (ifLayer) {
					if (typeof (layer) == "undefined") {
						alert("没有引入弹出层layer.js,请引入或关闭ifLayer:false");
						return false;
					}
				}
			}

			var myJSON = checkJson();; // 获取配置JSON

			var ScrollCount = 0; // 开启滚动，默认0

			if (realTime[0]) { // 实时的校验
				var nowTime = new Date().getTime();
				$("#" + formId).addClass('myValidateForm_' + nowTime);
				for (var i = 0; i < myJSON.length; i++) {
					$("#" + myJSON[i].id).addClass("vali_" + nowTime);
				}
				var realTimeStr="";
				if(realTime[1].indexOf('-')>-1){
					var realTimeArr=realTime[1].split('-');
				    for(var nn=0;nn<realTimeArr.length;nn++){
					   realTimeStr+=realTimeArr[nn]+" ";
				    }
				}else{
					realTimeStr=realTime[1];
				}
				$(".myValidateForm_" + nowTime + " .vali_" + nowTime).on(realTimeStr, function () {
					var t = $(this);
					if (ifLayer) {
						layer.closeAll();
					}
					for (var i = 0; i < myJSON.length; i++) {
						if (t.attr("id") == myJSON[i].id && myJSON[i].realTime != false) { // 取id，并且判断单个实时校验是否开启
							var getId = t.attr("id");
							var val = $("#" + getId).val();
							eachVali(val, i);
							break;
						}
					}
				})
			}

			// 检验函数
			function eachVali(val, i) {
				for (var j = 0; j < myJSON[i].rules.length; j++) {

					// 校验不通过提示函数
					function errorTips(str) {
						if (ifLayer) { // 弹出层提示
							layer.tips(str, "#" + myJSON[i].tid, {
								tipsMore: true
							});
						} else {
							if (ifImg[0]) { // 有图标，加入图标
								$("#" + myJSON[i].tid).html("<img src='" + ifImg[1] + "'>" + str);
							} else {
								$("#" + myJSON[i].tid).html(str);
							}
						}
						if (AutoScroll && ScrollCount == 0) { // 滚动到第一个校验不通过的位置
							$("html, body").animate({
								scrollTop: $("#" + myJSON[i].id).offset().top - obj["AutoScroll"][1]
							}, 0);
							ScrollCount++;
						}
						CanSubmit = false;
					}

					// 校验通过,如果没用layer 提示,置空校验错误提示
					function removeHtml() {
						if(!ifLayer){
							$("#" + myJSON[i].tid).html("");
						}
					}

					// 第一种,正则校验
					if (typeof (myJSON[i].rules[j].reg) != 'undefined') {
						// 再判断是否为空
						if (myJSON[i].rules[j].reg.toString() == "/^.+$/") {
							if (myJSON[i].rules[j].reg.test(val)|| val!="") {
								removeHtml();
							} else {
								errorTips(myJSON[i].rules[j].tips);
								break;
							}
						} else {
							if (myJSON[i].rules[j].reg.test(val) && val != "") {
								removeHtml();
							} else {
								errorTips(myJSON[i].rules[j].tips);
								break;
							}
						}

					}
					// 第二种,长度校验
					else if (typeof (myJSON[i].rules[j].longest) != 'undefined') {
						if (val.length > parseInt(myJSON[i].rules[j].longest) || val.length < parseInt(myJSON[i].rules[j].shortest)) {
							errorTips(myJSON[i].rules[j].tips);
							break;
						} else {
							removeHtml();
						}
					}
					// 第三种,自定义校验
					else if (typeof (myJSON[i].rules[j].custom) != 'undefined') {
						if (!myJSON[i].rules[j].custom($("#"+myJSON[i].id))) {
							errorTips(myJSON[i].rules[j].tips);
							break;
						} else {
							removeHtml();
						}
					}
					// 以上情况都不存在,书写有误
					else {
						CanSubmit = false;
						if (DeveloperMode) {
							alert("校验json配置错误!!!");
						} else {
							console.log("%c校验json配置错误!!!",'color:blue');
						}
						break;
					}
				}
			}

			// 点击提交按钮
			$(subId).on('click', function () {
				
				var submitOrSave=$("#"+$(this).attr('id')).attr('submitOrSave');
				
				CanSubmit = true;
				if (ifLayer) {
					layer.closeAll();
				}
				ScrollCount = 0;
				for (var i = 0; i < myJSON.length; i++) {
					var getId = myJSON[i].id;
					var val = $("#" + getId).val();
					eachVali(val, i);
				}
				
				var confirmMsg='';
				//confirmSub
				if(submitOrSave=='1'){
					confirmMsg=confirmSub[1];
				}else if(submitOrSave=='2'){
					confirmMsg=confirmSub[2];
				}

				if (CanSubmit) {
					// ajax 提交
					if (ifAjax) {
						if(confirmSub[0]){
							layer.confirm(confirmMsg, {
                        	btn: ['确定','取消'] //按钮
                        	}, function(){
                        		ajaxSub();
                        	},function(){
                        	});
						}else{
							ajaxSub();
						}
					}
					// 表单 提交
					else if (ifAjax == false) {
						if(confirmSub[0]){
							layer.confirm(confirmMsg, {
                        	btn: ['确定','取消'] //按钮
                        	}, function(){
                        		$("#" + formId).submit();
                        	},function(){
                        	});
						}else{
							$("#" + formId).submit();
						}
					}
					// 跨域ajax 提交
					else if (ifAjax == 'jsonp') {
						if(confirmSub[0]){
							layer.confirm(confirmMsg, {
                        	btn: ['确定','取消'] //按钮
                        	}, function(){
                        		ajaxJsoup();
                        	},function(){
                        	});
						}else{
							ajaxJsoup();
						}
					}
					
					function ajaxSub(){
						var mydata = '';
						if (submitSpecialData) {
							mydata = $.param(specialData()) + '&' + $("#" + formId).serialize()+'&'+$.param({submitOrSave:submitOrSave});
						} else {
							mydata = $("#" + formId).serialize()+'&'+$.param({submitOrSave:submitOrSave});
						}
						console.log("%c表单提交了如下参数：",'color:blue');
						console.log(specialData());
						console.log("%c"+$("#" + formId).serialize(),'color:blue');
						$.ajax({
							url: $("#" + formId).attr("action"),
							type: $("#" + formId).attr("method"),
							data: mydata,
							dataType: "json",
							async: false,
							success: function (data) {
								getAjax(data);
							},
							error: function (XMLHttpRequest, textStatus, errorThrown) {
								if (DeveloperMode) {
									alert("ajax 提交表单报错了! 错误代码:" + XMLHttpRequest.status);
								} else {
									console.log("%cajax 提交表单报错了! 错误代码:" + XMLHttpRequest.status,'color:blue');
								}
							}
						});
					}
					
					function ajaxJsoup(){
						var mydata = '';
						if (submitSpecialData) {
							mydata = $.param(specialData()) + '&' + $("#" + formId).serialize();
						} else {
							mydata = $("#" + formId).serialize();
						}
						console.log("%c跨域表单提交了如下参数：",'color:blue');
						console.log(specialData());
						console.log("%c"+$("#" + formId).serialize(),'color:blue');
						$.ajax({
							url: $("#" + formId).attr("action"),
							type: "get",
							data: mydata,
							dataType: "jsonp",
							jsonp: "jsoncallback",
							success: function (data) {
								getAjax(data);
							},
							error: function (XMLHttpRequest, textStatus, errorThrown) {
								if (DeveloperMode) {
									alert("ajax 跨域 提交表单报错了! 错误代码:" + XMLHttpRequest.status);
								} else {
									console.log("%cajax 跨域 提交表单报错了! 错误代码:" + XMLHttpRequest.status,'color:blue');
								}
							}
						});
					}
				}
			});

		}
	});

	// 快捷调用常用正则
	zz = { // 定义一个 名为 zz 的方法,在这里添加常用正则, 例如 zz.notNull()  调用

		notNull: function () {
			return /^.+$/;
		},
		// 不能为空
		chinese: function () {
			return /^[\u4e00-\u9fa5]+$/;
		}, // 中文
		email: function () {
			return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
		}, // 邮箱
		post: function () {
			return /^[1-9][0-9]{0,}$/;
		}, //邮政编码
		num: function () {
			return /^[0-9]*$/;
		}, // 数字
		ffzs: function () {
			return /^\d+$/;
		}, // 非负整数
		aBc123: function () {
			return /^[A-Za-z0-9]+$/;
		}, //数字和英文
		mobile: function () {
			return /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
		}, //手机号
		tel: function () {
			return /^1[0-9]{10}$/;
		}, // 手机号
		fax: function () {
			return /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/;
		} //传真

	}
})(jQuery);
// @且听风吟