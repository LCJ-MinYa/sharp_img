const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Text2SVG = require('text-to-svg');
const { getInputDir } = require('../utils/index');
const { cover } = require('../config/index');

//工作目录文件夹路径
const inputDir = getInputDir();
if (!inputDir) {
    console.log('未执行添加水印功能，工作目录不存在');
    return;
}

//需要拼图的文件夹
const previewDir = `${inputDir}/预览图`;
if (!previewDir) {
    console.log('未执行添加水印功能，预览图目录不存在');
    return;
}

async function nodeGenWatermark({ img, text, filepath }) {
    /**
     * @desc 将水印文字转换成 svg，再转换成buffer
     * @param {string} text 水印文字
     * @param {number} fontSize 字体大小
     * @param {string} color 字体颜色
     * @return {Buffer}
     */
    function text2SVG({ text, fontSize = 24, color = 'rgba(204, 204, 204, 0.2)' }) {
        const fontPath = path.join(__dirname, '../assets/STHUPO.TTF');
        // 加载字体文件
        const text2SVG = Text2SVG.loadSync(fontPath);
        const options = {
            fontSize,
            anchor: 'top', // 坐标中的对象锚点
            attributes: { fill: color }, // 文字颜色
        };
        const textSVG = text2SVG.getSVG(text, options);
        return Buffer.from(textSVG);
    }

    /**
     * @desc 水印图片旋转45度倾斜
     * @param {string} text 水印文字
     * @return {Promise<Buffer|*>}
     */
    async function rotateWatermarkBuffer(text) {
        // `  ${text}  ` 增加下文字间距
        const textBuffer = text2SVG({ text: `             ${text}             ` });
        return sharp(textBuffer)
            .rotate(330, { background: { r: 255, g: 255, b: 255, alpha: 0 } }) // 旋转330度，并且透明色
            .toBuffer();
    }

    /**
     * @desc 入口文件
     * @param  {string|Buffer} img 图片本地路径或图片 Buffer 数据
     * @param {string} text 水印文字
     * @param {string} filepath 保存合成水印后的文件路径
     * @return {Promise<Object>}
     */
    async function init({ img, text, filepath }) {
        const textBuffer = await rotateWatermarkBuffer(text);
        const imgInfo = await sharp(img)
            // 重复（tile）合并图像
            .composite([{ input: textBuffer, tile: true }])
            .toFile(filepath);
        return imgInfo;
    }

    await init({ img, text, filepath });
}

fs.readdirSync(previewDir).forEach((file) => {
    const ext = file.split('.').pop().toLowerCase();
    if (cover.imgFormat.has(ext)) {
        const imgPath = path.join(previewDir, file);
        const tempImgPath = path.join(previewDir, `${file}_temp`);
        nodeGenWatermark({
            img: imgPath,
            text: '创意素材铺',
            filepath: tempImgPath,
        })
            .then(() => {
                // 处理完后，将临时文件重命名为原始文件
                fs.rename(tempImgPath, imgPath, (err) => {
                    if (err) {
                        console.error('重命名失败:', err);
                    } else {
                        console.log('水印添加成功，文件已被覆盖:', imgPath);
                    }
                });
            })
            .catch((err) => {
                console.error('发生错误:', err);
            });
    }
});
