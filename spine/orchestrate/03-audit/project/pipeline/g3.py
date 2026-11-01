"""Run G3 on Silver: python pipeline/g3.py (exit 1 when it fails)"""
import sys

from gates import g3
from session import spark_session

results = g3(spark_session())
for check, ok, detail in results:
    print(f"  {check:<36} {'PASS' if ok else 'FAIL'}  {detail}")
if not all(ok for _, ok, _ in results):
    sys.exit("G3 FAIL: Gold does not run")
print("G3 PASS")
