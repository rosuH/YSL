#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Yellowstone Sound Library Crawler
This script crawls the Yellowstone National Park sound library and downloads audio files and images.
"""

import argparse
import glob
import hashlib
import logging
import os
import re
import shutil
import stat
import time
from http.client import RemoteDisconnected
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import urlopen

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('YSL-Spider')

# 基础配置
BASE_URL = "https://www.nps.gov"
SOUND_LIBRARY_URL = "https://www.nps.gov/yell/learn/photosmultimedia/soundlibrary.htm"
DEFAULT_SLEEP_TIME = 2  # 默认请求间隔时间（秒）
MAX_RETRIES = 3  # 最大重试次数


class YellowstoneSoundCrawler:
    """黄石公园声音库爬虫类"""

    def __init__(self, base_url=BASE_URL, sleep_time=DEFAULT_SLEEP_TIME, max_retries=MAX_RETRIES):
        """
        初始化爬虫

        Args:
            base_url (str): 基础URL
            sleep_time (float): 请求间隔时间（秒）
            max_retries (int): 最大重试次数
        """
        self.base_url = base_url
        self.sleep_time = sleep_time
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 YSL-Spider (https://github.com/user/YSL)'
        })

    def build_full_url(self, href):
        """构建完整URL"""
        if href is None:
            return None
        return urljoin(self.base_url, href)

    def download_file(self, url, filename):
        """
        下载文件并显示进度条

        Args:
            url (str): 文件URL
            filename (str): 保存的文件名

        Returns:
            bool: 下载是否成功
        """
        try:
            with self.session.get(url, stream=True) as response:
                response.raise_for_status()
                total = int(response.headers.get('content-length', 0))

                with open(filename, 'wb') as f, tqdm(
                    desc=f"下载 {os.path.basename(filename)}",
                    total=total,
                    unit='B',
                    unit_scale=True,
                    unit_divisor=1024,
                ) as bar:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            size = f.write(chunk)
                            bar.update(size)
            return True
        except Exception as e:
            logger.error(f"下载文件失败 {url}: {str(e)}")
            # 如果文件已经部分下载，则删除
            if os.path.exists(filename):
                os.remove(filename)
            return False

    def get_sound_page_content(self, url, retries=0):
        """
        获取声音详情页内容，带重试机制

        Args:
            url (str): 页面URL
            retries (int): 当前重试次数

        Returns:
            BeautifulSoup: 页面内容的BS4对象，失败则返回None
        """
        if url is None:
            return None

        try:
            # 添加请求间隔，避免对服务器造成压力
            time.sleep(self.sleep_time)
            logger.debug(f"请求页面: {url}")

            response = urlopen(url)
            return BeautifulSoup(response, "html.parser")
        except (requests.RequestException, RemoteDisconnected) as e:
            if retries >= self.max_retries:
                logger.error(f"达到最大重试次数，跳过: {url}")
                return None

            wait_time = self.sleep_time * (2 ** retries)  # 指数退避策略
            logger.warning(f"请求失败 ({str(e)}), {wait_time}秒后重试: {url}")
            time.sleep(wait_time)
            return self.get_sound_page_content(url, retries + 1)
        except Exception as e:
            logger.error(f"获取页面失败: {url}, 错误: {str(e)}")
            return None

    def process_sound_page(self, page_url):
        """
        处理声音详情页面，下载音频和图片

        Args:
            page_url (str): 页面URL

        Returns:
            bool: 处理是否成功
        """
        bs_obj = self.get_sound_page_content(page_url)
        if not bs_obj:
            return False

        try:
            page_title = bs_obj.find(class_="page-title").get_text()

            # 查找图片
            img_obj = bs_obj.find("img", attrs={
                'src': re.compile(r"(images).*?(jpg)"),
                'alt': True,
                'title': True
            })

            # 查找音频
            audio = bs_obj.find("source", attrs={
                'src': re.compile(r".mp3"),
                'type': "audio/mp3"
            })

            if not audio:
                logger.warning(f"页面中未找到音频文件: {page_url}")
                return False

            # 处理图片下载
            if img_obj:
                img_url = img_obj.attrs['src']
                author = bs_obj.find("p", class_="figcredit")
                date_str = bs_obj.find("dd", text=re.compile(r"\d{4}-\d{2}-\d{2}"))

                metadata = ""
                if author:
                    metadata += author.get_text().replace('/', '_') + "_"
                if date_str:
                    metadata += date_str.get_text()

                img_name = f"{page_title}_{metadata}.jpg"
                self.download_file(self.build_full_url(img_url), img_name)

            # 处理音频下载
            audio_name = f"{page_title}.mp3"
            self.download_file(self.build_full_url(audio.attrs['src']), audio_name)

            return True

        except AttributeError as e:
            logger.error(f"解析页面失败: {page_url}, 错误: {str(e)}")
        except Exception as e:
            logger.error(f"处理页面时发生错误: {page_url}, 错误: {str(e)}")

        return False

    def crawl_sound_library(self):
        """抓取声音库主页，并处理所有声音链接"""
        logger.info("开始爬取黄石公园声音库...")

        try:
            html = urlopen(SOUND_LIBRARY_URL)
            bs_obj = BeautifulSoup(html, "html.parser")
            links = bs_obj.find_all(id=re.compile(r"(sounds-)"))

            logger.info(f"找到 {len(links)} 个声音类别")

            for link in links:
                animal_name = link.get_text().rstrip()

                # 检查目录是否存在且不为空
                if os.path.exists(animal_name) and len(os.listdir(animal_name)) != 0:
                    logger.info(f"[{animal_name}] 已存在，跳过")
                    continue

                # 创建目录（如果不存在）
                os.makedirs(animal_name, exist_ok=True)

                # 切换到动物目录
                original_dir = os.getcwd()
                os.chdir(animal_name)

                try:
                    logger.info(f"正在获取 [{animal_name}] 的声音文件")
                    result = self.process_sound_page(self.build_full_url(link.attrs['href']))

                    if result:
                        logger.info(f"成功获取 [{animal_name}] 的声音文件")
                    else:
                        logger.warning(f"获取 [{animal_name}] 声音文件失败")

                except Exception as e:
                    logger.error(f"处理 [{animal_name}] 时发生错误: {str(e)}")

                finally:
                    # 返回原目录
                    os.chdir(original_dir)

        except Exception as e:
            logger.error(f"爬取声音库主页时发生错误: {str(e)}")
            return False

        return True


def md5(file_name):
    """计算文件MD5哈希值"""
    hash_md5 = hashlib.md5()
    with open(file_name, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


def remove_duplicated_files():
    """删除重复的音频文件（基于MD5哈希）"""
    logger.info("开始检查重复文件...")

    # 存储文件MD5到文件路径的映射
    files_map = {}
    # 记录哪些文件是重复的
    duplicate_files = []

    # 查找所有MP3文件
    for file_name in glob.iglob("*/*.mp3", recursive=True):
        file_md5 = md5(file_name)
        if file_md5 not in files_map:
            logger.debug(f"新文件: {file_name}, MD5: {file_md5}")
            files_map[file_md5] = file_name
        else:
            logger.info(f"找到重复文件: {file_name}, 对应于: {files_map[file_md5]}")
            duplicate_files.append((file_name, files_map[file_md5]))

    if not duplicate_files:
        logger.info("没有找到重复文件")
        return

    # 处理重复文件
    for duplicate, original in duplicate_files:
        # 检查文件是否附带图片
        duplicate_dir = os.path.dirname(duplicate)
        original_dir = os.path.dirname(original)

        duplicate_has_image = any(f.endswith(('.jpg', '.jpeg', '.png')) for f in os.listdir(duplicate_dir))
        original_has_image = any(f.endswith(('.jpg', '.jpeg', '.png')) for f in os.listdir(original_dir))

        # 确定要保留的文件和要删除的文件
        # 优先保留有图片的文件夹
        if duplicate_has_image and not original_has_image:
            # 如果重复文件有图片但原始文件没有，我们交换它们
            to_delete = original
            to_keep = duplicate
            # 更新映射
            file_md5 = md5(duplicate)
            files_map[file_md5] = duplicate
            logger.info(f"保留 {duplicate}（有图片），删除 {original}")
        else:
            # 否则默认保留第一个找到的文件
            to_delete = duplicate
            to_keep = original
            logger.info(f"保留 {original}，删除 {duplicate}")

        # 删除重复的单个文件
        try:
            if os.path.exists(to_delete):
                logger.info(f"删除重复文件: {to_delete}")
                os.remove(to_delete)

                # 如果文件夹为空，也删除文件夹
                dir_path = os.path.dirname(to_delete)
                if os.path.exists(dir_path) and not os.listdir(dir_path):
                    logger.info(f"删除空文件夹: {dir_path}")
                    shutil.rmtree(dir_path)
        except Exception as e:
            logger.error(f"删除文件失败 {to_delete}: {str(e)}")

    logger.info(f"重复文件检查完成，处理了 {len(duplicate_files)} 对重复文件")


def parse_arguments():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description='黄石公园声音库爬虫')
    parser.add_argument('--sleep', type=float, default=DEFAULT_SLEEP_TIME,
                        help=f'请求间隔时间（秒），默认 {DEFAULT_SLEEP_TIME}')
    parser.add_argument('--retries', type=int, default=MAX_RETRIES,
                        help=f'最大重试次数，默认 {MAX_RETRIES}')
    parser.add_argument('--skip-duplicates', action='store_true',
                        help='跳过检查重复文件')
    parser.add_argument('--verbose', '-v', action='store_true',
                        help='显示详细日志')
    return parser.parse_args()


def main():
    """主函数"""
    args = parse_arguments()

    # 设置日志级别
    if args.verbose:
        logger.setLevel(logging.DEBUG)

    # 创建爬虫实例
    crawler = YellowstoneSoundCrawler(
        sleep_time=args.sleep,
        max_retries=args.retries
    )

    # 开始爬取
    crawler.crawl_sound_library()

    # 检查重复文件
    if not args.skip_duplicates:
        remove_duplicated_files()

    logger.info("爬取完成！")


if __name__ == '__main__':
    main()
