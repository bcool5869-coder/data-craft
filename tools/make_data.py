"""Generates the small, synthetic datasets in data/ (deterministic; rerun to rebuild)."""
import csv, random, datetime, math

random.seed(42)
OUT = 'data/'

# cafe_sales.csv: a small cafe's orders for 2026 Q1, deliberately a little messy for the cleaning lesson:
# inconsistent item casing/spaces, some missing quantities, a few duplicate rows, one typo'd price.
items = {'Espresso': 2.5, 'Latte': 3.8, 'Cappuccino': 3.6, 'Tea': 2.2, 'Croissant': 2.9, 'Muffin': 3.1, 'Sandwich': 6.5}
weights = [18, 26, 16, 12, 12, 9, 7]
rows = []
start = datetime.date(2026, 1, 1)
oid = 1000
for day in range(90):
    date = start + datetime.timedelta(days=day)
    weekend = date.weekday() >= 5
    n = random.randint(14, 22) + (8 if weekend else 0)
    for _ in range(n):
        oid += 1
        item = random.choices(list(items), weights)[0]
        qty = random.choices([1, 2, 3, 4], [60, 25, 10, 5])[0]
        hour = random.choices(range(7, 19), [8, 12, 11, 8, 6, 9, 10, 7, 6, 5, 4, 3])[0]
        pay = random.choices(['card', 'cash', 'mobile'], [55, 20, 25])[0]
        name = item
        r = random.random()
        if r < 0.05: name = item.lower()
        elif r < 0.08: name = ' ' + item + ' '
        q = '' if random.random() < 0.03 else qty
        rows.append([oid, date.isoformat(), f'{hour:02d}:{random.randint(0,59):02d}', name, q, items[item], pay])
# duplicates and one bad price
for i in random.sample(range(len(rows)), 6):
    rows.append(list(rows[i]))
rows[123][5] = 380.0  # typo: 3.80 entered as 380
rows.sort(key=lambda r: r[0])
with open(OUT + 'cafe_sales.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['order_id', 'date', 'time', 'item', 'quantity', 'unit_price', 'payment'])
    w.writerows(rows)

# study_hours.csv: hours studied vs exam score (linear trend + noise) and whether the student passed.
with open(OUT + 'study_hours.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['hours', 'sleep_hours', 'score', 'passed'])
    for _ in range(120):
        h = round(random.uniform(0, 10), 1)
        s = round(random.uniform(4, 9), 1)
        score = max(0, min(100, round(35 + 5.2 * h + 2.0 * (s - 6.5) + random.gauss(0, 7))))
        w.writerow([h, s, score, int(score >= 60)])

# ab_test.csv: website visitors shown page A or B, and whether they signed up. B is truly a little better.
with open(OUT + 'ab_test.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['visitor_id', 'group', 'signed_up'])
    for i in range(6000):
        g = random.choice('AB')
        p = 0.10 if g == 'A' else 0.13
        w.writerow([i + 1, g, int(random.random() < p)])
print('ok', len(rows))
