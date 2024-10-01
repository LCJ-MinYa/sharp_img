const config = {
    //基础公共配置
    base: {
        // 指定要查找的目录
        directoryPath: 'E:/商品资料汇总/商品资料(1051-1100)',
        /**
         * 图片文件夹路径
         * 1. 配置文件中inputDir为空
         * 则根据directoryPath目录获取该文件夹下最新创建的文件夹作为工作目录
         *
         * 2. 配置文件中inputDir不为空
         * 则直接使用inputDir作为工作目录
         */
        inputDir: '',
    },
    // 裁剪商品封面图
    cover: {
        // 支持处理的常见图片格式
        imgFormat: new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'svg']),
        // 封面图裁剪比例
        scaleArr: [
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
        ],
    },
    ppt: {
        pptFormat: new Set(['ppt', 'pptx']),
        pdfFormat: new Set(['pdf']),
    },
    merge: {
        // 每行图片的个数
        row: 3,
        //画布背景颜色
        bgColor: 'rgb(211, 211, 211)',
        //画布宽度
        width: 1000,
        //画布外边距
        margin: 3,
        //图片间距
        padding: 3,
    },
};

module.exports = config;
