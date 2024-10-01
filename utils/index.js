const fs = require('fs');
const path = require('path');
const { base } = require('../config/index');

// 获取最终工作目录
const getInputDir = () => {
    if (base.inputDir) {
        return base.inputDir;
    }

    base.inputDir = getLatestFolder(base.directoryPath);
    return base.inputDir;
};

// 获取该文件夹下最新创建的文件夹作为工作目录
const getLatestFolder = (directory) => {
    let currentInputDir = null;
    let latestTime = 0;

    // 读取指定目录
    fs.readdirSync(directory, { withFileTypes: true }).forEach((file) => {
        if (file.isDirectory()) {
            const folderPath = path.join(directory, file.name);
            const stats = fs.statSync(folderPath);
            const creationTime = stats.birthtimeMs; // 获取创建时间
            // 找到最新创建的文件夹
            if (creationTime > latestTime) {
                latestTime = creationTime;
                currentInputDir = folderPath;
            }
        }
    });

    if (currentInputDir) {
        console.log('工作目录:', currentInputDir);
    } else {
        console.log('未找到工作目录.');
    }

    return currentInputDir;
};

module.exports = { getInputDir, getLatestFolder };
