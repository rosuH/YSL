from urllib.request import urlopen
import urllib.request

import progressbar
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin
import os
import glob
import hashlib
from pathlib import Path
import shutil
import stat
from http.client import RemoteDisconnected

from progressbar import ProgressBar

base_url = "https://www.nps.gov"


def get_link_list():
    html = urlopen("https://www.nps.gov/yell/learn/photosmultimedia/soundlibrary.htm")
    bs_boj = BeautifulSoup(html, "html.parser")
    links = bs_boj.find_all(id=re.compile("(sounds-)"))
    try:
        for link in links:
            animal_name = link.get_text().rstrip()
            if os.path.exists(animal_name) and len(os.listdir(animal_name)) != 0:
                print("[" + animal_name + "] is exists, skip it.")
                continue
            try:
                os.mkdir(link.get_text())
            except FileExistsError:
                pass
            os.chdir(animal_name)
            print("Trying getting [" + animal_name + "]")
            get_res_from_page(build_full_url(link.attrs['href']))
            print("Succeed for [" + animal_name + "]")
            os.chdir("..")
    except FileNotFoundError as f_n_a:
        print(str(f_n_a))
        print(link)


def get_res_from_page(page_url):
    if page_url is None:
        return
    html = urlopen(page_url)
    bs_boj = BeautifulSoup(html, "html.parser")
    try:
        page_title = bs_boj.find(class_="page-title").get_text()
        img_obj = bs_boj.find("img", attrs={
            'src': re.compile("(images).*?(jpg)"),
            'alt': True,
            'title': True
        })

        audio = bs_boj.find("source", attrs={
            'src': re.compile(".mp3"),
            'type': "audio/mp3"
        })

        if img_obj:
            img_url = img_obj.attrs['src']
            author = bs_boj.find("p", class_="figcredit")
            date_str = bs_boj.find("dd", text=re.compile("\d{4}-\d{2}-\d{2}"))
            actual_name = ""
            if author:
                actual_name += author.get_text().replace('/', '_') + "_"
            if date_str:
                actual_name += date_str.get_text()

            urllib.request.urlretrieve(build_full_url(img_url), page_title + "_" + actual_name + ".jpg")

        audio_name = page_title + ".mp3"
        urllib.request.urlretrieve(build_full_url(audio.attrs['src']), audio_name, show_progress)
    except AttributeError as a:
        print(str(a))
        print(page_url)
    except TypeError as t_a:
        print(t_a)
        print(page_url)
    except RemoteDisconnected as r_s_a:
        print(r_s_a)
        print(page_url)


def build_full_url(href):
    return urljoin(base_url, href)


def remove_duplicated_files():
    source_set = set()
    files_need_remove = list()
    for file_name in glob.iglob("*/*.mp3", recursive=True):
        md5_str = md5(file_name)
        if md5_str not in source_set:
            print("adding " + file_name)
            source_set.add(md5_str)
        else:
            print("removing " + file_name)
            files_need_remove.append(file_name)

    for file_name in files_need_remove:
        file_folder = str(Path(file_name).parent)
        if not os.access(file_folder, os.W_OK):
            os.chmod(file_folder, stat.S_IWUSR)
        shutil.rmtree(file_folder)


def md5(file_name):
    hash_md5 = hashlib.md5()
    with open(file_name, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)

    return hash_md5.hexdigest()


pbar = None


def show_progress(block_num, block_size, total_size):
    global pbar
    if pbar is None:
        pbar = progressbar.ProgressBar(maxval=total_size)

    downloaded = block_num * block_size
    if downloaded < total_size:
        pbar.update(downloaded)
    else:
        pbar.finish()
        pbar = None


if __name__ == '__main__':
    get_link_list()
    remove_duplicated_files()
