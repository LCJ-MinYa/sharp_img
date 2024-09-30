const config = {
    //基础公共配置
    base: {
        // 指定要查找的目录
        directoryPath: '/Users/minya/Desktop/商品资料',
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
        format: new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'svg']),
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
        // 支持处理的常见图片格式
        format: new Set(['ppt', 'pptx']),
    },
};

module.exports = config;
