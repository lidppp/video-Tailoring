
/* 播放器dom */
var player = document.querySelector("#videoshow")

var startDot = document.querySelector(".start")
var endDot = document.querySelector(".end")
endDot.style.left = document.getElementById("control_top").offsetWidth - 10 + "px"
/**
 * 播放器控制条
 */
$(".play").click(function () {
  var currTime = player.currentTime,    //当前播放时间
    duration = player.duration;       // 视频总时长
  var pre = currTime / duration; // 获取当前播放百分比

  // 获取开始位置的百分比
  var strTime = startDot.offsetLeft / document.getElementById("control_top").offsetWidth

  var endTime = (endDot.offsetLeft + 10) / document.getElementById("control_top").offsetWidth

  // 如果当前播放百分比小于开始时间百分比或者大于当前时间百分比的话让它回到开始 否则继续播放
  if (pre < strTime || pre > endTime) {
    // 修改开始位置
    player.currentTime = strTime * player.duration;
  }
  if (player.paused) {
    player.play()
  } else {
    player.pause()
  }

  /**
   * 监听进度条改变事件 如果当前进度条百分比>结束的百分比暂停播放
   */
  player.ontimeupdate = function () {
    var currTime = this.currentTime,    //当前播放时间
      pre = currTime / duration; // 获取当前播放百分比
    if (pre > endTime) {
      player.pause()
    }

  };

})


/**
 * 播放器控制条开始与结束位置的约束
 * 开始位置不能<0 且不能 > 结束位置
 * 结束位置不能>视频总长度 且不能 < 开始位置
 */

startDot.onmousedown = function (e) {
  move(e, startDot, endDot, function (a, b) {
    return a > b - 10 || a < 0
  }, function (a) {
    return {
      expression: a < 0,
      handle: function (dom) {
        dom.style.left = 0 + "px"
      }
    }
  })
}

endDot.onmousedown = function (e) {
  move(e, endDot, startDot, function (a, b) {
    return a < b + 10 || a > document.getElementById("control_top").offsetWidth
  }, function (a) {
    return {
      expression: a > document.getElementById("control_top").offsetWidth - 10,
      handle: function (dom) {
        dom.style.left = document.getElementById("control_top").offsetWidth - 10 + "px"
      }
    }
  })
}
/**
 * 
 * @param {*} e 事件对象
 * @param {*} sDom 当前dom
 * @param {*} eDom 需要判断的dom
 * @param {*} flagFn 表达式方法
 */
function move(e, sDom, eDom, flagFn, restFn) {
  e.preventDefault();
  player.pause()
  // 这里直接包含 onmousemove和onkeyup
  document.onmousemove = function (e) {
    // 开始拖动div并且判断限制
    console.dir(eDom.offsetLeft)
    var domOffsetLeft = parseInt(getstyle(sDom, "left"))
    var domROffsetLeft = domOffsetLeft + e.movementX
    if (sDom !== startDot && parseInt(startDot.style.left) + 10 > parseInt(endDot.style.left)) {
      endDot.style.left = parseInt(startDot.style.left) + 10 + "px"
    } else if (sDom !== endDot && parseInt(startDot.style.left) + 10 > parseInt(endDot.style.left)) {
      startDot.style.left = parseInt(endDot.style.left) - 10 + "px"
    }
    if (restFn.expression) {
      restFn.handle(sDom)
      return
    }


    if (flagFn(domOffsetLeft, eDom.offsetLeft)) {
      return
    }
    sDom.style.left = domOffsetLeft + e.movementX + "px"
  }
  document.onmouseup = function () {
    // 清除onmousemove
    document.onmousemove = null
  }
}

// 获取真实style样式
function getstyle(dom, styleName) {
  return dom.currentStyle
    ? dom.currentStyle[styleName]
    : getComputedStyle(dom, null)[styleName];
}

/**
 * 从开始时间点播放
 * 
 */

/**
 * 上传文件本地读取
 * @param {*} files 
 */

function jsReadFiles(files) {
  if (files.length && /video+/.test(files[0].type)) {
    var file = files[0];
    console.log(file)
    console.log(file.type)

    var reader = new FileReader(); //new一个FileReader实例
    reader.onload = function () {
      console.log(this.result)
      $('#videoshow').attr("src", this.result);
    }
    reader.readAsDataURL(file);

  } else {
    setTimeout(() => {
      console.log($("#video")[0].value)
      $("#video")[0].value = ""
    })
    console.log("您选择的文件不是视频文件")
  }
}

