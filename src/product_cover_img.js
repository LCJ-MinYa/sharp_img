const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { getInputDir } = require('../utils/index');
const { cover } = require('../config/index');

//工作目录文件夹路径
let inputDir = getInputDir();

if (!inputDir) {
    console.log('未执行裁剪主图功能，工作目录不存在');
    return;
}

//创建输出文件夹
cover.scaleArr.forEach((item) => {
    item.dir = `${inputDir}/${item.scale.join('x')}`;
    if (!fs.existsSync(item.dir)) {
        fs.mkdirSync(item.dir);
    }
});

async function resizeImage(imageDir, outputDir, scale) {
    let imgData = await sharp(imageDir).metadata();
    let config = {
        width: 0,
        height: 0,
    };
    if (imgData.height / scale[1] > imgData.width / scale[0]) {
        config.width = imgData.width;
        config.height = Math.floor(imgData.width / (scale[0] / scale[1]));
        config.top = 0;
        config.left = 0;
        await sharp(imageDir).extract(config).toFile(outputDir);
    } else {
        config.width = imgData.height;
        config.height = Math.floor(imgData.height / (scale[0] / scale[1]));
        await sharp(imageDir)
            .resize(config.width, config.height, {
                fit: 'cover',
                position: 'center',
            })
            .toFile(outputDir);
    }
}

//读取输入目录下所有文件
fs.readdirSync(inputDir).forEach(async (file) => {
    const ext = file.split('.').pop().toLowerCase();
    if (cover.format.has(ext)) {
        const inputPath = path.join(inputDir, file);
        cover.scaleArr.forEach((item) => {
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
