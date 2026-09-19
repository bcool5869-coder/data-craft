// Free courses and books, collected 2026-09-19 (see research/free-courses.md for sources).
// `cert`: whether a certificate is also free. Lessons refer to these by id.
export const STAGES = [
  'Overview', 'Python', 'Math & statistics', 'Data analysis & SQL', 'Machine learning',
  'Deep learning', 'LLMs & agents', 'MLOps & data engineering',
];

export const RESOURCES = [
  // Overview
  { id: 'elements-of-ai', stage: 'Overview', title: 'Elements of AI', provider: 'University of Helsinki',
    url: 'https://www.elementsofai.com', level: 'Beginner', cert: true, note: 'What AI is and isn\'t. No maths or code.' },
  { id: 'ai-for-everyone', stage: 'Overview', title: 'AI for Everyone', provider: 'DeepLearning.AI (Coursera)',
    url: 'https://www.coursera.org/learn/ai-for-everyone', level: 'Beginner', cert: false, note: 'About 7 hours. Free to audit; certificate paid.' },
  { id: 'google-ai-essentials', stage: 'Overview', title: 'Google AI Essentials / Intro to Generative AI', provider: 'Google',
    url: 'https://grow.google/ai-essentials', level: 'Beginner', cert: true, note: 'Short introduction to generative AI.' },

  // Python
  { id: 'cs50p', stage: 'Python', title: "CS50's Introduction to Programming with Python", provider: 'Harvard',
    url: 'https://cs50.harvard.edu/python', level: 'Beginner', cert: true, note: 'The best free way to learn Python properly.' },
  { id: 'kaggle-python', stage: 'Python', title: 'Python', provider: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/python', level: 'Beginner', cert: true, note: 'About 5 hours, in browser notebooks.' },
  { id: 'fcc-python-ds', stage: 'Python', title: 'Data Analysis with Python', provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/data-analysis-with-python', level: 'Beginner', cert: true, note: 'NumPy, pandas and 5 projects.' },

  // Math & statistics
  { id: '3b1b-linalg', stage: 'Math & statistics', title: 'Essence of Linear Algebra', provider: '3Blue1Brown',
    url: 'https://www.3blue1brown.com/topics/linear-algebra', level: 'Beginner', cert: false, note: 'Visual intuition for vectors and matrices.' },
  { id: '3b1b-calculus', stage: 'Math & statistics', title: 'Essence of Calculus', provider: '3Blue1Brown',
    url: 'https://www.3blue1brown.com/topics/calculus', level: 'Beginner', cert: false, note: 'Derivatives and the chain rule, visually.' },
  { id: '3b1b-nn', stage: 'Math & statistics', title: 'Neural Networks series', provider: '3Blue1Brown',
    url: 'https://www.3blue1brown.com/topics/neural-networks', level: 'Beginner', cert: false, note: 'Backpropagation and transformers, visually.' },
  { id: 'khan-stats', stage: 'Math & statistics', title: 'Statistics and Probability', provider: 'Khan Academy',
    url: 'https://www.khanacademy.org/math/statistics-probability', level: 'Beginner', cert: false, note: 'Videos plus practice exercises.' },
  { id: 'khan-linalg', stage: 'Math & statistics', title: 'Linear Algebra', provider: 'Khan Academy',
    url: 'https://www.khanacademy.org/math/linear-algebra', level: 'Beginner', cert: false, note: 'Videos and exercises.' },
  { id: 'mit-1806', stage: 'Math & statistics', title: '18.06 Linear Algebra (Gilbert Strang)', provider: 'MIT OpenCourseWare',
    url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010', level: 'Intermediate', cert: false, note: 'The classic lecture series.' },
  { id: 'mml-book', stage: 'Math & statistics', title: 'Mathematics for Machine Learning (book)', provider: 'Deisenroth, Faisal, Ong',
    url: 'https://mml-book.github.io', level: 'Intermediate', cert: false, note: 'Free PDF: linear algebra, calculus, probability for ML.' },
  { id: 'think-stats', stage: 'Math & statistics', title: 'Think Stats (book)', provider: 'Allen Downey',
    url: 'https://greenteapress.com/wp/think-stats-3e', level: 'Beginner', cert: false, note: 'Statistics taught with Python. Free online.' },
  { id: 'data8', stage: 'Math & statistics', title: 'Data 8: Foundations of Data Science', provider: 'UC Berkeley',
    url: 'https://inferentialthinking.com', level: 'Beginner', cert: false, note: 'Free textbook: inference by simulation, A/B tests, regression.' },

  // Data analysis & SQL
  { id: 'pdsh', stage: 'Data analysis & SQL', title: 'Python Data Science Handbook (book)', provider: 'Jake VanderPlas',
    url: 'https://jakevdp.github.io/PythonDataScienceHandbook', level: 'Beginner', cert: false, note: 'NumPy, pandas, matplotlib, scikit-learn. Free online.' },
  { id: 'kaggle-pandas', stage: 'Data analysis & SQL', title: 'Pandas', provider: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/pandas', level: 'Beginner', cert: true, note: 'About 4 hours.' },
  { id: 'kaggle-cleaning', stage: 'Data analysis & SQL', title: 'Data Cleaning', provider: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/data-cleaning', level: 'Beginner', cert: true, note: 'Missing values, scaling, dates, text encodings.' },
  { id: 'kaggle-viz', stage: 'Data analysis & SQL', title: 'Data Visualization', provider: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/data-visualization', level: 'Beginner', cert: true, note: 'Charts with seaborn.' },
  { id: 'kaggle-sql', stage: 'Data analysis & SQL', title: 'Intro to SQL and Advanced SQL', provider: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/intro-to-sql', level: 'Beginner', cert: true, note: 'SQL on real BigQuery datasets.' },
  { id: 'sqlbolt', stage: 'Data analysis & SQL', title: 'SQLBolt', provider: 'SQLBolt',
    url: 'https://sqlbolt.com', level: 'Beginner', cert: false, note: 'Short interactive SQL lessons.' },
  { id: 'google-data-analytics', stage: 'Data analysis & SQL', title: 'Google Data Analytics Certificate', provider: 'Google (Coursera)',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics', level: 'Beginner', cert: false, note: 'Free to audit; certificate paid.' },

  // Machine learning
  { id: 'google-mlcc', stage: 'Machine learning', title: 'Machine Learning Crash Course', provider: 'Google',
    url: 'https://developers.google.com/machine-learning/crash-course', level: 'Beginner', cert: true, note: '12 modules with interactive visuals.' },
  { id: 'ms-ml-beginners', stage: 'Machine learning', title: 'ML-For-Beginners', provider: 'Microsoft',
    url: 'https://github.com/microsoft/ML-For-Beginners', level: 'Beginner', cert: false, note: '12 weeks, 26 lessons, 52 quizzes of classic ML.' },
  { id: 'kaggle-ml', stage: 'Machine learning', title: 'Intro to ML and Intermediate ML', provider: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/intro-to-machine-learning', level: 'Beginner', cert: true, note: 'scikit-learn in about 3 hours each.' },
  { id: 'islp', stage: 'Machine learning', title: 'An Introduction to Statistical Learning with Python (book)', provider: 'James, Witten, Hastie, Tibshirani, Taylor',
    url: 'https://www.statlearning.com', level: 'Intermediate', cert: false, note: 'Free PDF and Python labs. The best ML textbook to start with.' },
  { id: 'fcc-ml', stage: 'Machine learning', title: 'Machine Learning with Python', provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/machine-learning-with-python', level: 'Intermediate', cert: true, note: 'TensorFlow, 5 projects.' },
  { id: 'mit-6036', stage: 'Machine learning', title: '6.036 Introduction to Machine Learning', provider: 'MIT OpenCourseWare',
    url: 'https://ocw.mit.edu/courses/6-036-introduction-to-machine-learning-fall-2020', level: 'Intermediate', cert: false, note: 'A full university semester.' },
  { id: 'cs229', stage: 'Machine learning', title: 'CS229 Machine Learning', provider: 'Stanford',
    url: 'https://cs229.stanford.edu', level: 'Advanced', cert: false, note: 'Math-heavy. The full older lecture series is on YouTube.' },
  { id: 'ml-zoomcamp', stage: 'Machine learning', title: 'Machine Learning Zoomcamp', provider: 'DataTalks.Club',
    url: 'https://github.com/DataTalksClub/machine-learning-zoomcamp', level: 'Intermediate', cert: true, note: 'Practical ML up to deployment. Join a cohort or go at your own pace.' },
  { id: 'cs50ai', stage: 'Machine learning', title: "CS50's Introduction to AI with Python", provider: 'Harvard',
    url: 'https://cs50.harvard.edu/ai', level: 'Intermediate', cert: true, note: 'Search, logic, probability, ML and neural nets. 7 weeks.' },

  // Deep learning
  { id: 'fastai', stage: 'Deep learning', title: 'Practical Deep Learning for Coders', provider: 'fast.ai',
    url: 'https://course.fast.ai', level: 'Intermediate', cert: false, note: 'Top-down: you train real models in lesson 1. PyTorch.' },
  { id: 'zero-to-hero', stage: 'Deep learning', title: 'Neural Networks: Zero to Hero', provider: 'Andrej Karpathy',
    url: 'https://karpathy.ai/zero-to-hero.html', level: 'Intermediate', cert: false, note: '8 videos (~12 h), from backprop to building GPT from scratch.' },
  { id: 'mit-6s191', stage: 'Deep learning', title: '6.S191 Introduction to Deep Learning', provider: 'MIT',
    url: 'https://introtodeeplearning.com', level: 'Intermediate', cert: false, note: 'Updated every year; lectures, slides and labs open.' },
  { id: 'cs231n', stage: 'Deep learning', title: 'CS231n Deep Learning for Computer Vision', provider: 'Stanford',
    url: 'https://cs231n.github.io', level: 'Intermediate', cert: false, note: 'Notes and assignments open.' },
  { id: 'd2l', stage: 'Deep learning', title: 'Dive into Deep Learning (book)', provider: 'd2l.ai',
    url: 'https://d2l.ai', level: 'Intermediate', cert: false, note: 'Free interactive book with runnable code.' },
  { id: 'dl-specialization', stage: 'Deep learning', title: 'Deep Learning Specialization', provider: 'DeepLearning.AI (Coursera)',
    url: 'https://www.coursera.org/specializations/deep-learning', level: 'Intermediate', cert: false, note: '5 courses. Free to audit; certificate paid.' },

  // LLMs & agents
  { id: 'hf-llm', stage: 'LLMs & agents', title: 'LLM Course', provider: 'Hugging Face',
    url: 'https://huggingface.co/learn/llm-course', level: 'Intermediate', cert: true, note: 'Transformers, tokenizers, fine-tuning, LoRA, reasoning models.' },
  { id: 'hf-agents', stage: 'LLMs & agents', title: 'AI Agents Course', provider: 'Hugging Face',
    url: 'https://huggingface.co/learn/agents-course', level: 'Beginner', cert: true, note: 'Agent concepts and frameworks.' },
  { id: 'ms-genai', stage: 'LLMs & agents', title: 'Generative AI for Beginners', provider: 'Microsoft',
    url: 'https://github.com/microsoft/generative-ai-for-beginners', level: 'Beginner', cert: false, note: '21 lessons: prompting, RAG, agents, fine-tuning.' },
  { id: 'ms-agents', stage: 'LLMs & agents', title: 'AI Agents for Beginners', provider: 'Microsoft',
    url: 'https://github.com/microsoft/ai-agents-for-beginners', level: 'Beginner', cert: false, note: '15 code-first lessons.' },
  { id: 'anthropic-academy', stage: 'LLMs & agents', title: 'Anthropic Academy (Claude API, Claude Code, MCP)', provider: 'Anthropic',
    url: 'https://anthropic.skilljar.com', level: 'Beginner', cert: true, note: 'Building with LLM APIs and agents.' },
  { id: 'dlai-short', stage: 'LLMs & agents', title: 'Short courses', provider: 'DeepLearning.AI',
    url: 'https://www.deeplearning.ai/short-courses', level: 'Beginner', cert: false, note: '1–2 hour courses on prompting, RAG and agents. Videos free.' },
  { id: 'llm-zoomcamp', stage: 'LLMs & agents', title: 'LLM Zoomcamp', provider: 'DataTalks.Club',
    url: 'https://github.com/DataTalksClub/llm-zoomcamp', level: 'Intermediate', cert: true, note: 'RAG, search and evaluation.' },

  // MLOps
  { id: 'mlops-zoomcamp', stage: 'MLOps & data engineering', title: 'MLOps Zoomcamp', provider: 'DataTalks.Club',
    url: 'https://github.com/DataTalksClub/mlops-zoomcamp', level: 'Intermediate', cert: true, note: '9 weeks: experiment tracking, deployment, monitoring.' },
  { id: 'de-zoomcamp', stage: 'MLOps & data engineering', title: 'Data Engineering Zoomcamp', provider: 'DataTalks.Club',
    url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp', level: 'Intermediate', cert: true, note: 'SQL, dbt, Kafka, Spark pipelines.' },
  { id: 'kaggle-competitions', stage: 'MLOps & data engineering', title: 'Kaggle Competitions & Datasets', provider: 'Kaggle',
    url: 'https://www.kaggle.com/competitions', level: 'Intermediate', cert: false, note: 'Free GPUs and real problems for your portfolio.' },
];

export const byId = Object.fromEntries(RESOURCES.map((r) => [r.id, r]));
