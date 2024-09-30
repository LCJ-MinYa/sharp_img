const imagePaths = [
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_0.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_1.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_2.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_3.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_4.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_5.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_6.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_7.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_8.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_9.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_10.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_11.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_12.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_13.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_14.png',
    'C:/Users/Administrator/Desktop/test/ppt1001/img/01/slide_15.png',
];

const sharp = require('sharp');

/**
 * 拼接图片
 * @param {Array<string>} imagePaths - 图片路径数组
 * @param {number} num - 每行显示的图片数量
 * @param {string} bgColor - 背景颜色（例如：'#ffffff'）
 * @param {number} width - 拼接后的宽度
 * @param {number} gap - 图片之间的间隙
 */
async function stitchImages(imagePaths, num, bgColor, width, gap) {
    // 获取第一张图片的信息
    const firstImageInfo = await sharp(imagePaths[0]).metadata();
    const firstImageHeight = Math.floor((firstImageInfo.height / firstImageInfo.width) * width); // 根据比例计算高度

    // 处理剩余的图片
    const remainingImagesInfo = await Promise.all(
        imagePaths.slice(1).map(async (imagePath) => {
            const { data, info } = await sharp(imagePath)
                .resize({ width: Math.floor((width - gap * (num - 1)) / num), fit: 'inside' })
                .toBuffer({ resolveWithObject: true });
            return { data, height: info.height }; // 返回图片数据及其高度
        })
    );

    const rows = Math.ceil(remainingImagesInfo.length / num); // 计算剩余图片的行数
    const totalHeight = firstImageHeight + (remainingImagesInfo[0]?.height + gap) * rows + gap; // 总高度
    const totalWidth = width + 2 * gap; // 总宽度，包括外层间隙

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
                input: await sharp(imagePaths[0]).resize(width, firstImageHeight).toBuffer(),
                top: gap, // 第一张图片顶部留出外层间隙
                left: gap, // 第一张图片左侧留出外层间隙
            },
            ...remainingImagesInfo.map((imgInfo, index) => {
                const row = Math.floor(index / num);
                const col = index % num;
                return {
                    input: imgInfo.data,
                    top: firstImageHeight + gap + row * (imgInfo.height + gap), // 计算纵向位置
                    left: gap + Math.floor(col * (width / num) + col * gap), // 计算横向位置并取整
                };
            }),
        ])
        .toFile('output.png');

    console.log('拼接完成，输出文件为:', outputImage);
}

// 示例使用
const num = 2; // 每行显示的图片数量
const bgColor = 'red'; // 背景颜色
const width = 1000; // 拼接后的宽度
const gap = 10; // 图片之间的间隙

stitchImages(imagePaths, num, bgColor, width, gap).catch((err) => console.error('发生错误:', err));
