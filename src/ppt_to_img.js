const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getInputDir } = require('../utils/index');
const { ppt } = require('../config/index');

//工作目录文件夹路径
const inputDir = getInputDir();

if (!inputDir) {
    console.log('未执行ppt转图片功能，工作目录不存在');
    return;
}

//创建pdf输出文件夹
const pdfDir = `${inputDir}/pdf`;
if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
}

//创建pdf转图片的输出文件夹
const imgDir = `${inputDir}/img`;
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
}

// 使用 LibreOffice 将 PPT 转换为 PDF
const convertPptToPdf = (inputDir) => {
    const pdfCmd = `soffice --headless --invisible --convert-to pdf --outdir "${pdfDir}" "${inputDir}" 2>NUL`;
    console.log(pdfCmd);

    execSync(pdfCmd);
};

// 使用 ImageMagick 将 PDF 转换为图片
const convertPdfToImg = (inputDir, file) => {
    const imgItemDir = path.join(imgDir, `${file.split('.')[0]}`);
    if (!fs.existsSync(imgItemDir)) {
        fs.mkdirSync(imgItemDir);
    }

    const imageOutputPath = path.join(imgItemDir, 'slide_%d.png');
    const imgCmd = `magick -density 72 "${inputDir}" "${imageOutputPath}"`;
    console.log(imgCmd);
    execSync(imgCmd);
};

// 读取输入目录下所有ppt文件 => 转换为pdf
fs.readdirSync(inputDir).forEach((file) => {
    const ext = file.split('.').pop().toLowerCase();
    if (ppt.pptFormat.has(ext)) {
        const inputPath = path.join(inputDir, file);
        convertPptToPdf(inputPath);
    }
});

// 读取输入目录下所有pdf文件下所有pdf文件 => 转换为image
fs.readdirSync(pdfDir).forEach((file) => {
    const ext = file.split('.').pop().toLowerCase();
    if (ppt.pdfFormat.has(ext)) {
        const inputPath = path.join(pdfDir, file);
        convertPdfToImg(inputPath, file);
    }
});
