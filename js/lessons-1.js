// Lessons 1–8: foundations and data analysis.
// Sections: H`html` is trusted, authored HTML. C`code` is a runnable, editable Python cell.
// String.raw keeps Python backslashes (e.g. "\n") exactly as written.
export const H = (s, ...v) => ({ html: String.raw(s, ...v) });
export const C = (s, ...v) => ({ code: String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') });
const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '');

export const LESSONS_1 = [
  {
    id: 1,
    part: 'Foundations',
    title: 'What are data science and AI?',
    minutes: 15,
    body: [
      H`<p><strong>Data science</strong> is answering questions with data: <em>Which product sells best on weekends?
      Did the new website design get more sign-ups?</em> <strong>Artificial intelligence</strong> is the broader
      goal of making computers do tasks that seem to need intelligence.</p>
      <div class="nest">
        <div>Artificial intelligence
          <div>Machine learning: learn patterns from examples
            <div>Deep learning: machine learning with neural networks
              <div>Large language models (LLMs): deep learning on text</div></div></div></div>
      </div>
      <p>The key idea of <strong>machine learning</strong>: instead of writing the rules yourself, you show the computer
      examples and let it <em>find</em> the rule. Every lesson in this course has code cells like the one below.
      They run real Python <strong>inside your browser</strong>. Press <kbd>Run</kbd> (or <kbd>Shift</kbd>+<kbd>Enter</kbd>).
      The first run downloads Python itself (about 13 MB, once).</p>`,
      C`
print("Hello, data!")
2 + 2`,
      H`<h3>A rule you write vs. a rule the computer learns</h3>
      <p>A hand-written rule looks like this:</p>`,
      C`
def is_hot(temp):
    return temp > 30   # I chose 30 myself

[is_hot(t) for t in [12, 25, 31, 36]]`,
      H`<p>Machine learning turns it around. We give examples with the right answers (called <strong>labels</strong>),
      and the computer tries many rules, keeping the one that makes the fewest mistakes. That search is
      <strong>training</strong>. Run it and read the loop:</p>`,
      C`
temps  = [12, 18, 22, 27, 31, 33, 36]
labels = ['cold', 'cold', 'cold', 'cold', 'hot', 'hot', 'hot']

best_threshold, fewest_mistakes = None, len(temps) + 1
for t in range(10, 40):                      # try every possible rule "temp > t"
    mistakes = sum((temp > t) != (label == 'hot') for temp, label in zip(temps, labels))
    if mistakes < fewest_mistakes:
        best_threshold, fewest_mistakes = t, mistakes

print("learned rule: temp >", best_threshold, "with", fewest_mistakes, "mistakes")`,
      H`<p>Real models learn millions of numbers instead of one threshold, and they search much more cleverly
      (lesson 10), but the idea is the same.</p>
      <h3>The data science workflow</h3>
      <ol>
        <li><strong>Ask</strong> a clear question.</li>
        <li><strong>Get</strong> the data (files, databases, APIs).</li>
        <li><strong>Clean</strong> it. This is usually most of the work.</li>
        <li><strong>Explore</strong> it with summaries and charts.</li>
        <li><strong>Model</strong> it: statistics or machine learning.</li>
        <li><strong>Communicate</strong> the answer, with its uncertainty.</li>
      </ol>
      <p>This course follows that path: Python and maths first, then data analysis, statistics, machine learning,
      deep learning and LLMs. Each lesson links the best <strong>free</strong> courses for going deeper.</p>
      <p>Stuck? Load the <strong>AI tutor</strong> (button at the top). It's a small language model that runs on your
      own device and can explain code and errors.</p>`,
    ],
    exercise: {
      task: H`<p>Some people's heights (cm) are labelled <code>tall</code> or <code>short</code>. Adapt the training loop so it
        learns the best threshold. Store it in a variable named <code>threshold</code>.</p>`,
      starter: py`
heights = [150, 158, 163, 168, 172, 179, 185, 191]
labels  = ['short', 'short', 'short', 'short', 'tall', 'tall', 'tall', 'tall']

threshold = None
# try every threshold from 140 to 200 and keep the one with the fewest mistakes

print(threshold)`,
      solution: py`
heights = [150, 158, 163, 168, 172, 179, 185, 191]
labels  = ['short', 'short', 'short', 'short', 'tall', 'tall', 'tall', 'tall']

threshold, fewest = None, len(heights) + 1
for t in range(140, 200):
    mistakes = sum((h > t) != (lab == 'tall') for h, lab in zip(heights, labels))
    if mistakes < fewest:
        threshold, fewest = t, mistakes
print(threshold)`,
      check: py`
assert threshold is not None, 'threshold is still None: the loop needs to set it.'
assert isinstance(threshold, (int, float)), 'threshold should be a number.'
wrong = sum((h > threshold) != (l == 'tall') for h, l in zip(heights, labels))
assert wrong == 0, f'With threshold {threshold} the rule still makes {wrong} mistakes.'`,
      hint: 'Copy the temperature loop, rename temps → heights, and change "hot" to "tall".',
    },
    quiz: [
      { q: 'What makes machine learning different from ordinary programming?',
        options: ['It uses a faster computer', 'It finds the rule from labelled examples instead of you writing it', 'It never makes mistakes'],
        answer: 1, why: 'You supply examples and answers; training searches for a rule that fits them.' },
      { q: 'Large language models are a kind of…',
        options: ['Deep learning', 'Database', 'Spreadsheet formula'],
        answer: 0, why: 'LLMs are deep neural networks trained on text.' },
      { q: 'Which step of a data project usually takes the most time?',
        options: ['Choosing the chart colours', 'Cleaning the data', 'Training the model'],
        answer: 1, why: 'Real data is messy. Cleaning it is often most of the work.' },
    ],
    resources: ['elements-of-ai', 'ai-for-everyone', 'google-ai-essentials'],
  },

  {
    id: 2,
    part: 'Foundations',
    title: 'Python for data',
    minutes: 25,
    body: [
      H`<p>You need a small part of Python for data work: values, lists, dictionaries, loops and functions.
      Change the code and re-run it. You can't break anything.</p>
      <h3>Values and variables</h3>`,
      C`
price = 3.8          # float (decimal number)
quantity = 2         # int (whole number)
item = "Latte"       # str (text)
paid = True          # bool (True / False)

total = price * quantity
print(f"{quantity} x {item} = {total:.2f}")   # f-string: {} inserts a value
type(total)`,
      H`<h3>Lists: ordered collections</h3>`,
      C`
sales = [12, 18, 7, 25, 30]
print(sales[0], sales[-1])      # first and last (counting starts at 0)
print(sales[1:3])               # a slice: positions 1 and 2
print(len(sales), sum(sales), max(sales))
sales.append(22)
sales`,
      H`<h3>Loops and conditions</h3>`,
      C`
for s in sales:
    if s >= 20:
        print(s, "good day")
    else:
        print(s, "quiet day")`,
      H`<p>A <strong>list comprehension</strong> builds a new list in one line. You'll see these everywhere:</p>`,
      C`
doubled = [s * 2 for s in sales]
good_days = [s for s in sales if s >= 20]
doubled, good_days`,
      H`<h3>Dictionaries: look things up by name</h3>`,
      C`
menu = {"Espresso": 2.5, "Latte": 3.8, "Tea": 2.2}
print(menu["Latte"])
menu["Muffin"] = 3.1            # add a new key
for name, p in menu.items():
    print(f"{name:10} {p:5.2f}")`,
      H`<h3>Functions</h3>
      <p>A function packages up code you want to reuse. <code>return</code> sends the answer back.</p>`,
      C`
def order_total(items, menu):
    """items is a list of item names; returns the bill."""
    return sum(menu[name] for name in items)

order_total(["Latte", "Latte", "Muffin"], menu)`,
      H`<p>Counting things with a dictionary is a classic pattern. <code>.get(key, 0)</code> returns 0 when the key is missing:</p>`,
      C`
orders = ["Tea", "Latte", "Tea", "Espresso", "Latte", "Tea"]
counts = {}
for o in orders:
    counts[o] = counts.get(o, 0) + 1
counts`,
    ],
    exercise: {
      task: H`<p>Write two functions:</p>
        <ul><li><code>average(nums)</code> returns the mean of a list of numbers.</li>
        <li><code>word_counts(text)</code> returns a dictionary of how often each word appears. Make it lower-case first
        and split on spaces with <code>text.lower().split()</code>.</li></ul>`,
      starter: py`
def average(nums):
    pass   # replace this line

def word_counts(text):
    pass   # replace this line

print(average([2, 4, 9]))
print(word_counts("the cat and the hat"))`,
      solution: py`
def average(nums):
    return sum(nums) / len(nums)

def word_counts(text):
    counts = {}
    for w in text.lower().split():
        counts[w] = counts.get(w, 0) + 1
    return counts

print(average([2, 4, 9]))
print(word_counts("the cat and the hat"))`,
      check: py`
assert average([2, 4, 9]) == 5, 'average([2, 4, 9]) should be 5.'
assert abs(average([1.5, 2.5]) - 2.0) < 1e-9, 'average([1.5, 2.5]) should be 2.0.'
wc = word_counts("The cat and the hat")
assert isinstance(wc, dict), 'word_counts should return a dictionary.'
assert wc.get('the') == 2, "'the' appears twice (remember to lower-case the text)."
assert wc.get('cat') == 1 and len(wc) == 4, 'Expected 4 different words: the, cat, and, hat.'`,
      hint: 'average: sum(nums) / len(nums). word_counts: loop over text.lower().split() and use counts.get(w, 0) + 1.',
    },
    quiz: [
      { q: 'sales = [5, 8, 13]. What is sales[-1]?', options: ['5', '13', 'An error'], answer: 1,
        why: 'Negative positions count from the end, so -1 is the last element.' },
      { q: 'What does [x * 2 for x in [1, 2, 3] if x > 1] give?', options: ['[2, 4, 6]', '[4, 6]', '[1, 2, 3]'], answer: 1,
        why: 'Only 2 and 3 pass the condition, and each is doubled.' },
      { q: 'Which is best for looking up a price by item name?', options: ['A list', 'A dictionary', 'A string'], answer: 1,
        why: 'Dictionaries map keys (names) to values (prices).' },
    ],
    resources: ['cs50p', 'kaggle-python', 'fcc-python-ds'],
  },

  {
    id: 3,
    part: 'Foundations',
    title: 'NumPy: vectors and matrices',
    minutes: 25,
    body: [
      H`<p>A dataset is a table of numbers, which mathematicians call a <strong>matrix</strong>. Each row is one example and
      each column is one feature. <strong>NumPy</strong> stores these as arrays and does maths on the whole array at once
      (<em>vectorised</em>), which is much faster than Python loops.</p>`,
      C`
import numpy as np

a = np.array([1, 2, 3, 4])
print(a * 10)          # every element times 10, no loop
print(a + a)           # element by element
print(a.mean(), a.std(), a.sum())
a ** 2`,
      H`<h3>Shape: rows × columns</h3>`,
      C`
X = np.array([[170, 65],
              [182, 80],
              [158, 52]])       # 3 people x 2 features (height cm, weight kg)
print(X.shape)                  # (rows, columns)
print(X[0])                     # first row: one person
print(X[:, 1])                  # all rows, column 1: every weight
X.mean(axis=0)                  # average of each column`,
      H`<h3>The dot product: a weighted sum</h3>
      <p>The <strong>dot product</strong> multiplies two vectors element by element and adds the results up. It is the single
      most important operation in machine learning: <em>one artificial neuron is a dot product</em>.</p>
      <div class="formula">w · x = w₁x₁ + w₂x₂ + … + wₙxₙ</div>`,
      C`
prices = np.array([2.5, 3.8, 2.2])     # espresso, latte, tea
basket = np.array([2, 1, 3])          # how many of each
basket @ prices                        # @ is the dot product: 2*2.5 + 1*3.8 + 3*2.2`,
      H`<h3>Matrix multiplication: many dot products at once</h3>
      <p>If each row of a matrix is one day's basket, <code>matrix @ vector</code> computes every day's total in one go.
      Neural networks are mostly big matrix multiplications, which is why GPUs are useful for them.</p>`,
      C`
days = np.array([[2, 1, 3],
                 [0, 4, 1],
                 [5, 5, 0]])     # 3 days x 3 items
days @ prices                    # revenue for each day`,
      H`<h3>Broadcasting</h3>
      <p>When shapes differ, NumPy stretches the smaller array to fit. Here we subtract each column's mean from every row
      (called <em>centering</em>, used all the time before training):</p>`,
      C`
centered = X - X.mean(axis=0)    # (3,2) minus (2,) → the (2,) row is used for every row
centered`,
      H`<p>Want the geometric picture: vectors as arrows, matrices as transformations of space? Watch 3Blue1Brown's
      <em>Essence of Linear Algebra</em> (linked below). It's the best free explanation there is.</p>`,
    ],
    exercise: {
      task: H`<p>A café sells 4 items at <code>prices</code>. <code>week</code> holds 7 days × 4 items of quantities sold.
        Compute <code>daily_revenue</code> (7 numbers) with matrix multiplication, then <code>best_day</code>: the <em>index</em>
        of the day with the highest revenue (use <code>np.argmax</code>).</p>`,
      starter: py`
import numpy as np
prices = np.array([2.5, 3.8, 2.9, 6.5])
week = np.array([[10, 22, 8, 3], [12, 25, 9, 4], [9, 20, 7, 2], [11, 24, 10, 5],
                 [15, 30, 12, 6], [22, 41, 18, 11], [20, 38, 15, 9]])

daily_revenue = None
best_day = None
print(daily_revenue, best_day)`,
      solution: py`
import numpy as np
prices = np.array([2.5, 3.8, 2.9, 6.5])
week = np.array([[10, 22, 8, 3], [12, 25, 9, 4], [9, 20, 7, 2], [11, 24, 10, 5],
                 [15, 30, 12, 6], [22, 41, 18, 11], [20, 38, 15, 9]])

daily_revenue = week @ prices
best_day = int(np.argmax(daily_revenue))
print(daily_revenue, best_day)`,
      check: py`
import numpy as np
assert daily_revenue is not None, 'Set daily_revenue = week @ prices.'
assert np.shape(daily_revenue) == (7,), f'daily_revenue should hold 7 numbers, got shape {np.shape(daily_revenue)}.'
assert np.allclose(daily_revenue, week @ prices), 'daily_revenue is not week @ prices.'
assert best_day == 5, 'best_day should be the index of the largest daily revenue.'`,
      hint: 'daily_revenue = week @ prices, then best_day = np.argmax(daily_revenue).',
    },
    quiz: [
      { q: 'A dataset has 500 rows and 12 columns. What is X.shape?', options: ['(12, 500)', '(500, 12)', '6000'], answer: 1,
        why: 'NumPy shapes are (rows, columns).' },
      { q: 'np.array([1, 2]) @ np.array([3, 4]) equals…', options: ['[3, 8]', '11', '10'], answer: 1,
        why: '1×3 + 2×4 = 11. A dot product returns one number.' },
      { q: 'Why use NumPy instead of Python loops?', options: ['Vectorised maths on whole arrays is much faster', 'Loops are not allowed in data science', 'It uses less memory than a single number'], answer: 0,
        why: 'NumPy runs the loop in fast compiled code.' },
    ],
    resources: ['3b1b-linalg', 'khan-linalg', 'pdsh', 'mml-book'],
  },

  {
    id: 4,
    part: 'Working with data',
    title: 'pandas: exploring a dataset',
    minutes: 25,
    body: [
      H`<p><strong>pandas</strong> is the standard tool for tables in Python. A table is a <code>DataFrame</code>, and one
      column is a <code>Series</code>. We'll explore a real-looking dataset: 3 months of orders from a small café
      (<code>data/cafe_sales.csv</code>, included with this course).</p>`,
      C`
import pandas as pd
df = pd.read_csv("data/cafe_sales.csv")
df.head()`,
      H`<p>First questions to ask any dataset: how big is it, what types are the columns, and what do the numbers look like?</p>`,
      C`
print(df.shape)
print(df.dtypes)
df.describe()`,
      H`<p>Look at the <code>unit_price</code> row of <code>describe()</code>: the max is <strong>380</strong> for a café item!
      That's suspicious. Keep it in mind for the next lesson.</p>
      <h3>Selecting and filtering</h3>`,
      C`
df["item"].head()                           # one column → a Series`,
      C`
cash_lattes = df[(df["item"] == "Latte") & (df["payment"] == "cash")]   # rows where both are true
cash_lattes.head()`,
      H`<h3>Counting and grouping</h3>
      <p><code>value_counts()</code> counts how often each value appears. <code>groupby</code> splits the table into groups,
      applies a summary to each, and combines the results. It's pandas' most useful feature.</p>`,
      C`
df["item"].value_counts()`,
      H`<p>Notice <code>latte</code> and <code>Latte</code> are counted separately: another data problem for lesson 5.</p>`,
      C`
df.groupby("payment")["quantity"].sum()`,
      C`
df.groupby("item")["unit_price"].agg(["count", "mean", "max"]).sort_values("count", ascending=False)`,
      H`<h3>New columns</h3>`,
      C`
df["revenue"] = df["quantity"] * df["unit_price"]
df.sort_values("revenue", ascending=False).head()`,
    ],
    exercise: {
      task: H`<p>Using <code>df</code> (already loaded for you), compute:</p>
        <ul><li><code>n_orders</code>: the number of rows.</li>
        <li><code>top_item</code>: the <code>item</code> value that appears most often (hint: <code>value_counts().idxmax()</code>).</li>
        <li><code>card_share</code>: the fraction of orders paid by <code>"card"</code>, between 0 and 1.</li></ul>`,
      setup: py`
import pandas as pd
df = pd.read_csv("data/cafe_sales.csv")`,
      starter: py`
n_orders = None
top_item = None
card_share = None
print(n_orders, top_item, card_share)`,
      solution: py`
n_orders = len(df)
top_item = df["item"].value_counts().idxmax()
card_share = (df["payment"] == "card").mean()
print(n_orders, top_item, card_share)`,
      check: py`
import pandas as pd
_raw = pd.read_csv("data/cafe_sales.csv")
assert n_orders == len(_raw), 'n_orders should be the number of rows: len(df).'
assert top_item == _raw["item"].value_counts().idxmax(), 'top_item should be the most common value in the item column.'
assert card_share is not None and abs(card_share - (_raw["payment"] == "card").mean()) < 1e-9, 'card_share should be (df["payment"] == "card").mean().'`,
      hint: 'The mean of a True/False column is the fraction of True values.',
    },
    quiz: [
      { q: 'df["price"] returns…', options: ['A DataFrame', 'A Series (one column)', 'A list'], answer: 1,
        why: 'A single column of a DataFrame is a Series.' },
      { q: 'Which gives total quantity per payment method?', options: ['df.sum("payment")', 'df.groupby("payment")["quantity"].sum()', 'df["payment"].value_counts()'], answer: 1,
        why: 'groupby splits by payment, then sums quantity in each group. value_counts only counts rows.' },
      { q: 'Why check describe() early?', options: ['It spots impossible values like a 380 price', 'It trains a model', 'It removes missing values'], answer: 0,
        why: 'Summary statistics reveal outliers and errors quickly.' },
    ],
    resources: ['kaggle-pandas', 'pdsh', 'fcc-python-ds'],
  },

  {
    id: 5,
    part: 'Working with data',
    title: 'Cleaning messy data',
    minutes: 30,
    body: [
      H`<p>Real data is messy. The café file has five classic problems. Let's find and fix each one. Every fix is a
      decision, so write down what you did and why.</p>
      <ol><li>Inconsistent text: <code>latte</code>, <code> Latte </code>, <code>Latte</code></li>
      <li>Missing values</li><li>Duplicate rows</li><li>An impossible value (the 380 price)</li>
      <li>Wrong types: dates stored as text</li></ol>`,
      C`
import pandas as pd
df = pd.read_csv("data/cafe_sales.csv")
print(df["item"].unique())`,
      H`<h3>1. Normalise text</h3>
      <p>The <code>.str</code> accessor applies string methods to a whole column.</p>`,
      C`
df["item"] = df["item"].str.strip().str.title()
df["item"].unique()`,
      H`<h3>2. Missing values</h3>`,
      C`
df.isna().sum()`,
      H`<p>Some orders have no quantity. You can drop those rows or <em>impute</em> a value. Most orders are for 1 item,
      so filling with the most common value (the <em>mode</em>) is reasonable here. Always report which you chose.</p>`,
      C`
print(df["quantity"].mode()[0])
df["quantity"] = df["quantity"].fillna(df["quantity"].mode()[0]).astype(int)
df["quantity"].isna().sum()`,
      H`<h3>3. Duplicates</h3>`,
      C`
print("duplicates:", df.duplicated().sum())
df = df.drop_duplicates()
len(df)`,
      H`<h3>4. Outliers and impossible values</h3>
      <p>Compare each price with its item's typical (median) price. A price 100× the median is almost certainly a typo.</p>`,
      C`
median_price = df.groupby("item")["unit_price"].transform("median")   # same length as df
bad = df["unit_price"] > 5 * median_price
print(df[bad])
df.loc[bad, "unit_price"] = median_price[bad]
df["unit_price"].max()`,
      H`<p>Careful: not every outlier is an error. A huge order might be real. Here we're fixing a price that
      can't be right, not deleting unusual data.</p>
      <h3>5. Types</h3>`,
      C`
df["date"] = pd.to_datetime(df["date"])
df["weekday"] = df["date"].dt.day_name()
df["revenue"] = df["quantity"] * df["unit_price"]
df.dtypes`,
      H`<p>Now we can ask real questions, like which weekday earns the most:</p>`,
      C`
df.groupby("weekday")["revenue"].sum().sort_values(ascending=False)`,
    ],
    exercise: {
      task: H`<p>Write a function <code>clean_sales(raw)</code> that takes the raw DataFrame and returns a cleaned copy where:</p>
        <ul><li>item names are stripped and title-cased (7 distinct items),</li>
        <li>missing quantities are filled with 1 and the column is <code>int</code>,</li>
        <li>duplicate rows are dropped,</li>
        <li>any price more than 5× its item's median is replaced by that median,</li>
        <li>there is a <code>revenue</code> column = quantity × unit_price.</li></ul>
        <p>Then run <code>clean = clean_sales(raw)</code>.</p>`,
      setup: py`
import pandas as pd
raw = pd.read_csv("data/cafe_sales.csv")`,
      starter: py`
def clean_sales(raw):
    df = raw.copy()
    # your cleaning steps here
    return df

clean = clean_sales(raw)
print(len(clean), clean["item"].nunique())`,
      solution: py`
def clean_sales(raw):
    df = raw.copy()
    df["item"] = df["item"].str.strip().str.title()
    df["quantity"] = df["quantity"].fillna(1).astype(int)
    df = df.drop_duplicates()
    med = df.groupby("item")["unit_price"].transform("median")
    bad = df["unit_price"] > 5 * med
    df.loc[bad, "unit_price"] = med[bad]
    df["revenue"] = df["quantity"] * df["unit_price"]
    return df

clean = clean_sales(raw)
print(len(clean), clean["item"].nunique())`,
      check: py`
import pandas as pd
_r = pd.read_csv("data/cafe_sales.csv")
_r["item"] = _r["item"].str.strip().str.title()
_n = len(_r.fillna({"quantity": 1}).drop_duplicates())
assert clean["item"].nunique() == 7, f'Expected 7 item names after cleaning, found {clean["item"].nunique()}: {sorted(clean["item"].unique())}'
assert clean["quantity"].isna().sum() == 0, 'There are still missing quantities.'
assert str(clean["quantity"].dtype).startswith("int"), 'quantity should be an int column (use .astype(int)).'
assert len(clean) == _n, f'Expected {_n} rows after removing duplicates, found {len(clean)}. Clean the item names before dropping duplicates.'
assert clean["unit_price"].max() < 10, f'A price of {clean["unit_price"].max()} is still in the data.'
assert "revenue" in clean, 'Add a revenue column.'
assert (clean["revenue"] - clean["quantity"] * clean["unit_price"]).abs().max() < 1e-9, 'revenue should be quantity × unit_price.'
assert len(raw) == len(_r), 'Don\'t change raw itself: work on raw.copy().'`,
      hint: 'Copy the steps from the lesson into the function, in this order: names, quantities, duplicates, prices, revenue.',
    },
    quiz: [
      { q: 'Why normalise item names before dropping duplicates?', options: ['"latte" and "Latte" rows would not count as duplicates', 'It makes the code shorter', 'It is not needed'], answer: 0,
        why: 'Rows that differ only in case or spaces are duplicates only after normalising.' },
      { q: 'An order of 40 lattes appears. What should you do?', options: ['Delete it: it is an outlier', 'Investigate: it might be a real catering order', 'Replace it with the mean'], answer: 1,
        why: 'Outliers aren\'t automatically errors. Check before you change them.' },
      { q: 'Filling missing values with a guess is called…', options: ['Imputation', 'Normalisation', 'Regression'], answer: 0,
        why: 'Imputation means filling in missing values. Always say that you did it.' },
    ],
    resources: ['kaggle-cleaning', 'pdsh', 'google-data-analytics'],
  },

  {
    id: 6,
    part: 'Working with data',
    title: 'Visualising data',
    minutes: 25,
    body: [
      H`<p>A good chart answers one question at a glance. Pick the chart by the question:</p>
      <table class="grid"><tr><th>Question</th><th>Chart</th></tr>
      <tr><td>How does it change over time?</td><td>Line</td></tr>
      <tr><td>How do categories compare?</td><td>Bar (sorted)</td></tr>
      <tr><td>How are values spread out?</td><td>Histogram</td></tr>
      <tr><td>Are two numbers related?</td><td>Scatter</td></tr></table>
      <p>We'll use <strong>matplotlib</strong>, the standard Python plotting library. A setup cell has already loaded the
      cleaned café data as <code>df</code>.</p>`,
      C`
import matplotlib.pyplot as plt
daily = df.groupby("date")["revenue"].sum()

fig, ax = plt.subplots(figsize=(8, 3))
ax.plot(daily.index, daily.values)
ax.set_title("Daily revenue, Q1 2026")
ax.set_ylabel("revenue")
plt.show()`,
      H`<p>The regular spikes are weekends. The chart shows it immediately, while a table of 90 numbers would hide it.</p>`,
      C`
by_item = df.groupby("item")["revenue"].sum().sort_values()
fig, ax = plt.subplots(figsize=(6, 3.5))
ax.barh(by_item.index, by_item.values, color="#3b6ea5")
ax.set_title("Revenue by item")
ax.set_xlabel("revenue")
plt.show()`,
      C`
hours = df["time"].str[:2].astype(int)
fig, ax = plt.subplots(figsize=(6, 3))
ax.hist(hours, bins=range(7, 20), edgecolor="white")
ax.set_title("When do orders come in?")
ax.set_xlabel("hour of day")
plt.show()`,
      H`<h3>Rules for honest charts</h3>
      <ul><li><strong>Title = the takeaway</strong> ("Weekends earn twice as much"), or at least the question.</li>
      <li>Label axes and include units.</li>
      <li>Bar charts must start at zero, or the bars exaggerate differences.</li>
      <li>Sort categories by value, not alphabetically.</li>
      <li>Use colour to highlight one thing, not to decorate.</li></ul>`,
    ],
    setup: py`
import pandas as pd
df = pd.read_csv("data/cafe_sales.csv")
df["item"] = df["item"].str.strip().str.title()
df["quantity"] = df["quantity"].fillna(1).astype(int)
df = df.drop_duplicates()
_m = df.groupby("item")["unit_price"].transform("median")
df.loc[df["unit_price"] > 5 * _m, "unit_price"] = _m
df["date"] = pd.to_datetime(df["date"])
df["revenue"] = df["quantity"] * df["unit_price"]`,
    exercise: {
      task: H`<p>Make a <strong>bar chart</strong> of total revenue by <code>payment</code> method. Store the totals in
        <code>by_payment</code> (a Series), draw it with <code>ax.bar</code>, and give the chart a title.</p>`,
      starter: py`
import matplotlib.pyplot as plt
by_payment = None

fig, ax = plt.subplots(figsize=(5, 3))
# draw the bars and set a title here
plt.show()`,
      solution: py`
import matplotlib.pyplot as plt
by_payment = df.groupby("payment")["revenue"].sum().sort_values(ascending=False)

fig, ax = plt.subplots(figsize=(5, 3))
ax.bar(by_payment.index, by_payment.values)
ax.set_title("Card brings in most revenue")
ax.set_ylabel("revenue")
plt.show()`,
      check: py`
import matplotlib.pyplot as plt
assert by_payment is not None, 'Set by_payment = df.groupby("payment")["revenue"].sum().'
_exp = df.groupby("payment")["revenue"].sum()
assert len(by_payment) == 3 and abs(float(by_payment.sum()) - float(_exp.sum())) < 1e-6, 'by_payment should hold total revenue for each of the 3 payment methods.'
_ax = plt.gcf().axes[0] if plt.get_fignums() and plt.gcf().axes else None
assert _ax is not None, 'No chart found. Keep plt.show() at the end.'
assert len(_ax.patches) == 3, f'Expected 3 bars, found {len(_ax.patches)}.'
assert _ax.get_title().strip(), 'Give the chart a title with ax.set_title(...).'`,
      hint: 'ax.bar(by_payment.index, by_payment.values), then ax.set_title("...").',
    },
    quiz: [
      { q: 'To show how exam scores are spread out, use a…', options: ['Line chart', 'Histogram', 'Pie chart'], answer: 1,
        why: 'Histograms show the distribution of one numeric variable.' },
      { q: 'A bar chart\'s y-axis starts at 90 instead of 0. The problem is…', options: ['Nothing', 'Small differences look huge', 'Bars become invisible'], answer: 1,
        why: 'Bar length encodes value, so a cut axis exaggerates differences.' },
      { q: 'Best order for bars comparing 7 products?', options: ['Alphabetical', 'Sorted by value', 'Random'], answer: 1,
        why: 'Sorting makes the ranking visible at a glance.' },
    ],
    resources: ['kaggle-viz', 'pdsh'],
  },

  {
    id: 7,
    part: 'Working with data',
    title: 'SQL: asking databases questions',
    minutes: 25,
    body: [
      H`<p>Most company data lives in <strong>databases</strong>, and <strong>SQL</strong> is how you ask them questions.
      It's short and readable, and it's in nearly every data job description. Python ships with
      <code>sqlite3</code>, a complete database in one file (or in memory). The setup cell loaded the cleaned café
      orders into a table called <code>orders</code>, plus a small <code>items</code> table.</p>`,
      C`
# The setup made a helper that runs SQL on the database "con" and returns a DataFrame:
#     def sql(query):
#         return pd.read_sql(query, con)
sql("SELECT * FROM orders LIMIT 5")`,
      H`<h3>SELECT … WHERE … ORDER BY</h3>`,
      C`
sql("""
SELECT date, item, quantity, revenue
FROM orders
WHERE item = 'Sandwich' AND quantity >= 3
ORDER BY revenue DESC
LIMIT 5
""")`,
      H`<h3>GROUP BY: SQL's version of groupby</h3>`,
      C`
sql("""
SELECT item, COUNT(*) AS orders, SUM(revenue) AS revenue, ROUND(AVG(quantity), 2) AS avg_qty
FROM orders
GROUP BY item
ORDER BY revenue DESC
""")`,
      H`<p>Filtering <em>after</em> grouping uses <code>HAVING</code> instead of <code>WHERE</code>:</p>`,
      C`
sql("""
SELECT payment, COUNT(*) AS n
FROM orders
GROUP BY payment
HAVING COUNT(*) > 400
""")`,
      H`<h3>JOIN: combining tables</h3>
      <p>The <code>items</code> table says which category each item belongs to. A <code>JOIN</code> matches rows on a shared column:</p>`,
      C`
sql("SELECT * FROM items")`,
      C`
sql("""
SELECT i.category, SUM(o.revenue) AS revenue
FROM orders AS o
JOIN items AS i ON o.item = i.item
GROUP BY i.category
""")`,
      H`<p>The order SQL <em>runs</em> in differs from how it's written: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT →
      ORDER BY → LIMIT. That's why you can't use a SELECT alias inside WHERE.</p>`,
    ],
    setup: py`
import pandas as pd, sqlite3
_df = pd.read_csv("data/cafe_sales.csv")
_df["item"] = _df["item"].str.strip().str.title()
_df["quantity"] = _df["quantity"].fillna(1).astype(int)
_df = _df.drop_duplicates()
_m = _df.groupby("item")["unit_price"].transform("median")
_df.loc[_df["unit_price"] > 5 * _m, "unit_price"] = _m
_df["revenue"] = _df["quantity"] * _df["unit_price"]
con = sqlite3.connect(":memory:")
def sql(query):
    return pd.read_sql(query, con)
_df.to_sql("orders", con, index=False)
pd.DataFrame({"item": ["Espresso", "Latte", "Cappuccino", "Tea", "Croissant", "Muffin", "Sandwich"],
              "category": ["coffee", "coffee", "coffee", "tea", "bakery", "bakery", "food"]}).to_sql("items", con, index=False)`,
    exercise: {
      task: H`<p>Write a SQL query in <code>query</code> that returns, for each <strong>category</strong>, the number of orders
        (<code>n_orders</code>) and total revenue (<code>revenue</code>), <strong>only for card payments</strong>, sorted by
        revenue from highest to lowest. Then run it: <code>result = sql(query)</code>.</p>`,
      starter: py`
query = """
SELECT ...
"""
result = sql(query)
result`,
      solution: py`
query = """
SELECT i.category, COUNT(*) AS n_orders, SUM(o.revenue) AS revenue
FROM orders AS o
JOIN items AS i ON o.item = i.item
WHERE o.payment = 'card'
GROUP BY i.category
ORDER BY revenue DESC
"""
result = sql(query)
result`,
      check: py`
_exp = pd.read_sql("""SELECT i.category, COUNT(*) AS n_orders, SUM(o.revenue) AS revenue FROM orders o JOIN items i ON o.item = i.item
WHERE o.payment = 'card' GROUP BY i.category ORDER BY revenue DESC""", con)
assert "n_orders" in result and "revenue" in result, 'Name the columns with AS n_orders and AS revenue.'
assert len(result) == 4, f'Expected one row per category (4), got {len(result)}.'
assert list(result["n_orders"]) == list(_exp["n_orders"]), 'The order counts don\'t match. Did you filter to card payments with WHERE?'
assert ((result["revenue"] - _exp["revenue"]).abs() < 1e-6).all(), 'The revenue totals or the sort order are off (ORDER BY revenue DESC).'`,
      hint: 'JOIN orders with items ON item, WHERE payment = \'card\', GROUP BY category, ORDER BY revenue DESC.',
    },
    quiz: [
      { q: 'Keep only groups with more than 100 orders. Use…', options: ['WHERE COUNT(*) > 100', 'HAVING COUNT(*) > 100', 'LIMIT 100'], answer: 1,
        why: 'WHERE filters rows before grouping; HAVING filters groups after.' },
      { q: 'A JOIN…', options: ['Stacks two tables vertically', 'Matches rows of two tables on a shared column', 'Deletes duplicates'], answer: 1,
        why: 'JOIN combines columns from tables whose key values match.' },
      { q: 'Which clause runs first?', options: ['SELECT', 'FROM', 'ORDER BY'], answer: 1,
        why: 'The database first decides which tables to read (FROM/JOIN).' },
    ],
    resources: ['kaggle-sql', 'sqlbolt', 'de-zoomcamp'],
  },

  {
    id: 8,
    part: 'Statistics',
    title: 'Probability and statistics by simulation',
    minutes: 30,
    body: [
      H`<p>Statistics is about <strong>uncertainty</strong>: what can a sample tell us about the whole population? A modern
      shortcut is to <strong>simulate</strong>: let the computer repeat an experiment thousands of times instead of
      deriving formulas.</p>
      <h3>Centre and spread</h3>`,
      C`
import numpy as np, pandas as pd
s = pd.read_csv("data/study_hours.csv")
print("mean:", s["score"].mean(), " median:", s["score"].median())
print("std (typical distance from the mean):", round(s["score"].std(), 1))
s.describe()`,
      H`<p>The <strong>mean</strong> is pulled around by extreme values; the <strong>median</strong> (middle value) isn't.
      For incomes or house prices, the median is usually more honest.</p>
      <h3>Randomness and the law of large numbers</h3>`,
      C`
rng = np.random.default_rng(0)        # a seeded random generator: same results every run
flips = rng.integers(0, 2, size=10_000)   # 0 = tails, 1 = heads
for n in [10, 100, 1000, 10_000]:
    print(n, "flips → fraction heads:", flips[:n].mean())`,
      H`<p>Small samples bounce around; large samples settle near the true value (0.5). That's the <strong>law of large
      numbers</strong>, and it's why sample size matters so much.</p>
      <h3>The central limit theorem</h3>
      <p>Averages of many random things form a bell curve (a <em>normal distribution</em>), even when the things
      themselves aren't bell-shaped. Dice are flat (each face is equally likely), but the <em>average</em> of 10 dice isn't:</p>`,
      C`
import matplotlib.pyplot as plt
one_die = rng.integers(1, 7, size=20_000)
avg_of_10 = rng.integers(1, 7, size=(20_000, 10)).mean(axis=1)

fig, axes = plt.subplots(1, 2, figsize=(9, 3))
axes[0].hist(one_die, bins=np.arange(0.5, 7.5, 1), edgecolor="white"); axes[0].set_title("One die: flat")
axes[1].hist(avg_of_10, bins=40, edgecolor="white"); axes[1].set_title("Average of 10 dice: a bell curve")
plt.show()`,
      H`<h3>Correlation</h3>
      <p>The correlation coefficient <em>r</em> runs from −1 to 1 and measures how strongly two numbers move together
      in a straight line.</p>`,
      C`
print(s[["hours", "sleep_hours", "score"]].corr().round(2))
fig, ax = plt.subplots(figsize=(5, 3.5))
ax.scatter(s["hours"], s["score"], alpha=0.6)
ax.set_xlabel("hours studied"); ax.set_ylabel("exam score"); ax.set_title("More study, higher scores")
plt.show()`,
      H`<p><strong>Correlation is not causation.</strong> Ice-cream sales and drownings are correlated because both rise
      in summer. Only a controlled experiment (next lesson) can show cause and effect.</p>`,
    ],
    exercise: {
      task: H`<p>Estimate by simulation the probability that <strong>two dice sum to 7</strong>. Roll two dice 100,000 times
        with <code>rng</code>, and store the fraction of sums equal to 7 in <code>p_seven</code>. The exact answer is
        6/36 ≈ 0.167, so see how close you get.</p>`,
      setup: py`
import numpy as np
rng = np.random.default_rng(42)`,
      starter: py`
n = 100_000
die1 = rng.integers(1, 7, size=n)
# roll the second die, add them up, and compute the fraction equal to 7
p_seven = None
print(p_seven)`,
      solution: py`
n = 100_000
die1 = rng.integers(1, 7, size=n)
die2 = rng.integers(1, 7, size=n)
p_seven = ((die1 + die2) == 7).mean()
print(p_seven)`,
      check: py`
assert p_seven is not None, 'Set p_seven to the fraction of sums equal to 7.'
assert 0 <= p_seven <= 1, 'A probability must be between 0 and 1.'
assert abs(p_seven - 1/6) < 0.01, f'{p_seven:.3f} is too far from 1/6 ≈ 0.167. Did you add two separate dice?'
assert p_seven != 1/6, 'Compute it from the simulation rather than typing 1/6.'`,
      hint: 'die2 = rng.integers(1, 7, size=n); p_seven = ((die1 + die2) == 7).mean()',
    },
    quiz: [
      { q: 'Incomes in a town: a few people are billionaires. Which describes a typical person better?', options: ['Mean', 'Median', 'Maximum'], answer: 1,
        why: 'The median ignores how extreme the extremes are.' },
      { q: 'Correlation between hours studied and score is 0.9. This proves…', options: ['Studying causes higher scores', 'They move together strongly; the cause is not proven', 'Nothing at all'], answer: 1,
        why: 'Correlation shows association. Causation needs an experiment.' },
      { q: 'Why seed the random generator (default_rng(0))?', options: ['To make results reproducible', 'To make numbers more random', 'It is faster'], answer: 0,
        why: 'The same seed gives the same "random" numbers every run.' },
    ],
    resources: ['data8', 'think-stats', 'khan-stats'],
  },
];
