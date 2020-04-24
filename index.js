var express = require("express")

var fs = require("fs")
var path = require('path');
var multer = require('multer');
var ffmpeg = require("fluent-ffmpeg")


// var upload = multer({ dest: path.join(__dirname, './upload/') });
var bodyParser = require('body-parser');
// 调用express
var app = express()
// 公开 public文件夹
app.use("/public/", express.static("./public/"))
// 因为上传的是视频文件 会很大 所以这边设置大小为500MB
app.use(bodyParser.json({limit: "500mb"}));
app.use(bodyParser.urlencoded({limit: "500mb", extended: true, parameterLimit: 50000}));
// 此处设置临时文件夹
app.use(multer({dest: './tmp/'}).array('file'));
// 请求为/时返回
app.get("/", function (req, res) {
    fs.readFile("./public/index.html", function (err, data) {
        if (err) {
            return res.status(500).set('Content-Type', 'text/plain;charset=utf8').send("服务器错误")
        }
        res.send(data.toString())
    })
})


app.post('/upload', function (req, res) {

    // 这里是files 不是file  这个坑踩了有一个小时
    // console.log(req.files, req.body)
    /*
    [ { fieldname: 'file',
    originalname: '190321153853126488.mp4',
    encoding: '7bit',
    mimetype: 'video/mp4',
    destination: './tmp/',
    filename: '884f12094891cabe0051474833367892',
    path: 'tmp\\884f12094891cabe0051474833367892',
    size: 12937054 } ]
    * */
    // 读取上传文件的临时路径 获取他的data
    fs.readFile(req.files[0].path, function (err, data) {
        if (err) {
            console.log('Error');
        } else {
            // 设置存放文件的路径
            var dir_file = path.join(__dirname, '/upload/', req.files[0].originalname)
            // console.log(dir_file);
            // 将文件写入 upload文件夹中
            fs.writeFile(dir_file, data, function (err) {

                // 发送回响应之后 删除临时文件夹中上传的文件
                fs.unlink(req.files[0].path, function (err, data) {
                    console.log(err, data)
                })
                // 定义保存路径变量
                var outputPath = path.join(__dirname, "/output/", req.files[0].originalname)
                // 开始处理视频文件
                ffmpeg(dir_file)
                // `-ss ${req.body.star} -c copy -to ${req.body.end} ${outputPath}`
                    .inputOptions([
                        // 从何时开始截取
                        `-ss ${req.body.star}`,
                        // 从何时结束截取
                        `-to ${req.body.end}`,
                    ])
                    // 这里的save写在了监听事件前面以保证可以读取到写入后的文件
                    .save('./output/' + req.files[0].originalname)
                    // 错误处理 控制台打印程序
                    .on('error', function (err) {
                        console.log('An error occurred: ' + err.message);
                    })
                    // 以上步骤完成后调用这个方法
                    .on('end', function () {
                        console.log('转码完成');
                        // 转码完成后读取转码后的文件
                        fs.readFile(outputPath, function (err, data) {
                            if(err){
                                return console.log(err)
                            }
                            res.send({msg:200,filename:req.files[0].originalname});
                        })
                    })
            })
        }
    })
});
app.get('/download', (req, res) => {
    console.log(req.query)
    var filePath = path.join(__dirname,"./output/",req.query.filename)
    fs.readFile(filePath,function (err,data) {
        if(err){
            return res.status(500).send({msg:"服务器错误"})
        }
        res.download(filePath)
    })
})
// 开始监听
app.listen(3000, function () {
    console.log("服务启动")
    console.log(path.join(__dirname, '/upload/'))
})



