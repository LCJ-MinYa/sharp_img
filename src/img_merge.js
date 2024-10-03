const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { getInputDir } = require('../utils/index');
const { merge, cover } = require('../config/index');

//工作目录文件夹路径
const inputDir = getInputDir();
if (!inputDir) {
    console.log('未执行ppt拼图功能，工作目录不存在');
    return;
}

//需要拼图的文件夹
const merageImgDir = `${inputDir}/img`;
const pdfDir = `${inputDir}/pdf`;
if (!merageImgDir) {
    console.log('未执行ppt拼图功能，工作目录下的图片文件夹不存在');
    return;
}

//创建预览图输出文件夹
const previewDir = `${inputDir}/预览图`;
if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir);
}

async function stitchImages(imagePaths, { row, bgColor, width, margin, padding }, outputName) {
    // 获取第一张图片的信息
    const firstImageInfo = await sharp(imagePaths[0]).metadata();
    const firstImageHeight = Math.floor((firstImageInfo.height / firstImageInfo.width) * width); // 根据比例计算高度

    // 处理剩余的图片
    const remainingImagesInfo = await Promise.all(
        imagePaths.slice(1).map(async (imagePath) => {
            const { data, info } = await sharp(imagePath)
                .resize({ width: Math.floor((width - padding * 2 * row) / row), fit: 'inside' })
                .toBuffer({ resolveWithObject: true });
            return { data, info }; // 返回图片数据及其高度
        })
    );

    const rows = Math.ceil(remainingImagesInfo.length / row); // 计算剩余图片的行数
    const totalHeight = margin * 2 + (padding * 2 + firstImageHeight) + (remainingImagesInfo[0]?.info.height + padding * 2) * rows; // 总高度
    const totalWidth = width + 2 * margin; // 总宽度，包括外层间隙

    // 创建拼接后的图片
    const outputImage = await sharp({
        create: {
            width: totalWidth,
            height: totalHeight,
            channels: 3,
            background: bgColor,
        },
    })
        .composite([
            {
                input: await sharp(imagePaths[0])
                    .resize(width - 2 * padding, firstImageHeight)
                    .toBuffer(),
                top: margin + padding, // 第一张图片顶部留出外层间隙
                left: margin + padding, // 第一张图片左侧留出外层间隙
            },
            ...remainingImagesInfo.map(({ data, info }, index) => {
                const currentRow = Math.floor(index / row);
                const currentCol = index % row;
                return {
                    input: data,
                    top: margin + padding + firstImageHeight + 2 * padding + currentRow * (info.height + padding * 2), // 计算纵向位置
                    left: margin + padding + currentCol * padding * 2 + currentCol * info.width, // 计算横向位置并取整
                };
            }),
        ])
        .toFile(outputName);

    console.log('拼接完成，输出文件为:', outputName);
}

const stitchPromises = []; // 存储所有拼图任务的 Promise
// 读取输入目录下所有文件夹，将每个文件夹内的图片拼图
fs.readdirSync(merageImgDir, { withFileTypes: true }).forEach((imgDir) => {
    if (imgDir.isDirectory()) {
        const inputPath = path.join(merageImgDir, imgDir.name);
        const imagePaths = [];
        fs.readdirSync(inputPath).forEach((file) => {
            const ext = file.split('.').pop().toLowerCase();
            if (cover.imgFormat.has(ext)) {
                const imgPath = path.join(inputPath, file);
                imagePaths.push(imgPath);
            }
        });
        const sortImagePaths = imagePaths.sort((a, b) => {
            // 提取数字部分
            const numA = parseInt(a.match(/幻灯片(\d+)\.png/)[1], 10);
            const numB = parseInt(b.match(/幻灯片(\d+)\.png/)[1], 10);

            return numA - numB; // 按数字排序
        });
        const outputName = path.join(previewDir, `${imgDir.name}.png`);
        stitchPromises.push(stitchImages(sortImagePaths, merge, outputName));
    }
});

// 等待所有拼图任务完成
Promise.all(stitchPromises)
    .then(() => {
        console.log('所有拼图任务完成');
        fs.rmSync(merageImgDir, { recursive: true, force: true });
        fs.rmSync(pdfDir, { recursive: true, force: true });
        console.log('删除img和pdf文件夹任务完成');
    })
    .catch((err) => {
        console.error('发生错误:', err);
    });
