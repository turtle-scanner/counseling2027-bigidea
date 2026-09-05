# -*- coding: utf-8 -*-
import json
import os
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(DIR)

from sub01_counseling import SUBJECT_01
from sub02_personality import SUBJECT_02
from sub03_assessment import SUBJECT_03
from sub04_abnormal import SUBJECT_04
from sub05_special import SUBJECT_05
from sub06_family import SUBJECT_06
from sub07_group import SUBJECT_07
from sub08_career import SUBJECT_08
from sub09_learning import SUBJECT_09
from sub10_development import SUBJECT_10
from sub11_school_ethics import SUBJECT_11

all_subjects = [
    SUBJECT_01,
    SUBJECT_02,
    SUBJECT_03,
    SUBJECT_04,
    SUBJECT_05,
    SUBJECT_06,
    SUBJECT_07,
    SUBJECT_08,
    SUBJECT_09,
    SUBJECT_10,
    SUBJECT_11
]

total_topics = sum(len(s['topics']) for s in all_subjects)
print(f"Total subjects: {len(all_subjects)}, Total topics: {total_topics}")

out_path = os.path.join(DIR, '..', 'data.js')
json_str = json.dumps(all_subjects, ensure_ascii=False, indent=2)

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('// 2027 전문상담 임용고시 핵심 교재 데이터베이스\n')
    f.write('const TEXTBOOK_DATA = ')
    f.write(json_str)
    f.write(';\n')

print(f"Successfully generated {out_path} ({os.path.getsize(out_path):,} bytes)")
