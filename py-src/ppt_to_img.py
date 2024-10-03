import os
import win32com.client
from config import Config


# 初始化PPT
def init_powerpoint():
    powerpoint = win32com.client.Dispatch("PowerPoint.Application")
    powerpoint.Visible = 1
    return powerpoint


# PPT转png
def ppt2png(pptFileName, downLoad_path, powerpoint):
    try:
        ppt_path = os.path.abspath(pptFileName)
        ppt = powerpoint.Presentations.Open(ppt_path)

        # 保存为图片
        img_path = os.path.abspath(downLoad_path + ".png")
        ppt.SaveAs(img_path, 18)  # 18 为 PNG 格式

        # 关闭打开的ppt文件
        ppt.Close()
    except Exception as e:
        print(f"PPT转png失败: {pptFileName}")
    else:
        print("PPT转png成功", pptFileName)


# 批量转换PPT文件
def batch_convert_ppt_to_png(directory, output_directory):
    powerpoint = init_powerpoint()

    # 遍历指定目录中的所有PPT和PPTX文件
    for filename in os.listdir(directory):
        if filename.endswith(".ppt") or filename.endswith(".pptx"):
            pptFileName = os.path.join(directory, filename)
            downLoad_path = os.path.join(
                output_directory, os.path.splitext(filename)[0]
            )  # 不带扩展名的文件名
            ppt2png(pptFileName, downLoad_path, powerpoint)

    powerpoint.Quit()  # 退出PowerPoint


# 示例用法
if __name__ == "__main__":
    # 获取最新创建的文件夹
    input_directory = Config.get_latest_folder(Config.WORK_PATH)
    # 设置输出目录为 input_directory/img
    output_directory = os.path.join(input_directory, "img")
    # 创建输出文件夹
    os.makedirs(output_directory, exist_ok=True)
    batch_convert_ppt_to_png(input_directory, output_directory)
