"""Run G4 on Gold: python pipeline/g4.py (exit 1 when it fails)"""
import sys

from gates import g4
from session import spark_session

results = g4(spark_session())
for check, ok, detail in results:
    print(f"  {check:<22} {'PASS' if ok else 'FAIL'}  {detail}")
if not all(ok for _, ok, _ in results):
    sys.exit("G4 FAIL: Gold is not published")
print("G4 PASS: Gold is published")
