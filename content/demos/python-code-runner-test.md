---
title: "Python Code Runner Demo"
tags:
  - demo
  - python
  - interactive
  - code-execution
  - data-visualization
---

# Python Code Runner Demo

This page demonstrates the interactive Python code execution capabilities powered by Pyodide.

## Basic Python Examples

### Hello World

```python-r
print("Hello, World!")
print("Welcome to the interactive Python environment!")

# Basic arithmetic
result = 2 + 2
print(f"2 + 2 = {result}")
```

### Working with Variables

```python-r
# Variables and data types
name = "Digital Garden"
version = 1.0
is_awesome = True

print(f"Project: {name}")
print(f"Version: {version}")
print(f"Is awesome: {is_awesome}")

# Lists and loops
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Numbers: {numbers}")
print(f"Squares: {squares}")
```

## Data Science Examples

### NumPy Operations

```python-r
import numpy as np

# Create arrays
arr1 = np.array([1, 2, 3, 4, 5])
arr2 = np.array([6, 7, 8, 9, 10])

print("Array 1:", arr1)
print("Array 2:", arr2)
print("Sum:", arr1 + arr2)
print("Element-wise product:", arr1 * arr2)
print("Mean of arr1:", np.mean(arr1))
print("Standard deviation of arr2:", np.std(arr2))

# Matrix operations
matrix = np.random.rand(3, 3)
print("\nRandom 3x3 matrix:")
print(matrix)
print("Matrix determinant:", np.linalg.det(matrix))
```

### Data Visualization with Matplotlib

```python-r
import matplotlib.pyplot as plt
import numpy as np

# Create sample data
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# Create the plot
plt.figure(figsize=(10, 6))
plt.plot(x, y1, label='sin(x)', linewidth=2)
plt.plot(x, y2, label='cos(x)', linewidth=2)
plt.xlabel('x')
plt.ylabel('y')
plt.title('Sine and Cosine Functions')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### Statistical Analysis

```python-r
import numpy as np
import matplotlib.pyplot as plt

# Generate sample data
np.random.seed(42)
data = np.random.normal(100, 15, 1000)

print("Sample Statistics:")
print(f"Mean: {np.mean(data):.2f}")
print(f"Median: {np.median(data):.2f}")
print(f"Standard Deviation: {np.std(data):.2f}")
print(f"Min: {np.min(data):.2f}")
print(f"Max: {np.max(data):.2f}")

# Create histogram
plt.figure(figsize=(10, 6))
plt.hist(data, bins=50, alpha=0.7, color='skyblue', edgecolor='black')
plt.axvline(np.mean(data), color='red', linestyle='--', linewidth=2, label=f'Mean: {np.mean(data):.2f}')
plt.axvline(np.median(data), color='green', linestyle='--', linewidth=2, label=f'Median: {np.median(data):.2f}')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.title('Distribution of Sample Data')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

## Advanced Examples

### Working with Pandas

```python-r
import pandas as pd
import numpy as np

# Create a sample dataset
np.random.seed(42)
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'Age': [25, 30, 35, 28, 32],
    'Score': np.random.randint(70, 100, 5),
    'Department': ['Engineering', 'Marketing', 'Engineering', 'Sales', 'Marketing']
}

df = pd.DataFrame(data)
print("Sample DataFrame:")
print(df)
print("\nDataFrame Info:")
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print("\nSummary Statistics:")
print(df.describe())

# Group by department
print("\nAverage score by department:")
dept_avg = df.groupby('Department')['Score'].mean()
print(dept_avg)
```

### Scientific Computing

```python-r
import numpy as np
import matplotlib.pyplot as plt
from scipy import optimize

# Define a function to fit
def func(x, a, b, c):
    return a * np.exp(-b * x) + c

# Generate noisy data
np.random.seed(42)
x_data = np.linspace(0, 4, 50)
y_data = func(x_data, 2.5, 1.3, 0.5) + 0.2 * np.random.normal(size=len(x_data))

# Fit the curve
popt, pcov = optimize.curve_fit(func, x_data, y_data)
print(f"Fitted parameters: a={popt[0]:.2f}, b={popt[1]:.2f}, c={popt[2]:.2f}")

# Plot the results
plt.figure(figsize=(10, 6))
plt.scatter(x_data, y_data, alpha=0.7, label='Data')
plt.plot(x_data, func(x_data, *popt), 'r-', 
         label=f'Fitted: $ae^{{-bx}}+c$\na={popt[0]:.2f}, b={popt[1]:.2f}, c={popt[2]:.2f}')
plt.xlabel('x')
plt.ylabel('y')
plt.title('Curve Fitting with SciPy')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

## Features

- **Interactive Execution**: Click "Run" to execute Python code directly in your browser
- **Copy Functionality**: Easy code copying for reuse
- **Collapsible Blocks**: Hide/show code blocks with the expand/collapse button
- **Rich Output**: Support for text output and matplotlib plots
- **Error Handling**: Clear error messages for debugging
- **Responsive Design**: Works great on mobile devices

## Available Packages

The Python environment includes:
- **NumPy**: Numerical computing
- **Pandas**: Data manipulation and analysis
- **Matplotlib**: Data visualization
- **SciPy**: Scientific computing
- **SymPy**: Symbolic mathematics
- **Scikit-learn**: Machine learning

Try experimenting with these examples and create your own interactive Python demonstrations!