const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { getInputDir } = require('../utils/index');

//工作目录文件夹路径
const inputDir = 'E:/商品资料汇总/商品资料(1051-1100)/doc1089-英语小报'; //getInputDir();
// 父文件夹路径
const parentFolder = `${inputDir}/预览图`;
if (!inputDir) {
    console.log('未执行手抄报拼图功能，工作目录不存在');
    return;
}

async function processImages(folderPath) {
    // 读取文件夹内的所有子文件夹
    const subFolders = fs.readdirSync(folderPath);
    for (const subFolder of subFolders) {
        const subFolderPath = path.join(folderPath, subFolder);
        const stats = fs.statSync(subFolderPath);

        // 确保是文件夹
        if (stats.isDirectory()) {
            const images = fs.readdirSync(subFolderPath);
            const imagePaths = images.map((image) => path.join(subFolderPath, image)).filter((img) => img.endsWith('.jpg') || img.endsWith('.png'));

            if (imagePaths.length === 2) {
                // 使用 sharp 拼接图片
                const [image1, image2] = imagePaths;
                // 获取第一张图片的高度
                const { width, height } = await sharp(image1).metadata();
                const outputImagePath = path.join(folderPath, `${subFolder}.png`);

                await sharp({
                    create: {
                        width: width, // 宽度使用第一张图片的宽度
                        height: height * 2, // 高度为两张图片的总高度
                        channels: 4,
                        background: { r: 255, g: 255, b: 255, alpha: 0 }, // 背景透明
                    },
                })
                    .composite([
                        { input: await sharp(image1).toBuffer(), top: 0, left: 0 },
                        { input: await sharp(image2).toBuffer(), top: height, left: 0 },
                    ])
                    .toFile(outputImagePath);

                console.log(`合并完成: ${outputImagePath}`);
            } else {
                console.log(`跳过文件夹 ${subFolder}: 找不到两张图片`);
            }
        }
    }
}

// 替换为你自己的文件夹路径
// const folderPath = './your-folder-path';
processImages(parentFolder).catch((err) => console.error(err));
