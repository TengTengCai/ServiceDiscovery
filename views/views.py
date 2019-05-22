#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 09:56
# @Author  : TengTengCai
# @File    : view.py
from flask import render_template


def index():
    return render_template("index.html")
