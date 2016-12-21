function creatBezierCurve(pointInfo)
{
	var curve =
	{
		canvasId:undefined,//绘制的图表所在的canvas的ID
		point:[],//用于绘制图形的点数据

		init:function(pointInfo)
		{
			for (var prop in pointInfo)
			{
				if (undefined != pointInfo[prop])
				{
					this[prop] = pointInfo[prop];
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

		    this.canctx = this.can.getContext("2d");

		    /*清除原有画布内容*/
			this.canctx.clearRect(0, 0, this.can.width, this.can.height);

			this.drawGraph(pointInfo);
		},

		//画N阶贝塞尔曲线
		drawGraph:function(point)
		{
			this.canctx.strokeStyle = "white";
			this.canctx.lineWidth = 1;
			this.canctx.beginPath();
			this.canctx.font = "20px SimSun";
			this.canctx.fillStyle = "white";

			for(i = 0; i < point.length; i++)
			{
				if(i == 0)
				{
					this.canctx.moveTo(point[i].x, point[i].y);
				}
				else
				{
					//注意是从1开始
					var ctrlP = this.getCtrlPoint(point, i-1);
					this.canctx.bezierCurveTo(ctrlP.pA.x, ctrlP.pA.y, ctrlP.pB.x,ctrlP.pB.y, point[i].x, point[i].y);
					//this.canctx.fillText("("+point[i].x+","+point[i].y+")",point[i].x,point[i].y);
				}
			}
			this.canctx.stroke();
		},

		//画辅助线，如研究辅助点可不用看
		drawAssistLine:function(point)
		{
			this.canctx.font = "15px SimSun";

			for(i = 1; i < point.length; i++)
			{
				var ctrlP = this.getCtrlPoint(point, i-1);
				this.canctx.beginPath();
				this.canctx.strokeStyle = "#AA0000";//红色是通过点与控制点的连线
				this.canctx.moveTo(point[i-1].x, point[i-1].y);
				this.canctx.lineTo(ctrlP.pA.x, ctrlP.pA.y);
				this.canctx.stroke();
				this.canctx.beginPath();
				this.canctx.strokeStyle = "#00AA00";//绿色是控制点连线
				this.canctx.arc(ctrlP.pA.x, ctrlP.pA.y, 1, 0, 2*Math.PI);
				this.canctx.arc(ctrlP.pB.x, ctrlP.pB.y, 1, 0, 2*Math.PI);
				this.canctx.fillText("(" + ctrlP.pA.x + "," + ctrlP.pA.y + ")", ctrlP.pA.x, ctrlP.pA.y);
				this.canctx.fillText("(" + ctrlP.pB.x + "," + ctrlP.pB.y + ")", ctrlP.pB.x, ctrlP.pB.y);
				this.canctx.stroke();
				this.canctx.beginPath();
				this.canctx.strokeStyle = "#AA0000";
				this.canctx.moveTo(ctrlP.pB.x, ctrlP.pB.y);
				this.canctx.lineTo(point[i].x, point[i].y);
				this.canctx.stroke();
			}
		},

		//直接lineTo连接点
		drawLine:function(point)
		{

			this.canctx.beginPath();
			this.canctx.strokeStyle = "#79ABDC";

			for(i = 1; i < point.length; i++)
			{
				this.canctx.lineTo(point[i].x, point[i].y);
			}

			this.canctx.stroke();
		},

		/* 根据已知点获取第i个控制点的坐标
		param ps	已知曲线将经过的坐标点
		param i	第i个坐标点
		param a,b	可以自定义的正数 */
		getCtrlPoint:function(ps, i, a, b)
		{
			if(!a || !b)
			{
				a = 0.25;
				b = 0.25;
			}

			//处理两种极端情形
			if(i < 1)
			{
				var pAx = ps[0].x + (ps[1].x - ps[0].x) * a;
				var pAy = ps[0].y + (ps[1].y - ps[0].y) * a;
			}
			else
			{
				var pAx = ps[i].x + (ps[i+1].x - ps[i-1].x) * a;
				var pAy = ps[i].y + (ps[i+1].y - ps[i-1].y) * a;
			}

			if(i > ps.length - 3)
			{
				var last = ps.length-1;
				var pBx = ps[last].x - (ps[last].x - ps[last-1].x) * b;
				var pBy = ps[last].y - (ps[last].y - ps[last-1].y) * b;
			}
			else
			{
				var pBx = ps[i+1].x - (ps[i+2].x - ps[i].x) * b;
				var pBy = ps[i+1].y - (ps[i+2].y - ps[i].y) * b;
			}

			return {
				pA:{x:pAx,y:pAy},
				pB:{x:pBx,y:pBy}
			}
		}
	};

	curve.init(pointInfo);
}