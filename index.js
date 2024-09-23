const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 常见图片格式
const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'svg']);
//图片文件夹路径
const inputDir = 'H:/商品资料/ppt1032-国庆假期出游安全';
//输出比例
const outputArr = [
    {
        name: '主图1：1',
        scale: [1, 1],
        dir: '',
    },
    {
        name: '主图3：4',
        scale: [3, 4],
        dir: '',
    },
];

//创建输出文件夹
outputArr.forEach((item) => {
    item.dir = `${inputDir}/${item.scale.join('x')}`;
    if (!fs.existsSync(item.dir)) {
        fs.mkdirSync(item.dir);
    }
});

async function resizeImage(imageDir, outputDir, scale) {
    let imgData = await sharp(imageDir).metadata();
    await sharp(imageDir)
        .extract({
            width: imgData.width,
            height: Math.floor(imgData.width / (scale[0] / scale[1])),
            left: 0,
            top: 0,
        })
        .toFile(outputDir);
}

//读取输入目录下所有文件
fs.readdirSync(inputDir).forEach(async (file) => {
    console.log(file);
    const ext = file.split('.').pop().toLowerCase();
    if (imageExtensions.has(ext)) {
        const inputPath = path.join(inputDir, file);
        outputArr.forEach((item) => {
            const outputPath = path.join(item.dir, file);
            resizeImage(inputPath, outputPath, item.scale)
                .then(() => {
                    console.log(`${file}的${item.name}图片已生成`);
                })
                .catch((err) => {
                    console.error(`${file}的${item.name}图片生成失败`, err);
                });
        });
    }
});
