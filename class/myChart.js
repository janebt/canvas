function createChart(chartStyle, chartInfo)
{
	var chart =
	{
		/*用于配置图表的必选参数*/
		canvasId:undefined,//绘制的图表所在的canvas的ID
		chartStyle : chartStyle,//当前选中的图表类型 barChart || lineChart
		xyData:[],//用于绘制图形的XY轴数据

		/*可选，假设在同一张图上绘制折线图和柱形图，则折线图的点对应于柱形图顶部中心点*/
		fontSize:0.017,//填充的字体大小和canvas整体长度的比例，包括XY轴数据，柱形图和折线图上的信息
		graphName:undefined,//图表标题
		xValuePosition:"center",//假设绘制柱形图，X轴数据需要和柱形中轴线还是右边对齐 right || center

		xyColor:"#606060",//XY轴的颜色
		lineColor:"#006ACC",//折线图线条的颜色
		barColorFill:"#006ACC",//柱形图填充的颜色
		barColorStroke:"#006ACC",//柱形图边框颜色
		dotColor:"#006ACC",//折线图中数据点的颜色
		xyDataColor:"#909090",//XY轴上数值以及文字信息的颜色
		dataColor:"#E1E1E1",//数据点上数值的颜色
		chartBackColor:"transparent",//图表背景颜色

		chartPaddingLeft:0.044,//图表左边距和图表总宽度的比例
		chartPaddingRight:0.022,//图表右边距和图表总宽度的比例
		chartPaddingTop:0.07,//图表上边距和图表总高度的比例
		chartPaddingBottom:0.101,//图表下边距和图表总高度的比例
		barWidth:0.8,//柱形宽度和相邻柱形间距的比例，默认为0.8
		leftDis:0.5,//最左端柱形离Y轴距离和相邻柱形之间的距离的比例，默认为0.5
		smallPaddingWithY:0,//用于微调柱形和Y轴之间的距离的像素值
		smallPaddingBetween:0,//用于微调柱形之间的距离的像素值

		init:function(chartInfo)
		{
			for (var prop in chartInfo)
			{
				if (undefined != chartInfo[prop])
				{
					this[prop] = chartInfo[prop];
				}
			}

			/*支持动态生成的canvas*/
			var browser = navigator.appName;

			if ("Microsoft Internet Explorer" == browser)
			{
				var b_version = navigator.appVersion;
				var version = b_version.split(";");
				var trim_Version = version[1].replace(/[ ]/g,"");

				if (("MSIE6.0" == trim_Version) || ("MSIE7.0" == trim_Version) || ("MSIE8.0" == trim_Version))
				{
					var els = document.getElementsByTagName('canvas');
				    for (var i = 0; i < els.length; i++)
				    {
				        if (this.canvasId == els[i].id)
				        {
				        	this.can = window.G_vmlCanvasManager.initElement(els[i]);
				        }
				    }
				}
				else
			    {
			    	this.can = document.getElementById(this.canvasId);
			    }
			}
		    else
		    {
		    	this.can = document.getElementById(this.canvasId);
		    }

		    this.can.style.display = "block";
		    this.canctx = this.can.getContext("2d");

		    /*比例转化为像素值*/
			this.chartPaddingLeft = parseInt(this.chartPaddingLeft * this.can.width);
			this.chartPaddingRight = parseInt(this.chartPaddingRight * this.can.width);
			this.chartPaddingTop = parseInt(this.chartPaddingTop * this.can.height);
			this.chartPaddingBottom = parseInt(this.chartPaddingBottom * this.can.height);
			this.fontSize = parseInt(this.fontSize * this.can.width);

		    /*设置用于调节fillText中文字位置的字体宽度和高度以及字体颜色*/
		    this.fontWidth = this.fontSize;
		    this.fontHeight = this.fontSize * 1.2;
		    this.canctx.font = this.fontSize + "px 微软雅黑";

		    /*清除原有画布内容*/
			this.canctx.clearRect(0, 0, this.can.width, this.can.height);

			this.drawGraph(this.xyData, this.chartStyle, this.chartPaddingLeft, this.chartPaddingRight, this.chartPaddingTop, this.chartPaddingBottom, this.barWidth, this.leftDis, this.xValuePosition, this.can);
		},

		/*绘制XY轴以及坐标轴上的数值、图表的标题、图表的背景*/
		drawGraph:function(data, chartStyle, paddingLeft, paddingRight, paddingTop, paddingBottom, barWidth, leftDis, xValuePosition, can)
		{
			/*获取绘图需要的数据*/
			var perwidth = this.getXWidth(data, can.width, paddingLeft, paddingRight, barWidth, leftDis);//x 轴上两个数据点之间距离
			var floatExist = this.checkFloatExist(data);//搜索data中value值中是否有小数
			var yEmptyHeight = parseInt(0.07 * can.height);//用于放置Y轴备注信息的位置高度
			var yInfo = this.getYInfo(this.getMax(data), can.height, paddingBottom, paddingTop, yEmptyHeight, floatExist);
			var maxY = yInfo.maxY;//图表中Y轴所能表示的最大值
			var perY = yInfo.perY;//Y轴上每maxY所表示的像素值
			var tenTimes = yInfo.tenTimes;//Y轴显示的数据需要乘以十的倍数

			/*修改图表背景颜色*/
			if ("transparent" != this.chartBackColor)
			{
				can.style.background = this.chartBackColor;
			}

			this.drawCoordinate(data, paddingLeft, paddingRight, paddingTop, paddingBottom, barWidth, leftDis, xValuePosition, can, tenTimes, perwidth, yEmptyHeight, maxY, perY);

			/*绘制标题*/
			if (undefined != chartInfo["graphName"])
			{
				this.drawGraphName(perY, can, paddingTop, paddingLeft, paddingRight);
			}

			/*绘制柱形或折线*/
			if ("lineChart" == chartStyle)
			{
				this.drawLine(data, paddingLeft, paddingBottom, perwidth, perY, barWidth, leftDis, tenTimes);
			}
			else if ("barChart" == chartStyle)
			{
				this.drawBar(data, paddingLeft, paddingBottom, perwidth, perY, barWidth, leftDis, tenTimes);
			}
		},

		drawCoordinate:function(data, paddingLeft, paddingRight, paddingTop, paddingBottom, barWidth, leftDis, xValuePosition, can, tenTimes, perwidth, yEmptyHeight, maxY, perY)
		{
			var moveDis = 0;//根据不同的xValuePosition设置的文字偏移距离

			/*绘制XY轴*/
			this.canctx.beginPath();
			this.canctx.lineWidth = "1";
			this.canctx.strokeStyle = this.xyColor;
			this.canctx.moveTo(paddingLeft, paddingTop);
			this.canctx.lineTo(paddingLeft, can.height - paddingBottom);
			this.canctx.lineTo(can.width - paddingRight, can.height - paddingBottom);
			this.canctx.stroke();
			this.canctx.closePath();

			this.canctx.beginPath();
			this.canctx.fillStyle= this.xyDataColor;

			/*绘制X轴上的数据*/
			if ("right" == xValuePosition)
			{
				moveDis = perwidth * barWidth / 2;
			}

			for (var i = 0; i < data.length; i++)
			{
				var nameValue = data[i].name;
				var dataLengthByNumber = this.getTotalLength((!isNaN(nameValue))?nameValue.toString():nameValue);

				var x = this.getCoordX(paddingLeft, perwidth, i, leftDis, barWidth) + moveDis - this.fontWidth / 4 * dataLengthByNumber;
				var y = can.height - paddingBottom + this.fontHeight;
				this.canctx.fillText(data[i].name, x, y);
			}

			/*绘制Y轴上的数字*/
			for (var i = 1; i <= 10; i ++)
			{
				var valueOfY = maxY * i / 10;
				var dataLengthByNumber = this.getTotalLength(valueOfY.toString());

				var x = paddingLeft - this.fontWidth / 2 * dataLengthByNumber - 10;
				var y = this.getCoordY(paddingBottom, perY, valueOfY) + this.fontHeight / 2;
				this.canctx.fillText(valueOfY, x, y);
			}

			/*绘制坐标轴左下角的0*/
			if (0 == moveDis)
			{
				var x = paddingLeft - this.fontWidth / 2 * 1.2 - 2;
				var y = this.getCoordY(paddingBottom, perY, 0) + this.fontHeight / 2;
			}
			else
			{
				var x = paddingLeft - this.fontWidth / 2;
				var y = can.height - paddingBottom + this.fontHeight;
			}
			this.canctx.fillText(0, x, y);

			/*绘制Y轴上方表示10的倍数的值*/
			if (1 != tenTimes)
			{
				var content = "( ×" + tenTimes + " )";
				var dataLengthByNumber = this.getTotalLength(content);
				var x = paddingLeft - dataLengthByNumber * (this.fontWidth / 2) / 2;
				var y = paddingTop - this.fontHeight / 4;
				//var y = paddingTop + parseInt(yEmptyHeight / 2) + parseInt(this.fontHeight / 2);
				this.canctx.fillText(content, x, y);
			}
		},

		drawGraphName:function(perY, can, paddingTop, paddingLeft, paddingRight)
		{
			/*绘制标题*/
			var dataLengthByNumber = this.getTotalLength(this.graphName);
			var x = (can.width - paddingLeft - paddingRight) / 2 + paddingLeft - (this.fontWidth / 2) * (dataLengthByNumber / 2);
			var y = paddingTop / 2 + this.fontHeight / 2;
			this.canctx.fillStyle= this.xyDataColor;

			this.canctx.fillText(this.graphName, x, y);
		},

		/*折线图：根据数据在坐标轴中添加点和线*/
		drawLine:function(data, paddingLeft, paddingBottom, perwidth, perY, barWidth, leftDis, tenTimes)
		{
			var x = this.getCoordX(paddingLeft, perwidth, 0, leftDis, barWidth);
			var y = this.getCoordY(paddingBottom, perY, data[0].value / tenTimes);

			this.canctx.lineWidth = "2";
			this.canctx.strokeStyle = this.lineColor;
			this.canctx.beginPath();
			this.canctx.moveTo(x, y);

			for (var i = 1; i < data.length; i++)
			{
				var x = this.getCoordX(paddingLeft, perwidth, i, leftDis, barWidth);
				var y = this.getCoordY(paddingBottom, perY, data[i].value / tenTimes);
				this.canctx.lineTo(x, y);
			}
			this.canctx.stroke();

			/*画折线上的点*/
			this.canctx.fillStyle = this.dotColor;

			for (var i = 0; i < data.length; i++)
			{
				var x = this.getCoordX(paddingLeft, perwidth, i, leftDis, barWidth);
				var y = this.getCoordY(paddingBottom, perY, data[i].value / tenTimes);

				this.canctx.beginPath();
				this.canctx.arc(x, y, 3, 0, Math.PI*2, true);
				this.canctx.fill();
			}

			/*填充每一点对应的值*/
			this.canctx.fillStyle= this.dataColor;

			for (var i = 0; i < data.length; i++)
			{
				var dataLengthByNumber = this.getTotalLength(data[i].value.toString());
				var x = this.getCoordX(paddingLeft, perwidth, i, leftDis, barWidth) - (this.fontWidth / 2) * (dataLengthByNumber / 2);
				var y = this.getCoordY(paddingBottom, perY, data[i].value / tenTimes);

				this.canctx.fillText(data[i].value, x, y - this.fontWidth / 2);
			}
		},

		/*柱形图：根据数据在坐标轴中添加框*/
		drawBar:function(data, paddingLeft, paddingBottom, perwidth, perY, barWidth, leftDis, tenTimes)
		{
			/*此处绘制柱形图
			先绘制柱形*/
			this.canctx.lineWidth = "2";
			this.canctx.fillStyle = this.barColorFill;

			/*先绘制第一个柱形*/
			var x = this.getCoordX(paddingLeft, perwidth, 0, leftDis, barWidth) - perwidth * barWidth / 2;
			var y = this.getCoordY(paddingBottom, perY, data[0].value / tenTimes);
			this.canctx.beginPath();
			this.canctx.rect(x + this.smallPaddingWithY, y, perwidth * barWidth - this.smallPaddingBetween - this.smallPaddingWithY, data[0].value / tenTimes * perY);
			this.canctx.fill();
			var smallPadding = 0;

			/*绘制第2到n个柱形*/
			for (var i = 1; i < data.length; i++)
			{
				var x = this.getCoordX(paddingLeft, perwidth, i, leftDis, barWidth) - perwidth * barWidth / 2;
				var y = this.getCoordY(paddingBottom, perY, data[i].value / tenTimes);

				this.canctx.beginPath();
				this.canctx.rect(x + this.smallPaddingBetween, y, perwidth * barWidth - 2 * this.smallPaddingBetween, data[i].value / tenTimes * perY);
				this.canctx.fill();
			}

			/*再绘制柱形上的数值*/
			this.canctx.fillStyle = this.dataColor;
			for (var i = 0; i < data.length; i++)
			{
				var dataLengthByNumber = this.getTotalLength(data[i].value.toString());
				console.log(data[i].value.toString());
				var x = this.getCoordX(paddingLeft, perwidth, i, leftDis, barWidth) - (this.fontWidth / 2) * (dataLengthByNumber / 2);
				var y = this.getCoordY(paddingBottom, perY, data[i].value / tenTimes);

				this.canctx.fillText(data[i].value, x, y - this.fontWidth / 4);
			}
		},

		/*获取value值占据的总宽度(像素)相对于单个数字宽度(像素)的倍数*/
		getTotalLength:function(value)
		{
			var totalLength = 0;

			for (var i = 0; i < value.length; i++)
			{
				if (/[\u4E00-\u9FA5]/g.test(value[i]))
				{
					totalLength += 2;
				}
				else
				{
					totalLength += 1;
				}
			}

			return totalLength;
		},

		/*搜索data中value值中是否有小数*/
		checkFloatExist:function(data)
		{
			for (var i = 0; i < data.length; i++)
			{
				if (data[i].value != parseInt(data[i].value))
				{
					return 1;
				}
			}

			return 0;
		},

		/*x 轴每一个数据占据的宽度*/
		getXWidth:function(data, width, paddingLeft, paddingRight, barWidth, leftDis)
		{
			return ((width - paddingLeft - paddingRight) / (data.length + leftDis - (1 - barWidth) / 2));
		},

		/*根据pindex获取X轴上相邻两个坐标点之间的距离，表示柱形图中轴线或者折线图的点的横坐标*/
		getCoordX:function(paddingLeft, perwidth, ptindex, leftDis, barWidth)
		{
			return paddingLeft + perwidth * (leftDis + barWidth / 2 + ptindex);
		},

		/*根据y的值获取对应的坐标*/
		getCoordY:function(paddingBottom, perY, yValue)
		{
			return (this.can.height - paddingBottom - perY * yValue);
		},

		/*返回Y轴上数值能够显示的最大值和Y轴单位数值占有的像素值*/
		getYInfo:function(maxYNumber, height, paddingBottom, paddingTop, yEmptyHeight, floatExist)
		{
			var tenTimes = 1;
			var maxY = undefined;

			while (maxYNumber > 100)
			{
				tenTimes *= 10;
				maxYNumber /= 10;
			}

			if (10 >= maxYNumber)
			{
				maxY = 10;
			}
			else if (10 < maxYNumber)
			{
				maxY = (parseInt(maxYNumber / 10) + 1) * 10;
			}

			return {perY:(height - paddingBottom - paddingTop - yEmptyHeight) / maxY, maxY:maxY, tenTimes:tenTimes};
		},

		/*返回最大值*/
		getMax:function(data)
		{
			var maxYNumber = data[0].value;
			var length = data.length;
			for (var i = 1; i < length; i++)
			{
				if (maxYNumber < data[i].value)
				{
					maxYNumber = data[i].value;
				}
			}
			return maxYNumber;
		}
	};

	chart.init(chartInfo);
}