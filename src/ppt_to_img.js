const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getInputDir } = require('../utils/index');
const { ppt } = require('../config/index');

//工作目录文件夹路径
const inputDir = getInputDir(); // 输入PPT文件路径

if (!inputDir) {
    console.log('未执行ppt转图片功能，工作目录不存在');
    return;
}

//创建pdf输出文件夹
const pdfDir = `${inputDir}/pdf`;
console.log(pdfDir);
if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
}

//创建pdf转图片的输出文件夹
const imgDir = `${inputDir}/img`;
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
}

const convertPptToImages = (inputDir, outputDir) => {
    // 使用 LibreOffice 将 PPT 转换为 PDF
    // const pdfFilePath = path.join(outputDir, '9.pdf');
    // console.log(pdfFilePath);
    const convertCommand = `soffice --headless --invisible --convert-to pdf --outdir "${outputDir}" "${inputDir}"`;

    return new Promise((resolve, reject) => {
        exec(convertCommand, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }

            // // 使用 ImageMagick 将 PDF 转换为图片
            // const imageOutputPath = path.join(outputDir, 'slide_%d.png');
            // const convertImageCommand = `convert -density 300 "${pdfFilePath}" "${imageOutputPath}"`;

            // exec(convertImageCommand, (error) => {
            //     if (error) {
            //         console.error(`转换为图片失败: ${error}`);
            //         return;
            //     }
            //     console.log('转换成功！输出目录:', outputDir);
            // });
        });
    });
};

//读取输入目录下所有文件
fs.readdirSync(inputDir).forEach(async (file) => {
    const ext = file.split('.').pop().toLowerCase();
    if (ppt.format.has(ext)) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(pdfDir, file);
        convertPptToImages(inputPath, outputPath)
            .then(() => {
                console.log(`${file}的图片已生成`);
            })
            .catch((err) => {
                console.error(`${file}的图片生成失败`, err);
            });
    }
});
