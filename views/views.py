#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 09:56
# @Author  : TengTengCai
# @File    : view.py
from flask import render_template


def index():
    """
    首页响应的函数

    :return:
    """
    return render_template("index.html")
