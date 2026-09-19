// Lessons 9–16: statistics, machine learning, deep learning and LLMs.
import { H, C } from './lessons-1.js';
const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '');

export const LESSONS_2 = [
  {
    id: 9,
    part: 'Statistics',
    title: 'A/B tests and hypothesis testing',
    minutes: 30,
    body: [
      H`<p>A website shows half its visitors page <strong>A</strong> and half page <strong>B</strong>, chosen at random.
      Because the groups are random, any real difference in sign-ups must be <em>caused</em> by the page. This is a
      <strong>randomised controlled experiment</strong>, the gold standard for cause and effect.</p>`,
      C`
import numpy as np, pandas as pd
ab = pd.read_csv("data/ab_test.csv")
rates = ab.groupby("group")["signed_up"].agg(["count", "mean"])
rates`,
      H`<p>B looks better. But even two identical pages would give slightly different rates just by luck. The question
      is: <strong>could a difference this big easily happen by chance?</strong></p>
      <h3>The permutation test</h3>
      <p>Assume the page makes <em>no</em> difference (the <strong>null hypothesis</strong>). Then the A/B labels are
      meaningless, and shuffling them shouldn't matter. Shuffle them many times and see how often chance alone produces
      a difference as big as the real one. That fraction is the <strong>p-value</strong>.</p>`,
      C`
rng = np.random.default_rng(0)
signed = ab["signed_up"].to_numpy()
is_b = (ab["group"] == "B").to_numpy()
observed = signed[is_b].mean() - signed[~is_b].mean()

diffs = []
for _ in range(2000):
    shuffled = rng.permutation(is_b)                      # random labels: "no difference" world
    diffs.append(signed[shuffled].mean() - signed[~shuffled].mean())
diffs = np.array(diffs)

p_value = (np.abs(diffs) >= abs(observed)).mean()
print(f"observed difference: {observed:.4f}   p-value: {p_value:.4f}")`,
      C`
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(7, 3))
ax.hist(diffs, bins=40, edgecolor="white", color="#999")
ax.axvline(observed, color="crimson", lw=2, label="what we observed")
ax.set_title("Differences produced by chance alone"); ax.legend()
plt.show()`,
      H`<p>The red line sits out in the tail: chance alone produces a gap that big only about 3% of the time. By convention,
      p &lt; 0.05 counts as <strong>statistically significant</strong>, so we'd say page B really is better. Notice how close
      to the line this is, though. A smaller test could easily have missed it.</p>
      <h3>Confidence intervals: how big is the effect?</h3>
      <p>A p-value only says "probably not zero". A <strong>confidence interval</strong> shows the plausible range of the
      real effect. The <em>bootstrap</em> gets one by resampling the data with replacement:</p>`,
      C`
a, b = signed[~is_b], signed[is_b]
boot = [rng.choice(b, len(b)).mean() - rng.choice(a, len(a)).mean() for _ in range(2000)]
low, high = np.percentile(boot, [2.5, 97.5])
print(f"95% confidence interval for B − A: {low:.4f} to {high:.4f}")`,
      H`<h3>Common traps</h3>
      <ul><li><strong>Peeking</strong>: stopping the test as soon as p &lt; 0.05 inflates false positives. Choose the sample size first.</li>
      <li><strong>Many metrics</strong>: test 20 things and one will be "significant" by luck.</li>
      <li><strong>Significant ≠ important</strong>: with huge samples, tiny, useless differences become significant. Look at the interval.</li></ul>
      <p>The same result from the textbook formula (a chi-squared test):</p>`,
      C`
from scipy import stats
table = pd.crosstab(ab["group"], ab["signed_up"])
chi2, p, dof, expected = stats.chi2_contingency(table)
print(table); print("p-value:", round(p, 4))`,
    ],
    exercise: {
      task: H`<p>A second experiment tested a new <strong>checkout button</strong>. Compute <code>diff</code> (new rate − old rate)
        and a permutation-test <code>p_value</code> with 2,000 shuffles. Then set <code>significant</code> to
        <code>True</code> or <code>False</code> (p &lt; 0.05).</p>`,
      setup: py`
import numpy as np
_g = np.random.default_rng(7)
new = (_g.random(600) < 0.31).astype(int)     # 1 = bought
old = (_g.random(600) < 0.29).astype(int)
rng = np.random.default_rng(1)`,
      starter: py`
# new and old are arrays of 0/1 (did the visitor buy?)
both = np.concatenate([new, old])
diff = None
p_value = None
significant = None
print(diff, p_value, significant)`,
      solution: py`
both = np.concatenate([new, old])
diff = new.mean() - old.mean()
diffs = []
for _ in range(2000):
    perm = rng.permutation(both)
    diffs.append(perm[:len(new)].mean() - perm[len(new):].mean())
p_value = (np.abs(np.array(diffs)) >= abs(diff)).mean()
significant = p_value < 0.05
print(diff, p_value, significant)`,
      check: py`
assert diff is not None and abs(diff - (new.mean() - old.mean())) < 1e-9, 'diff should be new.mean() - old.mean().'
assert p_value is not None and 0 <= p_value <= 1, 'p_value should be a fraction between 0 and 1.'
assert p_value > 0.2, f'p_value {p_value:.3f} looks too small. Count shuffled differences at least as extreme as |diff| (use np.abs).'
assert significant in (False, np.False_), 'With this p-value the result is not significant.'`,
      hint: 'Shuffle both with rng.permutation, split into the first len(new) and the rest, and compare means each time.',
    },
    quiz: [
      { q: 'A p-value of 0.03 means…', options: ['There is a 3% chance B is better', 'If there were no real difference, a gap this big would appear about 3% of the time', 'B is 3% better'], answer: 1,
        why: 'A p-value is computed assuming the null hypothesis is true.' },
      { q: 'Why assign pages at random?', options: ['So the groups differ only by the page, and the effect is causal', 'To make it faster', 'Randomness increases conversions'], answer: 0,
        why: 'Randomisation balances every other factor between the groups.' },
      { q: 'You stop the test the first time p < 0.05. This…', options: ['Is best practice', 'Inflates false positives ("peeking")', 'Has no effect'], answer: 1,
        why: 'Checking repeatedly gives chance many opportunities to cross the line.' },
    ],
    resources: ['data8', 'think-stats', 'khan-stats'],
  },

  {
    id: 10,
    part: 'Machine learning',
    title: 'Linear regression and gradient descent',
    minutes: 35,
    body: [
      H`<p>Our first real model predicts a number: exam <em>score</em> from <em>hours</em> studied. A line has two
      parameters, a weight <em>w</em> (slope) and a bias <em>b</em> (intercept):</p>
      <div class="formula">predicted score = w × hours + b</div>
      <p>To choose <em>w</em> and <em>b</em>, we need a <strong>loss</strong>: one number that says how wrong the predictions are.
      The usual one is the <strong>mean squared error</strong> (MSE).</p>`,
      C`
import numpy as np, pandas as pd
import matplotlib.pyplot as plt
s = pd.read_csv("data/study_hours.csv")
x, y = s["hours"].to_numpy(), s["score"].to_numpy()

def mse(w, b):
    return ((w * x + b - y) ** 2).mean()

for w, b in [(0, 60), (3, 45), (5, 35)]:
    print(f"w={w}, b={b}: loss = {mse(w, b):.1f}")`,
      H`<h3>Gradient descent: walk downhill</h3>
      <p>Picture the loss as a landscape over every (w, b). The <strong>gradient</strong> points uphill, so step a little
      the opposite way and repeat. The size of each step is the <strong>learning rate</strong>. This loop is how
      <em>every</em> neural network is trained, including ChatGPT-sized ones.</p>
      <div class="formula">w ← w − lr × ∂loss/∂w &nbsp;&nbsp;&nbsp; b ← b − lr × ∂loss/∂b</div>`,
      C`
w, b, lr = 0.0, 0.0, 0.01
history = []
for step in range(3000):
    error = w * x + b - y
    grad_w = 2 * (error * x).mean()     # derivative of MSE with respect to w
    grad_b = 2 * error.mean()           # ... and with respect to b
    w -= lr * grad_w
    b -= lr * grad_b
    history.append(mse(w, b))
print(f"w = {w:.2f}, b = {b:.2f}, loss = {history[-1]:.1f}")

fig, axes = plt.subplots(1, 2, figsize=(10, 3.2))
axes[0].plot(history); axes[0].set_yscale("log"); axes[0].set_title("Loss falls as we train"); axes[0].set_xlabel("step")
axes[1].scatter(x, y, alpha=0.5); xs = np.linspace(0, 10, 2)
axes[1].plot(xs, w * xs + b, color="crimson"); axes[1].set_title("The learned line"); axes[1].set_xlabel("hours")
plt.show()`,
      H`<p>Each extra hour of study adds about <em>w</em> points. Try <code>lr = 0.05</code>: the steps are too big, the
      loss explodes and the numbers become <code>nan</code>. Picking the learning rate is a real part of the job.</p>
      <h3>The same thing with scikit-learn</h3>
      <p><strong>scikit-learn</strong> is Python's standard ML library. Every model has the same interface:
      <code>fit(X, y)</code> to train and <code>predict(X)</code> to use it. <code>X</code> is a 2-D table of features.</p>`,
      C`
from sklearn.linear_model import LinearRegression
X = s[["hours", "sleep_hours"]]          # two features now
model = LinearRegression().fit(X, y)
print("weights:", model.coef_.round(2), " bias:", round(model.intercept_, 2))
print("R² (fraction of variation explained):", round(model.score(X, y), 3))
model.predict(pd.DataFrame({"hours": [2, 8], "sleep_hours": [8, 8]}))`,
      H`<p><strong>R²</strong> = 1 means perfect predictions; 0 means no better than always guessing the average.
      Here a 2-feature line explains most of the variation.</p>`,
    ],
    exercise: {
      task: H`<p>Fit <code>score = w × sleep_hours + b</code> with <strong>your own gradient descent</strong> (no sklearn).
        <code>x</code> and <code>y</code> are ready. Get <code>w</code> and <code>b</code> within 0.1 of the best
        values. Tip: sleep values are around 4–9, so you may need a smaller learning rate and more steps.</p>`,
      setup: py`
import numpy as np, pandas as pd
_s = pd.read_csv("data/study_hours.csv")
x, y = _s["sleep_hours"].to_numpy(), _s["score"].to_numpy()`,
      starter: py`
w, b, lr = 0.0, 0.0, 0.01
for step in range(1000):
    error = w * x + b - y
    # compute the two gradients and update w and b

print(w, b)`,
      solution: py`
w, b, lr = 0.0, 0.0, 0.02
for step in range(20000):
    error = w * x + b - y
    w -= lr * 2 * (error * x).mean()
    b -= lr * 2 * error.mean()
print(w, b)`,
      check: py`
_w, _b = np.polyfit(x, y, 1)
assert np.isfinite(w) and np.isfinite(b), 'w or b became nan/inf: the learning rate is too big.'
assert abs(w - _w) < 0.1 and abs(b - _b) < 0.1, f'Not converged yet: you have w={w:.2f}, b={b:.2f}. Keep the learning rate at 0.02 or lower and add more steps.'`,
      hint: 'The update lines are the same as in the lesson. Then try lr = 0.02 with 20,000 steps.',
    },
    quiz: [
      { q: 'What does gradient descent do each step?', options: ['Tries random parameters', 'Moves parameters a little in the direction that lowers the loss', 'Deletes bad data'], answer: 1,
        why: 'It follows the negative gradient downhill on the loss surface.' },
      { q: 'The loss turns into nan after a few steps. Most likely…', options: ['The learning rate is too high', 'There is too little data', 'The model is too simple'], answer: 0,
        why: 'Huge steps overshoot the minimum and the values blow up.' },
      { q: 'R² = 0 means the model is…', options: ['Perfect', 'No better than predicting the mean', 'Broken code'], answer: 1,
        why: 'R² compares the model with always predicting the average.' },
    ],
    resources: ['google-mlcc', 'islp', '3b1b-calculus', 'kaggle-ml'],
  },

  {
    id: 11,
    part: 'Machine learning',
    title: 'Classification and honest evaluation',
    minutes: 35,
    body: [
      H`<p><strong>Classification</strong> predicts a category: pass or fail, spam or not, tumour benign or malignant.
      The most important rule in all of machine learning:</p>
      <div class="formula">Never judge a model on the data it was trained on.</div>
      <p>A model can memorise its training data and still be useless on new data. That's called <strong>overfitting</strong>.
      So we hold back a <strong>test set</strong> that the model never sees during training.</p>`,
      C`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
s = pd.read_csv("data/study_hours.csv")
X, y = s[["hours", "sleep_hours"]], s["passed"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

clf = LogisticRegression().fit(X_train, y_train)
print("train accuracy:", clf.score(X_train, y_train))
print("test accuracy: ", clf.score(X_test, y_test))
clf.predict_proba(pd.DataFrame({"hours": [2, 5, 8], "sleep_hours": [7, 7, 7]})).round(2)`,
      H`<p><strong>Logistic regression</strong> is a linear model squashed into a probability between 0 and 1. It's simple,
      fast and a strong baseline.</p>
      <h3>Accuracy isn't enough</h3>
      <p>If 99% of emails aren't spam, a model that always says "not spam" is 99% accurate and useless. The
      <strong>confusion matrix</strong> shows which mistakes are made:</p>`,
      C`
from sklearn.metrics import confusion_matrix, classification_report
pred = clf.predict(X_test)
print(confusion_matrix(y_test, pred))      # rows = truth, columns = prediction
print(classification_report(y_test, pred))`,
      H`<ul><li><strong>Precision</strong>: of the ones we flagged, how many were right? (matters when false alarms are costly)</li>
      <li><strong>Recall</strong>: of the real ones, how many did we catch? (matters when misses are costly, e.g. disease)</li></ul>
      <h3>Overfitting, seen directly</h3>
      <p>A <strong>decision tree</strong> asks a chain of yes/no questions. Deeper trees fit the training data better, but
      at some point the test score stops improving or gets worse:</p>`,
      C`
from sklearn.tree import DecisionTreeClassifier
import matplotlib.pyplot as plt
depths, tr, te = range(1, 15), [], []
for d in depths:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(X_train, y_train)
    tr.append(t.score(X_train, y_train)); te.append(t.score(X_test, y_test))
fig, ax = plt.subplots(figsize=(7, 3))
ax.plot(depths, tr, label="train"); ax.plot(depths, te, label="test")
ax.set_xlabel("tree depth"); ax.set_ylabel("accuracy"); ax.set_title("Deeper trees memorise"); ax.legend()
plt.show()`,
      H`<h3>Cross-validation</h3>
      <p>One test split can be lucky or unlucky. <strong>k-fold cross-validation</strong> trains k times, each time holding
      out a different slice, and averages the scores:</p>`,
      C`
from sklearn.model_selection import cross_val_score
scores = cross_val_score(LogisticRegression(), X, y, cv=5)
print(scores.round(3), "mean:", scores.mean().round(3))`,
      H`<h3>Fairness</h3>
      <p>A model can be accurate overall and still much worse for one group of people, for example if that group was
      rare in the training data. Always check metrics <em>per group</em> when a model makes decisions about people.</p>`,
    ],
    exercise: {
      task: H`<p>scikit-learn includes a real medical dataset: 569 tumours with 30 measurements each, labelled benign or
        malignant. Split it with <code>train_test_split(X, y, test_size=0.25, random_state=0)</code>, train any classifier as
        <code>model</code>, and reach a <strong>test accuracy of at least 0.95</strong>, stored in <code>test_acc</code>.</p>
        <p>Hint: logistic regression works well if you <em>scale</em> the features first:
        <code>make_pipeline(StandardScaler(), LogisticRegression())</code>.</p>`,
      setup: py`
from sklearn.datasets import load_breast_cancer
X, y = load_breast_cancer(return_X_y=True)`,
      starter: py`
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
model = None
test_acc = None
print(test_acc)`,
      solution: py`
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
test_acc = model.score(X_test, y_test)
print(test_acc)`,
      check: py`
from sklearn.model_selection import train_test_split
_a, _b, _c, _d = train_test_split(X, y, test_size=0.25, random_state=0)
assert model is not None and test_acc is not None, 'Train a model and set test_acc = model.score(X_test, y_test).'
_real = model.score(_b, _d)
assert abs(test_acc - _real) < 1e-9, 'test_acc must be the score on the test set (X_test, y_test), not the training set.'
assert _real >= 0.95, f'Test accuracy is {_real:.3f}. Try scaling the features first with a pipeline.'`,
      hint: 'model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)',
    },
    quiz: [
      { q: '100% train accuracy, 70% test accuracy. The model is…', options: ['Underfitting', 'Overfitting', 'Perfect'], answer: 1,
        why: 'It memorised the training set and doesn\'t generalise.' },
      { q: 'Screening for a serious disease, which matters most?', options: ['Recall: don\'t miss real cases', 'Precision', 'Training speed'], answer: 0,
        why: 'Missing a sick patient is usually worse than a false alarm that a follow-up test can clear.' },
      { q: 'Why use cross-validation?', options: ['It makes models bigger', 'It gives a more reliable estimate than one split', 'It removes the need for a test set'], answer: 1,
        why: 'Averaging over several held-out folds reduces the luck of one split.' },
    ],
    resources: ['kaggle-ml', 'islp', 'google-mlcc', 'ms-ml-beginners'],
  },

  {
    id: 12,
    part: 'Machine learning',
    title: 'Unsupervised learning: clustering and PCA',
    minutes: 25,
    body: [
      H`<p>So far every example had a label. <strong>Unsupervised learning</strong> finds structure without labels:
      groups of similar customers (<strong>clustering</strong>), or a simpler view of data with many columns
      (<strong>dimensionality reduction</strong>).</p>
      <h3>k-means clustering</h3>
      <p>Pick <em>k</em> centres. Assign every point to its nearest centre, move each centre to the mean of its points,
      and repeat until nothing changes.</p>`,
      C`
from sklearn.datasets import load_iris
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
iris = load_iris()
X = iris.data                     # 150 flowers x 4 measurements, labels hidden from k-means

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
fig, axes = plt.subplots(1, 2, figsize=(10, 3.5))
axes[0].scatter(X[:, 2], X[:, 3], c=km.labels_, cmap="viridis"); axes[0].set_title("k-means clusters (no labels used)")
axes[1].scatter(X[:, 2], X[:, 3], c=iris.target, cmap="viridis"); axes[1].set_title("True species")
for a in axes: a.set_xlabel("petal length"); a.set_ylabel("petal width")
plt.show()`,
      H`<p>Without being told the species, k-means recovered them almost exactly.</p>
      <h3>How many clusters? The elbow</h3>`,
      C`
inertias = [KMeans(n_clusters=k, n_init=10, random_state=0).fit(X).inertia_ for k in range(1, 9)]
fig, ax = plt.subplots(figsize=(6, 3))
ax.plot(range(1, 9), inertias, marker="o"); ax.set_xlabel("k"); ax.set_ylabel("within-cluster distance")
ax.set_title("The bend (elbow) suggests k ≈ 3"); plt.show()`,
      H`<h3>Scaling matters</h3>
      <p>k-means uses distances. If one column is in thousands and another in fractions, the big column dominates.
      <code>StandardScaler</code> puts every column on the same scale (mean 0, std 1).</p>
      <h3>PCA: squashing 64 dimensions into 2</h3>
      <p>Each image of a handwritten digit is 8×8 = 64 numbers. <strong>Principal Component Analysis</strong> finds the
      directions in which the data varies most, so we can plot 64-dimensional data on a 2-D page:</p>`,
      C`
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
digits = load_digits()
Z = PCA(n_components=2).fit_transform(digits.data)
fig, ax = plt.subplots(figsize=(6, 5))
sc = ax.scatter(Z[:, 0], Z[:, 1], c=digits.target, cmap="tab10", s=8)
fig.colorbar(sc, label="digit"); ax.set_title("1,797 digits, 64 dimensions → 2")
plt.show()`,
      H`<p>Same digits land near each other, even though PCA never saw the labels. Embeddings in LLMs (lesson 14)
      use the same idea: meaning becomes <em>position</em> in a space.</p>`,
    ],
    exercise: {
      task: H`<p>The <strong>wine</strong> dataset has 178 wines, 13 chemical measurements and 3 true cultivars. Cluster it
        with k-means (k=3) and compare with the truth using <code>adjusted_rand_score</code> (1 = perfect match, 0 = random).
        Store it in <code>ari</code>. Without scaling you'll get about 0.37. Reach <strong>at least 0.8</strong>.</p>`,
      setup: py`
from sklearn.datasets import load_wine
from sklearn.metrics import adjusted_rand_score
X, y = load_wine(return_X_y=True)`,
      starter: py`
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

labels = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X)
ari = adjusted_rand_score(y, labels)
print(round(ari, 3))`,
      solution: py`
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

X_scaled = StandardScaler().fit_transform(X)
labels = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X_scaled)
ari = adjusted_rand_score(y, labels)
print(round(ari, 3))`,
      check: py`
assert ari is not None, 'Set ari = adjusted_rand_score(y, labels).'
assert ari >= 0.8, f'ARI is {ari:.3f}. Scale the features with StandardScaler before clustering.'`,
      hint: 'X_scaled = StandardScaler().fit_transform(X), then cluster X_scaled instead of X.',
    },
    quiz: [
      { q: 'Clustering is "unsupervised" because…', options: ['No labels are used for training', 'Nobody checks the code', 'It needs no data'], answer: 0,
        why: 'It finds groups from the features alone.' },
      { q: 'Why scale features before k-means?', options: ['Distances would otherwise be dominated by large-valued columns', 'It makes the plot prettier', 'k-means requires integers'], answer: 0,
        why: 'Distance-based methods treat a unit in every column equally.' },
      { q: 'PCA is mainly used to…', options: ['Label data', 'Reduce many columns to a few that keep most of the variation', 'Clean text'], answer: 1,
        why: 'It projects data onto the directions of greatest variance.' },
    ],
    resources: ['ms-ml-beginners', 'islp', 'pdsh', 'mit-6036'],
  },

  {
    id: 13,
    part: 'Deep learning',
    title: 'Neural networks from scratch',
    minutes: 40,
    body: [
      H`<p>A <strong>neuron</strong> is a dot product plus a bias, passed through a non-linear <strong>activation</strong>
      function. A <strong>layer</strong> is many neurons at once, which is a matrix multiplication. A <strong>network</strong>
      is layers stacked up.</p>
      <div class="formula">layer(x) = activation(x @ W + b)</div>
      <p>Why the activation? Without it, stacked layers collapse into one big linear function and can only draw
      straight lines. The classic test is <strong>XOR</strong>: output 1 when exactly one input is 1. No straight line
      separates it, but a tiny network can learn it.</p>`,
      C`
import numpy as np
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)

rng = np.random.default_rng(0)
W1, b1 = rng.normal(0, 1, (2, 8)), np.zeros(8)     # layer 1: 2 inputs → 8 hidden neurons
W2, b2 = rng.normal(0, 1, (8, 1)), np.zeros(1)     # layer 2: 8 hidden → 1 output
sigmoid = lambda z: 1 / (1 + np.exp(-z))

def forward(X):
    h = np.tanh(X @ W1 + b1)          # hidden layer with tanh activation
    return h, sigmoid(h @ W2 + b2)    # output: probability of 1

_, p = forward(X)
p.round(2)                            # untrained: roughly random`,
      H`<h3>Backpropagation</h3>
      <p>To train, we need the gradient of the loss with respect to <em>every</em> weight. <strong>Backpropagation</strong>
      applies the chain rule layer by layer, from the output back to the input. The code is short:</p>`,
      C`
lr, losses = 0.5, []
for step in range(3000):
    h, p = forward(X)
    loss = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))   # cross-entropy loss
    losses.append(loss)
    # backward pass (chain rule)
    dz2 = (p - y) / len(X)             # gradient at the output (sigmoid + cross-entropy)
    dW2, db2 = h.T @ dz2, dz2.sum(0)
    dh = dz2 @ W2.T * (1 - h ** 2)     # through W2, then through tanh
    dW1, db1 = X.T @ dh, dh.sum(0)
    # gradient descent step
    W1 -= lr * dW1; b1 -= lr * db1; W2 -= lr * dW2; b2 -= lr * db2

print("final loss:", round(losses[-1], 4))
forward(X)[1].round(3)`,
      H`<p>It learned XOR. Real frameworks like <strong>PyTorch</strong> and <strong>JAX</strong> compute the backward pass for
      you automatically (<em>autograd</em>), but this is exactly what they do inside.</p>
      <h3>A real task: reading handwritten digits</h3>
      <p>scikit-learn's <code>MLPClassifier</code> is a ready-made network (a multi-layer perceptron):</p>`,
      C`
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
import matplotlib.pyplot as plt
d = load_digits()
Xtr, Xte, ytr, yte = train_test_split(d.data / 16, d.target, test_size=0.25, random_state=0)
net = MLPClassifier(hidden_layer_sizes=(64,), max_iter=400, random_state=0).fit(Xtr, ytr)
print("test accuracy:", round(net.score(Xte, yte), 3))

fig, axes = plt.subplots(1, 8, figsize=(10, 1.8))
for ax, img, pred in zip(axes, Xte, net.predict(Xte)):
    ax.imshow(img.reshape(8, 8), cmap="gray_r"); ax.set_title(f"→ {pred}"); ax.axis("off")
plt.show()`,
      H`<h3>What makes deep learning "deep"</h3>
      <ul><li><strong>Many layers</strong>: each builds on the last (edges → shapes → objects).</li>
      <li><strong>Special layers</strong>: convolutions for images, attention for text (next lesson).</li>
      <li><strong>Scale</strong>: more data, more parameters and GPUs to run the matrix multiplications.</li></ul>
      <p>Karpathy's free <em>Zero to Hero</em> series builds all of this in PyTorch, up to a GPT. It's the natural next step
      after this lesson.</p>`,
    ],
    exercise: {
      task: H`<p>This network is set up badly: only <strong>1 hidden neuron</strong> and a <strong>tiny learning rate</strong>, so it
        can't learn XOR. Change <code>hidden</code> and <code>lr</code> (and the number of steps if you like) until the
        final loss in <code>losses[-1]</code> is <strong>below 0.05</strong>.</p>`,
      setup: py`
import numpy as np
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)
sigmoid = lambda z: 1 / (1 + np.exp(-z))`,
      starter: py`
hidden, lr, steps = 1, 0.001, 2000

rng = np.random.default_rng(0)
W1, b1 = rng.normal(0, 1, (2, hidden)), np.zeros(hidden)
W2, b2 = rng.normal(0, 1, (hidden, 1)), np.zeros(1)
losses = []
for step in range(steps):
    h = np.tanh(X @ W1 + b1); p = sigmoid(h @ W2 + b2)
    losses.append(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))
    dz2 = (p - y) / len(X); dh = dz2 @ W2.T * (1 - h ** 2)
    W2 -= lr * h.T @ dz2; b2 -= lr * dz2.sum(0); W1 -= lr * X.T @ dh; b1 -= lr * dh.sum(0)
print("final loss:", losses[-1])`,
      solution: py`
hidden, lr, steps = 8, 0.5, 3000

rng = np.random.default_rng(0)
W1, b1 = rng.normal(0, 1, (2, hidden)), np.zeros(hidden)
W2, b2 = rng.normal(0, 1, (hidden, 1)), np.zeros(1)
losses = []
for step in range(steps):
    h = np.tanh(X @ W1 + b1); p = sigmoid(h @ W2 + b2)
    losses.append(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))
    dz2 = (p - y) / len(X); dh = dz2 @ W2.T * (1 - h ** 2)
    W2 -= lr * h.T @ dz2; b2 -= lr * dz2.sum(0); W1 -= lr * X.T @ dh; b1 -= lr * dh.sum(0)
print("final loss:", losses[-1])`,
      check: py`
assert len(losses) > 0, 'Run the training loop.'
assert np.isfinite(losses[-1]), 'The loss became nan: the learning rate is too high.'
assert losses[-1] < 0.05, f'Final loss {losses[-1]:.3f} is still above 0.05. More hidden neurons (e.g. 8) and a bigger learning rate (e.g. 0.5) help.'
assert hidden >= 2, 'XOR needs at least 2 hidden neurons.'`,
      hint: 'Try hidden = 8 and lr = 0.5.',
    },
    quiz: [
      { q: 'Without activation functions, a deep network…', options: ['Is more accurate', 'Collapses into a single linear function', 'Trains faster and better'], answer: 1,
        why: 'A composition of linear maps is still linear.' },
      { q: 'Backpropagation is…', options: ['The chain rule, applied layer by layer to get every gradient', 'A way to collect more data', 'Running the network backwards to generate images'], answer: 0,
        why: 'It efficiently computes the gradient of the loss for all weights.' },
      { q: 'A layer of neurons computes mostly…', options: ['A sort', 'A matrix multiplication', 'A database join'], answer: 1,
        why: 'activation(x @ W + b): that\'s why GPUs, which excel at matrix maths, matter.' },
    ],
    resources: ['zero-to-hero', 'fastai', '3b1b-nn', 'mit-6s191', 'd2l'],
  },

  {
    id: 14,
    part: 'Deep learning',
    title: 'How large language models work',
    minutes: 40,
    body: [
      H`<p>An LLM does one thing: given some text, predict the <strong>next token</strong>. Generating a whole answer is just
      repeating that: predict, pick a token, append it, predict again. Everything else comes from doing that one task
      extremely well, at enormous scale.</p>
      <h3>1. Tokens</h3>
      <p>Models read numbers, not letters. A <strong>tokenizer</strong> splits text into pieces and gives each an ID. Real
      tokenizers (BPE) learn common chunks like "ing" or " the". Here's the simplest possible one, one token per character:</p>`,
      C`
text = open("data/tiny_corpus.txt").read()
vocab = sorted(set(text))
stoi = {ch: i for i, ch in enumerate(vocab)}
itos = {i: ch for ch, i in stoi.items()}
encode = lambda s: [stoi[c] for c in s]
decode = lambda ids: "".join(itos[i] for i in ids)

print(len(text), "characters,", len(vocab), "different tokens")
print(encode("data"), "→", decode(encode("data")))`,
      H`<h3>2. A tiny language model: counting</h3>
      <p>The simplest language model is a <strong>bigram</strong> model: count which character follows which, and turn the
      counts into probabilities. Then generate by sampling.</p>`,
      C`
import numpy as np
V = len(vocab)
counts = np.full((V, V), 0.01)               # a tiny start value so nothing has zero probability
ids = encode(text)
for a, b in zip(ids, ids[1:]):
    counts[a, b] += 1
probs = counts / counts.sum(axis=1, keepdims=True)   # each row: P(next char | this char)

rng = np.random.default_rng(0)
def generate(start, n=200, temperature=1.0):
    out = [stoi[start]]
    for _ in range(n):
        logits = np.log(probs[out[-1]]) / temperature
        p = np.exp(logits - logits.max()); p /= p.sum()
        out.append(rng.choice(V, p=p))
    return decode(out)

print(generate("T"))`,
      H`<p>It's gibberish with the right "texture". A bigram model only sees <em>one</em> previous character. Real LLMs see
      thousands of previous tokens, and the component that lets them use all that context is <strong>attention</strong>.</p>
      <h3>3. Temperature</h3>
      <p>Temperature rescales the probabilities before sampling. Low temperature means safe and repetitive; high
      temperature means creative and chaotic. It's the same knob you see in LLM apps:</p>`,
      C`
for T in [0.3, 1.0, 2.0]:
    print(f"T={T}:", generate("T", 80, T).replace("\n", " "), "\n")`,
      H`<h3>4. Embeddings</h3>
      <p>Each token ID is turned into a vector of numbers, its <strong>embedding</strong>. These are learned in training so that
      tokens used in similar ways end up close together (like the digits in PCA).</p>
      <h3>5. Attention</h3>
      <p>Every token makes a <strong>query</strong> ("what am I looking for?"), a <strong>key</strong> ("what do I contain?") and a
      <strong>value</strong> ("what I'll pass on"). Each token's output is a weighted average of the values, and the weights come
      from how well its query matches every key:</p>
      <div class="formula">Attention(Q, K, V) = softmax(Q Kᵀ / √d) V</div>`,
      C`
def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)

rng = np.random.default_rng(1)
T_, d = 4, 8                                # 4 tokens, 8-dimensional vectors
x = rng.normal(size=(T_, d))                # token embeddings
Wq, Wk, Wv = (rng.normal(size=(d, d)) for _ in range(3))
Q, K, V = x @ Wq, x @ Wk, x @ Wv

scores = Q @ K.T / np.sqrt(d)
mask = np.triu(np.ones((T_, T_)), k=1) == 1   # a GPT may not look at future tokens
scores[mask] = -np.inf
weights = softmax(scores)
print(weights.round(2))                      # row i: how much token i attends to each earlier token
out = weights @ V
out.shape`,
      H`<h3>6. The transformer</h3>
      <p>A <strong>transformer</strong> block is attention (tokens share information) followed by a small neural network on each
      token (lesson 13), with shortcuts and normalisation around both. GPT-style models stack dozens of these blocks and
      are trained with gradient descent (lesson 10) on trillions of tokens to predict the next one.</p>
      <p>The <strong>AI tutor</strong> on this site is one of these: MiniCPM5-1B, a transformer with about a billion learned
      numbers, running on your device with the same next-token loop as <code>generate</code> above.</p>
      <h3>From text predictor to assistant</h3>
      <ol><li><strong>Pre-training</strong>: next-token prediction on huge amounts of text gives knowledge and language.</li>
      <li><strong>Fine-tuning</strong> on example conversations teaches the assistant format.</li>
      <li><strong>Preference training</strong> (RLHF and similar) makes answers more helpful and safer.</li></ol>`,
    ],
    exercise: {
      task: H`<p>Write <code>attention(Q, K, V, causal)</code> that returns <code>softmax(Q @ K.T / √d) @ V</code>, where
        <code>d = Q.shape[-1]</code>. When <code>causal</code> is <code>True</code>, block future positions before the softmax by
        setting them to <code>-np.inf</code>. The <code>softmax</code> function from the lesson is provided.</p>`,
      setup: py`
import numpy as np
def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)`,
      starter: py`
def attention(Q, K, V, causal=False):
    d = Q.shape[-1]
    scores = None   # compute the scaled scores
    # if causal: hide the future
    return None

rng = np.random.default_rng(0)
Q, K, V = rng.normal(size=(3, 5, 4))
print(attention(Q, K, V, causal=True))`,
      solution: py`
def attention(Q, K, V, causal=False):
    d = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d)
    if causal:
        T = scores.shape[0]
        scores = np.where(np.triu(np.ones((T, T)), k=1) == 1, -np.inf, scores)
    return softmax(scores) @ V

rng = np.random.default_rng(0)
Q, K, V = rng.normal(size=(3, 5, 4))
print(attention(Q, K, V, causal=True))`,
      check: py`
_r = np.random.default_rng(3)
_Q, _K, _V = _r.normal(size=(3, 6, 4))
_s = _Q @ _K.T / 2.0
_full = softmax(_s) @ _V
_m = np.where(np.triu(np.ones((6, 6)), k=1) == 1, -np.inf, _s)
_causal = softmax(_m) @ _V
_a = attention(_Q, _K, _V)
assert _a is not None and np.shape(_a) == (6, 4), f'Output should have shape (6, 4), got {np.shape(_a)}.'
assert np.allclose(_a, _full), 'Non-causal output is wrong. Check the scaling by √d.'
_b = attention(_Q, _K, _V, causal=True)
assert np.allclose(_b[0], _V[0]), 'With causal=True, the first token can only attend to itself.'
assert np.allclose(_b, _causal), 'Causal output is wrong. Mask positions above the diagonal (np.triu(..., k=1)).'`,
      hint: 'scores = Q @ K.T / np.sqrt(d); for causal, np.where(np.triu(np.ones((T, T)), k=1) == 1, -np.inf, scores).',
    },
    quiz: [
      { q: 'At its core, an LLM is trained to…', options: ['Look up answers in a database', 'Predict the next token', 'Search the web'], answer: 1,
        why: 'Everything is built on next-token prediction.' },
      { q: 'Raising the temperature makes output…', options: ['More random and varied', 'Shorter', 'More accurate'], answer: 0,
        why: 'It flattens the probabilities, so less likely tokens get picked more often.' },
      { q: 'Why the causal mask in GPT-style models?', options: ['To save memory', 'So a token can\'t see the future it is supposed to predict', 'To remove punctuation'], answer: 1,
        why: 'Otherwise training would be cheating: the answer would be visible.' },
    ],
    resources: ['zero-to-hero', 'hf-llm', '3b1b-nn', 'cs231n'],
  },

  {
    id: 15,
    part: 'Using AI',
    title: 'Using LLMs: prompting, RAG and fine-tuning',
    minutes: 35,
    body: [
      H`<p>Most AI work today isn't training models from scratch. It's <strong>building on top</strong> of pre-trained ones.
      There are three main tools, from cheapest to most expensive:</p>
      <table class="grid"><tr><th>Tool</th><th>What it does</th><th>Use when</th></tr>
      <tr><td><strong>Prompting</strong></td><td>Better instructions and examples</td><td>Always try first</td></tr>
      <tr><td><strong>RAG</strong></td><td>Fetch relevant documents and put them in the prompt</td><td>The model needs facts it doesn't know</td></tr>
      <tr><td><strong>Fine-tuning</strong></td><td>Further training on your own examples (often with LoRA)</td><td>You need a consistent style or format, or skills prompting can't give</td></tr></table>
      <h3>Prompting that works</h3>
      <ul><li>Be specific about the task, the audience and the output format.</li>
      <li>Give the context the model needs. It can't read your mind or your files.</li>
      <li>Show an example of a good answer (large models; small ones tend to copy it).</li>
      <li>Ask for step-by-step reasoning on hard problems.</li>
      <li>Small models (like the 1–2B tutor here) do best with short, simple instructions.</li></ul>
      <h3>RAG: retrieval-augmented generation</h3>
      <p>LLMs make things up (<strong>hallucinate</strong>) when they don't know. RAG fixes much of that: find the relevant text
      first, then tell the model to answer <em>only from that text</em>. The retrieval step is classic data science. Here it
      is with TF-IDF vectors and cosine similarity:</p>`,
      C`
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

docs = [
    "Our café opens at 7am on weekdays and 8am on weekends.",
    "Lattes cost 3.80 and cappuccinos cost 3.60. Oat milk is free.",
    "We are closed on public holidays.",
    "Sandwiches are made fresh each morning and sell out by 2pm.",
    "Card, cash and mobile payments are accepted.",
]
vec = TfidfVectorizer().fit(docs)
D = vec.transform(docs)                      # each document → a vector of word weights

def search(question, k=2):
    sims = cosine_similarity(vec.transform([question]), D)[0]
    top = sims.argsort()[::-1][:k]
    return [(round(float(sims[i]), 2), docs[i]) for i in top]

search("how much is a latte?")`,
      H`<p>Production systems use neural <strong>embeddings</strong> instead of TF-IDF, so "price of coffee" matches "lattes cost
      3.80" even with no shared words, and store them in a <strong>vector database</strong>. The pipeline is the same:
      <em>embed → search → put the top passages in the prompt → generate</em>.</p>
      <p>Try the second half yourself in the <strong>RAG lab</strong> below: paste a passage and ask about it. The small
      tutor model runs on your own device.</p>
      <h3>Fine-tuning and LoRA</h3>
      <p>Fine-tuning continues training on your own examples. <strong>LoRA</strong> freezes the original weights and learns small
      low-rank "adapter" matrices beside them, often under 1% of the parameters, so fine-tuning fits on one free GPU.
      The Hugging Face LLM course (below) walks through it.</p>
      <h3>Agents</h3>
      <p>An <strong>agent</strong> is an LLM in a loop with <strong>tools</strong>: it decides to call a tool (search, run code, query a
      database), reads the result, and repeats until the task is done. The hard parts are reliability, cost and safety,
      so give agents only the permissions they need.</p>
      <h3>Evaluate, don't eyeball</h3>
      <p>Build a small test set of questions with known good answers and score every prompt or model change against it.
      That's lesson 11's "honest evaluation" applied to LLMs.</p>`,
    ],
    exercise: {
      task: H`<p>Improve retrieval by writing <code>retrieve(question, docs, k)</code> that returns the <strong>indices</strong> of the
        <code>k</code> most similar documents, most similar first. Fit a <code>TfidfVectorizer</code> on the docs, but give it
        <code>stop_words="english"</code> so common words like "the" and "is" don't count as matches.</p>`,
      setup: py`
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
docs = [
    "The course runs entirely in your browser using Pyodide.",
    "Gradient descent updates the weights in the direction that lowers the loss.",
    "A confusion matrix shows true and false positives and negatives.",
    "k-means clustering assigns each point to the nearest centre.",
    "Attention lets every token look at the other tokens in the context.",
    "The learning rate controls the size of each gradient descent step.",
]`,
      starter: py`
def retrieve(question, docs, k=2):
    # fit a TfidfVectorizer(stop_words="english") on docs, compare with the question,
    # and return the indices of the top k documents
    return []

print(retrieve("what does the learning rate do in gradient descent?", docs))`,
      solution: py`
def retrieve(question, docs, k=2):
    vec = TfidfVectorizer(stop_words="english").fit(docs)
    sims = cosine_similarity(vec.transform([question]), vec.transform(docs))[0]
    return list(np.argsort(sims)[::-1][:k])

print(retrieve("what does the learning rate do in gradient descent?", docs))`,
      check: py`
_r = [int(i) for i in retrieve("what does the learning rate do in gradient descent?", docs)]
assert len(_r) == 2, f'Expected 2 indices, got {_r}.'
assert set(_r) == {1, 5}, f'Expected the two gradient descent documents (1 and 5), got {_r}.'
assert _r[0] == 5, 'Order matters: document 5 (about the learning rate) is the best match and should come first.'
_t = [int(i) for i in retrieve("how do tokens attend to each other", docs, k=1)]
assert _t == [4], f'For an attention question, expected [4], got {_t}.'`,
      hint: 'sims = cosine_similarity(vec.transform([question]), vec.transform(docs))[0]; return list(np.argsort(sims)[::-1][:k])',
    },
    aiLab: {
      title: 'RAG lab: with and without context',
      intro: 'The tutor answers your question twice: once from its own memory and once with the passage (the "retrieved" context) in the prompt. Compare the two, then check both against the passage. Small models still misread context sometimes, and catching that is exactly what LLM evaluation is for.',
      fields: [
        { id: 'context', label: 'Context passage', multiline: true, rows: 5,
          placeholder: 'Our café opens at 7am on weekdays and 8am on weekends. Lattes cost 3.80 and cappuccinos cost 3.60. Oat milk is free. We are closed on public holidays.' },
        { id: 'question', label: 'Question', placeholder: 'How much does a latte cost?' },
      ],
      button: 'Ask both ways',
      // Tested on MiniCPM5-1B: adding "if the context doesn't say, say so" made it refuse even easy lookups,
      // so the grounded prompt has no refusal clause.
      prompts: (v) => [
        { label: 'Without context (from memory)', req: {
          system: 'You are a helpful assistant. Answer in one sentence.',
          user: `Question: ${v.question}`, prefill: '', maxTokens: 80 } },
        { label: 'With the retrieved context (RAG)', req: {
          system: 'You are a helpful assistant. Answer in one sentence.',
          user: `Context:\n"""\n${v.context}\n"""\n\nAnswer the question using the context.\nQuestion: ${v.question}`,
          prefill: '', maxTokens: 80 } },
      ],
    },
    quiz: [
      { q: 'A support bot must answer from your company\'s 500-page manual. First try…', options: ['Pre-training a new model', 'RAG: retrieve relevant manual sections into the prompt', 'A bigger temperature'], answer: 1,
        why: 'RAG adds knowledge without any training, and the manual can change any time.' },
      { q: 'LoRA makes fine-tuning cheaper by…', options: ['Training small adapter matrices while freezing the base model', 'Deleting layers', 'Using less data'], answer: 0,
        why: 'Only the low-rank adapters are trained.' },
      { q: 'An AI agent is…', options: ['A bigger model', 'An LLM in a loop that can call tools', 'A kind of database'], answer: 1,
        why: 'Agents act: call a tool, observe the result, decide the next step.' },
    ],
    resources: ['hf-llm', 'hf-agents', 'ms-genai', 'ms-agents', 'anthropic-academy', 'dlai-short', 'llm-zoomcamp'],
  },

  {
    id: 16,
    part: 'Using AI',
    title: 'From notebook to real world: MLOps, ethics and your portfolio',
    minutes: 25,
    body: [
      H`<p>A model in a notebook helps nobody. <strong>MLOps</strong> is everything needed to run models reliably:
      reproducible training, deployment, monitoring and retraining.</p>
      <h3>Reproducibility</h3>
      <ul><li>Fix random seeds, and record library versions and the exact data used.</li>
      <li>Keep code in <strong>git</strong>, and track every experiment's settings and scores (tools: MLflow, Weights &amp; Biases, trackio).</li>
      <li>Put preprocessing <em>inside</em> the model pipeline, so training and serving can't drift apart:</li></ul>`,
      C`
import pickle, sklearn
from sklearn.datasets import load_breast_cancer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
pipe = make_pipeline(StandardScaler(), LogisticRegression()).fit(X, y)
blob = pickle.dumps(pipe)                     # save (in real life: to a file, with the sklearn version)
restored = pickle.loads(blob)
print("sklearn", sklearn.__version__, "| saved", len(blob), "bytes | same predictions:",
      (restored.predict(X) == pipe.predict(X)).all())`,
      H`<h3>Deployment</h3>
      <p>Common patterns: a <strong>web API</strong> (FastAPI) that returns predictions; a <strong>batch job</strong> that scores a table
      every night; or, like this site, the model runs <strong>on the user's device</strong>. For demos, Gradio apps on Hugging
      Face Spaces are free.</p>
      <h3>Monitoring and data drift</h3>
      <p>The world changes. A model trained on last year's customers slowly gets worse on this year's. Watch the inputs
      as well as the accuracy: if a feature's distribution shifts, that's <strong>data drift</strong>.</p>`,
      C`
import numpy as np
rng = np.random.default_rng(0)
train_ages = rng.normal(35, 8, 5000)
this_month = rng.normal(41, 8, 800)        # the customers got older
shift = (this_month.mean() - train_ages.mean()) / train_ages.std()
print(f"shift = {shift:.2f} standard deviations")`,
      H`<h3>Ethics: questions to ask about every model</h3>
      <ul><li><strong>Bias</strong>: does it work equally well for every group it affects? (Check metrics per group.)</li>
      <li><strong>Privacy</strong>: do you need that personal data at all? Could it leak?</li>
      <li><strong>Transparency</strong>: can people affected by a decision get an explanation and appeal it?</li>
      <li><strong>Misuse</strong>: what's the worst realistic use of what you're building?</li></ul>
      <h3>Your portfolio</h3>
      <p>Employers want to see finished projects more than certificates. Aim for 3 to 5 that each:</p>
      <ol><li>start from a <strong>real question</strong> and real, messy data (Kaggle, government open data, your own),</li>
      <li>show cleaning, exploration, a baseline, a better model and <strong>honest evaluation</strong>,</li>
      <li>are published: a GitHub repo with a clear README, plus a live demo if you can.</li></ol>
      <p>Project ideas: predict prices in your city; A/B-analyse your own habit data; classify images you photograph;
      build a RAG assistant over a subject you love; fine-tune a small model with LoRA.</p>
      <h3>Where to go next</h3>
      <p>The <a href="#/courses">Free courses</a> page lists every course and book referenced here. A proven order:
      Kaggle Learn micro-courses → ISLP or Google's ML Crash Course → fast.ai → Karpathy's Zero to Hero →
      Hugging Face LLM course, with a Zoomcamp for production skills.</p>`,
    ],
    exercise: {
      task: H`<p>Write <code>drift_report(train, new, threshold=0.5)</code> for DataFrames with the same numeric columns. It returns
        a <strong>list of the column names</strong> whose mean moved by more than <code>threshold</code> training standard
        deviations: <code>|new.mean − train.mean| / train.std &gt; threshold</code>.</p>`,
      setup: py`
import numpy as np, pandas as pd
_g = np.random.default_rng(5)
train = pd.DataFrame({"age": _g.normal(35, 8, 3000), "income": _g.normal(50, 12, 3000), "visits": _g.normal(4, 1.5, 3000)})
new = pd.DataFrame({"age": _g.normal(36, 8, 500), "income": _g.normal(62, 12, 500), "visits": _g.normal(2.9, 1.5, 500)})`,
      starter: py`
def drift_report(train, new, threshold=0.5):
    drifted = []
    for col in train.columns:
        pass   # compute the shift for this column and append col if it's too big
    return drifted

drift_report(train, new)`,
      solution: py`
def drift_report(train, new, threshold=0.5):
    drifted = []
    for col in train.columns:
        shift = abs(new[col].mean() - train[col].mean()) / train[col].std()
        if shift > threshold:
            drifted.append(col)
    return drifted

drift_report(train, new)`,
      check: py`
_d = drift_report(train, new)
assert isinstance(_d, list), 'Return a list of column names.'
assert sorted(_d) == ["income", "visits"], f'Expected income and visits to drift, got {_d}.'
assert drift_report(train, train) == [], 'Comparing data with itself should report no drift.'
assert sorted(drift_report(train, new, threshold=0.1)) == ["age", "income", "visits"], 'With threshold=0.1 all three columns should be reported. Use the threshold argument.'`,
      hint: 'shift = abs(new[col].mean() - train[col].mean()) / train[col].std()',
    },
    quiz: [
      { q: 'Why put scaling inside a pipeline with the model?', options: ['The exact same preprocessing is saved and used when serving', 'It trains faster', 'It is required by Python'], answer: 0,
        why: 'Training/serving skew is a classic production bug.' },
      { q: 'Accuracy is fine but a feature\'s distribution has shifted a lot. You should…', options: ['Ignore it', 'Investigate: accuracy may drop soon, or labels may lag', 'Delete the feature'], answer: 1,
        why: 'Drift is an early warning, often visible before the true labels arrive.' },
      { q: 'What impresses employers most?', options: ['Lots of certificates', 'Finished, published projects with honest evaluation', 'Using the biggest model'], answer: 1,
        why: 'Projects show you can take messy data all the way to a result.' },
    ],
    resources: ['mlops-zoomcamp', 'ml-zoomcamp', 'de-zoomcamp', 'kaggle-competitions'],
  },
];
