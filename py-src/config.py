import os


class Config:
    RANGE_NUM: int = 20
    WORK_PATH = "E:/商品资料汇总/商品资料(1101-1150)"
    # WORK_PATH = "C:/Users/Administrator/Desktop/测试"

    @staticmethod
    def get_latest_folder(base_directory):
        folders = [
            os.path.join(base_directory, d)
            for d in os.listdir(base_directory)
            if os.path.isdir(os.path.join(base_directory, d))
        ]
        if not folders:
            return None
        latest_folder = max(folders, key=os.path.getctime)  # 获取最新创建的文件夹
        return latest_folder
